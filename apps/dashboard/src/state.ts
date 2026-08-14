import type { DemoRole } from '@logic-estancia/domain';

export type Scenario = 'terrava' | 'aurem';
export type EnquiryState = 'new' | 'alternative' | 'booked';
export type CleaningState = 'pending' | 'in_progress' | 'review' | 'ready';

export interface DemoState {
  version: 1;
  selectedProperty: string;
  role: DemoRole;
  enquiry: EnquiryState;
  cleaning: CleaningState;
  tourSeen: boolean;
}

export const initialState = (scenario: Scenario): DemoState => ({
  version: 1,
  selectedProperty: 'all',
  role: scenario === 'aurem' ? 'direction' : 'reception',
  enquiry: 'new',
  cleaning: 'pending',
  tourSeen: false,
});

export function parseStored(raw: string | null, scenario: Scenario): DemoState {
  if (!raw) return initialState(scenario);
  try {
    const value = JSON.parse(raw) as Partial<DemoState>;
    if (value.version !== 1) return initialState(scenario);
    if (!['direction', 'reception', 'cleaning'].includes(value.role ?? '')) return initialState(scenario);
    if (!['new', 'alternative', 'booked'].includes(value.enquiry ?? '')) return initialState(scenario);
    if (!['pending', 'in_progress', 'review', 'ready'].includes(value.cleaning ?? '')) return initialState(scenario);
    return { ...initialState(scenario), ...value } as DemoState;
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
