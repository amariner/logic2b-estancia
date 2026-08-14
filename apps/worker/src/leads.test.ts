import { afterEach, describe, expect, it, vi } from 'vitest';
import { handleLead, leadSchema } from './leads';

const lead = { name: 'Ada', businessName: 'Casa Ada', email: 'ada@example.test', accommodationType: 'rural', propertyCount: 2, unitCount: 4, accept: true, website: '', lang: 'es' };

describe('leads', () => {
  afterEach(() => vi.restoreAllMocks());
  it('requires explicit consent', () => expect(leadSchema.safeParse({ ...lead, accept: false }).success).toBe(false));
  it('fails closed when delivery is disabled', async () => {
    const response = await handleLead(new Request('https://test/api/leads', { method: 'POST', headers: { 'content-type': 'application/json', 'cf-connecting-ip': '1.1.1.1' }, body: JSON.stringify(lead) }), { LEADS_TRANSPORT: 'disabled' });
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ outcome: 'disabled' });
  });
  it('does not send a honeypot submission', async () => {
    const fetcher = vi.spyOn(globalThis, 'fetch');
    const response = await handleLead(new Request('https://test/api/leads', { method: 'POST', headers: { 'content-type': 'application/json', 'cf-connecting-ip': '2.2.2.2' }, body: JSON.stringify({ ...lead, website: 'spam.test' }) }), { LEADS_TRANSPORT: 'resend', LEADS_RESEND_API_KEY: 'secret' });
    expect(response.status).toBe(202); expect(fetcher).not.toHaveBeenCalled();
  });
  it('reports provider failure instead of claiming delivery', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('no', { status: 500 }));
    const response = await handleLead(new Request('https://test/api/leads', { method: 'POST', headers: { 'content-type': 'application/json', 'cf-connecting-ip': '3.3.3.3' }, body: JSON.stringify(lead) }), { LEADS_TRANSPORT: 'resend', LEADS_RESEND_API_KEY: 'secret' });
    expect(response.status).toBe(502); expect(await response.json()).toMatchObject({ outcome: 'failed' });
  });
});
