import { describe, expect, it } from 'vitest';
import { CAPABILITIES, CAPABILITY_STATUSES, DEMO_PLANS, hasLevel, nights, normalizePlanLevel, recommendLevel, validateOrganization, type StayOrganization } from './index';

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
      'website-editor': 'demo_visual_pendiente',
      'basic-reports': 'demo_visual_disponible',
      'explainable-revenue': 'demo_visual_disponible',
      'operations-centre': 'demo_visual_disponible',
      cleaning: 'demo_visual_disponible',
      maintenance: 'demo_visual_disponible',
      roles: 'demo_visual_disponible',
      channels: 'activable_por_proyecto',
      automation: 'demo_visual_pendiente',
      'supervised-ai': 'demo_visual_disponible',
      revenue: 'en_ruta',
    });
    const exposedWorkspaceViews = new Set(['home', 'enquiries', 'planning', 'bookings', 'guests', 'cleaning', 'maintenance', 'channels', 'automation', 'control', 'reports']);
    expect(CAPABILITIES.filter(({ evidence }) => evidence.surface === 'workspace').every(({ evidence }) => evidence.surface === 'workspace' && exposedWorkspaceViews.has(evidence.view))).toBe(true);
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
