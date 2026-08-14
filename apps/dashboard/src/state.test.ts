import { describe, expect, it } from 'vitest';
import { canOperate, initialState, parseStored } from './state';

describe('demo state', () => {
  it('recovers from corrupted storage', () => expect(parseStored('{no', 'aurem')).toEqual(initialState('aurem')));
  it('recovers from future versions', () => expect(parseStored('{"version":2}', 'terrava')).toEqual(initialState('terrava')));
  it('keeps cleaning isolated from reception', () => {
    expect(canOperate('cleaning', 'cleaning')).toBe(true);
    expect(canOperate('cleaning', 'booking')).toBe(false);
  });
});
