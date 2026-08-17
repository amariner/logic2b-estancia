import { afterEach, describe, expect, it, vi } from 'vitest';
import { deliverLead, handleLead, leadSchema, type LeadCoordination, type LeadEnv } from './leads';

const lead = { name: 'Ada', businessName: 'Casa Ada', email: 'ada@example.test', accommodationType: 'rural', propertyCount: 2, unitCount: 4, accept: true, website: '', lang: 'es' };

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
    const env = { LEADS_TRANSPORT: 'resend', LEADS_RESEND_API_KEY: 'secret' } as const;
    await submit(env, lead, 'case-one', coordination);
    await submit(env, { ...lead, email: 'ADA@EXAMPLE.TEST' }, 'case-two', coordination);
    expect(fingerprints[0]).toBe(fingerprints[1]);
  });
  it('fails closed when durable coordination is unavailable', async () => {
    const response = await handleLead(new Request('https://test/api/leads', { method: 'POST', body: JSON.stringify(lead) }), { LEADS_TRANSPORT: 'resend', LEADS_RESEND_API_KEY: 'secret' });
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
    const response = await handleLead(new Request('https://test/api/leads', { method: 'POST', body: JSON.stringify(lead) }), { LEADS_TRANSPORT: 'resend', LEADS_RESEND_API_KEY: 'secret', LEAD_COORDINATOR: namespace });
    expect(response.status).toBe(202);
    expect(await response.json()).toMatchObject({ ref: 'local-ref' });
  });
  it('fails closed when the persistent rate limiter is unavailable', async () => {
    const coordination: LeadCoordination = { rateLimit: async () => { throw new Error('unavailable'); }, submit: async () => new Response() };
    const response = await submit({ LEADS_TRANSPORT: 'resend', LEADS_RESEND_API_KEY: 'secret' }, lead, 'rate-error', coordination);
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ error: 'lead_coordination_failed' });
  });
  it('fails closed when delivery is disabled', async () => {
    const env = { LEADS_TRANSPORT: 'disabled' } as const;
    const response = await submit(env);
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ outcome: 'disabled' });
  });
  it('does not send a honeypot submission', async () => {
    const fetcher = vi.spyOn(globalThis, 'fetch');
    const env = { LEADS_TRANSPORT: 'resend', LEADS_RESEND_API_KEY: 'secret' } as const;
    const response = await submit(env, { ...lead, website: 'spam.test' });
    expect(response.status).toBe(202); expect(fetcher).not.toHaveBeenCalled();
  });
  it('reports provider failure instead of claiming delivery', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('no', { status: 500 }));
    const env = { LEADS_TRANSPORT: 'resend', LEADS_RESEND_API_KEY: 'secret' } as const;
    const response = await submit(env);
    expect(response.status).toBe(502); expect(await response.json()).toMatchObject({ outcome: 'failed' });
  });
  it('accepts the lead when email succeeds and HubSpot is degraded', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => String(input).includes('hubapi.com') ? new Response('no', { status: 500 }) : new Response('{}', { status: 200 }));
    const env = { LEADS_TRANSPORT: 'resend', LEADS_RESEND_API_KEY: 'secret', HUBSPOT_ACCESS_TOKEN: 'crm' } as const;
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
    const env = { LEADS_TRANSPORT: 'resend', LEADS_RESEND_API_KEY: 'secret', HUBSPOT_ACCESS_TOKEN: 'crm' } as const;
    const response = await submit(env);
    expect(response.status).toBe(202); expect(await response.json()).toMatchObject({ outcome: 'delivered_degraded' });
  });
});
