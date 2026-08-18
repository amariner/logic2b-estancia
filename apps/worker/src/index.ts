import { handleLead, isDemoPath, type LeadEnv } from './leads';

export { LeadCoordinator } from './lead-coordinator';

interface Env extends LeadEnv { ASSETS: Fetcher; }

const publicContentSecurityPolicy = "base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'";
const demoContentSecurityPolicy = "base-uri 'self'; form-action 'none'; frame-ancestors 'none'; object-src 'none'";
const securityHeaders = {
  'content-security-policy': publicContentSecurityPolicy,
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': 'camera=(), microphone=(), geolocation=()',
};
const apiSecurityHeaders = {
  ...securityHeaders,
  'cache-control': 'no-store',
  'cross-origin-resource-policy': 'same-origin',
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/api/leads') {
      if (request.method !== 'POST') return apiJson({ error: 'method_not_allowed' }, 405, { allow: 'POST' });
      if (!isJsonRequest(request)) return apiJson({ error: 'unsupported_media_type' }, 415);
      const response = await handleLead(request, env);
      const headers = new Headers(response.headers);
      Object.entries(apiSecurityHeaders).forEach(([key, value]) => headers.set(key, value));
      return new Response(response.body, { status: response.status, headers });
    }
    if (url.pathname === '/api' || url.pathname.startsWith('/api/')) return apiJson({ error: 'not_found' }, 404);
    const response = await env.ASSETS.fetch(request);
    const headers = new Headers(response.headers);
    Object.entries(securityHeaders).forEach(([key, value]) => headers.set(key, value));
    if (isDemoPath(url.pathname)) {
      headers.set('x-robots-tag', 'noindex, nofollow');
      headers.set('content-security-policy', demoContentSecurityPolicy);
    }
    return new Response(response.body, { status: response.status, headers });
  },
};

function isJsonRequest(request: Request): boolean {
  return request.headers.get('content-type')?.split(';', 1)[0]?.trim().toLowerCase() === 'application/json';
}

function apiJson(body: unknown, status: number, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...apiSecurityHeaders, ...headers },
  });
}
