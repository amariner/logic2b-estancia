import { describe, expect, it } from 'vitest';
import { hasLevel, nights, validateOrganization, type StayOrganization } from './index';

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
});
