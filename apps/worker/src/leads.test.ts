import { afterEach, describe, expect, it, vi } from 'vitest';
import { deliverLead, handleLead, leadSchema, type LeadCoordination, type LeadEnv } from './leads';

const lead = { name: 'Ada', businessName: 'Casa Ada', email: 'ada@example.test', accommodationType: 'rural', propertyCount: 2, unitCount: 4, accept: true, website: '', lang: 'es' };
const emailEnv = {
  DEMO_MODE: 'false',
  REAL_OPERATIONS_ENABLED: 'true',
  COMMERCIAL_LEADS_ENABLED: 'true',
  EMAIL_PROVIDER_MODE: 'resend',
  LEADS_TRANSPORT: 'resend',
  LEADS_RESEND_API_KEY: 'secret',
  LEADS_FROM_EMAIL: 'delivery@example.test',
  LEADS_INTERNAL_RECIPIENT: 'sales@example.test',
  LEADS_REPLY_TO: 'reply@example.test',
} as const;

function directCoordination(env: LeadEnv): LeadCoordination {
  return {
    rateLimit: async () => null,
    submit: async (_fingerprint, submittedLead) => deliverLead(submittedLead, env, crypto.randomUUID()),
  };
}

function submit(env: LeadEnv, body: unknown = lead, ip: string = crypto.randomUUID(), coordination = directCoordination(env)) {
  return handleLead(new Request('https://test/api/leads', { method: 'POST', headers: { 'content-type': 'application/json', 'cf-connecting-ip': ip }, body: JSON.stringify(body) }), env, coordination);
}

describe('leads', () => {
  afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers(); });
  it('blocks direct handlers and adapters when the commercial allowlist is absent', async () => {
    const providerFetch = vi.spyOn(globalThis, 'fetch');
    const coordination: LeadCoordination = { rateLimit: vi.fn(async () => null), submit: vi.fn(async () => new Response()) };
    const env = { ...emailEnv, DEMO_MODE: 'true', COMMERCIAL_LEADS_ENABLED: 'false' } as const;
    const handled = await submit(env, lead, 'demo-mode', coordination);
    const delivered = await deliverLead(leadSchema.parse(lead), env, 'must-not-deliver');
    expect(handled.status).toBe(403);
    expect(delivered.status).toBe(403);
    expect(coordination.rateLimit).not.toHaveBeenCalled();
    expect(coordination.submit).not.toHaveBeenCalled();
    expect(providerFetch).not.toHaveBeenCalled();
  });
  it('requires explicit consent', () => expect(leadSchema.safeParse({ ...lead, accept: false }).success).toBe(false));
  it('normalizes legacy plan values at the API edge', () => expect(leadSchema.parse({ ...lead, plan: 'automatiza' }).plan).toBe('inteligente'));
  it('normalizes email casing for a stable submission identity', () => expect(leadSchema.parse({ ...lead, email: 'ADA@Example.Test' }).email).toBe('ada@example.test'));
  it('rejects line breaks in fields that reach email headers and structured rows', () => {
    expect(leadSchema.safeParse({ ...lead, businessName: 'Casa Ada\r\nBcc: attacker@example.test' }).success).toBe(false);
    expect(leadSchema.safeParse({ ...lead, requestedCapabilities: ['automation\u2028Injected row'] }).success).toBe(false);
  });
  it('derives the same submission identity from equivalent email casing', async () => {
    const fingerprints: string[] = [];
    const coordination: LeadCoordination = {
      rateLimit: async () => null,
      submit: async (fingerprint) => { fingerprints.push(fingerprint); return new Response('{}', { status: 202 }); },
    };
    const env = emailEnv;
    await submit(env, lead, 'case-one', coordination);
    await submit(env, { ...lead, email: 'ADA@EXAMPLE.TEST' }, 'case-two', coordination);
    expect(fingerprints[0]).toBe(fingerprints[1]);
  });
  it('fails closed when durable coordination is unavailable', async () => {
    const response = await handleLead(new Request('https://test/api/leads', { method: 'POST', body: JSON.stringify(lead) }), emailEnv);
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ error: 'lead_coordination_unavailable' });
  });
  it('uses the local Durable Object namespace when workerd lacks jurisdiction support', async () => {
    const namespace = {
      jurisdiction: () => { throw new Error('not implemented'); },
      getByName: () => ({
        fetch: async (input: RequestInfo | URL) => new URL(String(input)).pathname === '/rate-limit'
          ? new Response(JSON.stringify({ retryAfter: null }), { status: 200 })
          : new Response(JSON.stringify({ ok: true, outcome: 'delivered', ref: 'local-ref' }), { status: 202 }),
      }),
    } as unknown as DurableObjectNamespace;
    const response = await handleLead(new Request('https://test/api/leads', { method: 'POST', body: JSON.stringify(lead) }), {
      ...emailEnv, LEAD_COORDINATOR: namespace, LEADS_ALLOW_LOCAL_JURISDICTION_FALLBACK: 'true',
    });
    expect(response.status).toBe(202);
    expect(await response.json()).toMatchObject({ ref: 'local-ref' });
  });
  it('fails closed when EU Durable Object jurisdiction cannot be enforced publicly', async () => {
    const logger = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const getByName = vi.fn();
    const namespace = {
      jurisdiction: () => { throw new Error('unexpected production failure'); },
      getByName,
    } as unknown as DurableObjectNamespace;
    const request = new Request('https://estancia.logic2b.com/api/leads', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(lead),
    });
    const response = await handleLead(request, { ...emailEnv, LEAD_COORDINATOR: namespace });
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ ok: false, outcome: 'disabled', error: 'lead_coordination_unavailable' });
    expect(getByName).not.toHaveBeenCalled();
    expect(logger).toHaveBeenCalledWith(JSON.stringify({ event: 'lead_coordination_jurisdiction_failed' }));
    expect(logger.mock.calls.flat().join(' ')).not.toContain('unexpected production failure');
  });
  it('fails closed when the persistent rate limiter is unavailable', async () => {
    const coordination: LeadCoordination = { rateLimit: async () => { throw new Error('unavailable'); }, submit: async () => new Response() };
    const response = await submit(emailEnv, lead, 'rate-error', coordination);
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ error: 'lead_coordination_failed' });
  });
  it('blocks before coordination when delivery is not explicitly activated', async () => {
    const env = { DEMO_MODE: 'false', REAL_OPERATIONS_ENABLED: 'true', EMAIL_PROVIDER_MODE: 'disabled', LEADS_TRANSPORT: 'disabled' } as const;
    const response = await submit(env);
    expect(response.status).toBe(403);
    expect(await response.json()).toMatchObject({ outcome: 'blocked', error: 'commercial_leads_disabled' });
  });
  it('does not activate email from flags or a secret when configuration is incomplete', async () => {
    const logger = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const response = await submit({ DEMO_MODE: 'false', REAL_OPERATIONS_ENABLED: 'true', COMMERCIAL_LEADS_ENABLED: 'true', EMAIL_PROVIDER_MODE: 'resend', LEADS_TRANSPORT: 'resend', LEADS_RESEND_API_KEY: 'sensitive-test-value', LEADS_FROM_EMAIL: 'not-an-email' });
    expect(response.status).toBe(403);
    expect(await response.json()).toMatchObject({ error: 'commercial_leads_disabled' });
    const log = logger.mock.calls.flat().join(' ');
    expect(log).toBe('');
    expect(log).not.toContain('sensitive-test-value');
  });
  it('does not send a honeypot submission', async () => {
    const fetcher = vi.spyOn(globalThis, 'fetch');
    const env = emailEnv;
    const response = await submit(env, { ...lead, website: 'spam.test' });
    expect(response.status).toBe(202); expect(fetcher).not.toHaveBeenCalled();
  });
  it('blocks an encoded demo source after rate limiting but before delivery', async () => {
    const fetcher = vi.spyOn(globalThis, 'fetch');
    const coordination: LeadCoordination = { rateLimit: vi.fn(async () => null), submit: vi.fn(async () => new Response()) };
    const response = await submit(emailEnv, { ...lead, sourcePath: '/%2565n/%2564emos/terrava/' }, 'demo-source', coordination);
    expect(response.status).toBe(403);
    expect(await response.json()).toMatchObject({ outcome: 'blocked', error: 'demo_submission_disabled' });
    expect(coordination.rateLimit).toHaveBeenCalledOnce();
    expect(coordination.submit).not.toHaveBeenCalled();
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('blocks a same-origin demo referrer before rate limiting', async () => {
    const coordination: LeadCoordination = { rateLimit: vi.fn(async () => null), submit: vi.fn(async () => new Response()) };
    const request = new Request('https://test/api/leads', {
      method: 'POST',
      headers: { 'content-type': 'application/json', referer: 'https://test/%2564emos/aurem/' },
      body: JSON.stringify({ ...lead, sourcePath: '/' }),
    });
    const response = await handleLead(request, emailEnv, coordination);
    expect(response.status).toBe(403);
    expect(coordination.rateLimit).not.toHaveBeenCalled();
    expect(coordination.submit).not.toHaveBeenCalled();
  });
  it('blocks a cross-site browser submission before rate limiting', async () => {
    const coordination: LeadCoordination = { rateLimit: vi.fn(async () => null), submit: vi.fn(async () => new Response()) };
    const request = new Request('https://test/api/leads', {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'https://attacker.example', 'sec-fetch-site': 'cross-site' },
      body: JSON.stringify(lead),
    });
    const response = await handleLead(request, emailEnv, coordination);
    expect(response.status).toBe(403);
    expect(await response.json()).toMatchObject({ outcome: 'blocked', error: 'cross_site_submission_disabled' });
    expect(coordination.rateLimit).not.toHaveBeenCalled();
    expect(coordination.submit).not.toHaveBeenCalled();
  });
  it('accepts an explicit same-origin browser submission', async () => {
    const coordination: LeadCoordination = {
      rateLimit: vi.fn(async () => null),
      submit: vi.fn(async () => new Response(JSON.stringify({ ok: true, outcome: 'delivered' }), { status: 202 })),
    };
    const request = new Request('https://test/api/leads', {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'https://test', 'sec-fetch-site': 'same-origin' },
      body: JSON.stringify(lead),
    });
    const response = await handleLead(request, emailEnv, coordination);
    expect(response.status).toBe(202);
    expect(coordination.rateLimit).toHaveBeenCalledOnce();
    expect(coordination.submit).toHaveBeenCalledOnce();
  });
  it('does not reflect invalid lead values or schema details', async () => {
    const coordination: LeadCoordination = { rateLimit: vi.fn(async () => null), submit: vi.fn(async () => new Response()) };
    const response = await submit(emailEnv, { ...lead, email: 'private-invalid-value' }, 'invalid-lead', coordination);
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ ok: false, outcome: 'invalid', error: 'invalid' });
    expect(coordination.submit).not.toHaveBeenCalled();
  });
  it('rejects a declared oversized body before rate limiting', async () => {
    const coordination: LeadCoordination = { rateLimit: vi.fn(async () => null), submit: vi.fn(async () => new Response()) };
    const request = new Request('https://test/api/leads', {
      method: 'POST', headers: { 'content-type': 'application/json', 'content-length': '32769' }, body: JSON.stringify(lead),
    });
    const response = await handleLead(request, emailEnv, coordination);
    expect(response.status).toBe(413);
    expect(await response.json()).toMatchObject({ outcome: 'invalid', error: 'payload_too_large' });
    expect(coordination.rateLimit).not.toHaveBeenCalled();
    expect(coordination.submit).not.toHaveBeenCalled();
  });
  it('stops an undeclared oversized body before validation or delivery', async () => {
    const coordination: LeadCoordination = { rateLimit: vi.fn(async () => null), submit: vi.fn(async () => new Response()) };
    const request = new Request('https://test/api/leads', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...lead, padding: 'x'.repeat(33_000) }),
    });
    const response = await handleLead(request, emailEnv, coordination);
    expect(response.status).toBe(413);
    expect(await response.json()).toMatchObject({ outcome: 'invalid', error: 'payload_too_large' });
    expect(coordination.rateLimit).toHaveBeenCalledOnce();
    expect(coordination.submit).not.toHaveBeenCalled();
  });
  it('returns a minimal invalid response when the request body stream fails', async () => {
    const logger = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const coordination: LeadCoordination = { rateLimit: vi.fn(async () => null), submit: vi.fn(async () => new Response()) };
    const body = new ReadableStream({ start(controller) { controller.error(new Error('sensitive-stream-detail')); } });
    const request = new Request('https://test/api/leads', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body, duplex: 'half',
    } as RequestInit & { duplex: 'half' });
    const response = await handleLead(request, emailEnv, coordination);
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ ok: false, outcome: 'invalid', error: 'invalid' });
    expect(coordination.rateLimit).toHaveBeenCalledOnce();
    expect(coordination.submit).not.toHaveBeenCalled();
    expect(logger).toHaveBeenCalledWith(JSON.stringify({ event: 'lead_body_read_failed' }));
    expect(logger.mock.calls.flat().join(' ')).not.toContain('sensitive-stream-detail');
  });
  it('reports provider failure instead of claiming delivery', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('no', { status: 500 }));
    const env = emailEnv;
    const response = await submit(env);
    expect(response.status).toBe(502); expect(await response.json()).toMatchObject({ outcome: 'failed' });
  });
  it('bounds stalled Resend calls and returns a retryable delivery failure', async () => {
    vi.useFakeTimers();
    const fetcher = vi.spyOn(globalThis, 'fetch').mockImplementation((_input, init) => new Promise<Response>((_resolve, reject) => {
      const signal = init?.signal;
      if (!signal) return reject(new Error('missing_abort_signal'));
      signal.addEventListener('abort', () => reject(signal.reason), { once: true });
    }));
    const responsePromise = deliverLead(leadSchema.parse(lead), emailEnv, 'timeout-ref');
    expect(fetcher).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(10_000);
    const response = await responsePromise;
    expect(response.status).toBe(502);
    expect(await response.json()).toMatchObject({ outcome: 'failed', error: 'lead_delivery_failed' });
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher.mock.calls.every(([, init]) => init?.signal?.aborted)).toBe(true);
  });
  it('fails instead of losing the lead when only the visitor summary succeeds', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (_input, init) => {
      const payload = JSON.parse(String(init?.body)) as { to: string[] };
      return new Response('{}', { status: payload.to[0] === 'sales@example.test' ? 500 : 200 });
    });
    const response = await submit(emailEnv);
    expect(response.status).toBe(502);
    expect(await response.json()).toMatchObject({ outcome: 'failed', error: 'lead_delivery_failed' });
  });
  it('keeps the captured lead when only the optional visitor summary fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (_input, init) => {
      const payload = JSON.parse(String(init?.body)) as { to: string[] };
      return new Response('{}', { status: payload.to[0] === 'sales@example.test' ? 200 : 500 });
    });
    const response = await submit(emailEnv);
    expect(response.status).toBe(202);
    expect(await response.json()).toMatchObject({ outcome: 'delivered_degraded' });
  });
  it('never invokes a CRM even if a legacy environment value is present', async () => {
    const fetcher = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));
    const env = { ...emailEnv, HUBSPOT_ACCESS_TOKEN: 'legacy-value' } as LeadEnv & { HUBSPOT_ACCESS_TOKEN: string };
    const response = await submit(env);
    expect(response.status).toBe(202);
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher.mock.calls.every(([input]) => String(input) === 'https://api.resend.com/emails')).toBe(true);
  });
  it('uses validated addresses and only returns a public HTTPS meeting URL', async () => {
    const fetcher = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));
    const response = await submit({ ...emailEnv, LEADS_MEETING_URL: 'https://meet.example.test/logic-estancia' });
    expect(response.status).toBe(202);
    expect(await response.json()).toMatchObject({ meetingUrl: 'https://meet.example.test/logic-estancia' });
    const payloads = fetcher.mock.calls.map(([, init]) => JSON.parse(String(init?.body)) as Record<string, unknown>);
    expect(payloads[0]).toMatchObject({ from: 'Logic2B Estancias <delivery@example.test>', to: ['sales@example.test'], reply_to: 'ada@example.test' });
    expect(payloads[1]).toMatchObject({ from: 'Logic2B Estancias <delivery@example.test>', to: ['ada@example.test'], reply_to: 'reply@example.test' });
  });
  it('escapes adversarial lead markup in both HTML emails', async () => {
    const fetcher = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));
    const response = await submit(emailEnv, {
      ...lead,
      name: '<img src=x onerror=alert(1)>',
      businessName: '<svg onload=alert(1)>',
      requestedCapabilities: ['<script>alert(1)</script>'],
      message: '<a href="https://attacker.example">open</a>',
    });
    expect(response.status).toBe(202);
    const payloads = fetcher.mock.calls.map(([, init]) => JSON.parse(String(init?.body)) as { html: string });
    expect(payloads[0]?.html).not.toMatch(/<(?:svg|script|a)\b/i);
    expect(payloads[1]?.html).not.toMatch(/<(?:img|script)\b/i);
    expect(payloads[0]?.html).toContain('&lt;svg onload=alert(1)&gt;');
    expect(payloads[1]?.html).toContain('&lt;img src=x onerror=alert(1)&gt;');
  });
  it('treats the absent optional meeting URL as healthy configuration', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));
    const logger = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const response = await submit(emailEnv);
    expect(response.status).toBe(202);
    expect(await response.json()).toMatchObject({ meetingUrl: null });
    expect(logger).not.toHaveBeenCalled();
  });
  it('acknowledges a direct enquiry without inventing a Basic recommendation', async () => {
    const fetcher = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));
    await submit(emailEnv);
    const visitor = JSON.parse(String(fetcher.mock.calls[1]?.[1]?.body)) as { subject: string; text: string; html: string };
    expect(visitor.subject).toBe('Hemos recibido tu solicitud de Logic2B Estancias');
    expect(visitor.text).toContain('hemos recibido tu solicitud sobre Casa Ada');
    expect(`${visitor.subject} ${visitor.text} ${visitor.html}`).not.toMatch(/Básico|recomendación inicial|Capacidades solicitadas/);
  });
  it('keeps a real assessment recommendation and its requested capabilities in the summary', async () => {
    const fetcher = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));
    await submit(emailEnv, { ...lead, lang: 'en', plan: 'inteligente', requestedCapabilities: ['automation'] });
    const visitor = JSON.parse(String(fetcher.mock.calls[1]?.[1]?.body)) as { subject: string; text: string };
    expect(visitor.subject).toBe('Your Logic2B Estancias assessment · Intelligent');
    expect(visitor.text).toContain('your initial recommendation is Intelligent');
    expect(visitor.text).toContain('Requested capabilities: automation');
  });
  it('omits an unsafe meeting URL while preserving successful delivery', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));
    const logger = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const response = await submit({ ...emailEnv, LEADS_MEETING_URL: 'javascript:alert(1)' });
    expect(response.status).toBe(202);
    expect(await response.json()).toMatchObject({ meetingUrl: null });
    expect(logger).toHaveBeenCalledOnce();
    expect(logger.mock.calls.flat().join(' ')).toContain('lead_meeting_configuration_invalid');
    expect(logger.mock.calls.flat().join(' ')).toContain('invalid');
  });
});
