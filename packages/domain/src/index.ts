export type Vertical = 'apartment' | 'rural' | 'hotel';
export type BusinessMode = 'mono' | 'multi';
export type PlanLevel = 'basico' | 'gestion' | 'inteligente';
export type LegacyPlanLevel = 'inicio' | 'automatiza';
export type DemoRole = 'direction' | 'reception' | 'cleaning';
export const CAPABILITY_STATUSES = [
  'demo_visual_disponible',
  'demo_visual_pendiente',
  'solo_interna',
  'activable_por_proyecto',
  'en_ruta',
] as const;
export type CapabilityStatus = (typeof CAPABILITY_STATUSES)[number];
export type CapabilityCategory = 'web' | 'reservations' | 'operations' | 'team' | 'revenue' | 'channels' | 'automation' | 'ai';
export type EvidenceView = 'home' | 'enquiries' | 'planning' | 'bookings' | 'guests' | 'cleaning' | 'maintenance' | 'website' | 'channels' | 'automations' | 'automation' | 'control' | 'reports';

export const DEMO_PLANS = {
  nivora: 'basico',
  terrava: 'gestion',
  aurem: 'inteligente',
} as const satisfies Record<string, PlanLevel>;

export type DemoSlug = keyof typeof DEMO_PLANS;

interface CapabilityEvidenceCopy {
  proof: { es: string; en: string };
  boundary: { es: string; en: string };
}

export type CapabilityEvidence = CapabilityEvidenceCopy & (
  | { surface: 'demo-site'; demo: DemoSlug; anchor: 'espacio' | 'reserva'; view?: never }
  | { surface: 'workspace'; demo: DemoSlug; view: EvidenceView; anchor?: never }
  | { surface: 'none'; demo?: never; view?: never; anchor?: never }
);

export interface Capability {
  id: string;
  category: CapabilityCategory;
  minimumPlan: PlanLevel;
  status: CapabilityStatus;
  evidence: CapabilityEvidence;
  label: { es: string; en: string };
  description: { es: string; en: string };
}

export type ChannelReadinessCandidateId =
  | 'ota-distribution'
  | 'stay-marketplace'
  | 'hotel-distribution'
  | 'ical-feed';

export type ChannelReadinessField =
  | 'owner'
  | 'permissions'
  | 'credentialReference'
  | 'mapping'
  | 'sandboxCases'
  | 'idempotency'
  | 'reconciliation'
  | 'failureRecovery'
  | 'audit'
  | 'acceptance'
  | 'killSwitch'
  | 'rollback';

type LocalizedText = { es: string; en: string };

export interface ChannelReadinessContract {
  id: ChannelReadinessCandidateId;
  label: LocalizedText;
  status: LocalizedText;
  detail: LocalizedText;
  coverage: {
    availability: LocalizedText;
    rates: LocalizedText;
    bookings: LocalizedText;
    messages: LocalizedText;
  };
  connectionState: 'not_connected';
  readinessState: 'not_validated';
  requirements: Record<ChannelReadinessField, LocalizedText>;
}

export const CHANNEL_READINESS_FIELDS = [
  'owner',
  'permissions',
  'credentialReference',
  'mapping',
  'sandboxCases',
  'idempotency',
  'reconciliation',
  'failureRecovery',
  'audit',
  'acceptance',
  'killSwitch',
  'rollback',
] as const satisfies readonly ChannelReadinessField[];

export const CHANNEL_READINESS_CONTRACTS: readonly ChannelReadinessContract[] = [
  {
    id: 'ota-distribution',
    label: { es: 'Distribución OTA', en: 'OTA distribution' },
    status: { es: 'Categoría por validar', en: 'Category to validate' },
    detail: { es: 'Categoría genérica para disponibilidad y tarifas. No representa un acuerdo, una cuenta o un proveedor seleccionado.', en: 'Generic category for availability and rates. It represents no agreement, account or selected provider.' },
    coverage: {
      availability: { es: 'Escenario', en: 'Scenario' },
      rates: { es: 'Escenario', en: 'Scenario' },
      bookings: { es: 'Sin entrada', en: 'No intake' },
      messages: { es: 'Fuera de demo', en: 'Out of demo' },
    },
    connectionState: 'not_connected',
    readinessState: 'not_validated',
    requirements: {
      owner: { es: 'Dirección acepta el alcance y una persona técnica mantiene el conector.', en: 'Direction accepts scope and a technical owner maintains the connector.' },
      permissions: { es: 'Lectura y publicación se separan con mínimo privilegio y aprobación humana.', en: 'Read and publish access are separated with least privilege and human approval.' },
      credentialReference: { es: 'Referencia externa por definir; esta demo contiene cero valores o secretos.', en: 'External reference to be defined; this demo contains zero values or secrets.' },
      mapping: { es: 'Alojamiento, unidades, ocupación, tarifas, impuestos y restricciones.', en: 'Property, units, occupancy, rates, tax and restrictions.' },
      sandboxCases: { es: 'Alta, cambio, cierre de venta, cancelación y rechazo en entorno aislado.', en: 'Create, change, stop-sell, cancel and reject in an isolated environment.' },
      idempotency: { es: 'Cada cambio necesita clave estable y repetición sin efectos duplicados.', en: 'Every change needs a stable key and replay without duplicate effects.' },
      reconciliation: { es: 'Comparación periódica entre fuente de verdad y canal, con diferencias visibles.', en: 'Periodic comparison between source of truth and channel, with visible differences.' },
      failureRecovery: { es: 'Timeout, reintento acotado, cola detenible y recuperación manual documentada.', en: 'Timeout, bounded retry, stoppable queue and documented manual recovery.' },
      audit: { es: 'Actor, motivo, entrada, resultado y correlación sin datos sensibles en logs.', en: 'Actor, reason, input, result and correlation without sensitive data in logs.' },
      acceptance: { es: 'Casos críticos aprobados por Dirección antes de una ventana de cambio.', en: 'Critical cases approved by Direction before a change window.' },
      killSwitch: { es: 'Interruptor independiente que bloquea nuevas publicaciones sin borrar evidencia.', en: 'Independent switch that blocks new publications without deleting evidence.' },
      rollback: { es: 'Procedimiento para restaurar configuración y reconciliar cambios parciales.', en: 'Procedure to restore configuration and reconcile partial changes.' },
    },
  },
  {
    id: 'stay-marketplace',
    label: { es: 'Marketplace de estancias', en: 'Stay marketplace' },
    status: { es: 'Categoría por validar', en: 'Category to validate' },
    detail: { es: 'Categoría genérica para un anuncio con reglas propias. No presupone OAuth, acceso o relación comercial.', en: 'Generic category for a listing with its own rules. It assumes no OAuth, access or commercial relationship.' },
    coverage: {
      availability: { es: 'Escenario', en: 'Scenario' },
      rates: { es: 'Escenario', en: 'Scenario' },
      bookings: { es: 'Sin entrada', en: 'No intake' },
      messages: { es: 'Fuera de demo', en: 'Out of demo' },
    },
    connectionState: 'not_connected',
    readinessState: 'not_validated',
    requirements: {
      owner: { es: 'Dirección controla el anuncio y una persona técnica responde del adaptador.', en: 'Direction controls the listing and a technical owner is accountable for the adapter.' },
      permissions: { es: 'Autorización limitada al anuncio acordado y publicación siempre supervisada.', en: 'Authorisation limited to the agreed listing and publishing always supervised.' },
      credentialReference: { es: 'Referencia OAuth por definir fuera del cliente; esta demo no inicia autorización.', en: 'OAuth reference to be defined outside the client; this demo starts no authorisation.' },
      mapping: { es: 'Anuncio, unidades, calendario, reglas de estancia, tasas y disponibilidad.', en: 'Listing, units, calendar, stay rules, fees and availability.' },
      sandboxCases: { es: 'Alta, modificación, bloqueo, cancelación y webhook inválido en cuenta aislada.', en: 'Create, modify, block, cancel and invalid webhook in an isolated account.' },
      idempotency: { es: 'Eventos repetidos no pueden duplicar bloqueos, reservas o actualizaciones.', en: 'Repeated events cannot duplicate blocks, bookings or updates.' },
      reconciliation: { es: 'Calendario y reservas se contrastan con una fuente de verdad acordada.', en: 'Calendar and bookings are checked against an agreed source of truth.' },
      failureRecovery: { es: 'Firma inválida, cuota, timeout y revocación deben parar y escalar sin publicar.', en: 'Invalid signature, quota, timeout and revocation must stop and escalate without publishing.' },
      audit: { es: 'Autorizaciones y cambios quedan correlacionados sin registrar tokens ni mensajes.', en: 'Authorisations and changes are correlated without logging tokens or messages.' },
      acceptance: { es: 'Dirección valida reglas, disponibilidad y cancelaciones antes de activar.', en: 'Direction validates rules, availability and cancellations before activation.' },
      killSwitch: { es: 'Revocación de publicación y recepción por separado, comprobable al instante.', en: 'Separate revocation for publishing and intake, verifiable immediately.' },
      rollback: { es: 'Restaurar el último mapeo aceptado y resolver eventos recibidos durante el corte.', en: 'Restore the last accepted mapping and resolve events received during the cutover.' },
    },
  },
  {
    id: 'hotel-distribution',
    label: { es: 'Distribución hotelera', en: 'Hotel distribution' },
    status: { es: 'Diferencia ficticia por revisar', en: 'Fictitious difference to review' },
    detail: { es: 'El fixture señala una diferencia de tarifa para revisar el contrato; no existe destino al que publicarla.', en: 'The fixture flags a rate difference for contract review; there is no destination to publish it to.' },
    coverage: {
      availability: { es: 'Escenario', en: 'Scenario' },
      rates: { es: 'Por revisar', en: 'Review' },
      bookings: { es: 'Sin entrada', en: 'No intake' },
      messages: { es: 'Fuera de demo', en: 'Out of demo' },
    },
    connectionState: 'not_connected',
    readinessState: 'not_validated',
    requirements: {
      owner: { es: 'Revenue acepta reglas y Dirección nombra responsable técnico y operativo.', en: 'Revenue accepts rules and Direction names technical and operational owners.' },
      permissions: { es: 'Inventario y tarifas requieren permisos separados y doble revisión para publicar.', en: 'Inventory and rates require separate permissions and dual review to publish.' },
      credentialReference: { es: 'Referencia contractual por definir en un almacén de secretos; cero valores aquí.', en: 'Contractual reference to be defined in a secret store; zero values here.' },
      mapping: { es: 'Hotel, tipos de habitación, planes de tarifa, ocupación, impuestos y restricciones.', en: 'Hotel, room types, rate plans, occupancy, tax and restrictions.' },
      sandboxCases: { es: 'Inventario, tarifa, cierre, reserva, modificación, cancelación y fallo parcial.', en: 'Inventory, rate, stop-sell, booking, change, cancel and partial failure.' },
      idempotency: { es: 'Publicaciones y entradas repetidas mantienen una única versión operativa.', en: 'Repeated publications and intake retain a single operational version.' },
      reconciliation: { es: 'Inventario, tarifa y reserva se cuadran por ventana y diferencia explicable.', en: 'Inventory, rate and booking reconcile by window and explainable difference.' },
      failureRecovery: { es: 'Reintentos con límite, circuito abierto, alerta y procedimiento de operación manual.', en: 'Bounded retries, open circuit, alert and manual operation procedure.' },
      audit: { es: 'Cada publicación conserva versión, aprobador, correlación y respuesta saneada.', en: 'Every publication retains version, approver, correlation and sanitised response.' },
      acceptance: { es: 'Revenue y Dirección aprueban paridad, fallos y reversión en sandbox.', en: 'Revenue and Direction approve parity, failures and rollback in sandbox.' },
      killSwitch: { es: 'Corte inmediato por hotel, tipo de habitación y operación de escritura.', en: 'Immediate cut-off by hotel, room type and write operation.' },
      rollback: { es: 'Volver a la última versión aceptada y conciliar reservas durante la incidencia.', en: 'Return to the last accepted version and reconcile bookings during the incident.' },
    },
  },
  {
    id: 'ical-feed',
    label: { es: 'Calendario iCal', en: 'iCal calendar' },
    status: { es: 'Lectura ficticia', en: 'Fictitious read' },
    detail: { es: 'Un feed real requeriría URL protegida, frecuencia, zona horaria, deduplicación y gestión de errores.', en: 'A live feed would require a protected URL, frequency, timezone, deduplication and error handling.' },
    coverage: {
      availability: { es: 'Lectura demo', en: 'Demo read' },
      rates: { es: 'No compatible', en: 'Unsupported' },
      bookings: { es: 'Sin entrada', en: 'No intake' },
      messages: { es: 'Fuera de demo', en: 'Out of demo' },
    },
    connectionState: 'not_connected',
    readinessState: 'not_validated',
    requirements: {
      owner: { es: 'Dirección identifica la fuente y una persona técnica controla su lectura.', en: 'Direction identifies the source and a technical owner controls its intake.' },
      permissions: { es: 'Solo lectura, URL individual y acceso revocable sin exponerla al navegador.', en: 'Read-only, individual URL and revocable access without exposing it to the browser.' },
      credentialReference: { es: 'Referencia de URL por definir fuera del cliente; la demo no contiene feeds.', en: 'URL reference to be defined outside the client; the demo contains no feeds.' },
      mapping: { es: 'Calendario, unidad, zona horaria, inicio, fin, estado y origen.', en: 'Calendar, unit, timezone, start, end, status and source.' },
      sandboxCases: { es: 'Evento nuevo, cambio, cancelación, duplicado, feed vacío y formato inválido.', en: 'New event, change, cancellation, duplicate, empty feed and invalid format.' },
      idempotency: { es: 'El mismo UID y versión no crean bloqueos repetidos.', en: 'The same UID and version create no repeated blocks.' },
      reconciliation: { es: 'Eventos importados se comparan con el feed y la fuente operativa acordada.', en: 'Imported events are compared with the feed and agreed operational source.' },
      failureRecovery: { es: 'Timeout, feed caído o formato inválido conservan el último estado y alertan.', en: 'Timeout, unavailable feed or invalid format retain the last state and alert.' },
      audit: { es: 'Lecturas, diferencias y descartes se registran sin guardar la URL completa.', en: 'Reads, differences and discards are logged without storing the full URL.' },
      acceptance: { es: 'Dirección valida zona horaria, duplicados y recuperación antes de usarlo.', en: 'Direction validates timezone, duplicates and recovery before use.' },
      killSwitch: { es: 'Pausa inmediata de nuevas lecturas por feed o unidad.', en: 'Immediate pause of new reads by feed or unit.' },
      rollback: { es: 'Retirar los cambios importados del lote afectado y restaurar el fixture aceptado.', en: 'Remove imported changes from the affected batch and restore the accepted fixture.' },
    },
  },
] as const;

export type WebsitePublicationReadinessField =
  | 'owner'
  | 'permissions'
  | 'repositoryReference'
  | 'version'
  | 'isolatedPreview'
  | 'contentValidation'
  | 'failureCases'
  | 'audit'
  | 'acceptance'
  | 'changeWindow'
  | 'killSwitch'
  | 'rollback';

export const WEBSITE_PUBLICATION_READINESS_FIELDS = [
  'owner',
  'permissions',
  'repositoryReference',
  'version',
  'isolatedPreview',
  'contentValidation',
  'failureCases',
  'audit',
  'acceptance',
  'changeWindow',
  'killSwitch',
  'rollback',
] as const satisfies readonly WebsitePublicationReadinessField[];

export const WEBSITE_PUBLICATION_READINESS = {
  demo: 'terrava',
  minimumPlan: 'gestion',
  readinessState: 'not_validated',
  requirements: {
    owner: {
      es: 'Dirección acepta el cambio y una persona técnica responde del proceso de publicación.',
      en: 'Direction accepts the change and a technical owner is accountable for the publication process.',
    },
    permissions: {
      es: 'Edición, aprobación y publicación usan permisos separados y revocables con mínimo privilegio.',
      en: 'Editing, approval and publishing use separate, revocable permissions with least privilege.',
    },
    repositoryReference: {
      es: 'Referencia opaca de repositorio y entorno por definir fuera del navegador; sin URL, cuenta o secreto en la demo.',
      en: 'Opaque repository and environment reference to be defined outside the browser; no URL, account or secret in the demo.',
    },
    version: {
      es: 'Cada candidato debe fijar una rama o versión inmutable y el contenido exacto que contiene.',
      en: 'Every candidate must pin an immutable branch or version and the exact content it contains.',
    },
    isolatedPreview: {
      es: 'La revisión necesita una preview aislada, privada y distinta del dominio de producción.',
      en: 'Review needs an isolated, private preview that is separate from the production domain.',
    },
    contentValidation: {
      es: 'Enlaces, imágenes, idiomas, formularios, metadata, accesibilidad y límites comerciales deben pasar antes de publicar.',
      en: 'Links, images, languages, forms, metadata, accessibility and commercial boundaries must pass before publishing.',
    },
    failureCases: {
      es: 'Build fallido, preview inaccesible, asset ausente, enlace roto y publicación parcial necesitan casos reproducibles.',
      en: 'Failed build, inaccessible preview, missing asset, broken link and partial publication need reproducible cases.',
    },
    audit: {
      es: 'Versión, solicitante, aprobador, pruebas y resultado deben quedar registrados sin tokens ni contenido personal.',
      en: 'Version, requester, approver, tests and outcome must be recorded without tokens or personal content.',
    },
    acceptance: {
      es: 'Dirección acepta la preview exacta y el resultado de pruebas antes de autorizar una publicación.',
      en: 'Direction accepts the exact preview and test outcome before authorising a publication.',
    },
    changeWindow: {
      es: 'La ventana define responsable, observación, criterio de parada y comunicación de incidencia.',
      en: 'The window defines owner, observation, stop criteria and incident communication.',
    },
    killSwitch: {
      es: 'Un control independiente debe impedir nuevos despliegues sin borrar versiones o evidencia.',
      en: 'An independent control must prevent new deployments without deleting versions or evidence.',
    },
    rollback: {
      es: 'La última versión aceptada debe poder restaurarse y verificarse antes de cerrar la ventana.',
      en: 'The last accepted version must be restorable and verifiable before closing the window.',
    },
  },
} as const satisfies {
  demo: 'terrava';
  minimumPlan: 'gestion';
  readinessState: 'not_validated';
  requirements: Record<WebsitePublicationReadinessField, LocalizedText>;
};

export type EmailDeliveryReadinessField =
  | 'owner'
  | 'lawfulBasis'
  | 'permissions'
  | 'providerCategory'
  | 'configurationReference'
  | 'templates'
  | 'routing'
  | 'idempotency'
  | 'failureRecovery'
  | 'audit'
  | 'acceptance'
  | 'killSwitch'
  | 'rollback';

export const EMAIL_DELIVERY_READINESS_FIELDS = [
  'owner',
  'lawfulBasis',
  'permissions',
  'providerCategory',
  'configurationReference',
  'templates',
  'routing',
  'idempotency',
  'failureRecovery',
  'audit',
  'acceptance',
  'killSwitch',
  'rollback',
] as const satisfies readonly EmailDeliveryReadinessField[];

export const EMAIL_DELIVERY_READINESS = {
  demo: 'nivora',
  minimumPlan: 'basico',
  readinessState: 'not_validated',
  labels: {
    owner: { es: 'Responsable', en: 'Owner' },
    lawfulBasis: { es: 'Base jurídica y finalidad', en: 'Lawful basis and purpose' },
    permissions: { es: 'Permisos', en: 'Permissions' },
    providerCategory: { es: 'Categoría de proveedor', en: 'Provider category' },
    configurationReference: { es: 'Referencia de configuración', en: 'Configuration reference' },
    templates: { es: 'Plantillas', en: 'Templates' },
    routing: { es: 'Enrutado', en: 'Routing' },
    idempotency: { es: 'Idempotencia', en: 'Idempotency' },
    failureRecovery: { es: 'Fallos y reintentos', en: 'Failures and retries' },
    audit: { es: 'Auditoría', en: 'Audit' },
    acceptance: { es: 'Aceptación', en: 'Acceptance' },
    killSwitch: { es: 'Kill switch', en: 'Kill switch' },
    rollback: { es: 'Reversión', en: 'Rollback' },
  },
  requirements: {
    owner: {
      es: 'Dirección acepta el alcance y una persona responsable responde de contenido, entrega e incidencias.',
      en: 'Direction accepts scope and an accountable owner is responsible for content, delivery and incidents.',
    },
    lawfulBasis: {
      es: 'Finalidad, base jurídica o consentimiento aplicable, datos mínimos y conservación se acuerdan antes de recoger información.',
      en: 'Purpose, applicable lawful basis or consent, minimum data and retention are agreed before collecting information.',
    },
    permissions: {
      es: 'Plantillas, configuración, envío y auditoría usan accesos separados, revocables y de mínimo privilegio.',
      en: 'Templates, configuration, delivery and audit use separate, revocable least-privilege access.',
    },
    providerCategory: {
      es: 'La categoría de email transaccional debe validarse por proyecto; no hay marca, cuenta o proveedor seleccionado.',
      en: 'The transactional email category must be validated per project; no brand, account or provider is selected.',
    },
    configurationReference: {
      es: 'Referencia opaca por definir fuera del navegador; la demo contiene cero claves, dominios, cuentas, direcciones reales o secretos.',
      en: 'Opaque reference to be defined outside the browser; the demo contains zero keys, domains, accounts, live addresses or secrets.',
    },
    templates: {
      es: 'Asunto, cuerpo, idiomas, identidad remitente, límites y textos legales necesitan versión y revisión humana.',
      en: 'Subject, body, languages, sender identity, boundaries and legal copy need versioning and human review.',
    },
    routing: {
      es: 'Origen, destino, respuesta y escalado se verifican con rutas de prueba; aquí solo aparecen direcciones reservadas `.example`.',
      en: 'Origin, destination, reply and escalation are verified with test routes; only reserved `.example` addresses appear here.',
    },
    idempotency: {
      es: 'Una referencia estable debe representar una única entrega lógica y permitir reintentos sin duplicados.',
      en: 'A stable reference must represent one logical delivery and allow retries without duplicates.',
    },
    failureRecovery: {
      es: 'Timeout, rechazo, cuota, degradación y resultado incierto requieren límites, reintentos acotados y recuperación manual.',
      en: 'Timeout, rejection, quota, degradation and uncertain outcome require limits, bounded retries and manual recovery.',
    },
    audit: {
      es: 'Referencia, versión de plantilla, actor, resultado y correlación se registran sin PII, mensaje, dirección, clave o secreto.',
      en: 'Reference, template version, actor, outcome and correlation are recorded without PII, message, address, key or secret.',
    },
    acceptance: {
      es: 'Dirección acepta contenido, idiomas, rutas de prueba, fallos y evidencia de recepción antes de autorizar entregas.',
      en: 'Direction accepts content, languages, test routes, failures and receipt evidence before authorising delivery.',
    },
    killSwitch: {
      es: 'Un control independiente bloquea nuevas entregas de producto sin afectar la captación comercial separada.',
      en: 'An independent control blocks new product deliveries without affecting the separate commercial lead intake.',
    },
    rollback: {
      es: 'La última plantilla y configuración aceptadas deben poder restaurarse y los resultados inciertos reconciliarse.',
      en: 'The last accepted template and configuration must be restorable and uncertain outcomes reconciled.',
    },
  },
} as const satisfies {
  demo: 'nivora';
  minimumPlan: 'basico';
  readinessState: 'not_validated';
  labels: Record<EmailDeliveryReadinessField, LocalizedText>;
  requirements: Record<EmailDeliveryReadinessField, LocalizedText>;
};

export type PaymentReadinessField =
  | 'ownerScope'
  | 'permissions'
  | 'providerCategory'
  | 'configurationReference'
  | 'testEnvironment'
  | 'currenciesAmounts'
  | 'paymentLifecycle'
  | 'idempotency'
  | 'webhooks'
  | 'reconciliation'
  | 'failureRecovery'
  | 'audit'
  | 'acceptance'
  | 'killSwitch'
  | 'rollback';

export const PAYMENT_READINESS_FIELDS = [
  'ownerScope',
  'permissions',
  'providerCategory',
  'configurationReference',
  'testEnvironment',
  'currenciesAmounts',
  'paymentLifecycle',
  'idempotency',
  'webhooks',
  'reconciliation',
  'failureRecovery',
  'audit',
  'acceptance',
  'killSwitch',
  'rollback',
] as const satisfies readonly PaymentReadinessField[];

export const PAYMENT_READINESS = {
  scopeState: 'separate_project_scope',
  readinessState: 'not_validated',
  executionState: 'unavailable',
  title: {
    es: 'Pagos: qué debe estar validado antes de cobrar',
    en: 'Payments: what must be validated before charging',
  },
  summary: {
    es: 'El cobro se define como un alcance separado. Este expediente explica las decisiones y pruebas necesarias; no representa un checkout ni un proveedor conectado.',
    en: 'Charging is scoped separately. This file explains the decisions and tests required; it represents neither a checkout nor a connected provider.',
  },
  labels: {
    ownerScope: { es: 'Responsable y alcance', en: 'Owner and scope' },
    permissions: { es: 'Permisos', en: 'Permissions' },
    providerCategory: { es: 'Categoría de proveedor', en: 'Provider category' },
    configurationReference: { es: 'Referencia de configuración', en: 'Configuration reference' },
    testEnvironment: { es: 'Entorno de prueba', en: 'Test environment' },
    currenciesAmounts: { es: 'Monedas e importes', en: 'Currencies and amounts' },
    paymentLifecycle: { es: 'Ciclo del pago', en: 'Payment lifecycle' },
    idempotency: { es: 'Idempotencia', en: 'Idempotency' },
    webhooks: { es: 'Eventos y webhooks', en: 'Events and webhooks' },
    reconciliation: { es: 'Conciliación', en: 'Reconciliation' },
    failureRecovery: { es: 'Fallos y recuperación', en: 'Failures and recovery' },
    audit: { es: 'Auditoría', en: 'Audit' },
    acceptance: { es: 'Aceptación', en: 'Acceptance' },
    killSwitch: { es: 'Kill switch', en: 'Kill switch' },
    rollback: { es: 'Reversión y compensación', en: 'Rollback and compensation' },
  },
  requirements: {
    ownerScope: {
      es: 'Dirección acepta cuándo se cobra, qué conceptos cubre y quién responde operativa y técnicamente de cada incidencia.',
      en: 'Direction accepts when charging occurs, what it covers and who is operationally and technically accountable for each incident.',
    },
    permissions: {
      es: 'Configuración, autorización, captura, devolución y conciliación usan permisos separados, revocables y de mínimo privilegio.',
      en: 'Configuration, authorisation, capture, refund and reconciliation use separate, revocable least-privilege access.',
    },
    providerCategory: {
      es: 'La categoría de servicio de pagos debe validarse por proyecto; no hay marca, cuenta o proveedor seleccionado.',
      en: 'The payment-service category must be validated per project; no brand, account or provider is selected.',
    },
    configurationReference: {
      es: 'Referencia opaca por definir fuera del navegador; la web contiene cero claves, cuentas de comercio, endpoints o secretos.',
      en: 'Opaque reference to be defined outside the browser; the website contains zero keys, merchant accounts, endpoints or secrets.',
    },
    testEnvironment: {
      es: 'Las pruebas requieren un entorno aislado, sin movimiento de dinero y con instrumentos de prueba; nunca se usan datos de tarjeta reales.',
      en: 'Tests require an isolated environment, no movement of money and test instruments; real card data is never used.',
    },
    currenciesAmounts: {
      es: 'Moneda, impuestos, tasas, redondeo e importes total, parcial y reembolsable necesitan reglas y ejemplos aceptados.',
      en: 'Currency, tax, fees, rounding and total, partial and refundable amounts need accepted rules and examples.',
    },
    paymentLifecycle: {
      es: 'Autorización, captura, rechazo, cancelación, devolución parcial o total y disputa se prueban como estados distintos.',
      en: 'Authorisation, capture, decline, cancellation, partial or full refund and dispute are tested as distinct states.',
    },
    idempotency: {
      es: 'Una referencia estable representa una sola intención y permite repetir llamadas sin duplicar autorizaciones, capturas o devoluciones.',
      en: 'A stable reference represents one intent and allows calls to be replayed without duplicating authorisations, captures or refunds.',
    },
    webhooks: {
      es: 'Firma, orden, repetición, retraso y evento desconocido se verifican en pruebas; aquí no existe webhook configurado.',
      en: 'Signature, order, replay, delay and unknown events are verified in tests; no webhook is configured here.',
    },
    reconciliation: {
      es: 'Intento, resultado, devolución, disputa y liquidación se contrastan con una fuente de verdad y diferencias explicables.',
      en: 'Intent, outcome, refund, dispute and settlement are checked against a source of truth with explainable differences.',
    },
    failureRecovery: {
      es: 'Timeout, rechazo, resultado incierto, cuota y fallo parcial requieren límites, reintentos seguros, escalado y recuperación manual.',
      en: 'Timeout, decline, uncertain outcome, quota and partial failure require limits, safe retries, escalation and manual recovery.',
    },
    audit: {
      es: 'Referencia, actor, versión, transición y resultado se registran sin número de tarjeta, código de seguridad, PII, clave o secreto.',
      en: 'Reference, actor, version, transition and outcome are recorded without card number, security code, PII, key or secret.',
    },
    acceptance: {
      es: 'Dirección y la persona responsable de cobros aceptan importes, rechazos, duplicados, devoluciones, conciliación y fallos antes de activar.',
      en: 'Direction and the payments owner accept amounts, declines, duplicates, refunds, reconciliation and failures before activation.',
    },
    killSwitch: {
      es: 'Un control independiente bloquea nuevas sesiones, autorizaciones y capturas sin borrar evidencia o impedir la conciliación.',
      en: 'An independent control blocks new sessions, authorisations and captures without deleting evidence or preventing reconciliation.',
    },
    rollback: {
      es: 'La configuración aceptada puede restaurarse; operaciones en curso o inciertas se concilian y compensan, nunca se revierten a ciegas.',
      en: 'Accepted configuration can be restored; in-flight or uncertain operations are reconciled and compensated, never blindly reversed.',
    },
  },
} as const satisfies {
  scopeState: 'separate_project_scope';
  readinessState: 'not_validated';
  executionState: 'unavailable';
  title: LocalizedText;
  summary: LocalizedText;
  labels: Record<PaymentReadinessField, LocalizedText>;
  requirements: Record<PaymentReadinessField, LocalizedText>;
};

export type DataSourceReadinessField =
  | 'ownerSource'
  | 'purposeMinimization'
  | 'permissions'
  | 'providerCategory'
  | 'configurationReference'
  | 'entitiesFields'
  | 'identifiersMatching'
  | 'baselineMigration'
  | 'isolatedCases'
  | 'idempotency'
  | 'reconciliation'
  | 'failureRecovery'
  | 'audit'
  | 'acceptance'
  | 'killSwitch'
  | 'rollback';

export const DATA_SOURCE_READINESS_FIELDS = [
  'ownerSource',
  'purposeMinimization',
  'permissions',
  'providerCategory',
  'configurationReference',
  'entitiesFields',
  'identifiersMatching',
  'baselineMigration',
  'isolatedCases',
  'idempotency',
  'reconciliation',
  'failureRecovery',
  'audit',
  'acceptance',
  'killSwitch',
  'rollback',
] as const satisfies readonly DataSourceReadinessField[];

export const DATA_SOURCE_READINESS = {
  scopeState: 'separate_project_scope',
  readinessState: 'not_validated',
  executionState: 'unavailable',
  title: {
    es: 'Datos y PMS: qué debe conservar la fuente de verdad',
    en: 'Data and PMS: what the source of truth must preserve',
  },
  summary: {
    es: 'Mantener, migrar o conectar una fuente se define por proyecto. Este expediente ordena decisiones y pruebas; no representa un PMS conectado ni una sincronización activa.',
    en: 'Keeping, migrating or connecting a source is scoped per project. This file organises decisions and tests; it represents neither a connected PMS nor live synchronisation.',
  },
  labels: {
    ownerSource: { es: 'Responsable y sistema fuente', en: 'Owner and source system' },
    purposeMinimization: { es: 'Finalidad y minimización', en: 'Purpose and minimisation' },
    permissions: { es: 'Permisos', en: 'Permissions' },
    providerCategory: { es: 'Categoría de proveedor', en: 'Provider category' },
    configurationReference: { es: 'Referencia de configuración', en: 'Configuration reference' },
    entitiesFields: { es: 'Entidades y campos', en: 'Entities and fields' },
    identifiersMatching: { es: 'Identificadores y matching', en: 'Identifiers and matching' },
    baselineMigration: { es: 'Baseline y migración', en: 'Baseline and migration' },
    isolatedCases: { es: 'Casos aislados', en: 'Isolated cases' },
    idempotency: { es: 'Idempotencia', en: 'Idempotency' },
    reconciliation: { es: 'Reconciliación', en: 'Reconciliation' },
    failureRecovery: { es: 'Fallos y recuperación', en: 'Failures and recovery' },
    audit: { es: 'Auditoría', en: 'Audit' },
    acceptance: { es: 'Aceptación', en: 'Acceptance' },
    killSwitch: { es: 'Kill switch', en: 'Kill switch' },
    rollback: { es: 'Reversión', en: 'Rollback' },
  },
  requirements: {
    ownerSource: {
      es: 'Dirección identifica la fuente de verdad y las personas responsables operativa, de datos y técnicamente de cada cambio.',
      en: 'Direction identifies the source of truth and the operational, data and technical owners accountable for every change.',
    },
    purposeMinimization: {
      es: 'Finalidad, base aplicable, campos mínimos, conservación y eliminación se acuerdan antes de acceder o mover datos.',
      en: 'Purpose, applicable basis, minimum fields, retention and deletion are agreed before data is accessed or moved.',
    },
    permissions: {
      es: 'Lectura, escritura, exportación y administración usan permisos separados, revocables y de mínimo privilegio.',
      en: 'Read, write, export and administration use separate, revocable least-privilege access.',
    },
    providerCategory: {
      es: 'La categoría de gestión de propiedades o reservas se valida por proyecto; no hay marca, cuenta o proveedor seleccionado.',
      en: 'The property- or booking-management category is validated per project; no brand, account or provider is selected.',
    },
    configurationReference: {
      es: 'Referencia opaca por definir fuera del navegador; la web contiene cero URL privadas, cuentas, claves, endpoints o secretos.',
      en: 'Opaque reference to be defined outside the browser; the website contains zero private URLs, accounts, keys, endpoints or secrets.',
    },
    entitiesFields: {
      es: 'Alojamientos, unidades o tipos, estancias, huéspedes, tarifas y estados requieren un mapa aceptado; campos opcionales o sensibles se excluyen por defecto.',
      en: 'Properties, units or types, stays, guests, rates and statuses need an accepted map; optional or sensitive fields are excluded by default.',
    },
    identifiersMatching: {
      es: 'Identificadores estables, namespace, duplicados y fusiones se definen sin hacer matching difuso de datos personales.',
      en: 'Stable identifiers, namespace, duplicates and merges are defined without fuzzy matching personal data.',
    },
    baselineMigration: {
      es: 'Corte, versión, recuentos y huellas de muestra forman una baseline aceptada; esta web no ejecuta una migración real.',
      en: 'Cut-off, version, counts and sample hashes form an accepted baseline; this website runs no live migration.',
    },
    isolatedCases: {
      es: 'Alta, cambio, cancelación, no-show, cambio de unidad, llegada tardía y evento inválido o atrasado se prueban solo con datos sintéticos.',
      en: 'Creation, change, cancellation, no-show, unit move, late arrival and invalid or stale events are tested with synthetic data only.',
    },
    idempotency: {
      es: 'Una referencia y versión estables permiten repetir cada caso sin duplicar estancias, huéspedes, tareas o cambios.',
      en: 'A stable reference and version allow each case to be replayed without duplicating stays, guests, tasks or changes.',
    },
    reconciliation: {
      es: 'Recuentos, versiones y diferencias entre fuente y destino se comparan y cada desviación queda explicada.',
      en: 'Counts, versions and differences between source and target are compared and every deviation is explained.',
    },
    failureRecovery: {
      es: 'Timeout, parcial, cambio de esquema, permiso revocado y eventos fuera de orden tienen límites, reintentos seguros y recuperación manual.',
      en: 'Timeout, partial failure, schema drift, revoked access and out-of-order events have limits, safe retries and manual recovery.',
    },
    audit: {
      es: 'Referencia, actor, versión de esquema, resultado y correlación se registran sin huésped, perfil, texto libre, PII o secreto.',
      en: 'Reference, actor, schema version, outcome and correlation are recorded without guest, profile, free text, PII or secret.',
    },
    acceptance: {
      es: 'Dirección y la persona responsable de datos aceptan mapeos, recuentos, diferencias, fallos y recuperación antes de activar.',
      en: 'Direction and the data owner accept mappings, counts, differences, failures and recovery before activation.',
    },
    killSwitch: {
      es: 'Controles independientes detienen entrada y publicación sin borrar la evidencia de solo lectura necesaria para revisar.',
      en: 'Independent controls stop intake and publication without deleting the read-only evidence needed for review.',
    },
    rollback: {
      es: 'La última configuración y baseline aceptadas se restauran; eventos afectados se reconcilian o compensan y la fuente nunca se borra.',
      en: 'The last accepted configuration and baseline are restored; affected events are reconciled or compensated and the source is never deleted.',
    },
  },
} as const satisfies {
  scopeState: 'separate_project_scope';
  readinessState: 'not_validated';
  executionState: 'unavailable';
  title: LocalizedText;
  summary: LocalizedText;
  labels: Record<DataSourceReadinessField, LocalizedText>;
  requirements: Record<DataSourceReadinessField, LocalizedText>;
};

export type IntegrationReadinessId =
  | 'channels'
  | 'website-publication'
  | 'product-email'
  | 'payments'
  | 'data-pms';

export interface IntegrationReadinessRecord {
  id: IntegrationReadinessId;
  label: LocalizedText;
  evidenceHref: LocalizedText;
  candidateCount: number;
  conditionCount: number;
  validatedConditionCount: 0;
  readinessState: 'not_validated';
  providerValidationState: 'not_started';
  validatedProviderCount: 0;
  activationState: 'unavailable';
}

export const INTEGRATION_READINESS_REGISTRY = [
  {
    id: 'channels',
    label: { es: 'Canales e inventario', en: 'Channels and inventory' },
    evidenceHref: { es: '/demos/aurem/gestion/?vista=channels', en: '/en/demos/aurem/gestion/?vista=channels' },
    candidateCount: CHANNEL_READINESS_CONTRACTS.length,
    conditionCount: CHANNEL_READINESS_FIELDS.length,
    validatedConditionCount: 0,
    readinessState: 'not_validated',
    providerValidationState: 'not_started',
    validatedProviderCount: 0,
    activationState: 'unavailable',
  },
  {
    id: 'website-publication',
    label: { es: 'Publicación web', en: 'Website publication' },
    evidenceHref: { es: '/demos/terrava/gestion/?vista=website', en: '/en/demos/terrava/gestion/?vista=website' },
    candidateCount: 1,
    conditionCount: WEBSITE_PUBLICATION_READINESS_FIELDS.length,
    validatedConditionCount: 0,
    readinessState: 'not_validated',
    providerValidationState: 'not_started',
    validatedProviderCount: 0,
    activationState: 'unavailable',
  },
  {
    id: 'product-email',
    label: { es: 'Email de producto', en: 'Product email' },
    evidenceHref: { es: '/demos/nivora/#reserva', en: '/en/demos/nivora/#reserva' },
    candidateCount: 1,
    conditionCount: EMAIL_DELIVERY_READINESS_FIELDS.length,
    validatedConditionCount: 0,
    readinessState: 'not_validated',
    providerValidationState: 'not_started',
    validatedProviderCount: 0,
    activationState: 'unavailable',
  },
  {
    id: 'payments',
    label: { es: 'Pagos', en: 'Payments' },
    evidenceHref: { es: '#payments-readiness', en: '#payments-readiness' },
    candidateCount: 1,
    conditionCount: PAYMENT_READINESS_FIELDS.length,
    validatedConditionCount: 0,
    readinessState: 'not_validated',
    providerValidationState: 'not_started',
    validatedProviderCount: 0,
    activationState: 'unavailable',
  },
  {
    id: 'data-pms',
    label: { es: 'Datos y PMS', en: 'Data and PMS' },
    evidenceHref: { es: '#data-pms-readiness', en: '#data-pms-readiness' },
    candidateCount: 1,
    conditionCount: DATA_SOURCE_READINESS_FIELDS.length,
    validatedConditionCount: 0,
    readinessState: 'not_validated',
    providerValidationState: 'not_started',
    validatedProviderCount: 0,
    activationState: 'unavailable',
  },
] as const satisfies readonly IntegrationReadinessRecord[];

export type ProviderValidationField =
  | 'contract'
  | 'owner'
  | 'permissions'
  | 'configurationReference'
  | 'isolatedTests'
  | 'failureRecovery'
  | 'audit'
  | 'acceptance'
  | 'killSwitch'
  | 'rollback';

export const PROVIDER_VALIDATION_FIELDS = [
  'contract',
  'owner',
  'permissions',
  'configurationReference',
  'isolatedTests',
  'failureRecovery',
  'audit',
  'acceptance',
  'killSwitch',
  'rollback',
] as const satisfies readonly ProviderValidationField[];

export const PROVIDER_VALIDATION_GATE = {
  title: {
    es: 'Cinco expedientes. Cero proveedores validados.',
    en: 'Five readiness files. Zero validated providers.',
  },
  summary: {
    es: 'El registro reúne la evidencia ya visible sin convertir preparación en activación. Una marca solo puede evaluarse después de completar esta puerta y recibir autorización separada.',
    en: 'The registry brings together evidence already in view without turning readiness into activation. A brand can only be assessed after completing this gate and receiving separate authorisation.',
  },
  labels: {
    contract: { es: 'Contrato y alcance', en: 'Contract and scope' },
    owner: { es: 'Responsables', en: 'Owners' },
    permissions: { es: 'Permisos', en: 'Permissions' },
    configurationReference: { es: 'Configuración opaca', en: 'Opaque configuration' },
    isolatedTests: { es: 'Pruebas aisladas', en: 'Isolated tests' },
    failureRecovery: { es: 'Fallos y recuperación', en: 'Failures and recovery' },
    audit: { es: 'Auditoría', en: 'Audit' },
    acceptance: { es: 'Aceptación', en: 'Acceptance' },
    killSwitch: { es: 'Kill switch', en: 'Kill switch' },
    rollback: { es: 'Reversión', en: 'Rollback' },
  },
  requirements: {
    contract: {
      es: 'Contrato, finalidad, alcance, jurisdicción y encargado aplicable quedan aceptados para ese proveedor concreto.',
      en: 'Contract, purpose, scope, jurisdiction and applicable processor terms are accepted for that specific provider.',
    },
    owner: {
      es: 'Dirección nombra responsables comercial, operativo, de datos y técnico con escalado acordado.',
      en: 'Direction names commercial, operational, data and technical owners with an agreed escalation path.',
    },
    permissions: {
      es: 'Lectura, escritura, administración y aprobación se separan, revocan y limitan al mínimo privilegio.',
      en: 'Read, write, administration and approval are separate, revocable and limited to least privilege.',
    },
    configurationReference: {
      es: 'Cuenta, entorno, endpoint y secretos usan referencias opacas fuera del navegador y nunca aparecen en esta web.',
      en: 'Account, environment, endpoint and secrets use opaque references outside the browser and never appear on this website.',
    },
    isolatedTests: {
      es: 'Casos principales, límites y datos sintéticos pasan en un entorno aislado sin efecto real.',
      en: 'Main cases, boundaries and synthetic data pass in an isolated environment with no live effect.',
    },
    failureRecovery: {
      es: 'Timeout, cuota, revocación, fallo parcial y resultado incierto tienen parada, reintento seguro y recuperación manual.',
      en: 'Timeout, quota, revocation, partial failure and uncertain outcome have stop, safe retry and manual recovery paths.',
    },
    audit: {
      es: 'Versión, actor, correlación y resultado quedan trazables sin PII, contenido, credencial o secreto.',
      en: 'Version, actor, correlation and outcome are traceable without PII, content, credential or secret.',
    },
    acceptance: {
      es: 'Dirección y las personas responsables aceptan casos, diferencias, fallos, evidencia y criterio de salida.',
      en: 'Direction and accountable owners accept cases, differences, failures, evidence and exit criteria.',
    },
    killSwitch: {
      es: 'Un control independiente detiene cada lectura o escritura sin impedir revisión y conciliación.',
      en: 'An independent control stops each read or write without preventing review and reconciliation.',
    },
    rollback: {
      es: 'La última configuración aceptada se restaura y cualquier efecto incierto se reconcilia antes de cerrar.',
      en: 'The last accepted configuration is restored and every uncertain effect is reconciled before closure.',
    },
  },
} as const satisfies {
  title: LocalizedText;
  summary: LocalizedText;
  labels: Record<ProviderValidationField, LocalizedText>;
  requirements: Record<ProviderValidationField, LocalizedText>;
};

export type ProviderValidationEvidence = Partial<Record<ProviderValidationField, 'validated'>>;

export function evaluateProviderValidation(evidence: ProviderValidationEvidence) {
  const validated = PROVIDER_VALIDATION_FIELDS.every((field) => evidence[field] === 'validated');
  return validated
    ? {
      providerValidationState: 'validated',
      brandState: 'eligible_after_authorization',
      activationState: 'eligible_after_authorization',
    } as const
    : {
      providerValidationState: 'not_validated',
      brandState: 'hidden',
      activationState: 'unavailable',
    } as const;
}

export type AssignMode = 'specific-unit' | 'unit-type';

export interface ReservableUnit {
  id: string;
  propertyId: string;
  name: string;
  type: string;
  assignMode: AssignMode;
  capacity: number;
}

export interface StayProperty {
  id: string;
  organizationId: string;
  name: string;
  city: string;
  units: ReservableUnit[];
}

export interface StayOrganization {
  id: string;
  name: string;
  vertical: Vertical;
  mode: BusinessMode;
  currency: 'EUR';
  properties: StayProperty[];
}

export interface StayRange {
  dateFrom: string;
  dateTo: string;
}

export function nights(range: StayRange): number {
  const from = Date.parse(`${range.dateFrom}T00:00:00Z`);
  const to = Date.parse(`${range.dateTo}T00:00:00Z`);
  if (!Number.isFinite(from) || !Number.isFinite(to) || to <= from) {
    throw new Error('invalid_stay_range');
  }
  return Math.round((to - from) / 86_400_000);
}

export function validateOrganization(org: StayOrganization): StayOrganization {
  if (org.properties.length === 0) throw new Error('organization_without_property');
  const units = org.properties.flatMap((property) => property.units);
  if (units.length === 0) throw new Error('organization_without_unit');
  if (org.mode === 'mono' && (org.properties.length !== 1 || units.length !== 1)) {
    throw new Error('mono_requires_single_property_and_unit');
  }
  for (const property of org.properties) {
    if (property.organizationId !== org.id) throw new Error('property_outside_organization');
    for (const unit of property.units) {
      if (unit.propertyId !== property.id) throw new Error('unit_outside_property');
      if (org.vertical === 'hotel' && unit.assignMode !== 'unit-type') {
        throw new Error('hotel_units_are_assigned_by_type');
      }
    }
  }
  return org;
}

export const LEVELS: Record<PlanLevel, { rank: number; capabilities: string[] }> = {
  basico: { rank: 0, capabilities: ['web', 'seo', 'enquiries', 'hosting', 'maintenance'] },
  gestion: {
    rank: 1,
    capabilities: ['enquiries-workspace', 'bookings', 'planning', 'guests', 'rates', 'reports-basic', 'website-editor'],
  },
  inteligente: {
    rank: 2,
    capabilities: ['operations-centre', 'cleaning', 'maintenance', 'teams', 'channels', 'automation', 'supervised-copilot', 'revenue', 'forecast'],
  },
};

export const CAPABILITIES: readonly Capability[] = [
  { id: 'brand-web', category: 'web', minimumPlan: 'basico', status: 'demo_visual_disponible', evidence: { demo: 'nivora', surface: 'demo-site', anchor: 'espacio', proof: { es: 'Web editorial responsive con contenido y navegación sobre una marca ficticia.', en: 'Responsive editorial website with content and navigation for a fictitious brand.' }, boundary: { es: 'No recoge solicitudes, consulta inventario ni incluye dashboard o edición pública.', en: 'It collects no enquiries, queries no inventory and includes no workspace or live editing.' } }, label: { es: 'Web modular de marca', en: 'Modular brand website' }, description: { es: 'Diseño, contenido y fundamentos SEO adaptables al alojamiento.', en: 'Design, content and SEO foundations adaptable to the stay.' } },
  { id: 'email-enquiries', category: 'reservations', minimumPlan: 'basico', status: 'demo_visual_disponible', evidence: { demo: 'nivora', surface: 'demo-site', anchor: 'reserva', proof: { es: 'Tres consultas ficticias muestran el contexto que podría reunir un email y trece condiciones de entrega todavía sin validar.', en: 'Three fictitious enquiries show the context an email could contain and thirteen delivery conditions that remain unvalidated.' }, boundary: { es: 'Solo cambia una vista previa en memoria y conserva 0/13 condiciones validadas: no recoge datos personales, no envía emails, no consulta ni bloquea inventario y no crea reservas; recargar restaura el fixture.', en: 'It only changes an in-memory preview and retains 0/13 validated conditions: it collects no personal data, sends no email, does not query or hold inventory and creates no booking; reloading restores the fixture.' } }, label: { es: 'Solicitudes por email', en: 'Email enquiries' }, description: { es: 'Representación visual del contexto que podría recibir el alojamiento en una consulta directa.', en: 'Visual representation of the context a property could receive in a direct enquiry.' } },
  { id: 'enquiry-workspace', category: 'reservations', minimumPlan: 'gestion', status: 'demo_visual_disponible', evidence: { demo: 'terrava', surface: 'workspace', view: 'enquiries', proof: { es: 'Caso ficticio precargado que conserva el contexto y compara una alternativa en solo lectura.', en: 'Preloaded fictitious case that keeps context and compares an alternative in read-only mode.' }, boundary: { es: 'No crea, convierte ni confirma reservas y no envía comunicaciones.', en: 'It does not create, convert or confirm bookings and sends no communication.' } }, label: { es: 'Solicitudes y reservas', en: 'Enquiries and bookings' }, description: { es: 'Representa una consulta y su alternativa con contexto compartido.', en: 'Represents an enquiry and its alternative with shared context.' } },
  { id: 'planning', category: 'reservations', minimumPlan: 'gestion', status: 'demo_visual_disponible', evidence: { demo: 'terrava', surface: 'workspace', view: 'planning', proof: { es: 'Calendario ficticio de solo lectura con unidades, estancias y una alternativa ya preparada.', en: 'Read-only fictitious calendar with units, stays and a prepared alternative.' }, boundary: { es: 'No cambia inventario o tarifas ni conecta PMS, disponibilidad o pagos.', en: 'It changes no inventory or rates and connects no PMS, availability or payments.' } }, label: { es: 'Planning y tarifas', en: 'Planning and rates' }, description: { es: 'Representa estancias, unidades, huéspedes y precios en un calendario común.', en: 'Represents stays, units, guests and pricing in a shared calendar.' } },
  { id: 'guest-context', category: 'reservations', minimumPlan: 'gestion', status: 'demo_visual_disponible', evidence: { demo: 'terrava', surface: 'workspace', view: 'guests', proof: { es: 'Tabla ficticia de solo lectura con dos huéspedes de muestra, origen y estado.', en: 'Read-only fictitious table with two sample guests, source and status.' }, boundary: { es: 'No crea perfiles, registra viajeros, guarda datos de visitantes ni envía comunicaciones.', en: 'It creates no profile, reports no traveller, stores no visitor data and sends no communication.' } }, label: { es: 'Huéspedes y llegadas', en: 'Guests and arrivals' }, description: { es: 'Contexto ficticio de la estancia disponible para preparar una llegada.', en: 'Fictitious stay context available to prepare an arrival.' } },
  { id: 'website-editor', category: 'web', minimumPlan: 'gestion', status: 'demo_visual_disponible', evidence: { demo: 'terrava', surface: 'workspace', view: 'website', proof: { es: 'Terrava permite editar un titular ficticio, descartar el borrador, aprobar una vista local solo desde Dirección y revisar doce condiciones de publicación sin validar.', en: 'Terrava lets users edit a fictitious headline, discard the draft, approve a local preview only from Direction and review twelve unvalidated publication conditions.' }, boundary: { es: 'El estado solo vive durante la visita y la aprobación local valida 0/12 condiciones: no existe CMS, repositorio, despliegue, proveedor ni escritura HTTP, y recargar restaura el fixture.', en: 'State only lasts for the visit and local approval validates 0/12 conditions: there is no CMS, repository, deployment, provider or HTTP write, and reloading restores the fixture.' } }, label: { es: 'Editor web supervisado', en: 'Supervised website editor' }, description: { es: 'Edición visual de un borrador ficticio con aprobación humana local.', en: 'Visual editing of a fictitious draft with local human approval.' } },
  { id: 'basic-reports', category: 'revenue', minimumPlan: 'gestion', status: 'demo_visual_disponible', evidence: { demo: 'terrava', surface: 'workspace', view: 'reports', proof: { es: 'Lectura visual de ocupación e ingresos con un conjunto de muestra.', en: 'Visual reading of occupancy and revenue from a sample dataset.' }, boundary: { es: 'No usa contabilidad, pagos ni datos operativos reales.', en: 'It uses no live accounting, payment or operational data.' } }, label: { es: 'Informes básicos', en: 'Basic reports' }, description: { es: 'Lectura de reservas, ocupación e ingresos con datos de muestra.', en: 'Booking, occupancy and revenue reading with sample data.' } },
  { id: 'explainable-revenue', category: 'revenue', minimumPlan: 'inteligente', status: 'demo_visual_disponible', evidence: { demo: 'aurem', surface: 'workspace', view: 'reports', proof: { es: 'Escenario ficticio de 28 días con ocupación, ADR, RevPAR, ingresos, fórmulas y libro semanal.', en: 'Fictitious 28-day scenario with occupancy, ADR, RevPAR, revenue, formulas and a weekly ledger.' }, boundary: { es: 'No usa PMS, canales, contabilidad o pagos reales y no predice demanda ni precio.', en: 'It uses no live PMS, channel, accounting or payment data and predicts no demand or price.' } }, label: { es: 'Métricas de ingresos explicables', en: 'Explainable revenue metrics' }, description: { es: 'Cifras ficticias contrastables con sus fórmulas y conjunto de muestra.', en: 'Fictitious figures that can be checked against formulas and their sample dataset.' } },
  { id: 'operations-centre', category: 'operations', minimumPlan: 'inteligente', status: 'demo_visual_disponible', evidence: { demo: 'aurem', surface: 'workspace', view: 'control', proof: { es: 'Llegadas, preparación e incidencias ficticias reunidas en una vista de solo lectura.', en: 'Fictitious arrivals, readiness and incidents brought together in a read-only view.' }, boundary: { es: 'No toma decisiones ni ejecuta acciones de forma autónoma.', en: 'It makes no autonomous decision and executes no live action.' } }, label: { es: 'Centro operativo', en: 'Operations centre' }, description: { es: 'Muestra llegadas en riesgo y la coordinación ficticia de la respuesta del equipo.', en: 'Shows at-risk arrivals and a fictional coordination scenario for the team response.' } },
  { id: 'cleaning', category: 'operations', minimumPlan: 'inteligente', status: 'demo_visual_disponible', evidence: { demo: 'aurem', surface: 'workspace', view: 'cleaning', proof: { es: 'Checklist y estado de habitación ya preparados para entender responsabilidades y revisión.', en: 'Prepared room checklist and status used to explain ownership and review.' }, boundary: { es: 'No asigna ni valida tareas, no notifica al equipo y no cambia un PMS real.', en: 'It assigns or validates no task, notifies no team and updates no live PMS.' } }, label: { es: 'Limpieza y preparación', en: 'Cleaning and preparation' }, description: { es: 'Responsabilidades, revisión y estado ficticio de una habitación.', en: 'Ownership, review and fictitious room status.' } },
  { id: 'maintenance', category: 'operations', minimumPlan: 'inteligente', status: 'demo_visual_disponible', evidence: { demo: 'aurem', surface: 'workspace', view: 'maintenance', proof: { es: 'Timeline ficticio de una incidencia con prioridad y estados precargados.', en: 'Fictitious incident timeline with preloaded priority and statuses.' }, boundary: { es: 'No asigna ni resuelve incidencias, no crea órdenes y no avisa a proveedores.', en: 'It assigns or resolves no incident, creates no work order and contacts no supplier.' } }, label: { es: 'Mantenimiento', en: 'Maintenance' }, description: { es: 'Muestra una incidencia ficticia con prioridad y trazabilidad visual.', en: 'Shows a fictitious incident with priority and visual traceability.' } },
  { id: 'roles', category: 'team', minimumPlan: 'inteligente', status: 'demo_visual_disponible', evidence: { demo: 'aurem', surface: 'workspace', view: 'home', proof: { es: 'El selector representa Dirección, Recepción y Limpieza sobre el mismo fixture de solo lectura.', en: 'The selector represents Management, Reception and Cleaning over the same read-only fixture.' }, boundary: { es: 'No crea cuentas ni permisos reales y no habilita acciones operativas diferentes.', en: 'It creates no live account or permission and enables no different operational action.' } }, label: { es: 'Equipos y permisos', en: 'Teams and permissions' }, description: { es: 'Representación visual de roles que comparten un contexto ficticio.', en: 'Visual representation of roles sharing fictitious context.' } },
  { id: 'channels', category: 'channels', minimumPlan: 'inteligente', status: 'activable_por_proyecto', evidence: { demo: 'aurem', surface: 'workspace', view: 'channels', proof: { es: 'Matriz de solo lectura que muestra cobertura, requisitos y cero conexiones por canal.', en: 'Read-only matrix showing coverage, requirements and zero connections per channel.' }, boundary: { es: 'Conectar exige contrato, credenciales, mapeo, pruebas y validación por proveedor; publicar está bloqueado.', en: 'Connection requires a contract, credentials, mapping, tests and per-provider validation; publishing is blocked.' } }, label: { es: 'Canales e inventario', en: 'Channels and inventory' }, description: { es: 'Vista de requisitos para una conectividad que se valida por proyecto y proveedor.', en: 'Requirements view for connectivity validated per project and provider.' } },
  { id: 'automation', category: 'automation', minimumPlan: 'inteligente', status: 'demo_visual_disponible', evidence: { demo: 'aurem', surface: 'workspace', view: 'automations', proof: { es: 'Tres reglas ficticias permiten inspeccionar disparador, condición, resultado propuesto y revisión humana sin ejecutarse.', en: 'Three fictitious rules expose their trigger, condition, proposed outcome and human review without running.' }, boundary: { es: 'La revisión solo vive durante la visita: no inicia jobs, colas, cron, webhooks, mensajes o proveedores, no escribe por HTTP y recargar restaura el fixture.', en: 'Review state only lasts for the visit: it starts no jobs, queues, cron, webhooks, messages or providers, makes no HTTP write and reloading restores the fixture.' } }, label: { es: 'Automatizaciones', en: 'Automations' }, description: { es: 'Reglas ficticias inspeccionables con revisión humana local y ejecución permanentemente inactiva.', en: 'Inspectable fictitious rules with local human review and permanently inactive execution.' } },
  { id: 'supervised-ai', category: 'ai', minimumPlan: 'inteligente', status: 'demo_visual_disponible', evidence: { demo: 'aurem', surface: 'workspace', view: 'automation', proof: { es: 'Borrador ficticio con fuentes visibles, edición, versionado y revisión humana por rol en memoria.', en: 'Fictitious draft with visible sources, editing, versioning and role-based human review in memory.' }, boundary: { es: 'No hay modelo ni proveedor, nada se envía y recargar restaura el fixture.', en: 'There is no model or provider, nothing is sent and reloading restores the fixture.' } }, label: { es: 'Copiloto supervisado', en: 'Supervised copilot' }, description: { es: 'Borradores ficticios editables y revisables con trazabilidad local.', en: 'Editable and reviewable fictitious drafts with local traceability.' } },
  { id: 'revenue', category: 'revenue', minimumPlan: 'inteligente', status: 'en_ruta', evidence: { surface: 'none', proof: { es: 'La demo incluye cálculos ficticios explicables, pero no demuestra previsión de demanda o precio.', en: 'The demo includes explainable fictitious calculations but does not demonstrate demand or pricing forecasts.' }, boundary: { es: 'La previsión no está disponible ni debe presentarse como incluida; no usa PMS, canales, contabilidad o pagos.', en: 'Forecasting is not available and must not be presented as included; it uses no PMS, channel, accounting or payment data.' } }, label: { es: 'Previsión de demanda y precio', en: 'Demand and pricing forecasts' }, description: { es: 'Previsión de demanda y precio todavía no disponible.', en: 'Demand and pricing forecasts are not yet available.' } },
] as const;

export function hasLevel(current: PlanLevel, required: PlanLevel): boolean {
  return LEVELS[current].rank >= LEVELS[required].rank;
}

export function normalizePlanLevel(value: PlanLevel | LegacyPlanLevel): PlanLevel {
  if (value === 'inicio') return 'basico';
  if (value === 'automatiza') return 'inteligente';
  return value;
}

export interface ScopeSignals {
  propertyCount: number;
  unitCount: number;
  wantsBookings: boolean;
  wantsAutomation: boolean;
  wantsOperations: boolean;
}

export function recommendLevel(signals: ScopeSignals): PlanLevel {
  if (signals.wantsOperations || signals.wantsAutomation) return 'inteligente';
  if (signals.wantsBookings) return 'gestion';
  return 'basico';
}
