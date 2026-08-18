export const ASSESSMENT_CONTEXT_KEY = 'logic-estancia-assessment-v1';
export const ASSESSMENT_CONTEXT_VERSION = '1.0.0';
export const ASSESSMENT_CONTEXT_MAX_AGE = 2 * 60 * 60 * 1000;

const locales = ['es', 'en'] as const;
const accommodationTypes = ['apartment', 'rural', 'hotel'] as const;
const businessModes = ['mono', 'multi'] as const;
const plans = ['basico', 'gestion', 'inteligente'] as const;
const stackValues = ['website', 'email', 'booking-engine', 'calendar', 'channels', 'pms'] as const;
const capabilityValues = ['enquiries', 'bookings', 'planning', 'guests', 'rates', 'web-editor', 'cleaning', 'teams', 'maintenance', 'channels', 'automation', 'ai', 'metrics'] as const;
const timelines = ['0-3', '3-6', '6-12', 'exploring'] as const;
const investmentRanges = ['under-3k', '3k-8k', '8k-20k', '20k-plus', 'unknown'] as const;

type Locale = typeof locales[number];
type AccommodationType = typeof accommodationTypes[number];
type BusinessMode = typeof businessModes[number];
type Plan = typeof plans[number];
type StackValue = typeof stackValues[number];
type CapabilityValue = typeof capabilityValues[number];
type Timeline = typeof timelines[number];
type InvestmentRange = typeof investmentRanges[number];

export interface AssessmentContext {
  version: typeof ASSESSMENT_CONTEXT_VERSION;
  createdAt: number;
  locale: Locale;
  accommodationType: AccommodationType;
  businessMode: BusinessMode;
  propertyCount: number;
  unitCount: number;
  plan: Plan;
  currentStack: StackValue[];
  requestedCapabilities: CapabilityValue[];
  timeline: Timeline;
  investmentRange: InvestmentRange;
}

type StorageReader = Pick<Storage, 'getItem' | 'removeItem'>;
type StorageWriter = Pick<Storage, 'setItem' | 'removeItem'>;

const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const member = <T extends readonly string[]>(values: T, value: unknown): value is T[number] => typeof value === 'string' && values.includes(value);
const integer = (value: unknown, max: number): number | null => {
  const parsed = typeof value === 'string' && value.trim() ? Number(value) : value;
  return typeof parsed === 'number' && Number.isInteger(parsed) && parsed >= 1 && parsed <= max ? parsed : null;
};
const members = <T extends readonly string[]>(values: T, value: unknown): T[number][] | null => {
  if (!Array.isArray(value) || value.length > values.length) return null;
  const result = [...new Set(value)];
  return result.every((item) => member(values, item)) ? result as T[number][] : null;
};

export function parseAssessmentContext(value: unknown, now = Date.now()): AssessmentContext | null {
  if (!isRecord(value) || value.version !== ASSESSMENT_CONTEXT_VERSION) return null;
  const propertyCount = integer(value.propertyCount, 10_000);
  const unitCount = integer(value.unitCount, 100_000);
  const currentStack = members(stackValues, value.currentStack);
  const requestedCapabilities = members(capabilityValues, value.requestedCapabilities);
  const createdAt = value.createdAt;
  if (typeof createdAt !== 'number' || !Number.isFinite(createdAt) || createdAt > now || now - createdAt > ASSESSMENT_CONTEXT_MAX_AGE) return null;
  if (!member(locales, value.locale) || !member(accommodationTypes, value.accommodationType) || !member(businessModes, value.businessMode)) return null;
  if (!member(plans, value.plan) || !member(timelines, value.timeline) || !member(investmentRanges, value.investmentRange)) return null;
  if (!propertyCount || !unitCount || !currentStack || !requestedCapabilities) return null;
  return {
    version: ASSESSMENT_CONTEXT_VERSION,
    createdAt,
    locale: value.locale,
    accommodationType: value.accommodationType,
    businessMode: value.businessMode,
    propertyCount,
    unitCount,
    plan: value.plan,
    currentStack,
    requestedCapabilities,
    timeline: value.timeline,
    investmentRange: value.investmentRange,
  };
}

export function saveAssessmentContext(storage: StorageWriter, value: unknown, now = Date.now()): AssessmentContext | null {
  if (!isRecord(value)) return null;
  const parsed = parseAssessmentContext({ ...value, version: ASSESSMENT_CONTEXT_VERSION, createdAt: now }, now);
  if (!parsed) return null;
  try {
    storage.setItem(ASSESSMENT_CONTEXT_KEY, JSON.stringify(parsed));
    return parsed;
  } catch {
    return null;
  }
}

export function readAssessmentContext(storage: StorageReader, locale: Locale, now = Date.now()): AssessmentContext | null {
  try {
    const raw = storage.getItem(ASSESSMENT_CONTEXT_KEY);
    if (!raw) return null;
    const parsed = parseAssessmentContext(JSON.parse(raw), now);
    if (parsed?.locale === locale) return parsed;
    storage.removeItem(ASSESSMENT_CONTEXT_KEY);
  } catch {
    try { storage.removeItem(ASSESSMENT_CONTEXT_KEY); } catch { /* Storage can be unavailable. */ }
  }
  return null;
}

export function clearAssessmentContext(storage: Pick<Storage, 'removeItem'>): void {
  try { storage.removeItem(ASSESSMENT_CONTEXT_KEY); } catch { /* Storage can be unavailable. */ }
}

const copy = {
  es: {
    status: 'Hemos recuperado el contexto de tu diagnóstico.', removed: 'El diagnóstico ya no se adjuntará.',
    labels: ['Plan recomendado', 'Tipo de alojamiento', 'Escala', 'Situación actual', 'Capacidades solicitadas', 'Plazo', 'Inversión orientativa'],
    empty: 'Ninguna seleccionada', properties: 'propiedades', units: 'unidades',
    plans: { basico: 'Básico', gestion: 'Gestión', inteligente: 'Inteligente' },
    types: { apartment: 'Apartamentos', rural: 'Alojamiento rural', hotel: 'Hotel' },
    stacks: { website: 'Web', email: 'Email y hojas de cálculo', 'booking-engine': 'Motor de reservas', calendar: 'Calendario compartido', channels: 'OTA / canales', pms: 'PMS' },
    capabilities: { enquiries: 'Solicitudes y alternativas', bookings: 'Reservas', planning: 'Planning', guests: 'Perfiles de huéspedes', rates: 'Tarifas', 'web-editor': 'Editor web', cleaning: 'Limpieza', teams: 'Equipos y roles', maintenance: 'Mantenimiento', channels: 'Canales', automation: 'Automatización', ai: 'IA supervisada', metrics: 'Métricas avanzadas' },
    timelines: { '0-3': '0–3 meses', '3-6': '3–6 meses', '6-12': '6–12 meses', exploring: 'Explorando' },
    investments: { 'under-3k': 'Menos de 3.000 €', '3k-8k': '3.000–8.000 €', '8k-20k': '8.000–20.000 €', '20k-plus': 'Más de 20.000 €', unknown: 'Por definir' },
  },
  en: {
    status: 'We recovered your assessment context.', removed: 'The assessment will no longer be attached.',
    labels: ['Recommended plan', 'Accommodation type', 'Scale', 'Current setup', 'Requested capabilities', 'Timeframe', 'Indicative investment'],
    empty: 'None selected', properties: 'properties', units: 'units',
    plans: { basico: 'Basic', gestion: 'Management', inteligente: 'Intelligent' },
    types: { apartment: 'Apartments', rural: 'Rural stays', hotel: 'Hotel' },
    stacks: { website: 'Website', email: 'Email and spreadsheets', 'booking-engine': 'Booking engine', calendar: 'Shared calendar', channels: 'OTA / channels', pms: 'PMS' },
    capabilities: { enquiries: 'Enquiries and alternatives', bookings: 'Bookings', planning: 'Planning', guests: 'Guest profiles', rates: 'Rates', 'web-editor': 'Website editor', cleaning: 'Cleaning', teams: 'Teams and roles', maintenance: 'Maintenance', channels: 'Channels', automation: 'Automation', ai: 'Supervised AI', metrics: 'Advanced metrics' },
    timelines: { '0-3': '0–3 months', '3-6': '3–6 months', '6-12': '6–12 months', exploring: 'Exploring' },
    investments: { 'under-3k': 'Under €3,000', '3k-8k': '€3,000–8,000', '8k-20k': '€8,000–20,000', '20k-plus': 'More than €20,000', unknown: 'To be defined' },
  },
} as const;

let activeLeadContext: AssessmentContext | null = null;

function browserSessionStorage(): Storage | null {
  try { return window.sessionStorage; } catch { return null; }
}

function withoutAssessmentMarker(): void {
  const url = new URL(location.href);
  if (!url.searchParams.has('assessment')) return;
  url.searchParams.delete('assessment');
  history.replaceState(history.state, '', `${url.pathname}${url.search}${url.hash}`);
}

function renderLeadContext(context: AssessmentContext): void {
  const form = document.querySelector<HTMLFormElement>('[data-lead]');
  const handoff = form?.querySelector<HTMLElement>('[data-assessment-handoff]');
  const list = handoff?.querySelector<HTMLDListElement>('[data-assessment-summary]');
  if (!form || !handoff || !list) return;
  const formFields = {
    accommodationType: form.elements.namedItem('accommodationType'),
    plan: form.elements.namedItem('plan'),
    propertyCount: form.elements.namedItem('propertyCount'),
    unitCount: form.elements.namedItem('unitCount'),
  } as Record<string, HTMLInputElement | HTMLSelectElement | null>;
  for (const [name, value] of Object.entries({ accommodationType: context.accommodationType, plan: context.plan, propertyCount: context.propertyCount, unitCount: context.unitCount })) {
    if (formFields[name]) formFields[name].value = String(value);
  }
  const c = copy[context.locale];
  const values = [
    c.plans[context.plan], c.types[context.accommodationType],
    `${context.propertyCount} ${c.properties} · ${context.unitCount} ${c.units}`,
    context.currentStack.map((value) => c.stacks[value]).join(', ') || c.empty,
    context.requestedCapabilities.map((value) => c.capabilities[value]).join(', ') || c.empty,
    c.timelines[context.timeline], c.investments[context.investmentRange],
  ];
  list.replaceChildren(...c.labels.flatMap((label, index) => {
    const term = document.createElement('dt'); term.textContent = label;
    const description = document.createElement('dd'); description.textContent = values[index];
    return [term, description];
  }));
  activeLeadContext = context;
  handoff.hidden = false;
  const status = form.querySelector<HTMLElement>('[data-assessment-context-status]');
  if (status) status.textContent = c.status;
}

function initialiseLeadContext(): void {
  const form = document.querySelector<HTMLFormElement>('[data-lead]');
  const locale = document.documentElement.lang === 'en' ? 'en' : 'es';
  if (!form || new URLSearchParams(location.search).get('assessment') !== '1') return;
  const storage = browserSessionStorage();
  const context = storage ? readAssessmentContext(storage, locale) : null;
  if (context) renderLeadContext(context);
  else withoutAssessmentMarker();
  form.querySelector('[data-assessment-discard]')?.addEventListener('click', () => {
    const status = form.querySelector<HTMLElement>('[data-assessment-context-status]');
    const handoff = form.querySelector<HTMLElement>('[data-assessment-handoff]');
    if (storage) clearAssessmentContext(storage);
    activeLeadContext = null; withoutAssessmentMarker();
    if (handoff) handoff.hidden = true;
    if (status) status.textContent = copy[locale].removed;
    (form.elements.namedItem('accommodationType') as HTMLSelectElement | null)?.focus();
  });
}

if (typeof window !== 'undefined') {
  window.estanciaAssessment = {
    save(value) { const storage = browserSessionStorage(); return storage ? Boolean(saveAssessmentContext(storage, value)) : false; },
    leadFields() {
      if (!activeLeadContext) return {};
      const { businessMode, currentStack, requestedCapabilities, timeline, investmentRange } = activeLeadContext;
      return { businessMode, currentStack, requestedCapabilities, timeline, investmentRange, sourcePath: activeLeadContext.locale === 'en' ? '/en/assessment/' : '/diagnostico/' };
    },
    clear() { const storage = browserSessionStorage(); if (storage) clearAssessmentContext(storage); activeLeadContext = null; withoutAssessmentMarker(); },
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialiseLeadContext, { once: true });
  else initialiseLeadContext();
}

declare global {
  interface Window {
    estanciaAssessment?: {
      save(value: unknown): boolean;
      leadFields(): Partial<AssessmentContext> & { sourcePath?: string };
      clear(): void;
    };
  }
}
