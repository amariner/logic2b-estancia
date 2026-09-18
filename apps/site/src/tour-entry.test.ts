import { describe, expect, it } from 'vitest';
import { parseTourEntry, tourAssessmentHref } from './tour-entry';
import { parseAssessmentContext } from './scripts/assessment-context';

describe('commercial journey context boundary', () => {
  it('drops arbitrary query values and never forwards free text', () => {
    const entry = parseTourEntry(new URLSearchParams('step=private&segment=person@example.test&sourcePath=https://example.test/private&email=secret'), 'en');
    expect(entry).toEqual({ step: 'brand-web', segment: 'unknown', sourcePath: '/en/journey/' });
    const href = tourAssessmentHref('en', entry.step, entry.sourcePath, entry.segment);
    expect(href).toBe('/en/assessment/?plan=basico&web=nivora&panel=none&segment=unknown&sourcePath=%2Fen%2Fjourney%2F');
  });
  it('keeps the rural enquiry route coherent and independent of injected plan hints', () => {
    const entry = parseTourEntry(new URLSearchParams('step=enquiries&segment=rural&sourcePath=%2Fsoluciones%2Fcasas-rurales%2F&plan=basico&web=aurem'), 'es');
    expect(tourAssessmentHref('es', entry.step, entry.sourcePath, entry.segment)).toBe('/diagnostico/?plan=gestion&web=terrava&panel=terrava&segment=rural&sourcePath=%2Fsoluciones%2Fcasas-rurales%2F&need=enquiries');
  });
  it.each(['/paneles/', '/recorrido/', '/en/journey/', '/soluciones/casas-rurales/', '/en/solutions/rural-stays/'])('retains supported source %s through the assessment boundary', sourcePath => {
    expect(parseAssessmentContext({ version: '1.0.0', createdAt: 1000, locale: 'es', accommodationType: 'rural', businessMode: 'mono', propertyCount: 1, unitCount: 1, plan: 'gestion', web: 'terrava', panel: 'terrava', segment: 'rural', sourcePath, currentStack: [], requestedCapabilities: ['enquiries'], timeline: 'exploring', investmentRange: 'unknown' }, 1000)?.sourcePath).toBe(sourcePath);
  });
});
