import { describe, expect, it, vi } from 'vitest';
import { createTestLead, runSmoke, sanitizeResponse, validateOptions } from './smoke-resend.mjs';

const authorization = {
  DEMO_MODE: 'false',
  COMMERCIAL_LEADS_ENABLED: 'true',
  LOGIC_ESTANCIA_SMOKE_AUTHORIZATION: 'SEND_IDENTIFIED_TEST_EMAIL',
  LOGIC_ESTANCIA_SMOKE_VISITOR_EMAIL: 'smoke@example.test',
};
const reference = '36c0d872-4eb2-4f47-8c06-380b82834758';

describe('Resend smoke tool', () => {
  it('stays offline by default and does not require an email', async () => {
    const fetchImplementation = vi.fn();
    const result = await runSmoke({ args: ['--run-id', 'release-20260817'], environment: {}, fetchImplementation });
    expect(result).toMatchObject({ exitCode: 0, stream: 'stdout' });
    expect(JSON.parse(result.output)).toMatchObject({ mode: 'dry-run', networkRequest: false });
    expect(fetchImplementation).not.toHaveBeenCalled();
  });

  it('accepts the pnpm option separator', async () => {
    const result = await runSmoke({ args: ['--', '--run-id', 'release-20260817'], environment: {}, fetchImplementation: vi.fn() });
    expect(result.exitCode).toBe(0);
  });

  it('requires an explicit authorization value before sending', () => {
    expect(() => validateOptions({ execute: true, runId: 'release-20260817', baseUrl: 'https://estancia.logic2b.com' }, { DEMO_MODE: 'false', COMMERCIAL_LEADS_ENABLED: 'true' }))
      .toThrow(/autorización explícita/);
  });

  it('rejects execution in demo or ambiguous mode before making a request', async () => {
    for (const DEMO_MODE of [undefined, 'true', 'FALSE']) {
      const fetchImplementation = vi.fn();
      const result = await runSmoke({
        args: ['--execute', '--run-id', 'release-20260817'],
        environment: { ...authorization, DEMO_MODE },
        fetchImplementation,
      }).catch((error) => ({ exitCode: 1, output: String(error) }));
      expect(result.output).toContain('DEMO_MODE=false');
      expect(fetchImplementation).not.toHaveBeenCalled();
    }
  });

  it('rejects short run identifiers and unsafe origins', () => {
    expect(() => validateOptions({ execute: false, runId: 'short', baseUrl: 'https://estancia.logic2b.com' }, {})).toThrow(/run-id/);
    expect(() => validateOptions({ execute: false, runId: 'release-20260817', baseUrl: 'ftp://localhost' }, {})).toThrow(/base-url/);
    expect(() => validateOptions({ execute: false, runId: 'release-20260817', baseUrl: 'https://user:secret@example.test' }, {})).toThrow(/base-url/);
  });

  it('marks every submitted field as a technical test without marketing consent', () => {
    const lead = createTestLead('release-20260817', 'smoke@example.test');
    expect(lead).toMatchObject({ marketingConsent: false, accept: true, sourcePath: '/ops/resend-smoke' });
    expect(`${lead.name} ${lead.businessName} ${lead.message}`).toMatch(/SMOKE TEST|PRUEBA TECNICA/);
  });

  it('prints only an allowlisted response summary and never the email', async () => {
    const fetchImplementation = vi.fn()
      .mockResolvedValueOnce(commercialRuntimeResponse())
      .mockResolvedValueOnce(new Response(JSON.stringify({
      ok: true,
      outcome: 'delivered',
      ref: reference,
      meetingUrl: 'https://calendar.example.test/private',
      echoedEmail: 'smoke@example.test',
      }), { status: 202 }));
    const result = await runSmoke({
      args: ['--execute', '--run-id', 'release-20260817'],
      environment: authorization,
      fetchImplementation,
    });
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain(reference);
    expect(result.output).not.toContain('smoke@example.test');
    expect(result.output).not.toContain('calendar.example.test');
  });

  it('fails when replay verification returns a different reference', async () => {
    const fetchImplementation = vi.fn()
      .mockResolvedValueOnce(commercialRuntimeResponse())
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true, outcome: 'delivered', ref: reference, replayed: true }), { status: 202 }));
    const result = await runSmoke({
      args: ['--execute', '--run-id', 'release-20260817', '--expect-ref', 'ce74de03-c7db-4cf7-9624-133e09be6972'],
      environment: authorization,
      fetchImplementation,
    });
    expect(result.exitCode).toBe(1);
    expect(result.output).toContain('expectedReferenceMatched');
  });

  it('treats a degraded provider result as a failed smoke', async () => {
    const fetchImplementation = vi.fn()
      .mockResolvedValueOnce(commercialRuntimeResponse())
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true, outcome: 'delivered_degraded', ref: reference }), { status: 202 }));
    const result = await runSmoke({
      args: ['--execute', '--run-id', 'release-20260817'],
      environment: authorization,
      fetchImplementation,
    });
    expect(result.exitCode).toBe(1);
    expect(result.output).toContain('entrega completa');
  });

  it('refuses a remote demo manifest before posting the lead', async () => {
    const fetchImplementation = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      mode: 'demo', demoMode: true, sideEffects: false,
      providers: { email: 'disabled' }, operations: { commercialLead: 'blocked' },
    }), { status: 200 }));
    const result = await runSmoke({
      args: ['--execute', '--run-id', 'release-20260817'],
      environment: authorization,
      fetchImplementation,
    });
    expect(result.exitCode).toBe(1);
    expect(result.output).toContain('No se enviará ningún correo');
    expect(fetchImplementation).toHaveBeenCalledOnce();
  });

  it('refuses an inconsistent real manifest before posting the lead', async () => {
    const fetchImplementation = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      schemaVersion: '1.0.0', mode: 'real', demoMode: false, sideEffects: true, durableWrites: false, jobs: false,
      providers: { email: 'live' }, operations: { commercialLead: 'active' },
    }), { status: 200 }));
    const result = await runSmoke({
      args: ['--execute', '--run-id', 'release-20260817'],
      environment: authorization,
      fetchImplementation,
    });
    expect(result.exitCode).toBe(1);
    expect(fetchImplementation).toHaveBeenCalledOnce();
  });

  it('drops unexpected provider fields from error output', () => {
    const result = sanitizeResponse(400, { outcome: 'person@example.test', error: 'secret-value', issues: [{ input: 'secret' }], email: 'person@example.test' });
    expect(result).toEqual({ ok: false, httpStatus: 400, outcome: 'unknown', ref: undefined, replayed: false, error: undefined, retryAfter: undefined });
  });
});

function commercialRuntimeResponse() {
  return new Response(JSON.stringify({
    schemaVersion: '1.0.0', mode: 'demo', demoMode: true, sideEffects: true, durableWrites: true, jobs: false,
    commercialLeadsEnabled: true,
    providers: { email: 'live' }, operations: { commercialLead: 'active' },
  }), { status: 200 });
}
