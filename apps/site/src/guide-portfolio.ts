import type { Locale } from '@logic-estancia/config';
import { CAPABILITIES } from '@logic-estancia/domain';
import { capabilityEvidenceHref } from './capability-evidence';
import { getPanelPortfolio, type PanelId } from './panel-portfolio';

export const GUIDE_IDS = ['direction', 'reception', 'operations', 'marketing-revenue', 'technical-privacy'] as const;
export type GuideId = typeof GUIDE_IDS[number];
export type GuideStatus = 'published' | 'preparation';

interface GuidePanelDefinition {
  id: PanelId;
  label: Record<Locale, string>;
}

interface GuideCapabilityDefinition {
  id: string;
  label: Record<Locale, string>;
}

interface GuideCopy {
  slug: string;
  role: string;
  title: string;
  question: string;
  summary: string;
  outcome: string;
  responsibilities: readonly string[];
  handoff: readonly string[];
  validations: readonly string[];
  boundaries: readonly string[];
}

interface GuideDefinition {
  id: GuideId;
  number: string;
  status: GuideStatus;
  capabilityIds: readonly string[];
  panels: readonly GuidePanelDefinition[];
  capabilityEvidence?: readonly GuideCapabilityDefinition[];
  copy: Record<Locale, GuideCopy>;
}

export interface GuidePortfolioItem extends GuideCopy {
  id: GuideId;
  number: string;
  status: GuideStatus;
  statusLabel: string;
  capabilityIds: readonly string[];
  panelLinks: readonly { id: PanelId; label: string; href: string }[];
  capabilityLinks: readonly { id: string; label: string; href: string }[];
  detailHref: string | null;
  alternateSlug: string;
}

const definitions: readonly GuideDefinition[] = [
  {
    id: 'direction', number: '01', status: 'published',
    capabilityIds: ['brand-web', 'operations-centre', 'roles'],
    panels: [
      { id: 'operations-revenue', label: { es: 'Operación e ingresos', en: 'Operations and revenue' } },
      { id: 'copilot', label: { es: 'Copiloto supervisado', en: 'Supervised copilot' } },
    ],
    copy: {
      es: {
        slug: 'direccion-propiedad', role: 'Propiedad y dirección', title: 'Decidir el alcance antes de conectar la operación',
        question: '¿Qué debe poder decidir dirección y qué evidencia necesita antes de publicar?',
        summary: 'Una guía para convertir prioridades comerciales y operativas en capacidades, responsables y pruebas que puedan revisarse.',
        outcome: 'Un punto de partida acordado, con una persona responsable, evidencia verificable y límites de activación explícitos.',
        responsibilities: [
          'Nombrar el cuello de botella y el resultado que justificaría resolverlo.',
          'Acordar qué sistema conserva la fuente de verdad y quién puede aprobar cambios.',
          'Elegir capacidades por necesidad; el tamaño solo aporta contexto de implantación.',
          'Aceptar pruebas, publicación supervisada, soporte y reversión antes de activar.',
        ],
        handoff: ['Prioridad y criterio de éxito', 'Capacidades y fuente de verdad', 'Pruebas y evidencia', 'Aprobación humana y seguimiento'],
        validations: [
          'Que el alcance responda a una necesidad observada, no a una lista genérica de funciones.',
          'Que accesos, dominio, contenidos y responsables estén acordados por escrito.',
          'Que la evidencia local coincida con la promesa comercial y sus límites.',
          'Que exista un plan humano de aceptación, publicación, soporte y reversión.',
        ],
        boundaries: [
          'La guía no sustituye decisiones legales, fiscales, financieras ni de protección de datos.',
          'La demo no conecta inventario, reservas, pagos, mensajes, canales o proveedores reales.',
          'No se publican precios hasta completar la validación comercial prevista.',
        ],
      },
      en: {
        slug: 'ownership-direction', role: 'Ownership and direction', title: 'Decide the scope before connecting operations',
        question: 'What must management be able to decide, and what evidence is needed before publishing?',
        summary: 'A guide for turning commercial and operating priorities into capabilities, owners and evidence that can be reviewed.',
        outcome: 'An agreed starting point with one accountable owner, verifiable evidence and explicit activation boundaries.',
        responsibilities: [
          'Name the bottleneck and the outcome that would justify solving it.',
          'Agree which system keeps the source of truth and who may approve changes.',
          'Choose capabilities by need; size only adds implementation context.',
          'Accept tests, supervised publication, support and rollback before activation.',
        ],
        handoff: ['Priority and success criterion', 'Capabilities and source of truth', 'Tests and evidence', 'Human approval and follow-up'],
        validations: [
          'The scope responds to an observed need rather than a generic feature list.',
          'Access, domain, content and accountable owners are agreed in writing.',
          'Local evidence matches the commercial promise and its boundaries.',
          'A human acceptance, publication, support and rollback plan exists.',
        ],
        boundaries: [
          'This guide does not replace legal, tax, financial or data-protection decisions.',
          'The demo connects no live inventory, booking, payment, message, channel or provider.',
          'Prices are not published before the planned commercial validation is complete.',
        ],
      },
    },
  },
  {
    id: 'reception', number: '02', status: 'published',
    capabilityIds: ['enquiry-workspace', 'planning', 'guest-context'],
    panels: [
      { id: 'enquiries', label: { es: 'Solicitudes', en: 'Enquiries' } },
      { id: 'planning', label: { es: 'Planning', en: 'Planning' } },
      { id: 'guests-arrivals', label: { es: 'Huéspedes y llegadas', en: 'Guests and arrivals' } },
    ],
    copy: {
      es: {
        slug: 'reservas-recepcion', role: 'Reservas y recepción', title: 'Conservar el contexto sin fingir una reserva real',
        question: '¿Qué necesita recepción para continuar una solicitud y preparar una llegada sin reconstruir la historia?',
        summary: 'Una guía para ordenar solicitudes, alternativas, planning y datos mínimos de llegada con responsabilidad humana visible.',
        outcome: 'Un recorrido revisable desde la solicitud hasta la preparación, sin confirmar, cobrar, registrar o comunicar nada fuera de la demo.',
        responsibilities: [
          'Conservar fechas, alojamiento, origen y alternativa junto a cada solicitud.',
          'Contrastar disponibilidad y tarifa en la fuente acordada antes de responder.',
          'Revisar el contexto mínimo de huésped y llegada con permisos adecuados.',
          'Escalar excepciones y dejar la confirmación, el cobro y el mensaje en manos autorizadas.',
        ],
        handoff: ['Solicitud con contexto', 'Alternativa y planning revisados', 'Llegada preparada por el equipo', 'Acción real solo tras validación'],
        validations: [
          'Qué canal y sistema son fuente de verdad para disponibilidad, tarifa y estado.',
          'Qué datos personales son imprescindibles, quién accede y cuánto tiempo se conservan.',
          'Qué excepciones requieren revisión de dirección, operación o soporte.',
          'Quién puede confirmar, cobrar, comunicar o realizar un registro obligatorio.',
        ],
        boundaries: [
          'Terrava muestra datos ficticios de solo lectura y no confirma ni modifica reservas.',
          'No envía email o mensajería, no cobra y no sincroniza inventario o tarifas.',
          'No realiza registro de viajeros; ese flujo exige validación legal, proveedor y aceptación separadas.',
        ],
      },
      en: {
        slug: 'reservations-reception', role: 'Reservations and reception', title: 'Keep context without pretending a live booking',
        question: 'What does reception need to continue an enquiry and prepare an arrival without rebuilding the story?',
        summary: 'A guide for organising enquiries, alternatives, planning and minimum arrival data with visible human ownership.',
        outcome: 'A reviewable journey from enquiry to preparation without confirming, charging, reporting or communicating outside the demo.',
        responsibilities: [
          'Keep dates, property, source and alternative with each enquiry.',
          'Check availability and rate in the agreed source before replying.',
          'Review minimum guest and arrival context with suitable permissions.',
          'Escalate exceptions and leave confirmation, payment and delivery to authorised people.',
        ],
        handoff: ['Enquiry with context', 'Alternative and planning reviewed', 'Arrival prepared by the team', 'Live action only after validation'],
        validations: [
          'Which channel and system are the source of truth for availability, rate and status.',
          'Which personal data is essential, who accesses it and how long it is retained.',
          'Which exceptions need management, operations or support review.',
          'Who may confirm, charge, communicate or complete mandatory guest reporting.',
        ],
        boundaries: [
          'Terrava shows fictitious read-only data and confirms or changes no booking.',
          'It sends no email or message, takes no payment and synchronises no inventory or rate.',
          'It performs no guest reporting; that flow needs separate legal, provider and acceptance validation.',
        ],
      },
    },
  },
  {
    id: 'operations', number: '03', status: 'published', capabilityIds: ['operations-centre', 'cleaning', 'maintenance'],
    panels: [
      { id: 'preparation', label: { es: 'Preparación', en: 'Preparation' } },
      { id: 'operations-revenue', label: { es: 'Operación e ingresos', en: 'Operations and revenue' } },
    ],
    capabilityEvidence: [
      { id: 'operations-centre', label: { es: 'Abrir centro operativo en Aurem', en: 'Open the Aurem operations centre' } },
      { id: 'cleaning', label: { es: 'Abrir limpieza y preparación en Aurem', en: 'Open housekeeping and preparation in Aurem' } },
      { id: 'maintenance', label: { es: 'Abrir mantenimiento en Aurem', en: 'Open maintenance in Aurem' } },
    ],
    copy: {
      es: {
        slug: 'operaciones', role: 'Operaciones', title: 'Coordinar preparación e incidencias sin ocultar al responsable',
        question: '¿Qué necesita operaciones para priorizar una llegada, preparar una habitación y escalar una incidencia sin perder la responsabilidad?',
        summary: 'Una guía para compartir prioridad, estado y siguiente revisión entre operación, limpieza y mantenimiento sin presentar coordinación visual como ejecución automática.',
        outcome: 'Un relevo operativo trazable: la señal conserva contexto, cada revisión tiene responsable y cualquier acción real termina en la fuente acordada.',
        responsibilities: [
          'Leer llegadas, preparación e incidencias desde la fuente acordada antes de priorizar.',
          'Nombrar responsable y punto de revisión para limpieza, mantenimiento y excepciones.',
          'Contrastar prioridad y estado antes de modificar un sistema o avisar a otra persona.',
          'Escalar bloqueos y conservar una aceptación humana antes de cerrar el caso.',
        ],
        handoff: ['Señal y contexto compartidos', 'Responsable y prioridad revisados', 'Preparación o incidencia contrastada', 'Cierre humano en la fuente acordada'],
        validations: [
          'Qué sistema es fuente de verdad y qué significa cada prioridad, estado y plazo.',
          'Quién asigna, valida y escala durante cada turno, incluida la cobertura fuera de horario.',
          'Qué datos operativos o personales son imprescindibles y qué roles pueden consultarlos.',
          'Quién puede actualizar un PMS, cerrar una orden o contactar con personal y proveedores.',
        ],
        boundaries: [
          'Aurem usa un fixture local ficticio; sus vistas no prueban ejecución operativa en un alojamiento.',
          'La demo no asigna ni valida tareas, no notifica al equipo y no cambia un PMS real.',
          'No crea o cierra órdenes de trabajo ni contacta con proveedores; recargar restaura el escenario local.',
        ],
      },
      en: {
        slug: 'operations', role: 'Operations', title: 'Coordinate preparation and incidents without hiding ownership',
        question: 'What does operations need to prioritise an arrival, prepare a room and escalate an incident without losing accountability?',
        summary: 'A guide for sharing priority, status and the next review across operations, housekeeping and maintenance without presenting visual coordination as automated execution.',
        outcome: 'A traceable operating handoff: the signal keeps its context, every review has an owner and every live action ends in the agreed source.',
        responsibilities: [
          'Read arrivals, preparation and incidents from the agreed source before prioritising.',
          'Name an owner and review point for housekeeping, maintenance and exceptions.',
          'Check priority and status before updating a system or notifying another person.',
          'Escalate blockers and retain human acceptance before closing the case.',
        ],
        handoff: ['Shared signal and context', 'Owner and priority reviewed', 'Preparation or incident checked', 'Human closure in the agreed source'],
        validations: [
          'Which system is the source of truth and what every priority, status and deadline means.',
          'Who assigns, validates and escalates on every shift, including out-of-hours cover.',
          'Which operating or personal data is essential and which roles may inspect it.',
          'Who may update a PMS, close a work order or contact staff and suppliers.',
        ],
        boundaries: [
          'Aurem uses a fictitious local fixture; its views do not prove live execution at a property.',
          'The demo assigns or validates no task, notifies no team and updates no live PMS.',
          'It creates or closes no work order and contacts no supplier; reloading restores the local scenario.',
        ],
      },
    },
  },
  {
    id: 'marketing-revenue', number: '04', status: 'preparation', capabilityIds: ['brand-web', 'explainable-revenue', 'revenue'], panels: [],
    copy: {
      es: { slug: 'marketing-ingresos', role: 'Marketing e ingresos', title: 'Separar señal, explicación y previsión', question: '¿Qué evidencia permite decidir sin convertir una lectura en una promesa?', summary: 'Marca, captación y métricas explicables con una frontera clara ante cualquier previsión.', outcome: '', responsibilities: [], handoff: [], validations: [], boundaries: [] },
      en: { slug: 'marketing-revenue', role: 'Marketing and revenue', title: 'Separate signal, explanation and forecast', question: 'What evidence supports a decision without turning a reading into a promise?', summary: 'Brand, acquisition and explainable metrics with a clear boundary before forecasting.', outcome: '', responsibilities: [], handoff: [], validations: [], boundaries: [] },
    },
  },
  {
    id: 'technical-privacy', number: '05', status: 'preparation', capabilityIds: ['roles', 'channels', 'supervised-ai'], panels: [],
    copy: {
      es: { slug: 'tecnica-privacidad', role: 'Técnica y privacidad', title: 'Validar accesos, proveedores y reversión', question: '¿Qué debe estar acordado antes de activar datos o sistemas?', summary: 'Fuentes, permisos, proveedores, pruebas y aceptación sin presentar una demo como producción.', outcome: '', responsibilities: [], handoff: [], validations: [], boundaries: [] },
      en: { slug: 'technical-privacy', role: 'Technical and privacy', title: 'Validate access, providers and rollback', question: 'What must be agreed before activating data or systems?', summary: 'Sources, permissions, providers, tests and acceptance without presenting a demo as production.', outcome: '', responsibilities: [], handoff: [], validations: [], boundaries: [] },
    },
  },
] as const;

export function getGuidePortfolio(locale: Locale): readonly GuidePortfolioItem[] {
  const prefix = locale === 'en' ? '/en' : '';
  const otherLocale: Locale = locale === 'en' ? 'es' : 'en';
  const panels = new Map(getPanelPortfolio(locale).map((panel) => [panel.id, panel]));

  return definitions.map((definition) => {
    const copy = definition.copy[locale];
    const published = definition.status === 'published';
    const panelLinks = definition.panels.map((panelDefinition) => {
      const panel = panels.get(panelDefinition.id);
      if (!panel?.detailHref) throw new Error(`missing_guide_panel:${definition.id}:${panelDefinition.id}`);
      return { id: panelDefinition.id, label: panelDefinition.label[locale], href: panel.detailHref };
    });
    const capabilityLinks = (definition.capabilityEvidence ?? []).map((linkDefinition) => {
      const capability = CAPABILITIES.find((candidate) => candidate.id === linkDefinition.id);
      if (!capability || !definition.capabilityIds.includes(linkDefinition.id)) throw new Error(`missing_guide_capability_evidence:${definition.id}:${linkDefinition.id}`);
      const href = capabilityEvidenceHref(capability, locale);
      if (!href) throw new Error(`missing_guide_capability_href:${definition.id}:${linkDefinition.id}`);
      return { id: linkDefinition.id, label: linkDefinition.label[locale], href };
    });
    return {
      ...definition,
      ...copy,
      statusLabel: published
        ? (locale === 'en' ? 'Published guide' : 'Guía publicada')
        : (locale === 'en' ? 'In preparation' : 'En preparación'),
      panelLinks,
      capabilityLinks,
      detailHref: published ? `${prefix}/docs/${copy.slug}/` : null,
      alternateSlug: definition.copy[otherLocale].slug,
    };
  });
}

export function getPublishedGuides(locale: Locale): readonly GuidePortfolioItem[] {
  return getGuidePortfolio(locale).filter((guide) => guide.status === 'published');
}

export function getGuideBySlug(locale: Locale, slug: string): GuidePortfolioItem | undefined {
  return getPublishedGuides(locale).find((guide) => guide.slug === slug);
}

export function validateGuideCapabilities(): void {
  for (const definition of definitions) {
    for (const capabilityId of definition.capabilityIds) {
      if (!CAPABILITIES.some((capability) => capability.id === capabilityId)) throw new Error(`missing_guide_capability:${definition.id}:${capabilityId}`);
    }
  }
}
