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
export type PanelPreviewKind = 'enquiries' | 'planning' | 'guests-arrivals' | 'preparation' | 'operations-revenue' | 'copilot';

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
        outcome: 'Una persona compara el caso original y una alternativa preparada antes de decidir.',
        visiblePoints: ['Solicitud REQ-024', 'Fechas y número de huéspedes', 'Alojamiento solicitado', 'Alternativa comparable con precio desglosado'],
        flow: ['La solicitud conserva el contexto', 'El equipo detecta el desajuste', 'La alternativa queda visible', 'Una persona decide el siguiente paso'],
      },
      en: {
        slug: 'enquiries', title: 'Enquiries',
        summary: 'Dates, guests, property and alternative stay together so a request can be reviewed without starting again.',
        decision: 'Reply with context before turning a conversation into a booking.',
        outcome: 'A person compares the original case and a prepared alternative before deciding.',
        visiblePoints: ['Enquiry REQ-024', 'Dates and guest count', 'Requested property', 'Comparable alternative with a price breakdown'],
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
        summary: 'Un calendario común permite leer estancias, propiedades y una alternativa en un mismo lugar.',
        decision: 'Comprobar encaje y carga antes de proponer o preparar una estancia.',
        outcome: 'El equipo comparte una lectura de catorce días para anticipar llegadas y salidas.',
        visiblePoints: ['Ocho propiedades', 'Ventana visual de catorce días', 'Estancias por alojamiento', 'Alternativa de Casa Bruma señalada'],
        flow: ['El caso llega con fechas', 'El calendario muestra el encaje', 'La alternativa conserva el contexto', 'La decisión sigue siendo humana'],
      },
      en: {
        slug: 'planning', title: 'Planning',
        summary: 'A shared calendar makes stays, properties and an alternative readable in one place.',
        decision: 'Check fit and workload before proposing or preparing a stay.',
        outcome: 'The team shares a fourteen-day view to anticipate arrivals and departures.',
        visiblePoints: ['Eight properties', 'Fourteen-day visual window', 'Stays by property', 'Casa Bruma alternative highlighted'],
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
        summary: 'El contexto de una estancia reúne titular, origen y estado para preparar una llegada con la información a mano.',
        decision: 'Consultar la información mínima antes de recibir al huésped sin duplicarla entre herramientas.',
        outcome: 'El equipo distingue una consulta recibida de una estancia en casa.',
        visiblePoints: ['Titular y acompañantes', 'Datos de contacto', 'Origen de la estancia', 'Estado de cada huésped'],
        flow: ['La solicitud conserva el contexto', 'La tabla muestra solo los campos necesarios', 'El equipo consulta el estado', 'La llegada conserva su contexto'],
      },
      en: {
        slug: 'guests-arrivals', title: 'Guests and arrivals',
        summary: 'Stay context brings together holder, source and status to prepare an arrival with the information at hand.',
        decision: 'Check the minimum information before welcoming a guest without duplicating it across tools.',
        outcome: 'The team distinguishes a received enquiry from an in-house stay.',
        visiblePoints: ['Lead guest and companions', 'Contact details', 'Source of the stay', 'Status of each guest'],
        flow: ['The enquiry keeps its context', 'The table shows only the needed fields', 'The team checks the status', 'The arrival keeps its context'],
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
        outcome: 'Estado, horario y checklist facilitan la revisión antes de cada llegada.',
        visiblePoints: ['Habitación 408 · Terrace', 'Salida 11:08 y llegada 15:00', 'Estado Pendiente', 'Checklist de limpieza y validación de recepción'],
        flow: ['La salida abre una ventana de preparación', 'El ejemplo muestra el estado pendiente', 'Limpieza y recepción leen sus responsabilidades', 'La recepción revisa la preparación'],
      },
      en: {
        slug: 'preparation', title: 'Preparation',
        summary: 'Room, preparation window and checklist share one view so final validation keeps a human owner.',
        decision: 'See what remains and who must review the room before arrival.',
        outcome: 'Status, timing and checklist make pre-arrival review easier.',
        visiblePoints: ['Room 408 · Terrace', 'Departure 11:08 and arrival 15:00', 'Pending status', 'Housekeeping and reception validation checklist'],
        flow: ['Departure opens a preparation window', 'The example shows the pending status', 'Housekeeping and reception read their responsibilities', 'Reception reviews preparation'],
      },
    },
  },
  {
    id: 'operations-revenue', number: '05', plan: 'inteligente', status: 'published',
    capabilityIds: ['operations-centre', 'explainable-revenue', 'revenue'], evidenceCapabilityId: 'explainable-revenue', preview: 'operations-revenue',
    copy: {
      es: {
        slug: 'operacion-ingresos', title: 'Operación e ingresos',
        summary: 'Un escenario de 28 días reúne ocupación, ingresos y fórmulas para entender la evolución del alojamiento.',
        decision: 'Entender ocupación, tarifa media e ingresos con una lectura compartida.',
        outcome: 'El equipo contrasta cuatro semanas de actividad con indicadores y fórmulas claras.',
        visiblePoints: ['Habitaciones y noches disponibles', 'Ocupación e ingresos por periodo', 'ADR y RevPAR con fórmula', 'Comparación semanal'],
        flow: ['El periodo delimita las noches disponibles', 'El libro semanal muestra ocupación e ingresos', 'Cada indicador expone su fórmula', 'El equipo contrasta el resultado'],
      },
      en: {
        slug: 'operations-revenue', title: 'Operations and revenue',
        summary: 'A 28-day scenario brings occupancy, revenue and formulas together to explain how the property is performing.',
        decision: 'Understand occupancy, average rate and revenue through a shared view.',
        outcome: 'The team compares four weeks of activity through clear metrics and formulas.',
        visiblePoints: ['Rooms and available room nights', 'Occupancy and revenue by period', 'ADR and RevPAR with formulas', 'Weekly comparison'],
        flow: ['The period defines available room nights', 'The weekly ledger shows occupancy and revenue', 'Each indicator exposes its formula', 'The team compares the results'],
      },
    },
  },
  {
    id: 'copilot', number: '06', plan: 'inteligente', status: 'published',
    capabilityIds: ['supervised-ai', 'automation'], evidenceCapabilityId: 'supervised-ai', preview: 'copilot',
    copy: {
      es: {
        slug: 'copiloto-supervisado', title: 'Copiloto supervisado',
        summary: 'Prepara una respuesta, consulta sus fuentes y revisa los cambios antes de decidir.',
        decision: 'Revisar y versionar un borrador con responsabilidad humana con sus fuentes a mano.',
        outcome: 'El borrador conserva fuentes y versiones para facilitar la revisión del equipo.',
        visiblePoints: ['Borrador para Marina Costa', 'Fuentes AUR-812, política de entrada y habitación 408', 'Versiones y revisión humana por rol', 'Aprobación del equipo'],
        flow: ['El borrador reúne la información', 'Las fuentes hacen visible el contexto', 'Una persona revisa el borrador', 'La aprobación queda en manos del equipo'],
      },
      en: {
        slug: 'supervised-copilot', title: 'Supervised copilot',
        summary: 'Prepare a reply, check its sources and review changes before deciding.',
        decision: 'Review and version a draft with human ownership with its sources at hand.',
        outcome: 'The draft keeps sources and versions together for team review.',
        visiblePoints: ['Draft for Marina Costa', 'AUR-812, arrival policy and room 408 sources', 'Local version and role-based human review', 'Team approval'],
        flow: ['The draft brings information together', 'Sources make the context visible', 'A person reviews the draft', 'Approval stays with the team'],
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
