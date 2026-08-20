import { describe, expect, it } from 'vitest';
import { resolveRuntimeCapabilities, type RuntimeModeEnv } from './runtime-mode';

const completeEmailEnv = {
  DEMO_MODE: 'false',
  REAL_OPERATIONS_ENABLED: 'true',
  COMMERCIAL_LEADS_ENABLED: 'true',
  EMAIL_PROVIDER_MODE: 'resend',
  LEADS_TRANSPORT: 'resend',
  LEADS_RESEND_API_KEY: 'test-secret',
  LEADS_FROM_EMAIL: 'delivery@example.test',
  LEADS_INTERNAL_RECIPIENT: 'sales@example.test',
  LEADS_REPLY_TO: 'reply@example.test',
} as const satisfies RuntimeModeEnv;

describe('runtime capability manifest', () => {
  it.each([undefined, 'true', 'TRUE', '1', '', 'false '])('keeps product operations closed for DEMO_MODE=%s', (DEMO_MODE) => {
    const manifest = resolveRuntimeCapabilities({ ...completeEmailEnv, DEMO_MODE });
    expect(manifest).toMatchObject({
      mode: 'demo',
      demoMode: true,
      commercialLeadsEnabled: true,
      sideEffects: true,
      durableWrites: true,
      jobs: false,
      providers: {
        analytics: 'disabled',
        email: 'live',
        payments: 'disabled',
        webhooks: 'disabled',
        externalStorage: 'disabled',
      },
      operations: { commercialLead: 'active', payments: 'unavailable', webhooks: 'unavailable', automations: 'unavailable' },
    });
  });

  it('keeps real mode locked until the deployment and provider are both explicit', () => {
    expect(resolveRuntimeCapabilities({ DEMO_MODE: 'false' })).toMatchObject({
      mode: 'real_locked', sideEffects: false, durableWrites: false,
      providers: { email: 'disabled', analytics: 'disabled' },
      operations: { commercialLead: 'blocked' },
    });
    expect(resolveRuntimeCapabilities({ ...completeEmailEnv, REAL_OPERATIONS_ENABLED: 'false' })).toMatchObject({
      mode: 'real', demoMode: false, providers: { email: 'live', analytics: 'disabled' }, operations: { commercialLead: 'active' },
    });
    expect(resolveRuntimeCapabilities({ ...completeEmailEnv, EMAIL_PROVIDER_MODE: 'capture' })).toMatchObject({
      mode: 'real_locked', operations: { commercialLead: 'blocked' },
    });
  });

  it('fails closed before any commercial delivery unless its own allowlist is exact', () => {
    for (const COMMERCIAL_LEADS_ENABLED of [undefined, 'false', 'TRUE', '1', 'true ']) {
      expect(resolveRuntimeCapabilities({ ...completeEmailEnv, DEMO_MODE: 'true', COMMERCIAL_LEADS_ENABLED })).toMatchObject({
        mode: 'demo',
        commercialLeadsEnabled: false,
        sideEffects: false,
        durableWrites: false,
        providers: { email: 'disabled', analytics: 'disabled' },
        operations: { commercialLead: 'blocked' },
      });
    }
  });

  it('does not activate email when any required secret or address is absent or invalid', () => {
    for (const patch of [
      { LEADS_RESEND_API_KEY: undefined },
      { LEADS_FROM_EMAIL: undefined },
      { LEADS_INTERNAL_RECIPIENT: 'not-an-email' },
      { LEADS_REPLY_TO: '' },
      { LEADS_REPLY_TO: `${'x'.repeat(250)}@example.test` },
    ]) {
      expect(resolveRuntimeCapabilities({ ...completeEmailEnv, ...patch })).toMatchObject({
        mode: 'real_locked', providers: { email: 'disabled' }, operations: { commercialLead: 'blocked' },
      });
    }
  });

  it('activates only the explicitly configured real providers', () => {
    expect(resolveRuntimeCapabilities(completeEmailEnv)).toMatchObject({
      mode: 'real', demoMode: false, sideEffects: true, durableWrites: true, jobs: false,
      providers: { email: 'live', analytics: 'disabled', payments: 'disabled', webhooks: 'disabled' },
      operations: { commercialLead: 'active', payments: 'unavailable', webhooks: 'unavailable', automations: 'unavailable' },
    });
    expect(resolveRuntimeCapabilities({
      DEMO_MODE: 'false', REAL_OPERATIONS_ENABLED: 'true', ANALYTICS_PROVIDER_MODE: 'gtm',
    })).toMatchObject({
      mode: 'real', sideEffects: true, durableWrites: false,
      providers: { analytics: 'live', email: 'disabled' }, operations: { commercialLead: 'blocked' },
    });
  });
});
