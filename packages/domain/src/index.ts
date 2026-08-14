export type Vertical = 'apartment' | 'rural' | 'hotel';
export type BusinessMode = 'mono' | 'multi';
export type PlanLevel = 'inicio' | 'gestion' | 'automatiza' | 'inteligente';
export type DemoRole = 'direction' | 'reception' | 'cleaning';
export type Maturity = 'available' | 'functional-demo' | 'next-to-validate' | 'future';

export type AssignMode = 'specific-unit' | 'unit-type';

export interface ReservableUnit {
  id: string;
  propertyId: string;
  name: string;
  type: string;
  assignMode: AssignMode;
  capacity: number;
}

export interface StayProperty {
  id: string;
  organizationId: string;
  name: string;
  city: string;
  units: ReservableUnit[];
}

export interface StayOrganization {
  id: string;
  name: string;
  vertical: Vertical;
  mode: BusinessMode;
  currency: 'EUR';
  properties: StayProperty[];
}

export interface StayRange {
  dateFrom: string;
  dateTo: string;
}

export function nights(range: StayRange): number {
  const from = Date.parse(`${range.dateFrom}T00:00:00Z`);
  const to = Date.parse(`${range.dateTo}T00:00:00Z`);
  if (!Number.isFinite(from) || !Number.isFinite(to) || to <= from) {
    throw new Error('invalid_stay_range');
  }
  return Math.round((to - from) / 86_400_000);
}

export function validateOrganization(org: StayOrganization): StayOrganization {
  if (org.properties.length === 0) throw new Error('organization_without_property');
  const units = org.properties.flatMap((property) => property.units);
  if (units.length === 0) throw new Error('organization_without_unit');
  if (org.mode === 'mono' && (org.properties.length !== 1 || units.length !== 1)) {
    throw new Error('mono_requires_single_property_and_unit');
  }
  for (const property of org.properties) {
    if (property.organizationId !== org.id) throw new Error('property_outside_organization');
    for (const unit of property.units) {
      if (unit.propertyId !== property.id) throw new Error('unit_outside_property');
      if (org.vertical === 'hotel' && unit.assignMode !== 'unit-type') {
        throw new Error('hotel_units_are_assigned_by_type');
      }
    }
  }
  return org;
}

export const LEVELS: Record<PlanLevel, { rank: number; capabilities: string[] }> = {
  inicio: { rank: 0, capabilities: ['web', 'seo', 'enquiries'] },
  gestion: {
    rank: 1,
    capabilities: ['booking-engine', 'payments-optional', 'planning', 'guests', 'cleaning-basic', 'ical'],
  },
  automatiza: {
    rank: 2,
    capabilities: ['templates', 'reminders', 'reviews', 'channel-provider', 'supervised-copilot'],
  },
  inteligente: {
    rank: 3,
    capabilities: ['operations-centre', 'advanced-cleaning', 'maintenance', 'teams', 'revenue', 'forecast'],
  },
};

export function hasLevel(current: PlanLevel, required: PlanLevel): boolean {
  return LEVELS[current].rank >= LEVELS[required].rank;
}
