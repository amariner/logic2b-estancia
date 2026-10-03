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
        summary: 'Comprueba fechas, compara alternativas y continúa una solicitud hasta su estancia ficticia sin perder el contexto.',
        decision: 'Resolver un conflicto de disponibilidad antes de confirmar una estancia de muestra.',
        outcome: 'Una persona confirma en memoria y puede modificar o cancelar el caso con opción de deshacer el último cambio; recargar reinicia la demo.',
        visiblePoints: ['Solicitud REQ-024', 'Disponibilidad y motivos de conflicto', 'Alternativas con noches e importe desglosado', 'Confirmación, modificación y cancelación ficticias'],
        flow: ['La solicitud conserva el contexto', 'Se comprueba el conflicto y la alternativa', 'Se confirma y se abre la estancia ficticia', 'El cambio se refleja en planning y puede deshacerse'],
      },
      en: {
        slug: 'enquiries', title: 'Enquiries',
        summary: 'Check dates, compare alternatives and continue an enquiry to its fictitious stay without losing context.',
        decision: 'Resolve an availability conflict before confirming a sample stay.',
        outcome: 'A person confirms in memory and can amend or cancel the case with an option to undo the last change; reloading resets the demo.',
        visiblePoints: ['Enquiry REQ-024', 'Availability and reasons for conflicts', 'Alternatives with nights and an amount breakdown', 'Fictitious confirmation, amendment and cancellation'],
        flow: ['The enquiry keeps its context', 'The conflict and alternative are checked', 'The fictitious stay is confirmed and opened', 'The change appears in planning and can be undone'],
      },
    },
  },
  {
    id: 'planning', number: '02', plan: 'gestion', status: 'published',
    capabilityIds: ['planning'], evidenceCapabilityId: 'planning', preview: 'planning',
    copy: {
      es: {
        slug: 'planning', title: 'Planning',
        summary: 'Un calendario común refleja las estancias de muestra y sus cambios, con filtro por propiedad.',
        decision: 'Comprobar encaje y carga antes de proponer o preparar una estancia.',
        outcome: 'El equipo consulta catorce días y abre el mismo detalle de estancia que nace de la solicitud ficticia.',
        visiblePoints: ['Ocho propiedades con filtro', 'Ventana visual de catorce días', 'Estancias con detalle compartido', 'Unidad fuera de servicio y conflictos visibles'],
        flow: ['El caso llega con fechas', 'El calendario muestra el encaje', 'La confirmación ficticia ocupa sus noches', 'Modificar o cancelar actualiza el mismo caso'],
      },
      en: {
        slug: 'planning', title: 'Planning',
        summary: 'A shared calendar reflects sample stays and their changes, with a property filter.',
        decision: 'Check fit and workload before proposing or preparing a stay.',
        outcome: 'The team explores fourteen days and opens the same stay detail created from the fictitious enquiry.',
        visiblePoints: ['Eight properties with a filter', 'Fourteen-day visual window', 'Stays with shared detail', 'Visible out-of-service unit and conflicts'],
        flow: ['The case arrives with dates', 'The calendar shows the fit', 'Fictitious confirmation occupies its nights', 'Amending or cancelling updates the same case'],
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
        outcome: 'El equipo abre las estancias ficticias confirmadas desde sus huéspedes; las canceladas dejan de aparecer en esta vista.',
        visiblePoints: ['Titulares y contactos de muestra', 'Fechas y alojamiento', 'Identificador de la estancia', 'Acceso al mismo detalle del planning'],
        flow: ['La solicitud conserva el contexto', 'Las fichas muestran titulares de muestra', 'El equipo abre el detalle compartido', 'Los cambios locales conservan la coherencia'],
      },
      en: {
        slug: 'guests-arrivals', title: 'Guests and arrivals',
        summary: 'Stay context brings together holder, source and status to prepare an arrival with the information at hand.',
        decision: 'Check the minimum information before welcoming a guest without duplicating it across tools.',
        outcome: 'The team opens confirmed fictitious stays from their guests; cancelled stays no longer appear in this view.',
        visiblePoints: ['Sample lead guests and contacts', 'Dates and property', 'Stay identifier', 'Access to the same details as planning'],
        flow: ['The enquiry keeps its context', 'The cards show sample lead guests', 'The team opens the shared detail', 'Local changes remain consistent'],
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
