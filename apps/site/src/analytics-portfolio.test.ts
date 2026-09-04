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
    expect(analyticsContract.eventShapes.web_handoff.combinations).toEqual(
      concepts.map(({ slug, plan }) => ({ web: slug, plan })),
    );
    expect(analyticsContract.eventShapes.web_handoff.values.handoff).toEqual(['demo', 'assessment', 'contact']);
    expect(analyticsContract.surfaces.site).toContain('web_view');
    expect(analyticsContract.surfaces.site).toContain('web_handoff');
    expect(analyticsContract.surfaces.demo).not.toContain('web_view');
    expect(analyticsContract.surfaces.demo).not.toContain('web_handoff');
  });

  it('keeps all six published panel identifiers and canonical plan pairs in sync', () => {
    const panels = getPublishedPanels('es');
    expect(panels).toHaveLength(6);
    expect(analyticsContract.parameterValues.panel).toEqual(panels.map(({ id }) => id));
    expect(analyticsContract.eventShapes.panel_view.combinations).toEqual(
      panels.map(({ id, plan }) => ({ panel: id, plan })),
    );
    expect(analyticsContract.eventShapes.panel_handoff.combinations).toEqual(
      panels.map(({ id, plan }) => ({ panel: id, plan })),
    );
    expect(analyticsContract.eventShapes.panel_handoff.values.handoff).toEqual(['demo', 'assessment', 'contact']);
    expect(analyticsContract.surfaces.site).toContain('panel_view');
    expect(analyticsContract.surfaces.site).toContain('panel_handoff');
    expect(analyticsContract.surfaces.demo).not.toContain('panel_handoff');
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

  it('keeps the guided journey explicit, closed and outside demo analytics', () => {
    for (const event of ['tour_start', 'tour_complete'] as const) {
      expect(analyticsContract.eventShapes[event]).toEqual({
        required: ['locale', 'flow', 'source_section'],
        allowed: ['locale', 'flow', 'source_section'],
        values: { flow: ['guided'], source_section: ['guided_tour'] },
      });
      expect(analyticsContract.surfaces.site).toContain(event);
      expect(analyticsContract.surfaces.demo).not.toContain(event);
    }
    expect(ANALYTICS_SAFE_PATHS).toEqual(expect.arrayContaining(['/recorrido/', '/en/journey/']));
  });

  it('gives every provider event an exact shape and keeps demo events local', () => {
    expect(analyticsContract.version).toBe('2.4.0');
    expect(analyticsContract.surfaces.site).toHaveLength(15);
    expect(analyticsContract.surfaces.demo).toHaveLength(5);
    expect(analyticsContract.surfaces.site.every((event) => Object.hasOwn(analyticsContract.eventShapes, event))).toBe(true);
    expect(analyticsContract.surfaces.demo.some((event) => analyticsContract.surfaces.site.includes(event))).toBe(false);
    expect(analyticsContract.eventShapes.plan_select).toEqual({
      required: ['locale', 'plan', 'source_section'],
      allowed: ['locale', 'plan', 'source_section'],
      values: { plan: ['basico', 'gestion', 'inteligente'], source_section: ['homepage_plans', 'plans_grid'] },
    });
    expect(analyticsContract.eventShapes.cta_click.values.source_section).toEqual(expect.arrayContaining(['web_portfolio', 'panel_portfolio']));
  });
});
