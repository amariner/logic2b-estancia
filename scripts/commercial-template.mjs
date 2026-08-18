#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SCRIPT_DIRECTORY = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_DIRECTORY = resolve(SCRIPT_DIRECTORY, '../docs/commercial/templates');
const MANIFEST_PATH = resolve(TEMPLATE_DIRECTORY, 'manifest.json');
const TOKEN_PATTERN = /\{\{([a-z][a-z0-9_]*)\}\}/g;
const ALLOWED_PLANS = new Set(['Básico', 'Gestión', 'Inteligente']);
const FORBIDDEN_PLAN_PATTERN = /\b(?:Inicio|Automatiza)\b/i;
const PUBLISHED_PRICE_PATTERN = /(?:\bEUR\b|€|\b\d+(?:[.,]\d+)?\s*euros?\b)/i;

const EXAMPLES = {
  'diagnostic-summary': {
    recipient_name: 'Responsable Demo', business_name: 'Alojamiento Faro · ejemplo ficticio', document_date: '18 de agosto de 2026', owner_name: 'Equipo Logic Estancia', confirmed_context: '- Hotel independiente ficticio.\n- El contexto actual y los proveedores siguen pendientes de confirmar.', recommended_plan: 'Gestión', recommendation_reasons: '- Se quiere revisar un espacio compartido para solicitudes y reservas.\n- No se han validado necesidades operativas avanzadas.', reviewed_evidence: '- Terrava: solicitud ficticia que conserva contexto y prepara una alternativa local.', open_questions: '- Confirmar el flujo actual.\n- Confirmar los proveedores que no se pueden sustituir.', next_step: 'Revisar el flujo actual en una conversación de alcance.', next_step_date: 'Cuando la persona responsable confirme disponibilidad.',
  },
  'follow-up': {
    recipient_name: 'Responsable Demo', business_name: 'Alojamiento Faro · ejemplo ficticio', document_date: '18 de agosto de 2026', owner_name: 'Equipo Logic Estancia', confirmed_context: '- Se revisó un caso ficticio de solicitudes y reservas.\n- No se confirmó ninguna integración.', recommended_plan: 'Gestión', reviewed_evidence: '- Terrava: conversión local de una solicitud ficticia.', pending_validation: '- Flujo real y responsables.\n- Sistemas existentes y restricciones.', next_step: 'Confirmar una sesión de alcance de 30 minutos.', next_step_date: 'Sin fecha hasta recibir confirmación.',
  },
  proposal: {
    recipient_name: 'Responsable Demo', business_name: 'Alojamiento Faro · ejemplo ficticio', document_date: '18 de agosto de 2026', owner_name: 'Equipo Logic Estancia', proposal_reference: 'PROPUESTA-DEMO-NO-ENVIAR', recommended_plan: 'Gestión', business_outcome: 'Revisar si un espacio compartido puede reducir la pérdida de contexto entre solicitud y reserva.', confirmed_context: '- Caso enteramente ficticio.\n- Ningún proveedor o flujo real ha sido confirmado.', included_scope: '- Taller de alcance.\n- Prototipo revisable del flujo acordado.', observable_evidence: '- Terrava muestra el recorrido local usado como referencia, sin crear reservas reales.', acceptance_criteria: '- El flujo acordado puede recorrerse con datos de prueba.\n- Los límites y acciones simuladas son visibles.', excluded_scope: '- Integraciones, pagos, inventario y mensajería reales.\n- Migraciones no inventariadas.', dependencies: '- Disponibilidad del responsable ficticio.\n- Validación futura de proveedores.', delivery_phases: '1. Descubrimiento.\n2. Validación del prototipo.\n3. Decisión de alcance.', open_questions: '- Qué sistema es la fuente de verdad.\n- Qué permisos serían necesarios.', next_step: 'Validar o corregir este borrador de alcance.', next_step_date: 'Pendiente de acuerdo.',
  },
};

export function usage() {
  return `Logic Estancia · kit comercial versionado

Uso:
  pnpm commercial:template -- --list
  pnpm commercial:template -- --validate
  pnpm commercial:template -- --template <id> --example
  pnpm commercial:template -- --template <id> < datos.json

La herramienta solo lee plantillas locales y stdin. No escribe archivos ni hace
peticiones de red. Los documentos generados requieren revisión humana.`;
}

export function parseArguments(args) {
  const options = { action: 'render', templateId: '', example: false, help: false };
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === '--') continue;
    if (argument === '--help' || argument === '-h') options.help = true;
    else if (argument === '--list') options.action = 'list';
    else if (argument === '--validate') options.action = 'validate';
    else if (argument === '--example') options.example = true;
    else if (argument === '--template') options.templateId = requiredValue(args, ++index, argument);
    else throw new Error(`Argumento desconocido: ${argument}`);
  }
  return options;
}

export async function loadKit() {
  const manifest = JSON.parse(await readFile(MANIFEST_PATH, 'utf8'));
  const templates = await Promise.all(manifest.templates.map(async (entry) => ({
    ...entry,
    content: await readFile(resolve(TEMPLATE_DIRECTORY, entry.file), 'utf8'),
  })));
  return { manifest, templates };
}

export function validateKit(kit) {
  const errors = [];
  if (!/^\d+\.\d+\.\d+$/.test(kit.manifest.version)) errors.push('La versión del kit debe usar semver.');
  if (kit.manifest.locale !== 'es') errors.push('El kit inicial debe estar localizado en español.');
  if (kit.manifest.status !== 'internal-draft') errors.push('El kit debe permanecer como borrador interno.');
  if (kit.templates.length !== 3) errors.push('El kit debe contener exactamente tres plantillas.');
  const ids = new Set();
  for (const template of kit.templates) {
    if (ids.has(template.id)) errors.push(`ID duplicado: ${template.id}.`);
    ids.add(template.id);
    const marker = `<!-- logic-estancia-template: ${template.id}@${kit.manifest.version} -->`;
    if (!template.content.includes(marker)) errors.push(`${template.id}: falta el marcador de versión.`);
    const tokens = [...template.content.matchAll(TOKEN_PATTERN)].map((match) => match[1]);
    const uniqueTokens = [...new Set(tokens)].sort();
    const requiredTokens = [...template.requiredTokens].sort();
    if (JSON.stringify(uniqueTokens) !== JSON.stringify(requiredTokens)) errors.push(`${template.id}: los tokens no coinciden con el manifiesto.`);
    if (FORBIDDEN_PLAN_PATTERN.test(template.content)) errors.push(`${template.id}: contiene un plan antiguo.`);
    if (PUBLISHED_PRICE_PATTERN.test(template.content)) errors.push(`${template.id}: contiene un precio o símbolo monetario.`);
    if (!template.content.toLowerCase().includes('fictici')) errors.push(`${template.id}: debe explicar el límite ficticio de la evidencia.`);
    if (!template.content.toLowerCase().includes('siguiente paso')) errors.push(`${template.id}: debe conservar un siguiente paso explícito.`);
  }
  if (errors.length) throw new Error(errors.join('\n'));
  return { version: kit.manifest.version, templates: kit.templates.map(({ id }) => id) };
}

export function renderTemplate(template, values) {
  if (!values || typeof values !== 'object' || Array.isArray(values)) throw new Error('La entrada debe ser un objeto JSON.');
  const supplied = Object.keys(values).sort();
  const required = [...template.requiredTokens].sort();
  const missing = required.filter((token) => !supplied.includes(token));
  const unknown = supplied.filter((token) => !required.includes(token));
  if (missing.length) throw new Error(`Faltan campos: ${missing.join(', ')}.`);
  if (unknown.length) throw new Error(`Campos desconocidos: ${unknown.join(', ')}.`);
  const normalized = {};
  for (const token of required) {
    if (typeof values[token] !== 'string') throw new Error(`${token} debe ser texto.`);
    const value = values[token].trim();
    if (!value) throw new Error(`${token} no puede estar vacío.`);
    if (value.length > 20_000) throw new Error(`${token} supera el límite de 20.000 caracteres.`);
    normalized[token] = value.replaceAll('\0', '');
  }
  if (!ALLOWED_PLANS.has(normalized.recommended_plan)) throw new Error('recommended_plan debe ser Básico, Gestión o Inteligente.');
  const rendered = template.content.replace(TOKEN_PATTERN, (_, token) => normalized[token]);
  if (TOKEN_PATTERN.test(rendered)) throw new Error('El documento conserva tokens sin resolver.');
  return rendered;
}

export async function runCommercialTemplate({ args, stdin = '' }) {
  try {
    const options = parseArguments(args);
    if (options.help) return success(usage());
    const kit = await loadKit();
    const summary = validateKit(kit);
    if (options.action === 'validate') return success(JSON.stringify({ ok: true, ...summary }, null, 2));
    if (options.action === 'list') return success(JSON.stringify({ version: kit.manifest.version, templates: kit.templates.map(({ id, purpose, requiredTokens }) => ({ id, purpose, requiredTokens })) }, null, 2));
    const template = kit.templates.find(({ id }) => id === options.templateId);
    if (!template) throw new Error('Indica un template válido con --template. Consulta --list.');
    const values = options.example ? EXAMPLES[template.id] : parseInput(stdin);
    return success(renderTemplate(template, values));
  } catch (error) {
    return { exitCode: 1, stream: 'stderr', output: error instanceof Error ? error.message : 'Error desconocido.' };
  }
}

function requiredValue(args, index, option) {
  const value = args[index];
  if (!value || value.startsWith('--')) throw new Error(`${option} requiere un valor.`);
  return value;
}

function parseInput(stdin) {
  if (!stdin.trim()) throw new Error('Pasa los datos JSON por stdin o usa --example.');
  try { return JSON.parse(stdin); }
  catch { throw new Error('La entrada de stdin no contiene JSON válido.'); }
}

function success(output) { return { exitCode: 0, stream: 'stdout', output }; }

async function main() {
  const chunks = [];
  if (!process.stdin.isTTY) for await (const chunk of process.stdin) chunks.push(chunk);
  const result = await runCommercialTemplate({ args: process.argv.slice(2), stdin: Buffer.concat(chunks).toString('utf8') });
  const stream = result.stream === 'stderr' ? process.stderr : process.stdout;
  stream.write(`${result.output}\n`);
  process.exitCode = result.exitCode;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) await main();
