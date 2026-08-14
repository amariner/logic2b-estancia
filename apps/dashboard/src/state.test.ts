import { describe, expect, it } from 'vitest';
import { canOperate, initialState, parseStored } from './state';

describe('demo state', () => {
  it('recovers from corrupted storage', () => expect(parseStored('{no', 'aurem')).toEqual(initialState('aurem')));
  it('recovers from future versions', () => expect(parseStored('{"version":2}', 'terrava')).toEqual(initialState('terrava')));
  it('adds the fixture stay to legacy version-one state', () => {
    const legacy = JSON.stringify({ ...initialState('terrava'), stay: undefined });
    expect(parseStored(legacy, 'terrava').stay).toEqual(initialState('terrava').stay);
  });
  it('keeps a valid journey received from the demo website', () => {
    const state = initialState('aurem');
    state.stay = { name: 'Alex Demo', email: 'alex@example.test', from: '2026-08-14', to: '2026-08-17', guests: 3, amount: 684, source: 'website' };
    expect(parseStored(JSON.stringify(state), 'aurem').stay).toEqual(state.stay);
  });
  it('rejects malformed shared journey data', () => {
    const state = { ...initialState('terrava'), stay: { name: '', email: 'bad', from: 'today', to: 'tomorrow', guests: 99, amount: -1, source: 'website' } };
    expect(parseStored(JSON.stringify(state), 'terrava').stay).toEqual(initialState('terrava').stay);
  });
  it('keeps cleaning isolated from reception', () => {
    expect(canOperate('cleaning', 'cleaning')).toBe(true);
    expect(canOperate('cleaning', 'booking')).toBe(false);
  });
});
