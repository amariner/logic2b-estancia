import { afterEach, describe, expect, it, vi } from 'vitest';
import worker, { type Env } from './index';

const lead = { name: 'Ada', businessName: 'Casa Ada', email: 'ada@example.test', accommodationType: 'rural', propertyCount: 2, unitCount: 4, accept: true, website: '', lang: 'es' };
const assets = { fetch: vi.fn(async () => new Response('<!doctype html><title>Demo</title>', { status: 200, headers: { 'content-type': 'text/html' } })) } as unknown as Fetcher;

const demoEnv = {
  DEMO_MODE: 'true',
  REAL_OPERATIONS_ENABLED: 'true',
  EMAIL_PROVIDER_MODE: 'resend',
  ANALYTICS_PROVIDER_MODE: 'gtm',
  LEADS_TRANSPORT: 'resend',
  LEADS_RESEND_API_KEY: 'must-not-be-used',
  LEADS_FROM_EMAIL: 'delivery@example.test',
  LEADS_INTERNAL_RECIPIENT: 'sales@example.test',
  LEADS_REPLY_TO: 'reply@example.test',
  ASSETS: assets,
} as const satisfies Env;

describe('worker runtime isolation', () => {
  afterEach(() => vi.restoreAllMocks());

  it('publishes a secret-free demo manifest and starts without provider credentials', async () => {
    const response = await worker.fetch(new Request('https://test/api/capabilities'), { DEMO_MODE: 'true', ASSETS: assets });
    expect(response.status).toBe(200);
    expect(response.headers.get('x-logic-runtime-mode')).toBe('demo');
    expect(await response.json()).toMatchObject({
      demoMode: true, sideEffects: false, durableWrites: false, jobs: false,
      providers: { analytics: 'disabled', email: 'disabled', payments: 'disabled', webhooks: 'disabled', externalStorage: 'disabled' },
    });
  });

  it('blocks a direct lead call before body access, durable coordination or providers', async () => {
    const jurisdiction = vi.fn();
    const getByName = vi.fn();
    const providerFetch = vi.spyOn(globalThis, 'fetch');
    let bodyTouched = false;
    const request = {
      url: 'https://test/api/leads',
      method: 'POST',
      headers: new Headers({ 'content-type': 'application/json' }),
      get body() { bodyTouched = true; throw new Error('body_must_not_be_read'); },
    } as unknown as Request;
    const env = {
      ...demoEnv,
      LEAD_COORDINATOR: { jurisdiction, getByName } as unknown as DurableObjectNamespace,
    };
    const response = await worker.fetch(request, env);
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ ok: false, outcome: 'blocked', error: 'commercial_leads_disabled' });
    expect(bodyTouched).toBe(false);
    expect(jurisdiction).not.toHaveBeenCalled();
    expect(getByName).not.toHaveBeenCalled();
    expect(providerFetch).not.toHaveBeenCalled();
  });

  it.each(['/api/payments', '/api/webhooks/resend', '/api/jobs/run', '/api/automations'])('keeps unavailable API %s private', async (path) => {
    const response = await worker.fetch(new Request(`https://test${path}`, { method: 'POST' }), demoEnv);
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: 'not_found' });
  });

  it('serves visual demo assets with the demo runtime and restrictive form policy', async () => {
    const response = await worker.fetch(new Request('https://test/demos/nivora/'), demoEnv);
    expect(response.status).toBe(200);
    expect(response.headers.get('x-logic-runtime-mode')).toBe('demo');
    expect(response.headers.get('content-security-policy')).toContain("form-action 'none'");
    expect(response.headers.get('content-security-policy')).toContain("connect-src 'none'");
    expect(response.headers.get('content-security-policy')).toContain("script-src 'self' 'unsafe-inline'");
    expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow');
  });

  it('keeps every public asset isolated when demo mode overrides provider-looking configuration', async () => {
    const response = await worker.fetch(new Request('https://test/'), demoEnv);
    const policy = response.headers.get('content-security-policy');
    expect(response.headers.get('x-logic-runtime-mode')).toBe('demo');
    expect(policy).toContain("connect-src 'self'");
    expect(policy).toContain("script-src 'self' 'unsafe-inline'");
    expect(policy).toContain("form-action 'none'");
    expect(policy).not.toContain('google-analytics.com');
    expect(policy).not.toContain('googletagmanager.com');
  });

  it('allows only the declared analytics hosts after every real activation gate', async () => {
    const response = await worker.fetch(new Request('https://test/'), {
      ...demoEnv,
      DEMO_MODE: 'false',
      REAL_OPERATIONS_ENABLED: 'true',
      EMAIL_PROVIDER_MODE: 'disabled',
      ANALYTICS_PROVIDER_MODE: 'gtm',
      LEADS_TRANSPORT: 'disabled',
    });
    const policy = response.headers.get('content-security-policy');
    expect(response.headers.get('x-logic-runtime-mode')).toBe('real');
    expect(policy).toContain("script-src 'self' 'unsafe-inline' https://www.googletagmanager.com");
    expect(policy).toContain('https://*.google-analytics.com');
    expect(policy).toContain("form-action 'none'");
  });

  it('allows the explicit commercial-lead exception in demo mode only with every email gate present', async () => {
    const rateLimit = vi.fn(async () => new Response(JSON.stringify({ retryAfter: null }), { status: 200 }));
    const deliver = vi.fn(async () => new Response(JSON.stringify({ ok: true, outcome: 'delivered', ref: 'isolated-test-ref' }), { status: 202 }));
    const namespace: DurableObjectNamespace = {
      jurisdiction: vi.fn(() => namespace),
      getByName: vi.fn((name: string) => ({ fetch: name.startsWith('rate:') ? rateLimit : deliver })),
    } as unknown as DurableObjectNamespace;
    const env: Env = {
      ...demoEnv,
      DEMO_MODE: 'true',
      REAL_OPERATIONS_ENABLED: 'true',
      COMMERCIAL_LEADS_ENABLED: 'true',
      EMAIL_PROVIDER_MODE: 'resend',
      ANALYTICS_PROVIDER_MODE: 'disabled',
      LEAD_COORDINATOR: namespace,
    };
    const response = await worker.fetch(new Request('https://test/api/leads', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(lead),
    }), env);
    expect(response.status).toBe(202);
    expect(response.headers.get('x-logic-runtime-mode')).toBe('demo');
    expect(await response.json()).toMatchObject({ outcome: 'delivered', ref: 'isolated-test-ref' });
    expect(rateLimit).toHaveBeenCalledOnce();
    expect(deliver).toHaveBeenCalledOnce();
  });

  it('keeps scheduled triggers inert', async () => {
    const providerFetch = vi.spyOn(globalThis, 'fetch');
    const scheduled = worker.scheduled;
    await scheduled({} as ScheduledController, demoEnv);
    expect(providerFetch).not.toHaveBeenCalled();
  });
});
