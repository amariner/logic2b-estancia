#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const CONTRACT_VERSION = '1.0.0';
const SCRIPT_DIRECTORY = dirname(fileURLToPath(import.meta.url));
const analyticsContract = JSON.parse(await readFile(resolve(SCRIPT_DIRECTORY, '../packages/config/src/analytics-contract.json'), 'utf8'));
const FUNNEL = [
  ['assessment_start', 'Diagnósticos iniciados'],
  ['assessment_complete', 'Recomendaciones visibles'],
  ['lead_submit', 'Solicitudes entregadas'],
  ['meeting_click', 'Clics en agenda'],
];
if (analyticsContract.version !== CONTRACT_VERSION) throw new Error('La versión del contrato analítico no coincide con el informe.');
const EVENTS = new Set(analyticsContract.events);
const ROW_KEYS = new Set(['event', 'count', ...analyticsContract.parameters]);
const ROOT_KEYS = new Set(['contractVersion', 'period', 'consentMode', 'rows']);
const PERIOD_KEYS = new Set(['start', 'end']);
const VALUES = Object.fromEntries(Object.entries(analyticsContract.parameterValues).map(([key, values]) => [key, new Set(values)]));

const EXAMPLE = {
  contractVersion: CONTRACT_VERSION,
  period: { start: '2026-08-01', end: '2026-08-31' },
  consentMode: 'analytics-consent-only',
  rows: [
    { event: 'assessment_start', count: 40, locale: 'es', source_section: 'assessment' },
    { event: 'assessment_start', count: 10, locale: 'en', source_section: 'assessment' },
    { event: 'assessment_complete', count: 20, locale: 'es', plan: 'gestion', source_section: 'assessment' },
    { event: 'assessment_complete', count: 5, locale: 'en', plan: 'inteligente', source_section: 'assessment' },
    { event: 'lead_submit', count: 6, locale: 'es', plan: 'gestion', source_section: 'homepage_contact' },
    { event: 'lead_submit', count: 1, locale: 'en', plan: 'inteligente', source_section: 'homepage_contact' },
    { event: 'meeting_click', count: 2, locale: 'es', plan: 'gestion', source_section: 'homepage_contact' },
    { event: 'demo_open', count: 32, locale: 'es', demo: 'terrava', source_section: 'website' },
  ],
};

export function usage() {
  return `Logic Estancia · informe reproducible del embudo

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
  if (!rows.some(({ event }) => FUNNEL.some(([stage]) => stage === event))) throw new Error('El dataset debe contener al menos un evento del embudo principal.');
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
  return { ...row };
}

export function buildReport(validDataset) {
  const eventTotals = Object.fromEntries([...EVENTS].sort().map((event) => [event, sum(validDataset.rows.filter((row) => row.event === event))]));
  const stages = FUNNEL.map(([event, label], index) => {
    const count = eventTotals[event];
    const previous = index === 0 ? null : eventTotals[FUNNEL[index - 1][0]];
    return { event, label, count, fromPrevious: previous === null || previous === 0 ? null : round((count / previous) * 100) };
  });
  const warnings = [];
  for (let index = 1; index < stages.length; index += 1) {
    if (stages[index].count > stages[index - 1].count) warnings.push(`${stages[index].event} supera a ${stages[index - 1].event}; revisa entradas externas, repeticiones o cambios de instrumentación.`);
  }
  const byLocale = ['es', 'en', 'sin_dimension'].map((locale) => ({
    locale,
    stages: Object.fromEntries(FUNNEL.map(([event]) => [event, sum(validDataset.rows.filter((row) => row.event === event && (locale === 'sin_dimension' ? row.locale === undefined : row.locale === locale)))])),
  })).filter(({ stages: totals }) => Object.values(totals).some((count) => count > 0));
  return {
    contractVersion: validDataset.contractVersion,
    period: validDataset.period,
    coverage: 'Solo navegación con consentimiento analítico explícito; recuentos agregados sin atribución usuario a usuario.',
    stages,
    eventTotals: Object.fromEntries(Object.entries(eventTotals).filter(([, count]) => count > 0)),
    byLocale,
    warnings,
    excludedOutcomes: ['proposals', 'won_projects', 'lost_projects', 'revenue', 'objections'],
  };
}

export function renderMarkdown(report) {
  const lines = [
    '# Logic Estancia · Informe del embudo digital',
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
    '| Idioma | Inicio | Recomendación | Solicitud | Agenda |',
    '| --- | ---: | ---: | ---: | ---: |',
    ...report.byLocale.map(({ locale, stages }) => `| ${locale} | ${stages.assessment_start} | ${stages.assessment_complete} | ${stages.lead_submit} | ${stages.meeting_click} |`),
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
    '- Propuestas, proyectos ganados/perdidos, ingresos y objeciones quedan fuera: requieren evidencia comercial separada.',
    '- No interpretar este informe como tráfico total: la analítica solo se activa tras consentimiento explícito.',
  ];
  return `${lines.join('\n')}\n`;
}

export async function runFunnelReport({ args, stdin = '' }) {
  try {
    const options = parseArguments(args);
    if (options.help) return success(usage());
    if (options.validate && !options.example && !stdin.trim()) return success(JSON.stringify({ ok: true, contractVersion: CONTRACT_VERSION, funnel: FUNNEL.map(([event]) => event), privacy: 'aggregated-allowlist-only' }, null, 2));
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
