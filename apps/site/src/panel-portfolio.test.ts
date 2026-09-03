import { describe, expect, it } from 'vitest';
import { CAPABILITIES } from '@logic-estancia/domain';
import { getPanelPortfolio, getPublishedPanels, PANEL_IDS } from './panel-portfolio';

describe('panel portfolio contract', () => {
  it('keeps one localized registry with six honest publication states', () => {
    for (const locale of ['es', 'en'] as const) {
      const panels = getPanelPortfolio(locale);
      expect(panels.map(({ id }) => id)).toEqual(PANEL_IDS);
      expect(panels).toHaveLength(6);
      expect(panels.filter(({ status }) => status === 'published')).toHaveLength(4);
      expect(panels.filter(({ status }) => status === 'preparation')).toHaveLength(2);
      expect(panels.map(({ plan }) => plan)).toEqual(['gestion', 'gestion', 'gestion', 'inteligente', 'inteligente', 'inteligente']);

      for (const panel of panels) {
        for (const capabilityId of panel.capabilityIds) {
          expect(CAPABILITIES.some(({ id }) => id === capabilityId), `${locale}:${panel.id}:${capabilityId}`).toBe(true);
        }
        if (panel.status === 'published') {
          expect(panel.detailHref).not.toBeNull();
          expect(panel.evidenceHref).not.toBeNull();
          expect(panel.preview).not.toBeNull();
          expect(panel.visiblePoints.length).toBeGreaterThanOrEqual(4);
          expect(panel.flow.length).toBeGreaterThanOrEqual(4);
        } else {
          expect(panel.detailHref).toBeNull();
          expect(panel.evidenceHref).toBeNull();
          expect(panel.preview).toBeNull();
          expect(panel.outcome).toBe('');
        }
      }
    }
  });

  it('publishes only exact Terrava and Aurem evidence routes in both languages', () => {
    expect(getPublishedPanels('es').map(({ id, detailHref, evidenceHref }) => [id, detailHref, evidenceHref])).toEqual([
      ['enquiries', '/paneles/solicitudes/', '/demos/terrava/gestion/?vista=enquiries'],
      ['planning', '/paneles/planning/', '/demos/terrava/gestion/?vista=planning'],
      ['guests-arrivals', '/paneles/huespedes-llegadas/', '/demos/terrava/gestion/?vista=guests'],
      ['preparation', '/paneles/preparacion/', '/demos/aurem/gestion/?vista=cleaning'],
    ]);
    expect(getPublishedPanels('en').map(({ id, detailHref, evidenceHref }) => [id, detailHref, evidenceHref])).toEqual([
      ['enquiries', '/en/panels/enquiries/', '/en/demos/terrava/gestion/?vista=enquiries'],
      ['planning', '/en/panels/planning/', '/en/demos/terrava/gestion/?vista=planning'],
      ['guests-arrivals', '/en/panels/guests-arrivals/', '/en/demos/terrava/gestion/?vista=guests'],
      ['preparation', '/en/panels/preparation/', '/en/demos/aurem/gestion/?vista=cleaning'],
    ]);
  });
});
