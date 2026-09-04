import type { Locale } from '@logic-estancia/config';
import type { BusinessSegment } from './businesses';
import { getPublishedGuides, GUIDE_IDS, type GuideId, type GuidePortfolioItem } from './guide-portfolio';
import type { PanelId } from './panel-portfolio';

export const GUIDE_CONTEXT_IDS = [
  'home', 'plans', 'solution-rural', 'solution-apartments', 'solution-hotels', 'webs', 'panels',
  'panel-enquiries', 'panel-planning', 'panel-guests-arrivals', 'panel-preparation', 'panel-operations-revenue', 'panel-copilot',
] as const;

export type GuideContextId = typeof GUIDE_CONTEXT_IDS[number];

interface GuideContextCopy {
  eyebrow: string;
  title: string;
  body: string;
}

interface GuideContextDefinition {
  guideIds: readonly GuideId[];
  copy: Record<Locale, GuideContextCopy>;
}

export interface GuideContext extends GuideContextCopy {
  id: GuideContextId;
  guides: readonly GuidePortfolioItem[];
}

const homeCopy = {
  es: { eyebrow: 'Guías por responsabilidad', title: 'Cinco conversaciones antes de conectar nada.', body: 'Cada guía convierte una promesa en decisiones, evidencia y un relevo humano que se puede revisar.' },
  en: { eyebrow: 'Guides by responsibility', title: 'Five conversations before connecting anything.', body: 'Every guide turns a promise into decisions, evidence and a human handoff that can be reviewed.' },
} as const;

const panelCopy = {
  es: { eyebrow: 'Responsabilidad relacionada', title: 'Comprueba quién debe revisar esta pantalla.', body: 'La ficha muestra evidencia local; la guía explica la decisión, el responsable y el límite antes de activar.' },
  en: { eyebrow: 'Related responsibility', title: 'Check who must review this screen.', body: 'The page shows local evidence; the guide explains the decision, owner and boundary before activation.' },
} as const;

const definitions: Record<GuideContextId, GuideContextDefinition> = {
  home: { guideIds: GUIDE_IDS, copy: homeCopy },
  plans: {
    guideIds: ['direction', 'technical-privacy'],
    copy: {
      es: { eyebrow: 'Antes de elegir el plan', title: 'Alinea alcance, aceptación y reversión.', body: 'El plan parte de capacidades; dirección y técnica convierten ese punto de partida en responsables y condiciones verificables.' },
      en: { eyebrow: 'Before choosing the plan', title: 'Align scope, acceptance and rollback.', body: 'The plan starts with capabilities; management and technical review turn that starting point into accountable, checkable conditions.' },
    },
  },
  'solution-rural': {
    guideIds: ['reception'],
    copy: {
      es: { eyebrow: 'Guía para este recorrido', title: 'Conserva el contexto desde la solicitud hasta la llegada.', body: 'Reservas y recepción aclara fuentes, datos mínimos, excepciones y acciones que siguen necesitando autorización.' },
      en: { eyebrow: 'Guide for this journey', title: 'Keep context from enquiry to arrival.', body: 'Reservations and reception clarifies sources, minimum data, exceptions and actions that still need authorisation.' },
    },
  },
  'solution-apartments': {
    guideIds: ['reception'],
    copy: {
      es: { eyebrow: 'Guía para este recorrido', title: 'Conserva el contexto al crecer en unidades y canales.', body: 'Reservas y recepción ayuda a decidir qué debe acompañar a cada solicitud sin fingir disponibilidad, cobros o mensajes conectados.' },
      en: { eyebrow: 'Guide for this journey', title: 'Keep context as units and channels grow.', body: 'Reservations and reception helps decide what must travel with every enquiry without pretending availability, payments or messages are connected.' },
    },
  },
  'solution-hotels': {
    guideIds: ['operations'],
    copy: {
      es: { eyebrow: 'Guía para este recorrido', title: 'Coordina prioridades sin ocultar al responsable.', body: 'Operaciones ordena señal, turno, escalado y cierre humano antes de atribuir ejecución a una vista.' },
      en: { eyebrow: 'Guide for this journey', title: 'Coordinate priorities without hiding ownership.', body: 'Operations organises signal, shift, escalation and human closure before attributing execution to a view.' },
    },
  },
  webs: {
    guideIds: ['marketing-revenue'],
    copy: {
      es: { eyebrow: 'De la dirección visual a la decisión', title: 'Separa marca, señal y previsión.', body: 'Marketing e ingresos explica qué puede demostrar una web y qué necesita datos reales antes de convertirse en resultado o forecast.' },
      en: { eyebrow: 'From visual direction to decision', title: 'Separate brand, signal and forecast.', body: 'Marketing and revenue explains what a website can demonstrate and what needs live data before becoming a result or forecast.' },
    },
  },
  panels: {
    guideIds: ['reception', 'operations', 'technical-privacy'],
    copy: {
      es: { eyebrow: 'De la superficie al responsable', title: 'Lee cada panel desde la decisión que acompaña.', body: 'Recepción, operaciones y técnica explican quién revisa el contexto y qué sigue fuera de la demo.' },
      en: { eyebrow: 'From surface to owner', title: 'Read every workspace through the decision it supports.', body: 'Reception, operations and technical review explain who checks the context and what remains outside the demo.' },
    },
  },
  'panel-enquiries': { guideIds: ['reception'], copy: panelCopy },
  'panel-planning': { guideIds: ['reception'], copy: panelCopy },
  'panel-guests-arrivals': { guideIds: ['reception'], copy: panelCopy },
  'panel-preparation': { guideIds: ['operations'], copy: panelCopy },
  'panel-operations-revenue': { guideIds: ['marketing-revenue'], copy: panelCopy },
  'panel-copilot': { guideIds: ['technical-privacy'], copy: panelCopy },
};

export function guideContextForSolution(segment: BusinessSegment): GuideContextId {
  return `solution-${segment}`;
}

export function guideContextForPanel(panelId: PanelId): GuideContextId {
  return `panel-${panelId}`;
}

export function getGuideContext(id: GuideContextId, locale: Locale): GuideContext {
  const definition = definitions[id];
  const guidesById = new Map(getPublishedGuides(locale).map((guide) => [guide.id, guide]));
  const guides = definition.guideIds.map((guideId) => {
    const guide = guidesById.get(guideId);
    if (!guide?.detailHref) throw new Error(`missing_contextual_guide:${id}:${guideId}`);
    return guide;
  });
  return { id, ...definition.copy[locale], guides };
}

export function validateGuideContexts(): void {
  for (const id of GUIDE_CONTEXT_IDS) {
    const definition = definitions[id];
    if (!definition || definition.guideIds.length === 0) throw new Error(`empty_guide_context:${id}`);
    if (new Set(definition.guideIds).size !== definition.guideIds.length) throw new Error(`duplicate_contextual_guide:${id}`);
    for (const guideId of definition.guideIds) {
      if (!GUIDE_IDS.includes(guideId)) throw new Error(`unknown_contextual_guide:${id}:${guideId}`);
    }
  }
}
