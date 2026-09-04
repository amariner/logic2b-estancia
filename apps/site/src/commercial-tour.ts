import type { Locale } from '@logic-estancia/config';
import type { PlanLevel } from '@logic-estancia/domain';
import { getPublishedPanels, type PanelId, type PanelPreviewKind } from './panel-portfolio';
import { getCanonicalWebPortfolio } from './web-portfolio';

export const COMMERCIAL_TOUR_STEP_IDS = [
  'brand-web',
  'enquiries',
  'planning',
  'preparation',
  'operations',
] as const;

export type CommercialTourStepId = (typeof COMMERCIAL_TOUR_STEP_IDS)[number];

interface CommercialTourStepBase {
  id: CommercialTourStepId;
  number: string;
  phase: string;
  title: string;
  summary: string;
  decision: string;
  outcome: string;
  boundary: string;
  plan: PlanLevel;
  planLabel: string;
  detailHref: string;
  evidenceHref: string;
  evidenceLabel: string;
}

export type CommercialTourStep =
  | (CommercialTourStepBase & { kind: 'web'; image: string; imageAlt: string })
  | (CommercialTourStepBase & { kind: 'panel'; preview: PanelPreviewKind });

const phases: Record<Locale, Record<CommercialTourStepId, string>> = {
  es: {
    'brand-web': 'Descubrimiento',
    enquiries: 'Solicitud',
    planning: 'Decisión',
    preparation: 'Preparación',
    operations: 'Lectura operativa',
  },
  en: {
    'brand-web': 'Discovery',
    enquiries: 'Enquiry',
    planning: 'Decision',
    preparation: 'Preparation',
    operations: 'Operations view',
  },
};

const evidenceLabels: Record<Locale, { web: string; panel: string }> = {
  es: { web: 'Abrir ficha web en otra pestaña', panel: 'Abrir ficha del panel en otra pestaña' },
  en: { web: 'Open website page in a new tab', panel: 'Open workspace page in a new tab' },
};

const panelSteps: readonly { id: CommercialTourStepId; panelId: PanelId }[] = [
  { id: 'enquiries', panelId: 'enquiries' },
  { id: 'planning', panelId: 'planning' },
  { id: 'preparation', panelId: 'preparation' },
  { id: 'operations', panelId: 'operations-revenue' },
];

export function getCommercialTour(locale: Locale): readonly CommercialTourStep[] {
  const web = getCanonicalWebPortfolio(locale).find(({ slug }) => slug === 'nivora');
  if (!web) throw new Error('missing_commercial_tour_web:nivora');

  const route = locale === 'en' ? '/en/webs/nivora/' : '/webs/nivora/';
  const steps: CommercialTourStep[] = [{
    id: 'brand-web',
    number: '01',
    phase: phases[locale]['brand-web'],
    title: web.brand,
    summary: web.summary,
    decision: web.businessProblem,
    outcome: web.visualIntent,
    boundary: web.boundary,
    plan: web.plan,
    planLabel: web.planLabel,
    detailHref: route,
    evidenceHref: web.demoHref,
    evidenceLabel: evidenceLabels[locale].web,
    kind: 'web',
    image: web.image,
    imageAlt: web.imageAlt,
  }];

  const panels = new Map(getPublishedPanels(locale).map((panel) => [panel.id, panel]));
  panelSteps.forEach(({ id, panelId }, index) => {
    const panel = panels.get(panelId);
    if (!panel?.detailHref || !panel.evidenceHref || !panel.preview) throw new Error(`missing_commercial_tour_panel:${panelId}`);
    steps.push({
      id,
      number: `0${index + 2}`,
      phase: phases[locale][id],
      title: panel.title,
      summary: panel.summary,
      decision: panel.decision,
      outcome: panel.outcome,
      boundary: panel.evidenceCapability.evidence.boundary[locale],
      plan: panel.plan,
      planLabel: panel.planLabel,
      detailHref: panel.detailHref,
      evidenceHref: panel.evidenceHref,
      evidenceLabel: evidenceLabels[locale].panel,
      kind: 'panel',
      preview: panel.preview,
    });
  });

  return steps;
}
