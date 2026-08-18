import { describe, expect, it } from 'vitest';
import { buildReport, CONTRACT_VERSION, parseArguments, runFunnelReport, validateDataset } from './funnel-report.mjs';

const dataset = {
  contractVersion: CONTRACT_VERSION,
  period: { start: '2026-08-01', end: '2026-08-31' },
  consentMode: 'analytics-consent-only',
  rows: [
    { event: 'assessment_start', count: 20, locale: 'es', source_section: 'assessment' },
    { event: 'assessment_complete', count: 10, locale: 'es', plan: 'gestion', source_section: 'assessment' },
    { event: 'lead_submit', count: 2, locale: 'es', plan: 'gestion', source_section: 'homepage_contact' },
  ],
};

describe('funnel report', () => {
  it('documents the versioned aggregate-only contract', async () => {
    const result = await runFunnelReport({ args: ['--validate'] });
    expect(result.exitCode).toBe(0);
    expect(JSON.parse(result.output)).toMatchObject({ ok: true, contractVersion: '1.0.0', privacy: 'aggregated-allowlist-only' });
  });

  it('calculates stable directional rates without user attribution', () => {
    const report = buildReport(validateDataset(dataset));
    expect(report.stages).toEqual([
      expect.objectContaining({ event: 'assessment_start', count: 20, fromPrevious: null }),
      expect.objectContaining({ event: 'assessment_complete', count: 10, fromPrevious: 50 }),
      expect.objectContaining({ event: 'lead_submit', count: 2, fromPrevious: 20 }),
      expect.objectContaining({ event: 'meeting_click', count: 0, fromPrevious: 0 }),
    ]);
    expect(report.coverage).toContain('consentimiento analítico explícito');
    expect(report.excludedOutcomes).toContain('proposals');
  });

  it('renders the fictitious example as Markdown or JSON', async () => {
    const markdown = await runFunnelReport({ args: ['--example'] });
    expect(markdown.exitCode).toBe(0);
    expect(markdown.output).toContain('| Recomendaciones visibles | `assessment_complete` | 25 | 50 % |');
    const json = await runFunnelReport({ args: ['--example', '--format', 'json'] });
    expect(JSON.parse(json.output).byLocale).toEqual(expect.arrayContaining([expect.objectContaining({ locale: 'es' }), expect.objectContaining({ locale: 'en' })]));
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

  it('flags downstream counts instead of hiding a non-cohort comparison', () => {
    const report = buildReport(validateDataset({ ...dataset, rows: [
      { event: 'assessment_start', count: 2 },
      { event: 'assessment_complete', count: 3 },
    ] }));
    expect(report.stages[1].fromPrevious).toBe(150);
    expect(report.warnings[0]).toContain('assessment_complete supera');
  });

  it('accepts pnpm separators and rejects malformed input', async () => {
    expect(parseArguments(['--', '--example', '--format', 'json'])).toMatchObject({ example: true, format: 'json' });
    const result = await runFunnelReport({ args: [], stdin: '{invalid' });
    expect(result).toEqual({ exitCode: 1, stream: 'stderr', output: 'La entrada de stdin no contiene JSON válido.' });
  });
});
