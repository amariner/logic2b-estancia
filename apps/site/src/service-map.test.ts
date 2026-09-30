import { describe, expect, it } from 'vitest';
import { getServiceMap } from './service-map';
import { getPlanCards } from './plan-contract';

const rank = { basico: 0, gestion: 1, inteligente: 2 } as const;

describe('service map', () => {
  it('derives each plan coverage from the stages it can reach, in ES and EN', () => {
    for (const locale of ['es', 'en'] as const) {
      const map = getServiceMap(locale);
      expect(map.stages.map(({ id }) => id)).toEqual(['guest', 'web', 'enquiry', 'workspace', 'operations']);
      expect(map.handoffs).toHaveLength(map.stages.length - 1);
      expect(map.coverage.map(({ plan }) => plan)).toEqual(['basico', 'gestion', 'inteligente']);
      for (const row of map.coverage) {
        const reachable = map.stages.filter(({ from }) => from === null || rank[from] <= rank[row.plan]).length;
        expect(row.span, `${locale} ${row.plan}`).toBe(reachable);
      }
    }
  });

  it('keeps Básico without a workspace and reuses the plan names', () => {
    for (const locale of ['es', 'en'] as const) {
      const map = getServiceMap(locale);
      const basic = map.coverage.find(({ plan }) => plan === 'basico');
      const workspace = map.stages.find(({ id }) => id === 'workspace');
      expect(basic && workspace && basic.span).toBeLessThanOrEqual(map.stages.indexOf(workspace!));
      expect(map.coverage.map(({ name }) => name)).toEqual(getPlanCards(locale).map(({ name }) => name));
      expect(map.note).toMatch(locale === 'es' ? /ficticios/ : /fictional/);
    }
  });
});
