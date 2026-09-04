import { describe, expect, it } from 'vitest';
import { buildDossier, CONTRACT_VERSION, parseArguments, runDossier, TARGET_HOSTNAME, validateDossier } from './gtm-activation-dossier.mjs';

const clone = (value) => structuredClone(value);

describe('GTM activation dossier', () => {
  it('derives every provider mapping and keeps demo events local', () => {
    const dossier = buildDossier();
    expect(validateDossier(dossier)).toEqual({ ok: true, contractVersion: CONTRACT_VERSION, providerEvents: 15, localOnlyDemoEvents: 5 });
    expect(dossier.scope.providerEvents.every(({ trigger }) => trigger.pageHostnameEquals === TARGET_HOSTNAME)).toBe(true);
    expect(dossier.scope.localOnlyDemoEvents).toEqual(['demo_open', 'demo_mode_select', 'demo_step_complete', 'demo_flow_complete', 'demo_cta']);
  });

  it('renders deterministic markdown and JSON without endpoints or fabricated activation data', async () => {
    const markdown = await runDossier([]);
    const json = await runDossier(['--format', 'json']);
    expect(markdown).toMatchObject({ exitCode: 0, stream: 'stdout' });
    expect(markdown.output).toContain('Expediente offline de activación GTM');
    expect(markdown.output).toContain('Fecha de corte de línea base: **pendiente**');
    expect(markdown.output).toContain('Estancias \\| GA4 Event \\| solution_view');
    expect(json.output).not.toMatch(/https?:\/\//);
    expect(JSON.parse(json.output).authorization.status).toBe('not_authorized');
  });

  it('supports validation and rejects unknown formats', async () => {
    expect(JSON.parse((await runDossier(['--validate'])).output)).toEqual({ ok: true, contractVersion: CONTRACT_VERSION, providerEvents: 15, localOnlyDemoEvents: 5 });
    expect(() => parseArguments(['--format', 'yaml'])).toThrow('--format debe ser markdown o json.');
  });

  it.each([
    ['a missing event', (dossier) => dossier.scope.providerEvents.pop()],
    ['a Camp hostname trigger', (dossier) => { dossier.scope.providerEvents[0].trigger.pageHostnameEquals = 'camp.logic2b.com'; }],
    ['a free parameter', (dossier) => { dossier.scope.providerEvents[0].parameters.push({ name: 'page_title', value: '{{Page Title}}', required: false }); }],
    ['a fabricated baseline date', (dossier) => { dossier.activation.baselineCutoffDate = '2026-09-04'; }],
    ['an invented GA4 reference', (dossier) => { dossier.configuration.ga4ConfigurationReference = 'G-FAKE'; }],
    ['an authorized state', (dossier) => { dossier.authorization.status = 'authorized'; }],
    ['a network action', (dossier) => { dossier.authorization.networkAccess = true; }],
    ['a missing rollback', (dossier) => { dossier.rollback.steps = []; }],
    ['a missing dataLayer variable', (dossier) => { dossier.configuration.dataLayerVariables.pop(); }],
  ])('fails closed on %s', (_label, mutate) => {
    const dossier = clone(buildDossier());
    mutate(dossier);
    expect(() => validateDossier(dossier)).toThrow();
  });
});
