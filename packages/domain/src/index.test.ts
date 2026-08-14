import { describe, expect, it } from 'vitest';
import { hasLevel, nights, recommendLevel, validateOrganization, type StayOrganization } from './index';

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
  it.each([
    [{ propertyCount: 1, unitCount: 1, wantsBookings: false, wantsAutomation: false, wantsOperations: false }, 'inicio'],
    [{ propertyCount: 2, unitCount: 2, wantsBookings: false, wantsAutomation: false, wantsOperations: false }, 'gestion'],
    [{ propertyCount: 1, unitCount: 12, wantsBookings: false, wantsAutomation: false, wantsOperations: false }, 'automatiza'],
    [{ propertyCount: 1, unitCount: 40, wantsBookings: false, wantsAutomation: false, wantsOperations: false }, 'inteligente'],
    [{ propertyCount: 1, unitCount: 1, wantsBookings: true, wantsAutomation: false, wantsOperations: false }, 'gestion'],
    [{ propertyCount: 1, unitCount: 1, wantsBookings: false, wantsAutomation: true, wantsOperations: false }, 'automatiza'],
    [{ propertyCount: 1, unitCount: 1, wantsBookings: false, wantsAutomation: false, wantsOperations: true }, 'inteligente'],
  ] as const)('recommends the smallest level that covers %#', (signals, expected) => {
    expect(recommendLevel(signals)).toBe(expected);
  });
});
