#!/usr/bin/env node

import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const lighthouseCli = fileURLToPath(import.meta.resolve('lighthouse/cli/index.js'));
const routes = [
  { path: '/', indexable: true },
  { path: '/soluciones/casas-rurales/', indexable: true },
  { path: '/soluciones/apartamentos/', indexable: true },
  { path: '/soluciones/hoteles/', indexable: true },
  { path: '/planes/', indexable: true },
  { path: '/webs/', indexable: true },
  { path: '/diagnostico/', indexable: true },
  { path: '/demos/terrava/', indexable: false },
];

function parseBaseUrl(args) {
  const index = args.indexOf('--base-url');
  const raw = index >= 0 ? args[index + 1] : 'http://127.0.0.1:8790';
  if (!raw || raw.startsWith('--')) throw new Error('Falta el valor de --base-url.');
  const url = new URL(raw);
  const local = ['127.0.0.1', 'localhost', '::1'].includes(url.hostname);
  const safeProtocol = url.protocol === 'https:' || local && url.protocol === 'http:';
  if (!safeProtocol || url.username || url.password || url.search || url.hash || url.pathname !== '/') {
    throw new Error('base-url debe ser un origen HTTPS, o HTTP local, sin credenciales, ruta, query ni fragmento.');
  }
  return url.origin;
}

async function assertReachable(baseUrl) {
  const response = await fetch(baseUrl, { signal: AbortSignal.timeout(5_000) }).catch(() => null);
  if (!response?.ok) throw new Error(`No hay un build accesible en ${baseUrl}. Ejecuta pnpm build y arranca el Worker local antes de la auditoría.`);
}

async function audit(baseUrl, route) {
  const url = new URL(route.path, `${baseUrl}/`).href;
  const { stdout } = await execFileAsync(process.execPath, [
    lighthouseCli,
    url,
    '--quiet',
    '--output=json',
    '--output-path=stdout',
    '--only-categories=performance,accessibility,best-practices,seo',
    '--form-factor=mobile',
    '--screenEmulation.mobile=true',
    '--throttling-method=simulate',
    '--chrome-flags=--headless --no-sandbox --disable-gpu',
  ], { maxBuffer: 30 * 1_024 * 1_024 });
  const report = JSON.parse(stdout);
  const score = (category) => Math.round((report.categories[category]?.score ?? 0) * 100);
  const numeric = (auditId) => report.audits[auditId]?.numericValue;
  const result = {
    path: route.path,
    scores: {
      performance: score('performance'),
      accessibility: score('accessibility'),
      bestPractices: score('best-practices'),
      seo: score('seo'),
    },
    metrics: {
      firstContentfulPaintMs: Math.round(numeric('first-contentful-paint') ?? 0),
      largestContentfulPaintMs: Math.round(numeric('largest-contentful-paint') ?? 0),
      totalBlockingTimeMs: Math.round(numeric('total-blocking-time') ?? 0),
      cumulativeLayoutShift: Number((numeric('cumulative-layout-shift') ?? 0).toFixed(3)),
    },
    indexation: route.indexable ? 'indexable' : 'noindex-demo',
  };
  const failures = [];
  if (result.scores.accessibility <= 90) failures.push(`accesibilidad ${result.scores.accessibility}`);
  if (route.indexable && result.scores.seo <= 90) failures.push(`SEO ${result.scores.seo}`);
  if (!route.indexable && report.audits['is-crawlable']?.score !== 0) failures.push('la demo no mantiene noindex');
  return { result, failures };
}

async function main() {
  const baseUrl = parseBaseUrl(process.argv.slice(2));
  await assertReachable(baseUrl);
  const results = [];
  const failures = [];
  for (const route of routes) {
    const audited = await audit(baseUrl, route);
    results.push(audited.result);
    failures.push(...audited.failures.map((failure) => `${route.path}: ${failure}`));
  }
  console.log(JSON.stringify({ baseUrl, emulation: 'mobile', thresholds: { accessibility: '>90', seoOnIndexableRoutes: '>90' }, results, failures }, null, 2));
  if (failures.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'La auditoría Lighthouse no pudo completarse.');
  process.exitCode = 1;
});
