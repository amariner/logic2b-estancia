export type Vertical = 'apartment' | 'rural' | 'hotel';
export type BusinessMode = 'mono' | 'multi';
export type PlanLevel = 'basico' | 'gestion' | 'inteligente';
export type LegacyPlanLevel = 'inicio' | 'automatiza';
export type DemoRole = 'direction' | 'reception' | 'cleaning';
export const CAPABILITY_STATUSES = [
  'demo_visual_disponible',
  'demo_visual_pendiente',
  'solo_interna',
  'activable_por_proyecto',
  'en_ruta',
] as const;
export type CapabilityStatus = (typeof CAPABILITY_STATUSES)[number];
export type CapabilityCategory = 'web' | 'reservations' | 'operations' | 'team' | 'revenue' | 'channels' | 'automation' | 'ai';
export type EvidenceView = 'home' | 'enquiries' | 'planning' | 'bookings' | 'guests' | 'cleaning' | 'maintenance' | 'channels' | 'automation' | 'control' | 'reports';

export const DEMO_PLANS = {
  nivora: 'basico',
  terrava: 'gestion',
  aurem: 'inteligente',
} as const satisfies Record<string, PlanLevel>;

export type DemoSlug = keyof typeof DEMO_PLANS;

interface CapabilityEvidenceCopy {
  proof: { es: string; en: string };
  boundary: { es: string; en: string };
}

export type CapabilityEvidence = CapabilityEvidenceCopy & (
  | { surface: 'demo-site'; demo: DemoSlug; anchor: 'espacio' | 'reserva'; view?: never }
  | { surface: 'workspace'; demo: DemoSlug; view: EvidenceView; anchor?: never }
  | { surface: 'none'; demo?: never; view?: never; anchor?: never }
);

export interface Capability {
  id: string;
  category: CapabilityCategory;
  minimumPlan: PlanLevel;
  status: CapabilityStatus;
  evidence: CapabilityEvidence;
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
  { id: 'brand-web', category: 'web', minimumPlan: 'basico', status: 'demo_visual_disponible', evidence: { demo: 'nivora', surface: 'demo-site', anchor: 'espacio', proof: { es: 'Web editorial responsive con contenido y navegación sobre una marca ficticia.', en: 'Responsive editorial website with content and navigation for a fictitious brand.' }, boundary: { es: 'No recoge solicitudes, consulta inventario ni incluye dashboard o edición pública.', en: 'It collects no enquiries, queries no inventory and includes no workspace or live editing.' } }, label: { es: 'Web modular de marca', en: 'Modular brand website' }, description: { es: 'Diseño, contenido y fundamentos SEO adaptables al alojamiento.', en: 'Design, content and SEO foundations adaptable to the stay.' } },
  { id: 'email-enquiries', category: 'reservations', minimumPlan: 'basico', status: 'demo_visual_pendiente', evidence: { surface: 'none', proof: { es: 'La capacidad está definida para una implantación, pero la demo pública actual no incluye formulario.', en: 'The capability is defined for an implementation, but the current public demo includes no form.' }, boundary: { es: 'No se presenta como demostrable y no envía emails ni bloquea inventario.', en: 'It is not presented as demonstrable and sends no email or holds inventory.' } }, label: { es: 'Solicitudes por email', en: 'Email enquiries' }, description: { es: 'Fechas y contacto podrían llegar por email dentro de un alcance validado.', en: 'Dates and contact details could arrive by email within a validated scope.' } },
  { id: 'enquiry-workspace', category: 'reservations', minimumPlan: 'gestion', status: 'demo_visual_disponible', evidence: { demo: 'terrava', surface: 'workspace', view: 'enquiries', proof: { es: 'Caso ficticio precargado que conserva el contexto y compara una alternativa en solo lectura.', en: 'Preloaded fictitious case that keeps context and compares an alternative in read-only mode.' }, boundary: { es: 'No crea, convierte ni confirma reservas y no envía comunicaciones.', en: 'It does not create, convert or confirm bookings and sends no communication.' } }, label: { es: 'Solicitudes y reservas', en: 'Enquiries and bookings' }, description: { es: 'Representa una consulta y su alternativa con contexto compartido.', en: 'Represents an enquiry and its alternative with shared context.' } },
  { id: 'planning', category: 'reservations', minimumPlan: 'gestion', status: 'demo_visual_disponible', evidence: { demo: 'terrava', surface: 'workspace', view: 'planning', proof: { es: 'Calendario ficticio de solo lectura con unidades, estancias y una alternativa ya preparada.', en: 'Read-only fictitious calendar with units, stays and a prepared alternative.' }, boundary: { es: 'No cambia inventario o tarifas ni conecta PMS, disponibilidad o pagos.', en: 'It changes no inventory or rates and connects no PMS, availability or payments.' } }, label: { es: 'Planning y tarifas', en: 'Planning and rates' }, description: { es: 'Representa estancias, unidades, huéspedes y precios en un calendario común.', en: 'Represents stays, units, guests and pricing in a shared calendar.' } },
  { id: 'website-editor', category: 'web', minimumPlan: 'gestion', status: 'demo_visual_pendiente', evidence: { surface: 'none', proof: { es: 'Existe una base interna, pero no hay una superficie pública accesible en el árbol actual de la demo.', en: 'An internal foundation exists, but the current demo tree exposes no public surface.' }, boundary: { es: 'No debe comunicarse como demostrable y no modifica ni despliega una web real.', en: 'It must not be presented as demonstrable and does not change or deploy a live website.' } }, label: { es: 'Editor web supervisado', en: 'Supervised website editor' }, description: { es: 'Capacidad de edición pendiente de una representación visual pública y validada.', en: 'Editing capability pending a validated public visual representation.' } },
  { id: 'basic-reports', category: 'revenue', minimumPlan: 'gestion', status: 'demo_visual_disponible', evidence: { demo: 'terrava', surface: 'workspace', view: 'reports', proof: { es: 'Lectura visual de ocupación e ingresos con un conjunto de muestra.', en: 'Visual reading of occupancy and revenue from a sample dataset.' }, boundary: { es: 'No usa contabilidad, pagos ni datos operativos reales.', en: 'It uses no live accounting, payment or operational data.' } }, label: { es: 'Informes básicos', en: 'Basic reports' }, description: { es: 'Lectura de reservas, ocupación e ingresos con datos de muestra.', en: 'Booking, occupancy and revenue reading with sample data.' } },
  { id: 'operations-centre', category: 'operations', minimumPlan: 'inteligente', status: 'demo_visual_disponible', evidence: { demo: 'aurem', surface: 'workspace', view: 'control', proof: { es: 'Llegadas, preparación e incidencias ficticias reunidas en una vista de solo lectura.', en: 'Fictitious arrivals, readiness and incidents brought together in a read-only view.' }, boundary: { es: 'No toma decisiones ni ejecuta acciones de forma autónoma.', en: 'It makes no autonomous decision and executes no live action.' } }, label: { es: 'Centro operativo', en: 'Operations centre' }, description: { es: 'Muestra llegadas en riesgo y la coordinación ficticia de la respuesta del equipo.', en: 'Shows at-risk arrivals and a fictional coordination scenario for the team response.' } },
  { id: 'cleaning', category: 'operations', minimumPlan: 'inteligente', status: 'demo_visual_disponible', evidence: { demo: 'aurem', surface: 'workspace', view: 'cleaning', proof: { es: 'Checklist y estado de habitación ya preparados para entender responsabilidades y revisión.', en: 'Prepared room checklist and status used to explain ownership and review.' }, boundary: { es: 'No asigna ni valida tareas, no notifica al equipo y no cambia un PMS real.', en: 'It assigns or validates no task, notifies no team and updates no live PMS.' } }, label: { es: 'Limpieza y preparación', en: 'Cleaning and preparation' }, description: { es: 'Responsabilidades, revisión y estado ficticio de una habitación.', en: 'Ownership, review and fictitious room status.' } },
  { id: 'maintenance', category: 'operations', minimumPlan: 'inteligente', status: 'demo_visual_disponible', evidence: { demo: 'aurem', surface: 'workspace', view: 'maintenance', proof: { es: 'Timeline ficticio de una incidencia con prioridad y estados precargados.', en: 'Fictitious incident timeline with preloaded priority and statuses.' }, boundary: { es: 'No asigna ni resuelve incidencias, no crea órdenes y no avisa a proveedores.', en: 'It assigns or resolves no incident, creates no work order and contacts no supplier.' } }, label: { es: 'Mantenimiento', en: 'Maintenance' }, description: { es: 'Muestra una incidencia ficticia con prioridad y trazabilidad visual.', en: 'Shows a fictitious incident with priority and visual traceability.' } },
  { id: 'roles', category: 'team', minimumPlan: 'inteligente', status: 'demo_visual_disponible', evidence: { demo: 'aurem', surface: 'workspace', view: 'home', proof: { es: 'El selector representa Dirección, Recepción y Limpieza sobre el mismo fixture de solo lectura.', en: 'The selector represents Management, Reception and Cleaning over the same read-only fixture.' }, boundary: { es: 'No crea cuentas ni permisos reales y no habilita acciones operativas diferentes.', en: 'It creates no live account or permission and enables no different operational action.' } }, label: { es: 'Equipos y permisos', en: 'Teams and permissions' }, description: { es: 'Representación visual de roles que comparten un contexto ficticio.', en: 'Visual representation of roles sharing fictitious context.' } },
  { id: 'channels', category: 'channels', minimumPlan: 'inteligente', status: 'activable_por_proyecto', evidence: { demo: 'aurem', surface: 'workspace', view: 'channels', proof: { es: 'Matriz de solo lectura que muestra cobertura, requisitos y cero conexiones por canal.', en: 'Read-only matrix showing coverage, requirements and zero connections per channel.' }, boundary: { es: 'Conectar exige contrato, credenciales, mapeo, pruebas y validación por proveedor; publicar está bloqueado.', en: 'Connection requires a contract, credentials, mapping, tests and per-provider validation; publishing is blocked.' } }, label: { es: 'Canales e inventario', en: 'Channels and inventory' }, description: { es: 'Vista de requisitos para una conectividad que se valida por proyecto y proveedor.', en: 'Requirements view for connectivity validated per project and provider.' } },
  { id: 'automation', category: 'automation', minimumPlan: 'inteligente', status: 'demo_visual_pendiente', evidence: { surface: 'none', proof: { es: 'La base del flujo existe internamente, pero no está expuesta en el árbol público actual.', en: 'The flow foundation exists internally but is not exposed in the current public tree.' }, boundary: { es: 'No debe comunicarse como demostrable; no hay reglas activas, mensajería ni ejecución externa.', en: 'It must not be presented as demonstrable; there are no active rules, messages or external execution.' } }, label: { es: 'Automatizaciones', en: 'Automations' }, description: { es: 'Reglas y recordatorios pendientes de una representación visual pública y validada.', en: 'Rules and reminders pending a validated public visual representation.' } },
  { id: 'supervised-ai', category: 'ai', minimumPlan: 'inteligente', status: 'demo_visual_disponible', evidence: { demo: 'aurem', surface: 'workspace', view: 'automation', proof: { es: 'Borrador ficticio con fuentes visibles, edición, versionado y revisión humana por rol en memoria.', en: 'Fictitious draft with visible sources, editing, versioning and role-based human review in memory.' }, boundary: { es: 'No hay modelo ni proveedor, nada se envía y recargar restaura el fixture.', en: 'There is no model or provider, nothing is sent and reloading restores the fixture.' } }, label: { es: 'Copiloto supervisado', en: 'Supervised copilot' }, description: { es: 'Borradores ficticios editables y revisables con trazabilidad local.', en: 'Editable and reviewable fictitious drafts with local traceability.' } },
  { id: 'revenue', category: 'revenue', minimumPlan: 'inteligente', status: 'en_ruta', evidence: { surface: 'none', proof: { es: 'La demo incluye cálculos ficticios explicables, pero no demuestra previsión de demanda o precio.', en: 'The demo includes explainable fictitious calculations but does not demonstrate demand or pricing forecasts.' }, boundary: { es: 'La previsión no está disponible ni debe presentarse como incluida; no usa PMS, canales, contabilidad o pagos.', en: 'Forecasting is not available and must not be presented as included; it uses no PMS, channel, accounting or payment data.' } }, label: { es: 'Revenue y previsión', en: 'Revenue and forecasting' }, description: { es: 'Previsión de demanda y precio todavía no disponible.', en: 'Demand and pricing forecasts are not yet available.' } },
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
