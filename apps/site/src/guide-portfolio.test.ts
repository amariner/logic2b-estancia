import { describe, expect, it } from 'vitest';
import { CAPABILITIES } from '@logic-estancia/domain';
import { getGuidePortfolio, getPublishedGuides, GUIDE_IDS, validateGuideCapabilities } from './guide-portfolio';

describe('guide portfolio contract', () => {
  it('keeps five localized roles with two complete published guides', () => {
    expect(() => validateGuideCapabilities()).not.toThrow();
    for (const locale of ['es', 'en'] as const) {
      const guides = getGuidePortfolio(locale);
      expect(guides.map(({ id }) => id)).toEqual(GUIDE_IDS);
      expect(guides).toHaveLength(5);
      expect(guides.filter(({ status }) => status === 'published')).toHaveLength(2);
      expect(guides.filter(({ status }) => status === 'preparation')).toHaveLength(3);
      for (const guide of guides) {
        for (const capabilityId of guide.capabilityIds) expect(CAPABILITIES.some(({ id }) => id === capabilityId), `${locale}:${guide.id}:${capabilityId}`).toBe(true);
        if (guide.status === 'published') {
          expect(guide.detailHref).not.toBeNull();
          expect(guide.responsibilities).toHaveLength(4);
          expect(guide.handoff).toHaveLength(4);
          expect(guide.validations).toHaveLength(4);
          expect(guide.boundaries).toHaveLength(3);
          expect(guide.panelLinks.length).toBeGreaterThanOrEqual(2);
        } else {
          expect(guide.detailHref).toBeNull();
          expect(guide.responsibilities).toEqual([]);
          expect(guide.panelLinks).toEqual([]);
        }
      }
    }
  });

  it('publishes stable bilingual detail routes', () => {
    expect(getPublishedGuides('es').map(({ id, detailHref }) => [id, detailHref])).toEqual([
      ['direction', '/docs/direccion-propiedad/'],
      ['reception', '/docs/reservas-recepcion/'],
    ]);
    expect(getPublishedGuides('en').map(({ id, detailHref }) => [id, detailHref])).toEqual([
      ['direction', '/en/docs/ownership-direction/'],
      ['reception', '/en/docs/reservations-reception/'],
    ]);
  });
});
