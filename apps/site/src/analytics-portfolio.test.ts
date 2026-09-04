import analyticsContract from '@logic-estancia/config/analytics-contract';
import { describe, expect, it } from 'vitest';
import { getPublishedPanels } from './panel-portfolio';
import { ANALYTICS_SAFE_PATHS } from './public-routes';
import { getWebPortfolio } from './web-portfolio';

describe('portfolio analytics contract', () => {
  it('keeps all twelve web identifiers and canonical plan pairs in sync', () => {
    const concepts = getWebPortfolio('es');
    expect(concepts).toHaveLength(12);
    expect(analyticsContract.parameterValues.web).toEqual(concepts.map(({ slug }) => slug));
    expect(analyticsContract.eventShapes.web_view.combinations).toEqual(
      concepts.map(({ slug, plan }) => ({ web: slug, plan })),
    );
    expect(analyticsContract.surfaces.site).toContain('web_view');
    expect(analyticsContract.surfaces.demo).not.toContain('web_view');
  });

  it('keeps all six published panel identifiers and canonical plan pairs in sync', () => {
    const panels = getPublishedPanels('es');
    expect(panels).toHaveLength(6);
    expect(analyticsContract.parameterValues.panel).toEqual(panels.map(({ id }) => id));
    expect(analyticsContract.eventShapes.panel_view.combinations).toEqual(
      panels.map(({ id, plan }) => ({ panel: id, plan })),
    );
    expect(analyticsContract.surfaces.site).toContain('panel_view');
  });

  it('allows analytics on every indexable web and panel detail route', () => {
    const safe = new Set<string>(ANALYTICS_SAFE_PATHS);
    for (const concept of getWebPortfolio('es')) {
      expect(safe.has(`/webs/${concept.slug}/`)).toBe(true);
      expect(safe.has(`/en/webs/${concept.slug}/`)).toBe(true);
    }
    for (const locale of ['es', 'en'] as const) {
      for (const panel of getPublishedPanels(locale)) expect(safe.has(panel.detailHref ?? '')).toBe(true);
    }
  });
});
