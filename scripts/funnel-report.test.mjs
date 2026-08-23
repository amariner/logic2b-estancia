import { describe, expect, it } from 'vitest';
import { buildReport, CONTRACT_VERSION, parseArguments, runFunnelReport, validateDataset } from './funnel-report.mjs';
import { readFile } from 'node:fs/promises';

const dataset = {
  contractVersion: CONTRACT_VERSION,
  period: { start: '2026-08-01', end: '2026-08-31' },
  consentMode: 'analytics-consent-only',
  rows: [
    { event: 'assessment_start', count: 20, locale: 'es', segment: 'rural', source_section: 'assessment' },
    { event: 'assessment_submit', count: 10, locale: 'es', segment: 'rural', plan: 'gestion', source_section: 'assessment' },
    { event: 'assessment_complete', count: 10, locale: 'es', plan: 'gestion', source_section: 'assessment' },
    { event: 'lead_submit', count: 2, locale: 'es', plan: 'gestion', source_section: 'homepage_contact' },
  ],
};

describe('funnel report', () => {
  it('shares the Camp GTM container through the analytics contract', async () => {
    const contract = JSON.parse(await readFile(new URL('../packages/config/src/analytics-contract.json', import.meta.url), 'utf8'));
    expect(contract.containerId).toBe('GTM-TVDWZ9LC');
  });

  it('documents the versioned aggregate-only contract', async () => {
    const result = await runFunnelReport({ args: ['--validate'] });
    expect(result.exitCode).toBe(0);
    expect(JSON.parse(result.output)).toMatchObject({ ok: true, contractVersion: '2.0.0', privacy: 'aggregated-allowlist-only' });
  });

  it('calculates stable directional rates without user attribution', () => {
    const report = buildReport(validateDataset(dataset));
    expect(report.stages).toEqual([
      expect.objectContaining({ event: 'assessment_start', count: 20, fromPrevious: null }),
      expect.objectContaining({ event: 'assessment_submit', count: 10, fromPrevious: 50 }),
      expect.objectContaining({ event: 'assessment_complete', count: 10, fromPrevious: 100 }),
      expect.objectContaining({ event: 'lead_submit', count: 2, fromPrevious: 20 }),
      expect.objectContaining({ event: 'meeting_click', count: 0, fromPrevious: 0 }),
    ]);
    expect(report.coverage).toContain('consentimiento analítico explícito');
    expect(report.excludedOutcomes).toContain('proposals');
  });

  it('renders the fictitious example as Markdown or JSON', async () => {
    const markdown = await runFunnelReport({ args: ['--example'] });
    expect(markdown.exitCode).toBe(0);
    expect(markdown.output).toContain('| Diagnósticos validados | `assessment_submit` | 25 | 50 % |');
    expect(markdown.output).toContain('| Recomendaciones visibles | `assessment_complete` | 25 | 100 % |');
    expect(markdown.output).toContain('| rural | 18 | 0 | 18 |');
    const json = await runFunnelReport({ args: ['--example', '--format', 'json'] });
    const report = JSON.parse(json.output);
    expect(report.byLocale).toEqual(expect.arrayContaining([expect.objectContaining({ locale: 'es' }), expect.objectContaining({ locale: 'en' })]));
    expect(report.solutionViewsBySegment).toEqual([
      { segment: 'rural', es: 18, en: 0, total: 18 },
      { segment: 'apartments', es: 12, en: 0, total: 12 },
      { segment: 'hotels', es: 0, en: 8, total: 8 },
    ]);
  });

  it('rejects identifiers, text dimensions and unknown values', () => {
    expect(() => validateDataset({ ...dataset, user_pseudo_id: '123' })).toThrow(/campos no permitidos/);
    expect(() => validateDataset({ ...dataset, rows: [{ event: 'lead_submit', count: 1, email: 'person@example.test' }] })).toThrow(/email/);
    expect(() => validateDataset({ ...dataset, rows: [{ event: 'lead_submit', count: 1, source_section: 'free-text' }] })).toThrow(/allowlisted/);
  });

  it('requires explicit consent scope and valid dates', () => {
    expect(() => validateDataset({ ...dataset, consentMode: 'all-traffic' })).toThrow(/analytics-consent-only/);
    expect(() => validateDataset({ ...dataset, period: { start: '2026-08-31', end: '2026-08-01' } })).toThrow(/posterior/);
  });

  it('requires canonical dimensions for measured funnel events', () => {
    expect(() => validateDataset({ ...dataset, rows: [
      { event: 'assessment_submit', count: 1, locale: 'es', source_section: 'assessment' },
    ] })).toThrow(/segment, plan/);
    expect(() => validateDataset({ ...dataset, rows: [
      { event: 'solution_view', count: 1, locale: 'es', segment: 'managers', source_section: 'solution' },
    ] })).toThrow(/segment no es canónico/);
    expect(() => validateDataset({ ...dataset, rows: [
      { event: 'solution_view', count: 1, locale: 'es', segment: 'rural', source_section: 'hero' },
    ] })).toThrow(/source_section no es canónico/);
    expect(() => validateDataset({ ...dataset, rows: [
      { event: 'assessment_start', count: 1, locale: 'es', segment: 'rural', plan: 'gestion', source_section: 'assessment' },
    ] })).toThrow(/dimensiones no canónicas.*plan/);
    expect(() => validateDataset({ ...dataset, rows: [
      { event: 'assessment_submit', count: 1, locale: 'es', segment: 'rural', plan: 'none', source_section: 'assessment' },
    ] })).toThrow(/plan no es canónico/);
    expect(() => validateDataset({ ...dataset, rows: [
      { event: 'assessment_step', count: 1, locale: 'es', step_index: 7, source_section: 'assessment' },
    ] })).toThrow(/step_index no es canónico/);
  });

  it('flags downstream counts instead of hiding a non-cohort comparison', () => {
    const report = buildReport(validateDataset({ ...dataset, rows: [
      { event: 'assessment_start', count: 2, locale: 'es', segment: 'rural', source_section: 'assessment' },
      { event: 'assessment_submit', count: 3, locale: 'es', segment: 'rural', plan: 'gestion', source_section: 'assessment' },
    ] }));
    expect(report.stages[1].fromPrevious).toBe(150);
    expect(report.warnings[0]).toContain('assessment_submit supera');
  });

  it('keeps homepage recommendations out of the diagnostic funnel', () => {
    const report = buildReport(validateDataset({ ...dataset, rows: [
      { event: 'assessment_start', count: 10, locale: 'es', segment: 'rural', source_section: 'assessment' },
      { event: 'assessment_submit', count: 5, locale: 'es', segment: 'rural', plan: 'gestion', source_section: 'assessment' },
      { event: 'assessment_complete', count: 5, locale: 'es', plan: 'gestion', source_section: 'assessment' },
      { event: 'assessment_complete', count: 50, locale: 'es', plan: 'gestion', source_section: 'homepage_scope' },
    ] }));
    expect(report.stages[2]).toMatchObject({ event: 'assessment_complete', count: 5, fromPrevious: 100 });
    expect(report.eventTotals.assessment_complete).toBe(55);
    expect(report.warnings).toEqual([]);
    expect(report.notes).toContain('50 recomendaciones de portada quedan fuera de las tasas del diagnóstico y permanecen en los totales de evento.');
  });

  it('reports only canonical solution views by segment', () => {
    const report = buildReport(validateDataset({ ...dataset, rows: [
      ...dataset.rows,
      { event: 'solution_view', count: 7, locale: 'es', segment: 'hotels', source_section: 'solution' },
    ] }));
    expect(report.solutionViewsBySegment).toEqual([{ segment: 'hotels', es: 7, en: 0, total: 7 }]);
    expect(report.eventTotals.solution_view).toBe(7);
  });

  it('accepts pnpm separators and rejects malformed input', async () => {
    expect(parseArguments(['--', '--example', '--format', 'json'])).toMatchObject({ example: true, format: 'json' });
    const result = await runFunnelReport({ args: [], stdin: '{invalid' });
    expect(result).toEqual({ exitCode: 1, stream: 'stderr', output: 'La entrada de stdin no contiene JSON válido.' });
  });
});
