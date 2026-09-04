import { describe, expect, it } from 'vitest';
import { COMMERCIAL_TOUR_STEP_IDS, getCommercialTour } from './commercial-tour';

describe('commercial tour contract', () => {
  it('keeps one localized sequence across Basic, Management and Intelligent evidence', () => {
    for (const locale of ['es', 'en'] as const) {
      const tour = getCommercialTour(locale);
      expect(tour.map(({ id }) => id)).toEqual(COMMERCIAL_TOUR_STEP_IDS);
      expect(tour.map(({ plan }) => plan)).toEqual(['basico', 'gestion', 'gestion', 'inteligente', 'inteligente']);
      expect(tour.map(({ number }) => number)).toEqual(['01', '02', '03', '04', '05']);
      expect(tour.every(({ detailHref, evidenceHref }) => detailHref.startsWith(locale === 'en' ? '/en/' : '/') && evidenceHref.startsWith(locale === 'en' ? '/en/' : '/'))).toBe(true);
    }
  });

  it('uses only published commercial detail pages and exact local evidence', () => {
    const tour = getCommercialTour('es');
    expect(tour.map(({ detailHref }) => detailHref)).toEqual([
      '/webs/nivora/',
      '/paneles/solicitudes/',
      '/paneles/planning/',
      '/paneles/preparacion/',
      '/paneles/operacion-ingresos/',
    ]);
    expect(tour.map(({ evidenceHref }) => evidenceHref)).toEqual([
      '/demos/nivora/',
      '/demos/terrava/gestion/?vista=enquiries',
      '/demos/terrava/gestion/?vista=planning',
      '/demos/aurem/gestion/?vista=cleaning',
      '/demos/aurem/gestion/?vista=reports',
    ]);
  });
});
