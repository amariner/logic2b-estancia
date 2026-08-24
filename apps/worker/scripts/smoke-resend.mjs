#!/usr/bin/env node

import { pathToFileURL } from 'node:url';

const DEFAULT_BASE_URL = 'https://estancia.logic2b.com';
const AUTHORIZATION_VALUE = 'SEND_IDENTIFIED_TEST_EMAIL';
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const RUN_ID_PATTERN = /^[a-z0-9][a-z0-9-]{4,62}[a-z0-9]$/;
const OUTCOMES = new Set(['delivered', 'delivered_degraded', 'failed', 'disabled', 'limited', 'invalid', 'received', 'demo', 'blocked']);
const ERRORS = new Set(['invalid', 'rate_limited', 'lead_coordination_unavailable', 'lead_coordination_failed', 'lead_email_configuration_invalid', 'lead_delivery_disabled', 'lead_delivery_failed', 'commercial_leads_disabled']);

export function usage() {
  return `Logic2B Estancias · smoke de Resend

Uso:
  pnpm smoke:resend -- --run-id <id> [--base-url <url>]
  pnpm smoke:resend -- --execute --run-id <id> [--expect-ref <uuid>] [--base-url <url>]

El modo por defecto es seco y no hace ninguna petición. Para ejecutar, define:
  DEMO_MODE=false
  COMMERCIAL_LEADS_ENABLED=true
  LOGIC_ESTANCIA_SMOKE_VISITOR_EMAIL=<buzon-de-prueba>
  LOGIC_ESTANCIA_SMOKE_AUTHORIZATION=${AUTHORIZATION_VALUE}

El correo solo se lee desde el entorno y nunca se imprime. Repite exactamente el
mismo run-id y correo para comprobar la idempotencia durante las siguientes 24 h.`;
}

export function parseArguments(args) {
  const options = { execute: false, baseUrl: DEFAULT_BASE_URL, runId: '', expectRef: undefined, help: false };
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === '--') continue;
    if (argument === '--execute') options.execute = true;
    else if (argument === '--help' || argument === '-h') options.help = true;
    else if (argument === '--base-url') options.baseUrl = requiredValue(args, ++index, argument);
    else if (argument === '--run-id') options.runId = requiredValue(args, ++index, argument);
    else if (argument === '--expect-ref') options.expectRef = requiredValue(args, ++index, argument);
    else throw new Error(`Argumento desconocido: ${argument}`);
  }
  return options;
}

export function validateOptions(options, environment) {
  if (!RUN_ID_PATTERN.test(options.runId)) {
    throw new Error('El run-id es obligatorio y debe contener entre 6 y 64 caracteres: minúsculas, números o guiones.');
  }
  const baseUrl = new URL(options.baseUrl);
  const local = baseUrl.hostname === 'localhost' || baseUrl.hostname === '127.0.0.1' || baseUrl.hostname === '::1';
  const safeProtocol = baseUrl.protocol === 'https:' || (local && baseUrl.protocol === 'http:');
  if (baseUrl.username || baseUrl.password || baseUrl.search || baseUrl.hash || baseUrl.pathname !== '/' || !safeProtocol) {
    throw new Error('La base-url debe ser un origen HTTPS público sin credenciales, ruta, query ni fragmento; HTTP solo se admite en localhost.');
  }
  if (options.expectRef && !UUID_PATTERN.test(options.expectRef)) throw new Error('expect-ref debe ser una referencia UUID válida.');
  if (!options.execute) return { ...options, baseUrl: baseUrl.origin };
  if (environment.DEMO_MODE !== 'false') {
    throw new Error('El smoke con red exige DEMO_MODE=false explícito; un modo ausente, ambiguo o demo permanece bloqueado.');
  }
  if (environment.COMMERCIAL_LEADS_ENABLED !== 'true') {
    throw new Error('El smoke con red exige COMMERCIAL_LEADS_ENABLED=true explícito; no se enviará ningún correo.');
  }
  if (environment.LOGIC_ESTANCIA_SMOKE_AUTHORIZATION !== AUTHORIZATION_VALUE) {
    throw new Error(`Falta la autorización explícita LOGIC_ESTANCIA_SMOKE_AUTHORIZATION=${AUTHORIZATION_VALUE}.`);
  }
  const visitorEmail = String(environment.LOGIC_ESTANCIA_SMOKE_VISITOR_EMAIL ?? '').trim().toLowerCase();
  if (!isEmail(visitorEmail)) throw new Error('LOGIC_ESTANCIA_SMOKE_VISITOR_EMAIL debe contener un buzón de prueba válido.');
  return { ...options, baseUrl: baseUrl.origin, visitorEmail };
}

export function createTestLead(runId, visitorEmail) {
  return {
    name: 'SMOKE TEST - NO CONTACTAR',
    businessName: `PRUEBA TECNICA - ${runId}`,
    email: visitorEmail,
    accommodationType: 'hotel',
    businessMode: 'mono',
    propertyCount: 1,
    unitCount: 1,
    plan: 'basico',
    currentStack: ['smoke-test'],
    requestedCapabilities: ['verificacion-entrega-resend'],
    timeline: 'exploring',
    investmentRange: 'unknown',
    sourcePath: '/ops/resend-smoke',
    sourceCampaign: `resend-smoke:${runId}`,
    marketingConsent: false,
    message: `PRUEBA TECNICA ${runId}. No es un lead comercial. No contactar ni crear registros externos.`,
    lang: 'es',
    accept: true,
    website: '',
  };
}

export async function runSmoke({ args, environment, fetchImplementation = fetch }) {
  const parsed = parseArguments(args);
  if (parsed.help) return { exitCode: 0, stream: 'stdout', output: usage() };
  const options = validateOptions(parsed, environment);
  if (!options.execute) {
    return success({
      ok: true,
      mode: 'dry-run',
      targetOrigin: options.baseUrl,
      runId: options.runId,
      networkRequest: false,
    });
  }

  let runtimeResponse;
  try {
    runtimeResponse = await fetchImplementation(`${options.baseUrl}/api/capabilities`, {
      method: 'GET',
      headers: { accept: 'application/json', 'user-agent': 'logic-estancia-resend-smoke/1.0' },
    });
  } catch {
    return failure('No se pudo verificar el modo del despliegue. No se enviará ningún correo.');
  }
  const runtime = await runtimeResponse.json().catch(() => null);
  if (!runtimeResponse.ok || !allowsLiveEmail(runtime)) {
    return failure('El despliegue no declara un proveedor de email real y activado. No se enviará ningún correo.');
  }

  let response;
  try {
    response = await fetchImplementation(`${options.baseUrl}/api/leads`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'user-agent': 'logic-estancia-resend-smoke/1.0' },
      body: JSON.stringify(createTestLead(options.runId, options.visitorEmail)),
    });
  } catch {
    return failure('No se pudo conectar con el endpoint. No se muestran detalles del entorno para evitar filtraciones.');
  }

  const body = await response.json().catch(() => null);
  const summary = sanitizeResponse(response.status, body);
  if (!summary.ok) return { exitCode: 1, stream: 'stderr', output: JSON.stringify(summary, null, 2) };
  if (options.expectRef && summary.ref !== options.expectRef) {
    return failure('La referencia no coincide con --expect-ref.', { ...summary, expectedReferenceMatched: false });
  }
  if (summary.outcome !== 'delivered') {
    return failure('El smoke no terminó con entrega completa. Revisa los canales de la referencia antes de reintentar.', summary);
  }
  return success({
    ...summary,
    mode: 'executed',
    targetOrigin: options.baseUrl,
    runId: options.runId,
    expectedReferenceMatched: options.expectRef ? true : undefined,
  });
}

function allowsLiveEmail(value) {
  return Boolean(value
    && typeof value === 'object'
    && value.schemaVersion === '1.0.0'
    && ((value.mode === 'demo' && value.demoMode === true)
      || (value.mode === 'real' && value.demoMode === false))
    && value.commercialLeadsEnabled === true
    && value.sideEffects === true
    && value.durableWrites === true
    && value.jobs === false
    && value.providers?.email === 'live'
    && value.operations?.commercialLead === 'active');
}

export function sanitizeResponse(httpStatus, body) {
  const value = body && typeof body === 'object' ? body : {};
  const ref = typeof value.ref === 'string' && UUID_PATTERN.test(value.ref) ? value.ref : undefined;
  const outcome = typeof value.outcome === 'string' && OUTCOMES.has(value.outcome) ? value.outcome : 'unknown';
  const error = typeof value.error === 'string' && ERRORS.has(value.error) ? value.error : undefined;
  const retryAfter = typeof value.retryAfter === 'number' && Number.isFinite(value.retryAfter) && value.retryAfter >= 0 ? value.retryAfter : undefined;
  return {
    ok: httpStatus === 202 && value.ok === true && Boolean(ref),
    httpStatus,
    outcome,
    ref,
    replayed: value.replayed === true,
    error,
    retryAfter,
  };
}

function requiredValue(args, index, argument) {
  const value = args[index];
  if (!value || value.startsWith('--')) throw new Error(`Falta el valor de ${argument}.`);
  return value;
}

function isEmail(value) {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function success(value) {
  return { exitCode: 0, stream: 'stdout', output: JSON.stringify(value, (_, item) => item === undefined ? undefined : item, 2) };
}

function failure(message, details = {}) {
  return { exitCode: 1, stream: 'stderr', output: JSON.stringify({ ok: false, message, ...details }, null, 2) };
}

async function main() {
  let result;
  try {
    result = await runSmoke({ args: process.argv.slice(2), environment: process.env });
  } catch (error) {
    result = failure(error instanceof Error ? error.message : 'Configuración inválida.');
  }
  const writer = result.stream === 'stderr' ? console.error : console.log;
  writer(result.output);
  process.exitCode = result.exitCode;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) await main();
