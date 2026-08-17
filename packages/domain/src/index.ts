export type Vertical = 'apartment' | 'rural' | 'hotel';
export type BusinessMode = 'mono' | 'multi';
export type PlanLevel = 'basico' | 'gestion' | 'inteligente';
export type LegacyPlanLevel = 'inicio' | 'automatiza';
export type DemoRole = 'direction' | 'reception' | 'cleaning';
export type Maturity = 'demo' | 'simulated' | 'to-validate' | 'future';
export type CapabilityCategory = 'web' | 'reservations' | 'operations' | 'team' | 'revenue' | 'channels' | 'automation' | 'ai';

export interface Capability {
  id: string;
  category: CapabilityCategory;
  minimumPlan: PlanLevel;
  maturity: Maturity;
  evidence?: 'nivora' | 'terrava' | 'aurem';
  label: { es: string; en: string };
  description: { es: string; en: string };
}

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
  basico: { rank: 0, capabilities: ['web', 'seo', 'enquiries', 'hosting', 'maintenance'] },
  gestion: {
    rank: 1,
    capabilities: ['enquiries-workspace', 'bookings', 'planning', 'guests', 'rates', 'reports-basic', 'website-editor'],
  },
  inteligente: {
    rank: 2,
    capabilities: ['operations-centre', 'cleaning', 'maintenance', 'teams', 'channels', 'automation', 'supervised-copilot', 'revenue', 'forecast'],
  },
};

export const CAPABILITIES: readonly Capability[] = [
  { id: 'brand-web', category: 'web', minimumPlan: 'basico', maturity: 'demo', evidence: 'nivora', label: { es: 'Web modular de marca', en: 'Modular brand website' }, description: { es: 'Diseño, contenido, SEO técnico y solicitud directa adaptados al alojamiento.', en: 'Design, content, technical SEO and direct enquiry adapted to the stay.' } },
  { id: 'email-enquiries', category: 'reservations', minimumPlan: 'basico', maturity: 'demo', evidence: 'nivora', label: { es: 'Solicitudes por email', en: 'Email enquiries' }, description: { es: 'Fechas y contacto llegan por email sin bloquear inventario.', en: 'Dates and contact details arrive by email without holding inventory.' } },
  { id: 'enquiry-workspace', category: 'reservations', minimumPlan: 'gestion', maturity: 'demo', evidence: 'terrava', label: { es: 'Solicitudes y reservas', en: 'Enquiries and bookings' }, description: { es: 'Convierte una consulta en alternativa y reserva conservando su contexto.', en: 'Turn an enquiry into an alternative and booking while keeping its context.' } },
  { id: 'planning', category: 'reservations', minimumPlan: 'gestion', maturity: 'demo', evidence: 'terrava', label: { es: 'Planning y tarifas', en: 'Planning and rates' }, description: { es: 'Opera estancias, unidades, huéspedes y precios desde un calendario común.', en: 'Operate stays, units, guests and pricing from one shared calendar.' } },
  { id: 'website-editor', category: 'web', minimumPlan: 'gestion', maturity: 'demo', evidence: 'terrava', label: { es: 'Editor web supervisado', en: 'Supervised website editor' }, description: { es: 'Prepara, previsualiza, publica y revierte cambios de contenido.', en: 'Prepare, preview, publish and revert content changes.' } },
  { id: 'basic-reports', category: 'revenue', minimumPlan: 'gestion', maturity: 'simulated', evidence: 'terrava', label: { es: 'Informes básicos', en: 'Basic reports' }, description: { es: 'Lectura de reservas, ocupación e ingresos con datos de muestra.', en: 'Booking, occupancy and revenue reading with sample data.' } },
  { id: 'operations-centre', category: 'operations', minimumPlan: 'inteligente', maturity: 'demo', evidence: 'aurem', label: { es: 'Centro operativo', en: 'Operations centre' }, description: { es: 'Prioriza llegadas en riesgo y coordina la respuesta del equipo.', en: 'Prioritise at-risk arrivals and coordinate the team response.' } },
  { id: 'cleaning', category: 'operations', minimumPlan: 'inteligente', maturity: 'demo', evidence: 'aurem', label: { es: 'Limpieza y preparación', en: 'Cleaning and preparation' }, description: { es: 'Responsabilidades, revisión y estado de cada habitación.', en: 'Ownership, review and status for every room.' } },
  { id: 'maintenance', category: 'operations', minimumPlan: 'inteligente', maturity: 'demo', evidence: 'aurem', label: { es: 'Mantenimiento', en: 'Maintenance' }, description: { es: 'Incidencias priorizadas, asignadas y resueltas con impacto visible.', en: 'Prioritised, assigned and resolved incidents with visible impact.' } },
  { id: 'roles', category: 'team', minimumPlan: 'inteligente', maturity: 'demo', evidence: 'aurem', label: { es: 'Equipos y permisos', en: 'Teams and permissions' }, description: { es: 'Dirección, recepción y limpieza comparten contexto con acciones delimitadas.', en: 'Management, reception and cleaning share context with bounded actions.' } },
  { id: 'channels', category: 'channels', minimumPlan: 'inteligente', maturity: 'to-validate', evidence: 'aurem', label: { es: 'Canales e inventario', en: 'Channels and inventory' }, description: { es: 'Vista de conectividad cuya integración real se valida por proveedor.', en: 'Connectivity view whose live integration is validated per provider.' } },
  { id: 'automation', category: 'automation', minimumPlan: 'inteligente', maturity: 'simulated', evidence: 'aurem', label: { es: 'Automatizaciones', en: 'Automations' }, description: { es: 'Reglas y recordatorios representados sin ejecutar envíos externos.', en: 'Rules and reminders represented without external delivery.' } },
  { id: 'supervised-ai', category: 'ai', minimumPlan: 'inteligente', maturity: 'simulated', evidence: 'aurem', label: { es: 'Copiloto supervisado', en: 'Supervised copilot' }, description: { es: 'Prepara recomendaciones y mensajes con fuentes y confirmación humana.', en: 'Prepares recommendations and messages with sources and human confirmation.' } },
  { id: 'revenue', category: 'revenue', minimumPlan: 'inteligente', maturity: 'future', evidence: 'aurem', label: { es: 'Revenue y previsión', en: 'Revenue and forecasting' }, description: { es: 'Escenarios de demanda y precio pendientes de validación operacional.', en: 'Demand and pricing scenarios pending operational validation.' } },
] as const;

export function hasLevel(current: PlanLevel, required: PlanLevel): boolean {
  return LEVELS[current].rank >= LEVELS[required].rank;
}

export function normalizePlanLevel(value: PlanLevel | LegacyPlanLevel): PlanLevel {
  if (value === 'inicio') return 'basico';
  if (value === 'automatiza') return 'inteligente';
  return value;
}

export interface ScopeSignals {
  propertyCount: number;
  unitCount: number;
  wantsBookings: boolean;
  wantsAutomation: boolean;
  wantsOperations: boolean;
}

export function recommendLevel(signals: ScopeSignals): PlanLevel {
  if (signals.wantsOperations || signals.wantsAutomation) return 'inteligente';
  if (signals.wantsBookings) return 'gestion';
  return 'basico';
}
