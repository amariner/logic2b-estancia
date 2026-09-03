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
export type PanelPreviewKind = 'enquiries' | 'planning' | 'guests-arrivals' | 'preparation';

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
    id: 'guests-arrivals', number: '03', plan: 'gestion', status: 'published',
    capabilityIds: ['guest-context'], evidenceCapabilityId: 'guest-context', preview: 'guests-arrivals',
    copy: {
      es: {
        slug: 'huespedes-llegadas', title: 'Huéspedes y llegadas',
        summary: 'El contexto de una estancia reúne titular, origen y estado para preparar una llegada sin convertir la demo en un registro de viajeros.',
        decision: 'Consultar la información mínima antes de recibir al huésped sin duplicarla entre herramientas.',
        outcome: 'El equipo distingue una consulta recibida de una estancia en casa usando únicamente datos ficticios.',
        visiblePoints: ['Marina Costa y M. Laurent como casos ficticios', 'Emails reservados bajo example.test', 'Origen de la estancia', 'Estado de cada huésped'],
        flow: ['La solicitud conserva el contexto', 'La tabla muestra solo los campos necesarios', 'El equipo consulta el estado', 'Cualquier registro real queda fuera de la demo'],
      },
      en: {
        slug: 'guests-arrivals', title: 'Guests and arrivals',
        summary: 'Stay context brings together holder, source and status to prepare an arrival without turning the demo into a traveller register.',
        decision: 'Check the minimum information before welcoming a guest without duplicating it across tools.',
        outcome: 'The team distinguishes a received enquiry from an in-house stay using fictitious data only.',
        visiblePoints: ['Marina Costa and M. Laurent as fictitious cases', 'Reserved example.test email addresses', 'Source of the stay', 'Status of each guest'],
        flow: ['The enquiry keeps its context', 'The table shows only the needed fields', 'The team checks the status', 'Every live registration remains outside the demo'],
      },
    },
  },
  {
    id: 'preparation', number: '04', plan: 'inteligente', status: 'published',
    capabilityIds: ['cleaning', 'operations-centre'], evidenceCapabilityId: 'cleaning', preview: 'preparation',
    copy: {
      es: {
        slug: 'preparacion', title: 'Preparación',
        summary: 'Habitación, ventana de preparación y checklist comparten una vista para que la validación final siga teniendo responsable humano.',
        decision: 'Ver qué falta y quién debe revisar la habitación antes de la llegada.',
        outcome: 'Una persona lee estado y checklist precargados; la demo no asigna, valida ni actualiza habitaciones.',
        visiblePoints: ['Habitación ficticia 408 · Terrace', 'Salida 11:08 y llegada 15:00', 'Estado Pendiente', 'Checklist de limpieza y validación de recepción'],
        flow: ['La salida abre una ventana de preparación', 'El fixture muestra el estado pendiente', 'Limpieza y recepción leen sus responsabilidades', 'La validación real permanece fuera de la demo'],
      },
      en: {
        slug: 'preparation', title: 'Preparation',
        summary: 'Room, preparation window and checklist share one view so final validation keeps a human owner.',
        decision: 'See what remains and who must review the room before arrival.',
        outcome: 'A person reads preloaded status and checklist; the demo assigns, validates or updates no room.',
        visiblePoints: ['Fictitious room 408 · Terrace', 'Departure 11:08 and arrival 15:00', 'Pending status', 'Housekeeping and reception validation checklist'],
        flow: ['Departure opens a preparation window', 'The fixture shows the pending status', 'Housekeeping and reception read their responsibilities', 'Live validation remains outside the demo'],
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
