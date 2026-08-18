import { afterEach, describe, expect, it, vi } from 'vitest';
import { deliverLead, handleLead, leadSchema, type LeadCoordination, type LeadEnv } from './leads';

const lead = { name: 'Ada', businessName: 'Casa Ada', email: 'ada@example.test', accommodationType: 'rural', propertyCount: 2, unitCount: 4, accept: true, website: '', lang: 'es' };
const emailEnv = {
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
  afterEach(() => vi.restoreAllMocks());
  it('requires explicit consent', () => expect(leadSchema.safeParse({ ...lead, accept: false }).success).toBe(false));
  it('normalizes legacy plan values at the API edge', () => expect(leadSchema.parse({ ...lead, plan: 'automatiza' }).plan).toBe('inteligente'));
  it('normalizes email casing for a stable submission identity', () => expect(leadSchema.parse({ ...lead, email: 'ADA@Example.Test' }).email).toBe('ada@example.test'));
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
    const response = await handleLead(new Request('https://test/api/leads', { method: 'POST', body: JSON.stringify(lead) }), { ...emailEnv, LEAD_COORDINATOR: namespace });
    expect(response.status).toBe(202);
    expect(await response.json()).toMatchObject({ ref: 'local-ref' });
  });
  it('fails closed when the persistent rate limiter is unavailable', async () => {
    const coordination: LeadCoordination = { rateLimit: async () => { throw new Error('unavailable'); }, submit: async () => new Response() };
    const response = await submit(emailEnv, lead, 'rate-error', coordination);
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ error: 'lead_coordination_failed' });
  });
  it('fails closed when delivery is disabled', async () => {
    const env = { LEADS_TRANSPORT: 'disabled' } as const;
    const response = await submit(env);
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ outcome: 'disabled' });
  });
  it('fails closed when email delivery is selected with incomplete configuration', async () => {
    const logger = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const response = await submit({ LEADS_TRANSPORT: 'resend', LEADS_RESEND_API_KEY: 'sensitive-test-value', LEADS_FROM_EMAIL: 'not-an-email' });
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ error: 'lead_email_configuration_invalid' });
    const log = logger.mock.calls.flat().join(' ');
    expect(log).toContain('LEADS_FROM_EMAIL');
    expect(log).toContain('LEADS_INTERNAL_RECIPIENT');
    expect(log).not.toContain('sensitive-test-value');
  });
  it('does not send a honeypot submission', async () => {
    const fetcher = vi.spyOn(globalThis, 'fetch');
    const env = emailEnv;
    const response = await submit(env, { ...lead, website: 'spam.test' });
    expect(response.status).toBe(202); expect(fetcher).not.toHaveBeenCalled();
  });
  it('blocks a demo source path before coordinating or calling Resend', async () => {
    const fetcher = vi.spyOn(globalThis, 'fetch');
    const coordination: LeadCoordination = { rateLimit: async () => null, submit: vi.fn(async () => new Response()) };
    const response = await submit(emailEnv, { ...lead, sourcePath: '/en/demos/terrava/' }, 'demo-source', coordination);
    expect(response.status).toBe(403);
    expect(await response.json()).toMatchObject({ outcome: 'blocked', error: 'demo_submission_disabled' });
    expect(coordination.submit).not.toHaveBeenCalled();
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('blocks a same-origin demo referrer before rate limiting', async () => {
    const coordination: LeadCoordination = { rateLimit: vi.fn(async () => null), submit: vi.fn(async () => new Response()) };
    const request = new Request('https://test/api/leads', {
      method: 'POST',
      headers: { 'content-type': 'application/json', referer: 'https://test/demos/aurem/' },
      body: JSON.stringify({ ...lead, sourcePath: '/' }),
    });
    const response = await handleLead(request, emailEnv, coordination);
    expect(response.status).toBe(403);
    expect(coordination.rateLimit).not.toHaveBeenCalled();
    expect(coordination.submit).not.toHaveBeenCalled();
  });
  it('reports provider failure instead of claiming delivery', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('no', { status: 500 }));
    const env = emailEnv;
    const response = await submit(env);
    expect(response.status).toBe(502); expect(await response.json()).toMatchObject({ outcome: 'failed' });
  });
  it('accepts the lead when email succeeds and HubSpot is degraded', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => String(input).includes('hubapi.com') ? new Response('no', { status: 500 }) : new Response('{}', { status: 200 }));
    const env = { ...emailEnv, HUBSPOT_ACCESS_TOKEN: 'crm' } as const;
    const response = await submit(env);
    expect(response.status).toBe(202); expect(await response.json()).toMatchObject({ outcome: 'delivered_degraded' });
  });
  it('accepts the lead when HubSpot succeeds and email is degraded', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes('resend.com')) return new Response('no', { status: 500 });
      if (url.endsWith('/contacts/search')) return new Response(JSON.stringify({ results: [] }), { status: 200 });
      if (url.endsWith('/contacts')) return new Response(JSON.stringify({ id: 'contact-1' }), { status: 201 });
      return new Response(JSON.stringify({ id: 'deal-1' }), { status: 201 });
    });
    const env = { ...emailEnv, HUBSPOT_ACCESS_TOKEN: 'crm' } as const;
    const response = await submit(env);
    expect(response.status).toBe(202); expect(await response.json()).toMatchObject({ outcome: 'delivered_degraded' });
  });
  it('marks delivery as degraded when CRM succeeds but selected email configuration is invalid', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = String(input);
      if (url.endsWith('/contacts/search')) return new Response(JSON.stringify({ results: [] }), { status: 200 });
      if (url.endsWith('/contacts')) return new Response(JSON.stringify({ id: 'contact-1' }), { status: 201 });
      return new Response(JSON.stringify({ id: 'deal-1' }), { status: 201 });
    });
    const response = await submit({ LEADS_TRANSPORT: 'resend', HUBSPOT_ACCESS_TOKEN: 'crm' });
    expect(response.status).toBe(202);
    expect(await response.json()).toMatchObject({ outcome: 'delivered_degraded' });
  });
  it('uses validated addresses and only returns a public HTTPS meeting URL', async () => {
    const fetcher = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));
    const response = await submit({ ...emailEnv, LEADS_MEETING_URL: 'https://meet.example.test/logic-estancia' });
    expect(response.status).toBe(202);
    expect(await response.json()).toMatchObject({ meetingUrl: 'https://meet.example.test/logic-estancia' });
    const payloads = fetcher.mock.calls.map(([, init]) => JSON.parse(String(init?.body)) as Record<string, unknown>);
    expect(payloads[0]).toMatchObject({ from: 'Logic Estancia <delivery@example.test>', to: ['sales@example.test'], reply_to: 'ada@example.test' });
    expect(payloads[1]).toMatchObject({ from: 'Logic Estancia <delivery@example.test>', to: ['ada@example.test'], reply_to: 'reply@example.test' });
  });
  it('omits an unsafe meeting URL while preserving successful delivery', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));
    const response = await submit({ ...emailEnv, LEADS_MEETING_URL: 'javascript:alert(1)' });
    expect(response.status).toBe(202);
    expect(await response.json()).toMatchObject({ meetingUrl: null });
  });
});
