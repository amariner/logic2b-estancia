import type { Locale } from '@logic-estancia/config';
import { CAPABILITIES, type Capability, type PlanLevel } from '@logic-estancia/domain';
import { capabilityEvidenceHref } from './capability-evidence';

export const PANEL_IDS = [
  'enquiries',
  'planning',
  'guests-arrivals',
  'preparation',
  'operations-revenue',
  'copilot',
] as const;

export type PanelId = (typeof PANEL_IDS)[number];
export type PanelPublicationStatus = 'published' | 'preparation';
export type PanelPreviewKind = 'enquiries' | 'planning';

interface LocalizedPanelCopy {
  slug: string;
  title: string;
  summary: string;
  decision: string;
  outcome: string;
  visiblePoints: readonly string[];
  flow: readonly string[];
}

interface PanelDefinition {
  id: PanelId;
  number: string;
  plan: PlanLevel;
  status: PanelPublicationStatus;
  capabilityIds: readonly string[];
  evidenceCapabilityId: string;
  preview: PanelPreviewKind | null;
  copy: Record<Locale, LocalizedPanelCopy>;
}

export interface PanelPortfolioItem extends LocalizedPanelCopy {
  id: PanelId;
  number: string;
  plan: PlanLevel;
  planLabel: string;
  status: PanelPublicationStatus;
  statusLabel: string;
  capabilityIds: readonly string[];
  evidenceCapability: Capability;
  evidenceHref: string | null;
  detailHref: string | null;
  alternateSlug: string;
  preview: PanelPreviewKind | null;
}

const definitions: readonly PanelDefinition[] = [
  {
    id: 'enquiries', number: '01', plan: 'gestion', status: 'published',
    capabilityIds: ['enquiry-workspace'], evidenceCapabilityId: 'enquiry-workspace', preview: 'enquiries',
    copy: {
      es: {
        slug: 'solicitudes', title: 'Solicitudes',
        summary: 'Fechas, huéspedes, alojamiento y alternativa permanecen juntos para revisar una consulta sin empezar de cero.',
        decision: 'Responder con contexto antes de convertir una conversación en reserva.',
        outcome: 'Una persona compara el caso original y una alternativa preparada sin enviar ni confirmar nada.',
        visiblePoints: ['Caso ficticio REQ-024', 'Fechas y número de huéspedes', 'Alojamiento solicitado', 'Alternativa comparable con precio de muestra'],
        flow: ['La solicitud conserva el contexto', 'El equipo detecta el desajuste', 'La alternativa queda visible', 'Una persona decide el siguiente paso'],
      },
      en: {
        slug: 'enquiries', title: 'Enquiries',
        summary: 'Dates, guests, property and alternative stay together so a request can be reviewed without starting again.',
        decision: 'Reply with context before turning a conversation into a booking.',
        outcome: 'A person compares the original case and a prepared alternative without sending or confirming anything.',
        visiblePoints: ['Fictitious case REQ-024', 'Dates and guest count', 'Requested property', 'Comparable alternative with a sample price'],
        flow: ['The enquiry keeps its context', 'The team spots the mismatch', 'The alternative becomes visible', 'A person decides the next step'],
      },
    },
  },
  {
    id: 'planning', number: '02', plan: 'gestion', status: 'published',
    capabilityIds: ['planning'], evidenceCapabilityId: 'planning', preview: 'planning',
    copy: {
      es: {
        slug: 'planning', title: 'Planning',
        summary: 'Un calendario común permite leer estancias, propiedades y una alternativa sin confundir la vista con inventario real.',
        decision: 'Comprobar encaje y carga antes de proponer o preparar una estancia.',
        outcome: 'El equipo comparte una lectura de catorce días y mantiene cualquier cambio real fuera de la demo.',
        visiblePoints: ['Ocho propiedades ficticias', 'Ventana visual de catorce días', 'Estancias de muestra', 'Alternativa de Casa Bruma señalada'],
        flow: ['El caso llega con fechas', 'El calendario muestra el encaje', 'La alternativa conserva el contexto', 'La decisión sigue siendo humana'],
      },
      en: {
        slug: 'planning', title: 'Planning',
        summary: 'A shared calendar makes stays, properties and an alternative readable without presenting the view as live inventory.',
        decision: 'Check fit and workload before proposing or preparing a stay.',
        outcome: 'The team shares a fourteen-day view while every live change remains outside the demo.',
        visiblePoints: ['Eight fictitious properties', 'Fourteen-day visual window', 'Sample stays', 'Casa Bruma alternative highlighted'],
        flow: ['The case arrives with dates', 'The calendar shows the fit', 'The alternative keeps its context', 'The decision remains human'],
      },
    },
  },
  {
    id: 'guests-arrivals', number: '03', plan: 'gestion', status: 'preparation',
    capabilityIds: ['enquiry-workspace', 'operations-centre'], evidenceCapabilityId: 'enquiry-workspace', preview: null,
    copy: {
      es: {
        slug: 'huespedes-llegadas', title: 'Huéspedes y llegadas',
        summary: 'Ficha prevista para explicar cómo el contexto de una estancia acompaña a la llegada sin crear registros reales.',
        decision: 'Preparar la llegada con la información necesaria y el mínimo acceso.', outcome: '', visiblePoints: [], flow: [],
      },
      en: {
        slug: 'guests-arrivals', title: 'Guests and arrivals',
        summary: 'Planned page for explaining how stay context reaches arrival without creating live guest records.',
        decision: 'Prepare arrival with the necessary information and minimum access.', outcome: '', visiblePoints: [], flow: [],
      },
    },
  },
  {
    id: 'preparation', number: '04', plan: 'inteligente', status: 'preparation',
    capabilityIds: ['cleaning', 'maintenance'], evidenceCapabilityId: 'cleaning', preview: null,
    copy: {
      es: {
        slug: 'preparacion', title: 'Preparación',
        summary: 'Ficha prevista para reunir limpieza, estado de habitación y revisión humana antes de una llegada.',
        decision: 'Ver qué falta, quién revisa y qué no puede darse por terminado.', outcome: '', visiblePoints: [], flow: [],
      },
      en: {
        slug: 'preparation', title: 'Preparation',
        summary: 'Planned page bringing together cleaning, room status and human review before arrival.',
        decision: 'See what remains, who reviews it and what cannot yet be considered ready.', outcome: '', visiblePoints: [], flow: [],
      },
    },
  },
  {
    id: 'operations-revenue', number: '05', plan: 'inteligente', status: 'preparation',
    capabilityIds: ['operations-centre', 'basic-reports', 'revenue'], evidenceCapabilityId: 'operations-centre', preview: null,
    copy: {
      es: {
        slug: 'operacion-ingresos', title: 'Operación e ingresos',
        summary: 'Ficha prevista para separar prioridades operativas, métricas explicables y previsión todavía no disponible.',
        decision: 'Distinguir la señal que requiere atención de una predicción que la demo no puede sostener.', outcome: '', visiblePoints: [], flow: [],
      },
      en: {
        slug: 'operations-revenue', title: 'Operations and revenue',
        summary: 'Planned page separating operating priorities, explainable metrics and forecasting that is not yet available.',
        decision: 'Separate a signal needing attention from a prediction the demo cannot support.', outcome: '', visiblePoints: [], flow: [],
      },
    },
  },
  {
    id: 'copilot', number: '06', plan: 'inteligente', status: 'preparation',
    capabilityIds: ['supervised-ai'], evidenceCapabilityId: 'supervised-ai', preview: null,
    copy: {
      es: {
        slug: 'copiloto-supervisado', title: 'Copiloto supervisado',
        summary: 'Ficha prevista para mostrar edición, fuentes, versiones y revisión humana con envío bloqueado.',
        decision: 'Revisar un borrador local sin confundirlo con una respuesta generada o enviada.', outcome: '', visiblePoints: [], flow: [],
      },
      en: {
        slug: 'supervised-copilot', title: 'Supervised copilot',
        summary: 'Planned page showing editing, sources, versions and human review with delivery blocked.',
        decision: 'Review a local draft without presenting it as generated or sent.', outcome: '', visiblePoints: [], flow: [],
      },
    },
  },
] as const;

const capabilities = new Map(CAPABILITIES.map((capability) => [capability.id, capability]));
const planLabels: Record<Locale, Record<PlanLevel, string>> = {
  es: { basico: 'Básico', gestion: 'Gestión', inteligente: 'Inteligente' },
  en: { basico: 'Basic', gestion: 'Management', inteligente: 'Intelligent' },
};

function getCapability(id: string): Capability {
  const capability = capabilities.get(id);
  if (!capability) throw new Error(`missing_panel_capability:${id}`);
  return capability;
}

export function getPanelPortfolio(locale: Locale): readonly PanelPortfolioItem[] {
  const prefix = locale === 'en' ? '/en' : '';
  const route = locale === 'en' ? 'panels' : 'paneles';
  const otherLocale: Locale = locale === 'en' ? 'es' : 'en';
  return definitions.map((definition) => {
    const copy = definition.copy[locale];
    const evidenceCapability = getCapability(definition.evidenceCapabilityId);
    const published = definition.status === 'published';
    return {
      ...definition,
      ...copy,
      planLabel: planLabels[locale][definition.plan],
      statusLabel: published
        ? (locale === 'en' ? 'Navigable page' : 'Ficha navegable')
        : (locale === 'en' ? 'Page in preparation' : 'Ficha en preparación'),
      evidenceCapability,
      evidenceHref: published ? capabilityEvidenceHref(evidenceCapability, locale) : null,
      detailHref: published ? `${prefix}/${route}/${copy.slug}/` : null,
      alternateSlug: definition.copy[otherLocale].slug,
    };
  });
}

export function getPublishedPanels(locale: Locale): readonly PanelPortfolioItem[] {
  return getPanelPortfolio(locale).filter((panel) => panel.status === 'published');
}

export function getPanelBySlug(locale: Locale, slug: string): PanelPortfolioItem | undefined {
  return getPublishedPanels(locale).find((panel) => panel.slug === slug);
}
