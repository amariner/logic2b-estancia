import { describe, expect, it } from 'vitest';
import { CAPABILITIES, hasLevel, nights, normalizePlanLevel, recommendLevel, validateOrganization, type StayOrganization } from './index';

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
  it('keeps the capability map internally valid', () => {
    expect(new Set(CAPABILITIES.map(({ id }) => id)).size).toBe(CAPABILITIES.length);
    expect(CAPABILITIES.every(({ minimumPlan }) => ['basico', 'gestion', 'inteligente'].includes(minimumPlan))).toBe(true);
    expect(CAPABILITIES.every(({ evidence }) => evidence.proof.es && evidence.proof.en && evidence.boundary.es && evidence.boundary.en)).toBe(true);
    expect(CAPABILITIES.filter(({ evidence }) => evidence.surface === 'demo-site').every(({ evidence }) => evidence.demo === 'nivora' && evidence.anchor && !evidence.view)).toBe(true);
    expect(CAPABILITIES.filter(({ evidence }) => evidence.surface === 'workspace').every(({ evidence }) => evidence.demo !== 'nivora' && evidence.view && !evidence.anchor)).toBe(true);
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
