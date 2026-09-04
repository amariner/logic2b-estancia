#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const CONTRACT_VERSION = '2.4.0';
export const TARGET_HOSTNAME = 'estancia.logic2b.com';
export const EXCLUDED_HOSTNAME = 'camp.logic2b.com';
const SCRIPT_DIRECTORY = dirname(fileURLToPath(import.meta.url));
const analyticsContract = JSON.parse(await readFile(resolve(SCRIPT_DIRECTORY, '../packages/config/src/analytics-contract.json'), 'utf8'));

export function usage() {
  return `Logic2B Estancias · expediente offline de activación GTM

Uso:
  pnpm gtm:dossier -- --validate
  pnpm gtm:dossier -- [--format markdown|json]

Genera y valida una especificación determinista desde el contrato analítico.
No escribe archivos, no consulta GTM y no autoriza ni activa producción.`;
}

export function parseArguments(args) {
  const options = { format: 'markdown', validate: false, help: false };
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === '--') continue;
    if (argument === '--help' || argument === '-h') options.help = true;
    else if (argument === '--validate') options.validate = true;
    else if (argument === '--format') options.format = args[++index];
    else throw new Error(`Argumento desconocido: ${argument}`);
  }
  if (!['markdown', 'json'].includes(options.format)) throw new Error('--format debe ser markdown o json.');
  return options;
}

export function buildDossier(contract = analyticsContract) {
  if (contract.version !== CONTRACT_VERSION) throw new Error(`El contrato debe ser ${CONTRACT_VERSION}.`);
  const providerEvents = contract.surfaces.site.map((event) => {
    const shape = contract.eventShapes[event];
    if (!shape) throw new Error(`Falta la forma contractual de ${event}.`);
    return {
      event,
      tag: `Estancias | GA4 Event | ${event}`,
      trigger: {
        name: `Estancias | Custom Event | ${event} | ${TARGET_HOSTNAME}`,
        type: 'custom_event',
        eventEquals: event,
        pageHostnameEquals: TARGET_HOSTNAME,
      },
      parameters: shape.allowed.map((parameter) => ({
        name: parameter,
        value: `{{DLV | Estancias | ${parameter}}}`,
        required: shape.required.includes(parameter),
      })),
      allowedValues: shape.values,
      allowedCombinations: shape.combinations ?? [],
    };
  });

  return {
    dossierVersion: '1.0.0',
    contractVersion: contract.version,
    generatedFrom: 'packages/config/src/analytics-contract.json',
    authorization: {
      status: 'not_authorized',
      externalApprovalRequired: true,
      mutatesGtm: false,
      activatesRuntime: false,
      deploysProduction: false,
      networkAccess: false,
      writesFiles: false,
    },
    scope: {
      containerId: contract.containerId,
      targetHostname: TARGET_HOSTNAME,
      excludedHostname: EXCLUDED_HOSTNAME,
      namespace: 'Estancias |',
      providerEvents,
      localOnlyDemoEvents: [...contract.surfaces.demo],
    },
    configuration: {
      ga4ConfigurationReference: null,
      ga4ConfigurationStatus: 'required_external_input',
      dataLayerVariables: [...new Set(providerEvents.flatMap(({ parameters }) => parameters.map(({ name }) => name)))].sort().map((parameter) => ({
        name: `DLV | Estancias | ${parameter}`,
        dataLayerVersion: 2,
        key: parameter,
      })),
      consent: {
        applicationGate: 'explicit_analytics_consent',
        tagGate: 'analytics_storage_granted',
        defaultBeforeChoice: 'denied',
        revokeStopsFutureEvents: true,
      },
      runtimeGates: {
        DEMO_MODE: 'false',
        REAL_OPERATIONS_ENABLED: 'true',
        ANALYTICS_PROVIDER_MODE: 'gtm',
      },
      forbiddenParameters: ['page_location', 'page_referrer', 'page_title', 'user_id', 'session_id', 'email', 'phone', 'name', 'free_text'],
    },
    activation: {
      owner: null,
      approver: null,
      plannedAt: null,
      baselineCutoffDate: null,
      status: 'required_external_input',
      rule: 'Do not mix observations before and after the recorded cutoff date.',
      steps: [
        'Record owner, approver, GA4 configuration reference and baseline cutoff date.',
        'Create only the Estancias-prefixed variables, triggers and tags listed in this dossier.',
        'Preview on the target hostname and prove every tag is blocked on the excluded hostname.',
        'Verify denied, accepted and revoked consent before publishing.',
        'Publish only with explicit rollout approval and record the GTM container version.',
      ],
    },
    verification: {
      beforePublish: [
        'Contract validation passes with no missing or extra provider event.',
        'Camp preview produces zero Estancias tag fires.',
        'No provider request occurs before explicit analytics consent.',
        'Local demo events produce zero provider tags.',
        'Payloads contain only event-specific allowlisted parameters.',
      ],
      afterPublish: [
        'Capability manifest reports analytics live only under all runtime gates.',
        'One canonical event reaches DebugView with its exact allowlisted shape.',
        'Revoking consent prevents every subsequent event.',
        'Camp behavior and existing tags are unchanged.',
        'The first aggregate period starts on or after baselineCutoffDate.',
      ],
    },
    rollback: {
      trigger: 'Any Camp regression, consent leak, unexpected parameter, duplicate event or runtime mismatch.',
      steps: [
        'Restore the previously recorded GTM container version.',
        'Set ANALYTICS_PROVIDER_MODE=disabled if the fault is not isolated to GTM configuration.',
        'Verify zero provider requests with denied and revoked consent.',
        'Record the incident window and exclude it from baseline analysis.',
      ],
    },
  };
}

export function validateDossier(dossier, contract = analyticsContract) {
  assert(dossier.contractVersion === CONTRACT_VERSION && contract.version === CONTRACT_VERSION, 'La versión del expediente diverge del contrato.');
  assert(dossier.authorization?.status === 'not_authorized', 'El expediente no puede autorizar la activación.');
  assert(dossier.authorization?.externalApprovalRequired === true, 'Debe constar la aprobación externa obligatoria.');
  for (const key of ['mutatesGtm', 'activatesRuntime', 'deploysProduction', 'networkAccess', 'writesFiles']) assert(dossier.authorization?.[key] === false, `${key} debe permanecer false.`);
  assert(dossier.scope?.containerId === contract.containerId, 'El contenedor no coincide con el contrato.');
  assert(dossier.scope?.targetHostname === TARGET_HOSTNAME, 'El hostname objetivo no es exacto.');
  assert(dossier.scope?.excludedHostname === EXCLUDED_HOSTNAME && TARGET_HOSTNAME !== EXCLUDED_HOSTNAME, 'El aislamiento de Camp no es válido.');
  assert(dossier.scope?.namespace === 'Estancias |', 'El namespace no es exacto.');

  const expectedEvents = contract.surfaces.site;
  const mappings = dossier.scope?.providerEvents;
  assert(Array.isArray(mappings) && mappings.length === expectedEvents.length, 'La cobertura de eventos de sitio no es exacta.');
  assert(new Set(mappings.map(({ event }) => event)).size === mappings.length, 'Hay eventos duplicados.');
  assert(equalSets(mappings.map(({ event }) => event), expectedEvents), 'Faltan o sobran eventos de proveedor.');
  assert(equalArrays(dossier.scope?.localOnlyDemoEvents, contract.surfaces.demo), 'Los eventos locales de demo divergen del contrato.');
  assert(!contract.surfaces.demo.some((event) => expectedEvents.includes(event)), 'Un evento local de demo no puede ser evento de proveedor.');
  assert(equalSets([...contract.surfaces.site, ...contract.surfaces.demo], contract.events), 'Las superficies no cubren exactamente los eventos del contrato.');

  for (const mapping of mappings) {
    const shape = contract.eventShapes[mapping.event];
    assert(shape, `Falta forma para ${mapping.event}.`);
    assert(mapping.tag === `Estancias | GA4 Event | ${mapping.event}`, `Etiqueta inválida para ${mapping.event}.`);
    assert(mapping.trigger?.name.startsWith('Estancias |') && mapping.trigger?.eventEquals === mapping.event, `Activador inválido para ${mapping.event}.`);
    assert(mapping.trigger?.pageHostnameEquals === TARGET_HOSTNAME, `El activador ${mapping.event} no aísla el hostname.`);
    assert(equalArrays(mapping.parameters.map(({ name }) => name), shape.allowed), `Parámetros divergentes en ${mapping.event}.`);
    for (const parameter of mapping.parameters) {
      assert(parameter.value === `{{DLV | Estancias | ${parameter.name}}}`, `Variable incorrecta en ${mapping.event}.${parameter.name}.`);
      assert(parameter.required === shape.required.includes(parameter.name), `Obligatoriedad incorrecta en ${mapping.event}.${parameter.name}.`);
    }
    assert(JSON.stringify(mapping.allowedValues) === JSON.stringify(shape.values), `Valores divergentes en ${mapping.event}.`);
    assert(JSON.stringify(mapping.allowedCombinations) === JSON.stringify(shape.combinations ?? []), `Combinaciones divergentes en ${mapping.event}.`);
  }

  assert(dossier.configuration?.consent?.applicationGate === 'explicit_analytics_consent', 'Falta la puerta de consentimiento de aplicación.');
  assert(dossier.configuration?.consent?.tagGate === 'analytics_storage_granted', 'Falta la puerta de consentimiento de etiqueta.');
  assert(dossier.configuration?.consent?.defaultBeforeChoice === 'denied' && dossier.configuration?.consent?.revokeStopsFutureEvents === true, 'El consentimiento no falla cerrado.');
  assert(JSON.stringify(dossier.configuration?.runtimeGates) === JSON.stringify({ DEMO_MODE: 'false', REAL_OPERATIONS_ENABLED: 'true', ANALYTICS_PROVIDER_MODE: 'gtm' }), 'Las puertas de runtime no son exactas.');
  const expectedVariables = [...new Set(mappings.flatMap(({ parameters }) => parameters.map(({ name }) => name)))].sort();
  assert(equalArrays(dossier.configuration?.dataLayerVariables?.map(({ key }) => key), expectedVariables), 'Las variables de dataLayer no cubren exactamente los parámetros.');
  for (const variable of dossier.configuration.dataLayerVariables) {
    assert(variable.name === `DLV | Estancias | ${variable.key}` && variable.dataLayerVersion === 2, `Variable dataLayer inválida para ${variable.key}.`);
  }
  assert(dossier.configuration?.ga4ConfigurationReference === null && dossier.configuration?.ga4ConfigurationStatus === 'required_external_input', 'No se puede inventar una referencia GA4.');
  assert(dossier.activation?.owner === null && dossier.activation?.approver === null && dossier.activation?.plannedAt === null, 'Responsable, aprobador y fecha deben quedar pendientes.');
  assert(dossier.activation?.baselineCutoffDate === null && dossier.activation?.status === 'required_external_input', 'La fecha de corte debe quedar pendiente de actividad humana.');
  assert(Array.isArray(dossier.verification?.beforePublish) && dossier.verification.beforePublish.length >= 5, 'Falta verificación previa.');
  assert(Array.isArray(dossier.verification?.afterPublish) && dossier.verification.afterPublish.length >= 5, 'Falta verificación posterior.');
  assert(Array.isArray(dossier.rollback?.steps) && dossier.rollback.steps.length >= 4, 'Falta rollback verificable.');

  const serialized = JSON.stringify(dossier);
  for (const forbidden of dossier.configuration.forbiddenParameters) assert(!mappings.some(({ parameters }) => parameters.some(({ name }) => name === forbidden)), `Se ha mapeado el parámetro prohibido ${forbidden}.`);
  assert(!/https?:\/\//i.test(serialized), 'El expediente no debe contener endpoints.');
  return { ok: true, contractVersion: CONTRACT_VERSION, providerEvents: mappings.length, localOnlyDemoEvents: dossier.scope.localOnlyDemoEvents.length };
}

export function renderMarkdown(dossier) {
  const lines = [
    '# Logic2B Estancias · Expediente offline de activación GTM',
    '',
    `Contrato: \`${dossier.contractVersion}\`  `,
    `Contenedor compartido: \`${dossier.scope.containerId}\`  `,
    `Estado: \`${dossier.authorization.status}\` — este artefacto no autoriza, conecta, publica ni despliega.`,
    '',
    '## Aislamiento y puertas',
    '',
    `- Hostname objetivo exacto: \`${dossier.scope.targetHostname}\`.`,
    `- Hostname que debe producir cero disparos: \`${dossier.scope.excludedHostname}\`.`,
    '- Consentimiento: denegado por defecto, aplicación y etiqueta deben comprobarlo, y la revocación detiene eventos posteriores.',
    `- Runtime: \`${Object.entries(dossier.configuration.runtimeGates).map(([key, value]) => `${key}=${value}`).join('`, `')}\`.`,
    '- Referencia de configuración GA4, responsable, aprobador, fecha y versión publicada: entradas externas obligatorias; no se inventan.',
    '',
    '## Mapeo exacto de eventos de proveedor',
    '',
    '| Evento | Etiqueta | Activador | Parámetros |',
    '| --- | --- | --- | --- |',
    ...dossier.scope.providerEvents.map(({ event, tag, trigger, parameters }) => `| \`${event}\` | ${escapeCell(tag)} | ${escapeCell(trigger.name)} | ${parameters.map(({ name, required }) => `\`${name}\`${required ? ' *' : ''}`).join(', ')} |`),
    '',
    '* Parámetro obligatorio según el contrato. Cada activador exige además el hostname objetivo exacto.',
    '',
    '## Eventos locales de demo — no configurar en GTM',
    '',
    dossier.scope.localOnlyDemoEvents.map((event) => `\`${event}\``).join(', '),
    '',
    '## Secuencia de activación humana',
    '',
    ...dossier.activation.steps.map((step, index) => `${index + 1}. ${step}`),
    '',
    'Fecha de corte de línea base: **pendiente**. Nunca mezclar periodos anteriores y posteriores sin segmentar por esa fecha.',
    '',
    '## Verificación previa',
    '',
    ...dossier.verification.beforePublish.map((item) => `- ${item}`),
    '',
    '## Verificación posterior',
    '',
    ...dossier.verification.afterPublish.map((item) => `- ${item}`),
    '',
    '## Rollback',
    '',
    `Disparador: ${dossier.rollback.trigger}`,
    '',
    ...dossier.rollback.steps.map((step, index) => `${index + 1}. ${step}`),
  ];
  return `${lines.join('\n')}\n`;
}

export async function runDossier(args) {
  try {
    const options = parseArguments(args);
    if (options.help) return success(usage());
    const dossier = buildDossier();
    const result = validateDossier(dossier);
    if (options.validate) return success(JSON.stringify(result, null, 2));
    return success(options.format === 'json' ? JSON.stringify(dossier, null, 2) : renderMarkdown(dossier));
  } catch (error) {
    return { exitCode: 1, stream: 'stderr', output: error instanceof Error ? error.message : 'Error desconocido.' };
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function equalArrays(left, right) {
  return Array.isArray(left) && Array.isArray(right) && left.length === right.length && left.every((value, index) => value === right[index]);
}

function equalSets(left, right) {
  return Array.isArray(left) && Array.isArray(right) && left.length === right.length && left.every((value) => right.includes(value));
}

function escapeCell(value) {
  return value.replaceAll('|', '\\|');
}

function success(output) {
  return { exitCode: 0, stream: 'stdout', output };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = await runDossier(process.argv.slice(2));
  process[result.stream].write(`${result.output}${result.output.endsWith('\n') ? '' : '\n'}`);
  process.exitCode = result.exitCode;
}
