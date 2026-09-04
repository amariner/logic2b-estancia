#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const CONTRACT_VERSION = '2.1.0';
const SCRIPT_DIRECTORY = dirname(fileURLToPath(import.meta.url));
const analyticsContract = JSON.parse(await readFile(resolve(SCRIPT_DIRECTORY, '../packages/config/src/analytics-contract.json'), 'utf8'));
const FUNNEL = [
  { event: 'assessment_start', label: 'Diagnósticos iniciados', sourceSection: 'assessment' },
  { event: 'assessment_submit', label: 'Diagnósticos validados', sourceSection: 'assessment' },
  { event: 'assessment_complete', label: 'Recomendaciones visibles', sourceSection: 'assessment' },
  { event: 'lead_submit', label: 'Solicitudes entregadas', sourceSection: 'homepage_contact' },
  { event: 'meeting_click', label: 'Clics en agenda', sourceSection: 'homepage_contact' },
];
if (analyticsContract.version !== CONTRACT_VERSION) throw new Error('La versión del contrato analítico no coincide con el informe.');
const EVENTS = new Set(analyticsContract.events);
const ROW_KEYS = new Set(['event', 'count', ...analyticsContract.parameters]);
const ROOT_KEYS = new Set(['contractVersion', 'period', 'consentMode', 'rows']);
const PERIOD_KEYS = new Set(['start', 'end']);
const VALUES = Object.fromEntries(Object.entries(analyticsContract.parameterValues).map(([key, values]) => [key, new Set(values)]));
const EVENT_SHAPES = analyticsContract.eventShapes;

const EXAMPLE = {
  contractVersion: CONTRACT_VERSION,
  period: { start: '2026-08-01', end: '2026-08-31' },
  consentMode: 'analytics-consent-only',
  rows: [
    { event: 'assessment_start', count: 40, locale: 'es', segment: 'rural', source_section: 'assessment' },
    { event: 'assessment_start', count: 10, locale: 'en', segment: 'hotels', source_section: 'assessment' },
    { event: 'assessment_submit', count: 20, locale: 'es', segment: 'rural', plan: 'gestion', source_section: 'assessment' },
    { event: 'assessment_submit', count: 5, locale: 'en', segment: 'hotels', plan: 'inteligente', source_section: 'assessment' },
    { event: 'assessment_complete', count: 20, locale: 'es', plan: 'gestion', source_section: 'assessment' },
    { event: 'assessment_complete', count: 5, locale: 'en', plan: 'inteligente', source_section: 'assessment' },
    { event: 'lead_submit', count: 6, locale: 'es', plan: 'gestion', source_section: 'homepage_contact' },
    { event: 'lead_submit', count: 1, locale: 'en', plan: 'inteligente', source_section: 'homepage_contact' },
    { event: 'meeting_click', count: 2, locale: 'es', source_section: 'homepage_contact' },
    { event: 'solution_view', count: 18, locale: 'es', segment: 'rural', source_section: 'solution' },
    { event: 'solution_view', count: 12, locale: 'es', segment: 'apartments', source_section: 'solution' },
    { event: 'solution_view', count: 8, locale: 'en', segment: 'hotels', source_section: 'solution' },
    { event: 'demo_open', count: 32, locale: 'es', demo: 'terrava', source_section: 'website' },
    { event: 'web_view', count: 14, locale: 'es', web: 'linde', plan: 'basico', source_section: 'web_portfolio' },
    { event: 'web_view', count: 6, locale: 'en', web: 'cobalto', plan: 'inteligente', source_section: 'web_portfolio' },
    { event: 'panel_view', count: 9, locale: 'es', panel: 'planning', plan: 'gestion', source_section: 'panel_portfolio' },
    { event: 'panel_view', count: 4, locale: 'en', panel: 'copilot', plan: 'inteligente', source_section: 'panel_portfolio' },
  ],
};

export function usage() {
  return `Logic2B Estancias · informe reproducible del embudo

Uso:
  pnpm funnel:report -- --validate
  pnpm funnel:report -- --example [--format markdown|json]
  pnpm funnel:report -- [--format markdown|json] < recuentos.json

Solo se admiten recuentos agregados, eventos y parámetros allowlisted. La
herramienta no escribe archivos ni hace peticiones de red.`;
}

export function parseArguments(args) {
  const options = { validate: false, example: false, format: 'markdown', help: false };
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === '--') continue;
    if (argument === '--help' || argument === '-h') options.help = true;
    else if (argument === '--validate') options.validate = true;
    else if (argument === '--example') options.example = true;
    else if (argument === '--format') options.format = requiredValue(args, ++index, argument);
    else throw new Error(`Argumento desconocido: ${argument}`);
  }
  if (!['markdown', 'json'].includes(options.format)) throw new Error('--format debe ser markdown o json.');
  return options;
}

export function validateDataset(dataset) {
  if (!isRecord(dataset)) throw new Error('La entrada debe ser un objeto JSON.');
  rejectUnknownKeys(dataset, ROOT_KEYS, 'raíz');
  if (dataset.contractVersion !== CONTRACT_VERSION) throw new Error(`contractVersion debe ser ${CONTRACT_VERSION}.`);
  if (dataset.consentMode !== 'analytics-consent-only') throw new Error('consentMode debe confirmar analytics-consent-only.');
  if (!isRecord(dataset.period)) throw new Error('period debe ser un objeto.');
  rejectUnknownKeys(dataset.period, PERIOD_KEYS, 'period');
  const start = parseDate(dataset.period.start, 'period.start');
  const end = parseDate(dataset.period.end, 'period.end');
  if (start > end) throw new Error('period.start no puede ser posterior a period.end.');
  if (!Array.isArray(dataset.rows) || dataset.rows.length === 0) throw new Error('rows debe contener al menos una fila agregada.');
  const rows = dataset.rows.map((row, index) => validateRow(row, index));
  if (!rows.some((row) => FUNNEL.some((stage) => matchesStage(row, stage)) || isCanonicalEvidenceView(row))) throw new Error('El dataset debe contener al menos un evento canónico del embudo o de evidencia web/panel.');
  return { contractVersion: CONTRACT_VERSION, period: { start: dataset.period.start, end: dataset.period.end }, consentMode: dataset.consentMode, rows };
}

function validateRow(row, index) {
  const label = `rows[${index}]`;
  if (!isRecord(row)) throw new Error(`${label} debe ser un objeto.`);
  rejectUnknownKeys(row, ROW_KEYS, label);
  if (!EVENTS.has(row.event)) throw new Error(`${label}.event no está permitido.`);
  if (!Number.isSafeInteger(row.count) || row.count < 0 || row.count > 1_000_000_000) throw new Error(`${label}.count debe ser un entero agregado entre 0 y 1.000.000.000.`);
  for (const [key, allowed] of Object.entries(VALUES)) {
    if (row[key] !== undefined && !allowed.has(row[key])) throw new Error(`${label}.${key} no está allowlisted.`);
  }
  if (row.step_index !== undefined && (!Number.isSafeInteger(row.step_index) || row.step_index < 1 || row.step_index > 20)) throw new Error(`${label}.step_index debe ser un entero entre 1 y 20.`);
  validateEventShape(row, label);
  return { ...row };
}

export function buildReport(validDataset) {
  const eventTotals = Object.fromEntries([...EVENTS].sort().map((event) => [event, sum(validDataset.rows.filter((row) => row.event === event))]));
  const stageCounts = FUNNEL.map((stage) => sum(validDataset.rows.filter((row) => matchesStage(row, stage))));
  const stages = FUNNEL.map(({ event, label }, index) => {
    const count = stageCounts[index];
    const previous = index === 0 ? null : stageCounts[index - 1];
    return { event, label, count, fromPrevious: previous === null || previous === 0 ? null : round((count / previous) * 100) };
  });
  const warnings = [];
  const notes = [];
  for (let index = 1; index < stages.length; index += 1) {
    if (stages[index].count > stages[index - 1].count) warnings.push(`${stages[index].event} supera a ${stages[index - 1].event}; revisa entradas externas, repeticiones o cambios de instrumentación.`);
  }
  const excludedStageRows = validDataset.rows.filter((row) => FUNNEL.some(({ event }) => event === row.event) && !FUNNEL.some((stage) => matchesStage(row, stage)));
  const excludedStageCount = sum(excludedStageRows);
  if (excludedStageCount > 0) notes.push(`${excludedStageCount} recomendaciones de portada quedan fuera de las tasas del diagnóstico y permanecen en los totales de evento.`);
  const byLocale = ['es', 'en', 'sin_dimension'].map((locale) => ({
    locale,
    stages: Object.fromEntries(FUNNEL.map((stage) => [stage.event, sum(validDataset.rows.filter((row) => matchesStage(row, stage) && (locale === 'sin_dimension' ? row.locale === undefined : row.locale === locale)))])),
  })).filter(({ stages: totals }) => Object.values(totals).some((count) => count > 0));
  const solutionViewRows = validDataset.rows.filter((row) => row.event === 'solution_view' && row.source_section === 'solution');
  const solutionViewsBySegment = ['rural', 'apartments', 'hotels'].map((segment) => ({
    segment,
    es: sum(solutionViewRows.filter((row) => row.segment === segment && row.locale === 'es')),
    en: sum(solutionViewRows.filter((row) => row.segment === segment && row.locale === 'en')),
    total: sum(solutionViewRows.filter((row) => row.segment === segment)),
  })).filter(({ total }) => total > 0);
  const webViewsByConcept = buildEvidenceViewBreakdown(validDataset.rows, 'web_view', 'web', 'web_portfolio');
  const panelViewsBySurface = buildEvidenceViewBreakdown(validDataset.rows, 'panel_view', 'panel', 'panel_portfolio');
  return {
    contractVersion: validDataset.contractVersion,
    period: validDataset.period,
    coverage: 'Solo navegación con consentimiento analítico explícito; recuentos agregados sin atribución usuario a usuario. Las tasas usan únicamente el source_section canónico de cada etapa.',
    stages,
    eventTotals: Object.fromEntries(Object.entries(eventTotals).filter(([, count]) => count > 0)),
    byLocale,
    solutionViewsBySegment,
    webViewsByConcept,
    panelViewsBySurface,
    warnings,
    notes,
    excludedOutcomes: ['proposals', 'won_projects', 'lost_projects', 'revenue', 'objections'],
  };
}

export function renderMarkdown(report) {
  const lines = [
    '# Logic2B Estancias · Informe del embudo digital',
    '',
    `Periodo: ${report.period.start} → ${report.period.end}  `,
    `Contrato: ${report.contractVersion}  `,
    `Cobertura: ${report.coverage}`,
    '',
    '## Embudo principal',
    '',
    '| Etapa | Evento | Recuento | Desde la anterior |',
    '| --- | --- | ---: | ---: |',
    ...report.stages.map((stage, index) => `| ${stage.label} | \`${stage.event}\` | ${stage.count} | ${index === 0 ? '—' : stage.fromPrevious === null ? 'N/D' : `${formatPercent(stage.fromPrevious)} %`} |`),
    '',
    'Las tasas comparan eventos agregados: muestran dirección, no personas ni atribución individual.',
    '',
    '## Desglose por idioma',
    '',
    '| Idioma | Inicio | Entrega válida | Recomendación | Solicitud | Agenda |',
    '| --- | ---: | ---: | ---: | ---: | ---: |',
    ...report.byLocale.map(({ locale, stages }) => `| ${locale} | ${stages.assessment_start} | ${stages.assessment_submit} | ${stages.assessment_complete} | ${stages.lead_submit} | ${stages.meeting_click} |`),
    '',
    '## Vistas de soluciones',
    '',
    ...(report.solutionViewsBySegment.length ? [
      '| Segmento | ES | EN | Total |',
      '| --- | ---: | ---: | ---: |',
      ...report.solutionViewsBySegment.map(({ segment, es, en, total }) => `| ${segment} | ${es} | ${en} | ${total} |`),
    ] : ['Sin `solution_view` canónicos en el periodo.']),
    '',
    '## Vistas de evidencia web',
    '',
    ...(report.webViewsByConcept.length ? [
      '| Web | Plan | ES | EN | Total |',
      '| --- | --- | ---: | ---: | ---: |',
      ...report.webViewsByConcept.map(({ id, plan, es, en, total }) => `| ${id} | ${plan} | ${es} | ${en} | ${total} |`),
    ] : ['Sin `web_view` canónicos en el periodo.']),
    '',
    '## Vistas de evidencia de panel',
    '',
    ...(report.panelViewsBySurface.length ? [
      '| Panel | Plan | ES | EN | Total |',
      '| --- | --- | ---: | ---: | ---: |',
      ...report.panelViewsBySurface.map(({ id, plan, es, en, total }) => `| ${id} | ${plan} | ${es} | ${en} | ${total} |`),
    ] : ['Sin `panel_view` canónicos en el periodo.']),
    '',
    '## Totales de eventos observados',
    '',
    '| Evento | Recuento |',
    '| --- | ---: |',
    ...Object.entries(report.eventTotals).map(([event, count]) => `| \`${event}\` | ${count} |`),
    '',
    '## Controles de calidad',
    '',
    ...(report.warnings.length ? report.warnings.map((warning) => `- Revisar: ${warning}`) : ['- Sin incoherencias direccionales detectadas en los recuentos.']),
    ...report.notes.map((note) => `- Contexto: ${note}`),
    '- Propuestas, proyectos ganados/perdidos, ingresos y objeciones quedan fuera: requieren evidencia comercial separada.',
    '- No interpretar este informe como tráfico total: la analítica solo se activa tras consentimiento explícito.',
    '- Las vistas son cargas agregadas de evidencia, no personas ni usuarios únicos.',
  ];
  return `${lines.join('\n')}\n`;
}

export async function runFunnelReport({ args, stdin = '' }) {
  try {
    const options = parseArguments(args);
    if (options.help) return success(usage());
    if (options.validate && !options.example && !stdin.trim()) return success(JSON.stringify({ ok: true, contractVersion: CONTRACT_VERSION, funnel: FUNNEL.map(({ event }) => event), privacy: 'aggregated-allowlist-only' }, null, 2));
    const raw = options.example ? EXAMPLE : parseInput(stdin);
    const dataset = validateDataset(raw);
    const report = buildReport(dataset);
    if (options.validate) return success(JSON.stringify({ ok: true, contractVersion: CONTRACT_VERSION, rows: dataset.rows.length }, null, 2));
    return success(options.format === 'json' ? JSON.stringify(report, null, 2) : renderMarkdown(report));
  } catch (error) {
    return { exitCode: 1, stream: 'stderr', output: error instanceof Error ? error.message : 'Error desconocido.' };
  }
}

function rejectUnknownKeys(value, allowed, label) {
  const unknown = Object.keys(value).filter((key) => !allowed.has(key));
  if (unknown.length) throw new Error(`${label} contiene campos no permitidos: ${unknown.join(', ')}.`);
}

function parseDate(value, label) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error(`${label} debe usar YYYY-MM-DD.`);
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== value) throw new Error(`${label} no es una fecha válida.`);
  return date;
}

function parseInput(stdin) {
  if (!stdin.trim()) throw new Error('Pasa recuentos JSON agregados por stdin o usa --example.');
  try { return JSON.parse(stdin); }
  catch { throw new Error('La entrada de stdin no contiene JSON válido.'); }
}

function requiredValue(args, index, option) {
  const value = args[index];
  if (!value || value.startsWith('--')) throw new Error(`${option} requiere un valor.`);
  return value;
}

function isRecord(value) { return Boolean(value) && typeof value === 'object' && !Array.isArray(value); }
function validateEventShape(row, label) {
  const shape = EVENT_SHAPES[row.event];
  if (!shape) return;
  const missing = shape.required.filter((key) => row[key] === undefined);
  if (missing.length) throw new Error(`${label} requiere dimensiones canónicas para ${row.event}: ${missing.join(', ')}.`);
  const dimensions = Object.keys(row).filter((key) => key !== 'event' && key !== 'count');
  const unexpected = dimensions.filter((key) => !shape.allowed.includes(key));
  if (unexpected.length) throw new Error(`${label} contiene dimensiones no canónicas para ${row.event}: ${unexpected.join(', ')}.`);
  for (const [key, allowed] of Object.entries(shape.values)) {
    if (row[key] !== undefined && !allowed.includes(row[key])) throw new Error(`${label}.${key} no es canónico para ${row.event}.`);
  }
  if (Array.isArray(shape.combinations) && !shape.combinations.some((combination) => Object.entries(combination).every(([key, value]) => row[key] === value))) {
    throw new Error(`${label} no contiene una combinación canónica para ${row.event}.`);
  }
}
function matchesStage(row, stage) { return row.event === stage.event && row.source_section === stage.sourceSection; }
function isCanonicalEvidenceView(row) {
  return (row.event === 'web_view' && row.source_section === 'web_portfolio')
    || (row.event === 'panel_view' && row.source_section === 'panel_portfolio');
}
function buildEvidenceViewBreakdown(rows, event, dimension, sourceSection) {
  const canonicalPlans = new Map((EVENT_SHAPES[event]?.combinations ?? []).map((combination) => [combination[dimension], combination.plan]));
  const matching = rows.filter((row) => row.event === event && row.source_section === sourceSection);
  return [...canonicalPlans].map(([id, plan]) => {
    const selected = matching.filter((row) => row[dimension] === id && row.plan === plan);
    const es = sum(selected.filter((row) => row.locale === 'es'));
    const en = sum(selected.filter((row) => row.locale === 'en'));
    return { id, plan, es, en, total: es + en };
  }).filter(({ total }) => total > 0);
}
function sum(rows) { return rows.reduce((total, row) => total + row.count, 0); }
function round(value) { return Math.round(value * 10) / 10; }
function formatPercent(value) { return Number.isInteger(value) ? String(value) : value.toFixed(1); }
function success(output) { return { exitCode: 0, stream: 'stdout', output }; }

async function main() {
  const chunks = [];
  if (!process.stdin.isTTY) for await (const chunk of process.stdin) chunks.push(chunk);
  const result = await runFunnelReport({ args: process.argv.slice(2), stdin: Buffer.concat(chunks).toString('utf8') });
  const stream = result.stream === 'stderr' ? process.stderr : process.stdout;
  stream.write(`${result.output}\n`);
  process.exitCode = result.exitCode;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) await main();
