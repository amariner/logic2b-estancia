import { describe, expect, it } from 'vitest';
import { getGuideContext, GUIDE_CONTEXT_IDS, guideContextForPanel, guideContextForSolution, validateGuideContexts } from './guide-context';

const expected = {
  home: ['direction', 'reception', 'operations', 'marketing-revenue', 'technical-privacy'],
  plans: ['direction', 'technical-privacy'],
  'solution-rural': ['reception'],
  'solution-apartments': ['reception'],
  'solution-hotels': ['operations'],
  webs: ['marketing-revenue'],
  panels: ['reception', 'operations', 'technical-privacy'],
  'panel-enquiries': ['reception'],
  'panel-planning': ['reception'],
  'panel-guests-arrivals': ['reception'],
  'panel-preparation': ['operations'],
  'panel-operations-revenue': ['marketing-revenue'],
  'panel-copilot': ['technical-privacy'],
} as const;

describe('contextual guide contract', () => {
  it('maps every commercial family and panel to published role guides', () => {
    expect(() => validateGuideContexts()).not.toThrow();
    expect(GUIDE_CONTEXT_IDS).toEqual(Object.keys(expected));
    for (const locale of ['es', 'en'] as const) {
      for (const id of GUIDE_CONTEXT_IDS) {
        const context = getGuideContext(id, locale);
        expect(context.guides.map((guide) => guide.id), `${locale}:${id}`).toEqual(expected[id]);
        expect(context.title).not.toBe('');
        expect(context.body).not.toBe('');
        for (const guide of context.guides) expect(guide.detailHref, `${locale}:${id}:${guide.id}`).toMatch(locale === 'en' ? /^\/en\/docs\/.+\/$/ : /^\/docs\/.+\/$/);
      }
    }
  });

  it('derives solution and panel context ids from their domain ids', () => {
    expect((['rural', 'apartments', 'hotels'] as const).map((segment) => guideContextForSolution(segment))).toEqual(['solution-rural', 'solution-apartments', 'solution-hotels']);
    expect((['enquiries', 'planning', 'guests-arrivals', 'preparation', 'operations-revenue', 'copilot'] as const).map((panelId) => guideContextForPanel(panelId))).toEqual([
      'panel-enquiries', 'panel-planning', 'panel-guests-arrivals', 'panel-preparation', 'panel-operations-revenue', 'panel-copilot',
    ]);
  });
});
