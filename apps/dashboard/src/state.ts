import type { DemoRole } from '@logic-estancia/domain';

export type Scenario = 'terrava' | 'aurem';
export type EnquiryState = 'new' | 'alternative' | 'booked';
export type CleaningState = 'pending' | 'in_progress' | 'review' | 'ready';
export type JourneySource = 'fixture' | 'website';

export interface DemoStay {
  name: string;
  email: string;
  from: string;
  to: string;
  guests: number;
  amount: number;
  source: JourneySource;
}

export interface DemoState {
  version: 1;
  selectedProperty: string;
  role: DemoRole;
  enquiry: EnquiryState;
  cleaning: CleaningState;
  tourSeen: boolean;
  stay: DemoStay;
}

export const initialState = (scenario: Scenario): DemoState => {
  const stay: DemoStay = scenario === 'aurem'
    ? { name: 'Elena Rossi', email: 'elena@example.test', from: '2026-08-14', to: '2026-08-17', guests: 2, amount: 684, source: 'fixture' }
    : { name: 'Marina Costa', email: 'marina@example.test', from: '2026-08-21', to: '2026-08-24', guests: 4, amount: 612, source: 'fixture' };
  return {
    version: 1,
    selectedProperty: 'all',
    role: scenario === 'aurem' ? 'direction' : 'reception',
    enquiry: 'new',
    cleaning: 'pending',
    tourSeen: false,
    stay,
  };
};

function parseStay(value: Partial<DemoState>['stay'], fallback: DemoStay): DemoStay {
  if (!value || typeof value !== 'object') return fallback;
  const { name, email, from, to, guests, amount, source } = value;
  const validDate = (date: unknown): date is string => typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date);
  if (typeof name !== 'string' || !name.trim() || name.length > 120) return fallback;
  if (typeof email !== 'string' || !email.includes('@') || email.length > 200) return fallback;
  if (!validDate(from) || !validDate(to) || from >= to) return fallback;
  if (typeof guests !== 'number' || !Number.isInteger(guests) || guests < 1 || guests > 8) return fallback;
  if (typeof amount !== 'number' || !Number.isInteger(amount) || amount < 0 || amount > 100000) return fallback;
  if (source !== 'fixture' && source !== 'website') return fallback;
  return { name: name.trim(), email: email.trim(), from, to, guests, amount, source };
}

export function parseStored(raw: string | null, scenario: Scenario): DemoState {
  if (!raw) return initialState(scenario);
  try {
    const value = JSON.parse(raw) as Partial<DemoState>;
    if (value.version !== 1) return initialState(scenario);
    if (!['direction', 'reception', 'cleaning'].includes(value.role ?? '')) return initialState(scenario);
    if (!['new', 'alternative', 'booked'].includes(value.enquiry ?? '')) return initialState(scenario);
    if (!['pending', 'in_progress', 'review', 'ready'].includes(value.cleaning ?? '')) return initialState(scenario);
    const fallback = initialState(scenario);
    return { ...fallback, ...value, stay: parseStay(value.stay, fallback.stay) } as DemoState;
  } catch {
    return initialState(scenario);
  }
}

export function canOperate(role: DemoRole, action: 'booking' | 'cleaning' | 'review'): boolean {
  if (role === 'direction') return true;
  if (action === 'booking') return role === 'reception';
  if (action === 'cleaning') return role === 'cleaning';
  return role === 'reception';
}
