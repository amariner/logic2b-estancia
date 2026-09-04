import { describe, expect, it } from 'vitest';
import { CAPABILITIES, CAPABILITY_STATUSES, CHANNEL_READINESS_CONTRACTS, CHANNEL_READINESS_FIELDS, DATA_SOURCE_READINESS, DATA_SOURCE_READINESS_FIELDS, DEMO_PLANS, EMAIL_DELIVERY_READINESS, EMAIL_DELIVERY_READINESS_FIELDS, PAYMENT_READINESS, PAYMENT_READINESS_FIELDS, WEBSITE_PUBLICATION_READINESS, WEBSITE_PUBLICATION_READINESS_FIELDS, hasLevel, nights, normalizePlanLevel, recommendLevel, validateOrganization, type StayOrganization } from './index';

const mono: StayOrganization = {
  id: 'org-nivora', name: 'Nivora One', vertical: 'apartment', mode: 'mono', currency: 'EUR',
  properties: [{ id: 'nivora', organizationId: 'org-nivora', name: 'Nivora One', city: 'City', units: [
    { id: 'nivora-1', propertyId: 'nivora', name: 'Nivora One', type: 'apartment', assignMode: 'specific-unit', capacity: 4 },
  ] }],
};

describe('domain', () => {
  it('models checkout as an exclusive date', () => expect(nights({ dateFrom: '2026-09-02', dateTo: '2026-09-05' })).toBe(3));
  it('keeps mono on the shared hierarchy', () => expect(validateOrganization(mono)).toEqual(mono));
  it('rejects a mono organization with extra properties', () => expect(() => validateOrganization({ ...mono, properties: [...mono.properties, mono.properties[0]!] })).toThrow('mono_requires'));
  it('orders the commercial ladder', () => expect(hasLevel('inteligente', 'gestion')).toBe(true));
  it('normalizes legacy public values', () => {
    expect(normalizePlanLevel('inicio')).toBe('basico');
    expect(normalizePlanLevel('automatiza')).toBe('inteligente');
  });
  it('keeps one canonical plan for every fictional demo', () => {
    expect(DEMO_PLANS).toEqual({ nivora: 'basico', terrava: 'gestion', aurem: 'inteligente' });
    expect(CAPABILITIES.filter(({ evidence }) => evidence.surface !== 'none').every(({ evidence, minimumPlan }) => evidence.surface !== 'none' && DEMO_PLANS[evidence.demo] === minimumPlan)).toBe(true);
  });
  it('keeps the capability map internally valid', () => {
    expect(new Set(CAPABILITIES.map(({ id }) => id)).size).toBe(CAPABILITIES.length);
    expect(CAPABILITIES.every(({ minimumPlan }) => ['basico', 'gestion', 'inteligente'].includes(minimumPlan))).toBe(true);
    expect(CAPABILITY_STATUSES).toEqual(['demo_visual_disponible', 'demo_visual_pendiente', 'solo_interna', 'activable_por_proyecto', 'en_ruta']);
    expect(CAPABILITIES.every(({ status }) => CAPABILITY_STATUSES.includes(status))).toBe(true);
    expect(CAPABILITIES.every((capability) => !('maturity' in capability))).toBe(true);
    expect(CAPABILITIES.every(({ evidence }) => evidence.proof.es && evidence.proof.en && evidence.boundary.es && evidence.boundary.en)).toBe(true);
    expect(CAPABILITIES.filter(({ evidence }) => evidence.surface === 'demo-site').every(({ evidence }) => evidence.demo === 'nivora' && evidence.anchor && !evidence.view)).toBe(true);
    expect(CAPABILITIES.filter(({ evidence }) => evidence.surface === 'workspace').every(({ evidence }) => evidence.demo !== 'nivora' && evidence.view && !evidence.anchor)).toBe(true);
    expect(CAPABILITIES.filter(({ status }) => ['demo_visual_disponible', 'activable_por_proyecto'].includes(status)).every(({ evidence }) => evidence.surface !== 'none')).toBe(true);
    expect(CAPABILITIES.filter(({ status }) => ['demo_visual_pendiente', 'solo_interna', 'en_ruta'].includes(status)).every(({ evidence }) => evidence.surface === 'none')).toBe(true);
  });
  it('states the current public evidence for every capability without overstating hidden views', () => {
    expect(Object.fromEntries(CAPABILITIES.map(({ id, status }) => [id, status]))).toEqual({
      'brand-web': 'demo_visual_disponible',
      'email-enquiries': 'demo_visual_disponible',
      'enquiry-workspace': 'demo_visual_disponible',
      planning: 'demo_visual_disponible',
      'guest-context': 'demo_visual_disponible',
      'website-editor': 'demo_visual_disponible',
      'basic-reports': 'demo_visual_disponible',
      'explainable-revenue': 'demo_visual_disponible',
      'operations-centre': 'demo_visual_disponible',
      cleaning: 'demo_visual_disponible',
      maintenance: 'demo_visual_disponible',
      roles: 'demo_visual_disponible',
      channels: 'activable_por_proyecto',
      automation: 'demo_visual_disponible',
      'supervised-ai': 'demo_visual_disponible',
      revenue: 'en_ruta',
    });
    const exposedWorkspaceViews = new Set(['home', 'enquiries', 'planning', 'bookings', 'guests', 'cleaning', 'maintenance', 'website', 'channels', 'automations', 'automation', 'control', 'reports']);
    expect(CAPABILITIES.filter(({ evidence }) => evidence.surface === 'workspace').every(({ evidence }) => evidence.surface === 'workspace' && exposedWorkspaceViews.has(evidence.view))).toBe(true);
  });
  it('keeps channel readiness complete, generic and disconnected until provider validation', () => {
    expect(CHANNEL_READINESS_CONTRACTS).toHaveLength(4);
    expect(new Set(CHANNEL_READINESS_CONTRACTS.map(({ id }) => id)).size).toBe(4);
    expect(CHANNEL_READINESS_FIELDS).toEqual([
      'owner', 'permissions', 'credentialReference', 'mapping', 'sandboxCases', 'idempotency',
      'reconciliation', 'failureRecovery', 'audit', 'acceptance', 'killSwitch', 'rollback',
    ]);
    for (const contract of CHANNEL_READINESS_CONTRACTS) {
      expect(contract.connectionState).toBe('not_connected');
      expect(contract.readinessState).toBe('not_validated');
      expect(Object.keys(contract.requirements)).toEqual([...CHANNEL_READINESS_FIELDS]);
      expect(Object.values(contract.requirements).every(({ es, en }) => es.length > 0 && en.length > 0)).toBe(true);
    }
    expect(JSON.stringify(CHANNEL_READINESS_CONTRACTS)).not.toMatch(/booking\.com|airbnb|expedia/i);
  });
  it('keeps supervised website publication readiness complete and disconnected from live infrastructure', () => {
    expect(WEBSITE_PUBLICATION_READINESS).toMatchObject({
      demo: 'terrava',
      minimumPlan: 'gestion',
      readinessState: 'not_validated',
    });
    expect(WEBSITE_PUBLICATION_READINESS_FIELDS).toEqual([
      'owner', 'permissions', 'repositoryReference', 'version', 'isolatedPreview', 'contentValidation',
      'failureCases', 'audit', 'acceptance', 'changeWindow', 'killSwitch', 'rollback',
    ]);
    expect(Object.keys(WEBSITE_PUBLICATION_READINESS.requirements)).toEqual([...WEBSITE_PUBLICATION_READINESS_FIELDS]);
    expect(Object.values(WEBSITE_PUBLICATION_READINESS.requirements).every(({ es, en }) => es.length > 0 && en.length > 0)).toBe(true);
    expect(JSON.stringify(WEBSITE_PUBLICATION_READINESS)).not.toMatch(/https?:\/\/|token[=:]|secret[=:]/i);
  });
  it('keeps product email delivery readiness complete and separate from commercial lead intake', () => {
    expect(EMAIL_DELIVERY_READINESS).toMatchObject({
      demo: 'nivora',
      minimumPlan: 'basico',
      readinessState: 'not_validated',
    });
    expect(EMAIL_DELIVERY_READINESS_FIELDS).toEqual([
      'owner', 'lawfulBasis', 'permissions', 'providerCategory', 'configurationReference', 'templates',
      'routing', 'idempotency', 'failureRecovery', 'audit', 'acceptance', 'killSwitch', 'rollback',
    ]);
    expect(Object.keys(EMAIL_DELIVERY_READINESS.labels)).toEqual([...EMAIL_DELIVERY_READINESS_FIELDS]);
    expect(Object.keys(EMAIL_DELIVERY_READINESS.requirements)).toEqual([...EMAIL_DELIVERY_READINESS_FIELDS]);
    expect(Object.values(EMAIL_DELIVERY_READINESS.labels).every(({ es, en }) => es.length > 0 && en.length > 0)).toBe(true);
    expect(Object.values(EMAIL_DELIVERY_READINESS.requirements).every(({ es, en }) => es.length > 0 && en.length > 0)).toBe(true);
    expect(JSON.stringify(EMAIL_DELIVERY_READINESS)).not.toMatch(/https?:\/\/|@[a-z0-9.-]+\.(?!example\b)[a-z]{2,}|api[_-]?key[=:]|token[=:]|secret[=:]/i);
  });
  it('keeps payment readiness complete, generic and unable to charge', () => {
    expect(PAYMENT_READINESS).toMatchObject({
      scopeState: 'separate_project_scope',
      readinessState: 'not_validated',
      executionState: 'unavailable',
    });
    expect(PAYMENT_READINESS_FIELDS).toEqual([
      'ownerScope', 'permissions', 'providerCategory', 'configurationReference', 'testEnvironment',
      'currenciesAmounts', 'paymentLifecycle', 'idempotency', 'webhooks', 'reconciliation',
      'failureRecovery', 'audit', 'acceptance', 'killSwitch', 'rollback',
    ]);
    expect(Object.keys(PAYMENT_READINESS.labels)).toEqual([...PAYMENT_READINESS_FIELDS]);
    expect(Object.keys(PAYMENT_READINESS.requirements)).toEqual([...PAYMENT_READINESS_FIELDS]);
    expect(Object.values(PAYMENT_READINESS.labels).every(({ es, en }) => es.length > 0 && en.length > 0)).toBe(true);
    expect(Object.values(PAYMENT_READINESS.requirements).every(({ es, en }) => es.length > 0 && en.length > 0)).toBe(true);
    expect(JSON.stringify(PAYMENT_READINESS)).not.toMatch(/https?:\/\/|stripe|adyen|paypal|merchant[_-]?id[=:]|api[_-]?key[=:]|token[=:]|secret[=:]|\b\d{13,19}\b/i);
  });
  it('keeps data source readiness complete, generic and unable to synchronise', () => {
    expect(DATA_SOURCE_READINESS).toMatchObject({
      scopeState: 'separate_project_scope',
      readinessState: 'not_validated',
      executionState: 'unavailable',
    });
    expect(DATA_SOURCE_READINESS_FIELDS).toEqual([
      'ownerSource', 'purposeMinimization', 'permissions', 'providerCategory', 'configurationReference',
      'entitiesFields', 'identifiersMatching', 'baselineMigration', 'isolatedCases', 'idempotency',
      'reconciliation', 'failureRecovery', 'audit', 'acceptance', 'killSwitch', 'rollback',
    ]);
    expect(Object.keys(DATA_SOURCE_READINESS.labels)).toEqual([...DATA_SOURCE_READINESS_FIELDS]);
    expect(Object.keys(DATA_SOURCE_READINESS.requirements)).toEqual([...DATA_SOURCE_READINESS_FIELDS]);
    expect(Object.values(DATA_SOURCE_READINESS.labels).every(({ es, en }) => es.length > 0 && en.length > 0)).toBe(true);
    expect(Object.values(DATA_SOURCE_READINESS.requirements).every(({ es, en }) => es.length > 0 && en.length > 0)).toBe(true);
    expect(JSON.stringify(DATA_SOURCE_READINESS)).not.toMatch(/https?:\/\/|\b(?:cloudbeds|mews|opera|roomraccoon|siteminder)\b|api[_-]?key[=:]|token[=:]|secret[=:]|@[a-z0-9.-]+\.\w+|\b\d{8,}\b/i);
  });
  it.each([
    [{ propertyCount: 1, unitCount: 1, wantsBookings: false, wantsAutomation: false, wantsOperations: false }, 'basico'],
    [{ propertyCount: 2, unitCount: 50, wantsBookings: false, wantsAutomation: false, wantsOperations: false }, 'basico'],
    [{ propertyCount: 1, unitCount: 1, wantsBookings: true, wantsAutomation: false, wantsOperations: false }, 'gestion'],
    [{ propertyCount: 1, unitCount: 1, wantsBookings: false, wantsAutomation: true, wantsOperations: false }, 'inteligente'],
    [{ propertyCount: 1, unitCount: 1, wantsBookings: false, wantsAutomation: false, wantsOperations: true }, 'inteligente'],
  ] as const)('recommends the smallest level that covers %#', (signals, expected) => {
    expect(recommendLevel(signals)).toBe(expected);
  });
});
