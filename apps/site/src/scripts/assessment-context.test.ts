import { describe, expect, it } from 'vitest';
import { ASSESSMENT_CONTEXT_KEY, ASSESSMENT_CONTEXT_MAX_AGE, clearAssessmentContext, parseAssessmentContext, readAssessmentContext, saveAssessmentContext } from './assessment-context';

const valid = {
  locale: 'es', accommodationType: 'hotel', businessMode: 'multi', propertyCount: '2', unitCount: '48', plan: 'inteligente',
  currentStack: ['pms', 'channels'], requestedCapabilities: ['maintenance', 'automation'], timeline: '3-6', investmentRange: '8k-20k',
};

const storage = () => {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
  };
};

describe('assessment context', () => {
  it('stores only a validated, bounded context and restores it for the same locale', () => {
    const memory = storage();
    const saved = saveAssessmentContext(memory, { ...valid, email: 'not-stored@example.test', message: 'not stored' }, 1_000);
    expect(saved).toMatchObject({ propertyCount: 2, unitCount: 48, currentStack: ['pms', 'channels'] });
    expect(readAssessmentContext(memory, 'es', 1_100)).toEqual(saved);
    expect(JSON.parse(memory.getItem(ASSESSMENT_CONTEXT_KEY) ?? '{}')).not.toHaveProperty('email');
    expect(JSON.parse(memory.getItem(ASSESSMENT_CONTEXT_KEY) ?? '{}')).not.toHaveProperty('message');
  });

  it('rejects unknown values, invalid bounds and expired contexts', () => {
    const memory = storage();
    expect(saveAssessmentContext(memory, { ...valid, plan: 'premium' }, 1_000)).toBeNull();
    expect(saveAssessmentContext(memory, { ...valid, unitCount: 100_001 }, 1_000)).toBeNull();
    const saved = saveAssessmentContext(memory, valid, 1_000);
    expect(parseAssessmentContext(saved, 1_000 + ASSESSMENT_CONTEXT_MAX_AGE + 1)).toBeNull();
  });

  it('removes corrupt, cross-locale and explicitly cleared state', () => {
    const memory = storage();
    memory.setItem(ASSESSMENT_CONTEXT_KEY, '{broken');
    expect(readAssessmentContext(memory, 'es')).toBeNull();
    expect(memory.getItem(ASSESSMENT_CONTEXT_KEY)).toBeNull();
    saveAssessmentContext(memory, valid);
    expect(readAssessmentContext(memory, 'en')).toBeNull();
    saveAssessmentContext(memory, valid);
    clearAssessmentContext(memory);
    expect(memory.getItem(ASSESSMENT_CONTEXT_KEY)).toBeNull();
  });
});
