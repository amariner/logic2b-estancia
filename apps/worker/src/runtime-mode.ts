import { z } from 'zod';

export type ProviderMode = 'capture' | 'mock' | 'disabled' | 'live';
export type EmailProviderSelection = Exclude<ProviderMode, 'live'> | 'resend';
export type AnalyticsProviderSelection = Exclude<ProviderMode, 'live'> | 'gtm';

export interface RuntimeModeEnv {
  DEMO_MODE?: string;
  REAL_OPERATIONS_ENABLED?: string;
  /**
   * Explicit allowlist for the only public side effect: a prospective
   * customer's commercial enquiry. It is intentionally independent from the
   * product-demo switch so a safe demo can still capture its own leads.
   */
  COMMERCIAL_LEADS_ENABLED?: string;
  EMAIL_PROVIDER_MODE?: EmailProviderSelection;
  ANALYTICS_PROVIDER_MODE?: AnalyticsProviderSelection;
  LEADS_TRANSPORT?: 'resend' | 'disabled' | 'demo';
  LEADS_RESEND_API_KEY?: string;
  LEADS_FROM_EMAIL?: string;
  LEADS_INTERNAL_RECIPIENT?: string;
  LEADS_REPLY_TO?: string;
}

export interface RuntimeCapabilityManifest {
  schemaVersion: '1.0.0';
  mode: 'demo' | 'real_locked' | 'real';
  demoMode: boolean;
  /** True only when the public commercial-lead exception is configured. */
  commercialLeadsEnabled: boolean;
  sideEffects: boolean;
  durableWrites: boolean;
  jobs: false;
  providers: {
    analytics: ProviderMode;
    email: ProviderMode;
    payments: 'disabled';
    webhooks: 'disabled';
    externalStorage: 'disabled';
  };
  operations: {
    commercialLead: 'blocked' | 'active';
    payments: 'unavailable';
    webhooks: 'unavailable';
    automations: 'unavailable';
  };
}

export const runtimeEmailConfigurationSchema = z.object({
  apiKey: z.string().trim().min(1),
  fromEmail: z.string().trim().email().max(254),
  internalRecipient: z.string().trim().email().max(254),
  replyTo: z.string().trim().email().max(254),
});

export type RuntimeEmailConfiguration = z.output<typeof runtimeEmailConfigurationSchema>;

const disabledProviders: RuntimeCapabilityManifest['providers'] = {
  analytics: 'disabled',
  email: 'disabled',
  payments: 'disabled',
  webhooks: 'disabled',
  externalStorage: 'disabled',
};

/**
 * Runtime activation is deliberately opt-in. Missing, misspelled or ambiguous
 * values always resolve to the public demo contract.
 */
export function resolveRuntimeCapabilities(env: RuntimeModeEnv): RuntimeCapabilityManifest {
  const demoMode = env.DEMO_MODE !== 'false';
  const realOperationsEnabled = env.REAL_OPERATIONS_ENABLED === 'true';
  const commercialLeadsEnabled = env.COMMERCIAL_LEADS_ENABLED === 'true';
  // Commercial leads are the single allowlisted exception. Product operations
  // and analytics still need an explicitly real deployment.
  const emailActive = commercialLeadsEnabled
    && env.EMAIL_PROVIDER_MODE === 'resend'
    && env.LEADS_TRANSPORT === 'resend'
    && hasCompleteEmailConfiguration(env);
  const analyticsActive = !demoMode && realOperationsEnabled && env.ANALYTICS_PROVIDER_MODE === 'gtm';
  const sideEffects = emailActive || analyticsActive;

  return {
    schemaVersion: '1.0.0',
    mode: demoMode ? 'demo' : sideEffects ? 'real' : 'real_locked',
    demoMode,
    commercialLeadsEnabled,
    sideEffects,
    durableWrites: emailActive,
    jobs: false,
    providers: {
      ...disabledProviders,
      analytics: analyticsActive ? 'live' : 'disabled',
      email: emailActive ? 'live' : 'disabled',
    },
    operations: {
      commercialLead: emailActive ? 'active' : 'blocked',
      payments: 'unavailable',
      webhooks: 'unavailable',
      automations: 'unavailable',
    },
  };
}

export function commercialLeadIsActive(env: RuntimeModeEnv): boolean {
  return resolveRuntimeCapabilities(env).operations.commercialLead === 'active';
}

function hasCompleteEmailConfiguration(env: RuntimeModeEnv): boolean {
  return runtimeEmailConfigurationSchema.safeParse({
    apiKey: env.LEADS_RESEND_API_KEY,
    fromEmail: env.LEADS_FROM_EMAIL,
    internalRecipient: env.LEADS_INTERNAL_RECIPIENT,
    replyTo: env.LEADS_REPLY_TO,
  }).success;
}
