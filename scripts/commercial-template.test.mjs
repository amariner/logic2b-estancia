import { describe, expect, it } from 'vitest';
import { loadKit, parseArguments, renderTemplate, runCommercialTemplate, validateKit } from './commercial-template.mjs';

describe('commercial template kit', () => {
  it('contains the three aligned, safe and versioned templates', async () => {
    const result = validateKit(await loadKit());
    expect(result).toEqual({ version: '1.0.0', templates: ['diagnostic-summary', 'follow-up', 'proposal'] });
  });

  it('lists contracts without requiring commercial data', async () => {
    const result = await runCommercialTemplate({ args: ['--list'] });
    expect(result.exitCode).toBe(0);
    expect(JSON.parse(result.output).templates).toHaveLength(3);
    expect(result.output).toContain('recommended_plan');
  });

  it('renders an explicitly fictitious example with no unresolved tokens', async () => {
    const result = await runCommercialTemplate({ args: ['--template', 'proposal', '--example'] });
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('PROPUESTA-DEMO-NO-ENVIAR');
    expect(result.output).toContain('Plan: **Gestión**');
    expect(result.output).not.toMatch(/\{\{[a-z_]+\}\}/);
    expect(result.output).not.toMatch(/\b(?:Inicio|Automatiza)\b/);
  });

  it('requires every token and rejects unexpected fields', async () => {
    const template = (await loadKit()).templates.find(({ id }) => id === 'diagnostic-summary');
    expect(() => renderTemplate(template, { recommended_plan: 'Gestión' })).toThrow(/Faltan campos/);
    const result = await runCommercialTemplate({ args: ['--template', 'follow-up'], stdin: JSON.stringify({ unexpected: 'dato' }) });
    expect(result).toMatchObject({ exitCode: 1, stream: 'stderr' });
  });

  it('accepts only the three canonical plans', async () => {
    const template = (await loadKit()).templates.find(({ id }) => id === 'diagnostic-summary');
    const values = Object.fromEntries(template.requiredTokens.map((token) => [token, token === 'recommended_plan' ? 'Inicio' : 'Contenido confirmado']));
    expect(() => renderTemplate(template, values)).toThrow(/Básico, Gestión o Inteligente/);
  });

  it('accepts the pnpm separator and reports malformed input safely', async () => {
    expect(parseArguments(['--', '--validate']).action).toBe('validate');
    const result = await runCommercialTemplate({ args: ['--template', 'proposal'], stdin: '{invalid' });
    expect(result).toEqual({ exitCode: 1, stream: 'stderr', output: 'La entrada de stdin no contiene JSON válido.' });
  });
});
