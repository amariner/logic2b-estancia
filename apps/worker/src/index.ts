import { handleLead, isDemoPath, type LeadEnv } from './leads';
import { resolveRuntimeCapabilities, type RuntimeCapabilityManifest } from './runtime-mode';

export { LeadCoordinator } from './lead-coordinator';

export interface Env extends LeadEnv { ASSETS: Fetcher; }

const isolatedContentSecurityPolicy = "default-src 'self'; base-uri 'self'; connect-src 'self'; font-src 'self'; form-action 'none'; frame-ancestors 'none'; img-src 'self' data:; media-src 'self'; object-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; worker-src 'none'";
const demoContentSecurityPolicy = "default-src 'self'; base-uri 'self'; connect-src 'none'; font-src 'self'; form-action 'none'; frame-ancestors 'none'; img-src 'self' data:; media-src 'self'; object-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; worker-src 'none'";
const analyticsContentSecurityPolicy = "default-src 'self'; base-uri 'self'; connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com; font-src 'self'; form-action 'none'; frame-ancestors 'none'; img-src 'self' data: https://www.google-analytics.com https://*.google-analytics.com; media-src 'self'; object-src 'none'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; worker-src 'none'";
const commonSecurityHeaders = {
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': 'camera=(), microphone=(), geolocation=()',
};
const apiSecurityHeaders = {
  ...commonSecurityHeaders,
  'content-security-policy': isolatedContentSecurityPolicy,
  'cache-control': 'no-store',
  'cross-origin-resource-policy': 'same-origin',
};

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const capabilities = resolveRuntimeCapabilities(env);
    if (url.pathname === '/api/capabilities') {
      if (request.method !== 'GET') return apiJson({ error: 'method_not_allowed' }, 405, { allow: 'GET' }, capabilities);
      return apiJson(capabilities, 200, {}, capabilities);
    }
    if (url.pathname === '/api/leads') {
      if (request.method !== 'POST') return apiJson({ error: 'method_not_allowed' }, 405, { allow: 'POST' }, capabilities);
      if (capabilities.operations.commercialLead !== 'active') {
        return apiJson({ ok: false, outcome: 'blocked', error: 'commercial_leads_disabled' }, 403, {}, capabilities);
      }
      if (!isJsonRequest(request)) return apiJson({ error: 'unsupported_media_type' }, 415, {}, capabilities);
      const response = await handleLead(request, env);
      const headers = new Headers(response.headers);
      Object.entries(apiSecurityHeaders).forEach(([key, value]) => headers.set(key, value));
      headers.set('x-logic-runtime-mode', capabilities.mode);
      return new Response(response.body, { status: response.status, headers });
    }
    if (url.pathname === '/api' || url.pathname.startsWith('/api/')) return apiJson({ error: 'not_found' }, 404, {}, capabilities);
    const response = await env.ASSETS.fetch(request);
    const headers = new Headers(response.headers);
    Object.entries(commonSecurityHeaders).forEach(([key, value]) => headers.set(key, value));
    headers.set('content-security-policy', capabilities.providers.analytics === 'live'
      ? analyticsContentSecurityPolicy
      : isolatedContentSecurityPolicy);
    headers.set('x-logic-runtime-mode', capabilities.mode);
    if (isDemoPath(url.pathname)) {
      headers.set('x-robots-tag', 'noindex, nofollow');
      // Demo routes never inherit a provider-enabled policy, even in a real deployment.
      headers.set('content-security-policy', demoContentSecurityPolicy);
    }
    return new Response(response.body, { status: response.status, headers });
  },

  async scheduled(_controller: ScheduledController, env: Env): Promise<void> {
    // There are no scheduled capabilities in this product. Keeping the handler
    // explicit makes an accidental trigger a verified no-op in demo and real mode.
    if (!resolveRuntimeCapabilities(env).jobs) return;
  },
};

export default worker;

function isJsonRequest(request: Request): boolean {
  return request.headers.get('content-type')?.split(';', 1)[0]?.trim().toLowerCase() === 'application/json';
}

function apiJson(
  body: unknown,
  status: number,
  headers: Record<string, string> = {},
  capabilities?: RuntimeCapabilityManifest,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...apiSecurityHeaders,
      ...(capabilities ? { 'x-logic-runtime-mode': capabilities.mode } : {}),
      ...headers,
    },
  });
}
