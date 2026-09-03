import { describe, expect, it } from 'vitest';
import { getPlanCards, planHandoffHref } from './plan-contract';

describe('plan contract', () => {
  it('keeps the three plans mapped to their canonical web and workspace evidence', () => {
    for (const locale of ['es', 'en'] as const) {
      const plans = getPlanCards(locale);
      expect(plans.map(({ id }) => id)).toEqual(['basico', 'gestion', 'inteligente']);
      expect(plans.map(({ webSlug, panelSlug }) => [webSlug, panelSlug])).toEqual([
        ['nivora', 'none'], ['terrava', 'terrava'], ['aurem', 'aurem'],
      ]);
      expect(plans.every(({ visible, boundary }) => visible.length === 3 && boundary.length > 20)).toBe(true);
    }
  });

  it('creates localized, allowlisted handoff parameters without free text', () => {
    const es = planHandoffHref('es', getPlanCards('es')[1], '/');
    const en = planHandoffHref('en', getPlanCards('en')[2], '/en/plans/');
    expect(es).toBe('/diagnostico/?plan=gestion&web=terrava&panel=terrava&segment=unknown&sourcePath=%2F');
    expect(en).toBe('/en/assessment/?plan=inteligente&web=aurem&panel=aurem&segment=unknown&sourcePath=%2Fen%2Fplans%2F');
  });
});
