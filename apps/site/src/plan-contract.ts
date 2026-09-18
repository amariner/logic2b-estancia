import type { Locale } from '@logic-estancia/config';
import type { PlanLevel } from '@logic-estancia/domain';

export type PlanWebSlug = 'nivora' | 'terrava' | 'aurem';
export type PlanPanelSlug = 'none' | 'terrava' | 'aurem';
export const PLAN_HANDOFF_SOURCES = ['/', '/planes/', '/en/', '/en/plans/', '/webs/', '/en/webs/', '/paneles/', '/en/panels/', '/recorrido/', '/en/journey/', '/soluciones/casas-rurales/', '/en/solutions/rural-stays/'] as const;
export type PlanHandoffSource = (typeof PLAN_HANDOFF_SOURCES)[number];
export const ASSESSMENT_NEEDS = { enquiries: 'bookingNeeds', planning: 'bookingNeeds', cleaning: 'operationNeeds', metrics: 'operationNeeds' } as const;
export type AssessmentNeed = keyof typeof ASSESSMENT_NEEDS;
export type PlanHandoffSegment = 'rural' | 'apartments' | 'hotels' | 'unknown';

export interface PlanCardData {
  id: PlanLevel;
  number: string;
  name: string;
  summary: string;
  visibleLabel: string;
  visible: readonly string[];
  boundaryLabel: string;
  boundary: string;
  webSlug: PlanWebSlug;
  panelSlug: PlanPanelSlug;
  previewTitle: string;
  previewNote: string;
  previewItems: readonly string[];
  webCta: string;
  panelCta: string;
  assessCta: string;
}

const cards: Record<Locale, readonly PlanCardData[]> = {
  es: [
    {
      id: 'basico', number: '00', name: 'Básico',
      summary: 'Tu propia web para presentar el alojamiento y recibir consultas directas.',
      visibleLabel: 'Áreas del proyecto', visible: ['Web de marca gestionada', 'Fundamentos SEO y contenido', 'Acompañamiento de Logic2B'],
      boundaryLabel: 'Límite visible', boundary: 'Sin dashboard, inventario, reservas, pagos ni solicitudes enviadas desde la demo.',
      webSlug: 'nivora', panelSlug: 'none', previewTitle: 'Web editorial de Nivora One', previewNote: 'Web responsive · demo local · sin disponibilidad real',
      previewItems: ['Historia propia', 'Navegación clara', 'Puerta a contacto'], webCta: 'Ver web demo', panelCta: '', assessCta: 'Evaluar este plan',
    },
    {
      id: 'gestion', number: '01', name: 'Gestión',
      summary: 'Web y gestor para reunir solicitudes, reservas y huéspedes en un mismo lugar.',
      visibleLabel: 'Áreas del proyecto', visible: ['Solicitudes y alternativas', 'Planning y tarifas', 'Huéspedes e informes'],
      boundaryLabel: 'Límite visible', boundary: 'Datos ficticios y cambios solo locales. No confirma reservas ni envía comunicaciones reales.',
      webSlug: 'terrava', panelSlug: 'terrava', previewTitle: 'Web + gestor Terrava Collection', previewNote: 'Web y gestor · datos ficticios · cambios locales',
      previewItems: ['Solicitudes', 'Planning', 'Huéspedes'], webCta: 'Ver web demo', panelCta: 'Ver gestor demo', assessCta: 'Evaluar este plan',
    },
    {
      id: 'inteligente', number: '02', name: 'Inteligente',
      summary: 'Web y gestión avanzada para coordinar equipos, tareas e ingresos.',
      visibleLabel: 'Áreas del proyecto', visible: ['Operación, limpieza y mantenimiento', 'Roles e informes de ingresos', 'Copiloto supervisado local'],
      boundaryLabel: 'Límite visible', boundary: 'No ejecuta tareas, mensajes, canales, IA ni cambios en sistemas reales; todo requiere alcance validado.',
      webSlug: 'aurem', panelSlug: 'aurem', previewTitle: 'Web + centro operativo Aurem Hotel', previewNote: 'Web y gestor · demo local · acciones bloqueadas',
      previewItems: ['Llegadas', 'Operación', 'Supervisión'], webCta: 'Ver web demo', panelCta: 'Ver gestor demo', assessCta: 'Evaluar este plan',
    },
  ],
  en: [
    {
      id: 'basico', number: '00', name: 'Basic',
      summary: 'Your own website to showcase your accommodation and receive direct enquiries.',
      visibleLabel: 'Project areas', visible: ['Managed brand website', 'SEO and content foundations', 'Logic2B support'],
      boundaryLabel: 'Visible boundary', boundary: 'No workspace, inventory, bookings, payments or enquiries sent from the demo.',
      webSlug: 'nivora', panelSlug: 'none', previewTitle: 'Nivora One editorial website', previewNote: 'Responsive website · local demo · no live availability',
      previewItems: ['Owned story', 'Clear navigation', 'Route to contact'], webCta: 'View web demo', panelCta: '', assessCta: 'Assess this plan',
    },
    {
      id: 'gestion', number: '01', name: 'Management',
      summary: 'Website and workspace to bring enquiries, bookings and guests together.',
      visibleLabel: 'Project areas', visible: ['Enquiries and alternatives', 'Planning and rates', 'Guests and reports'],
      boundaryLabel: 'Visible boundary', boundary: 'Fictional data and local changes only. No live booking confirmation or communication.',
      webSlug: 'terrava', panelSlug: 'terrava', previewTitle: 'Terrava Collection website + workspace', previewNote: 'Website and workspace · fictional data · local changes',
      previewItems: ['Enquiries', 'Planning', 'Guests'], webCta: 'View web demo', panelCta: 'View workspace demo', assessCta: 'Assess this plan',
    },
    {
      id: 'inteligente', number: '02', name: 'Intelligent',
      summary: 'Website and advanced management to coordinate teams, tasks and revenue.',
      visibleLabel: 'Project areas', visible: ['Operations, cleaning and maintenance', 'Roles and revenue view', 'Local supervised copilot'],
      boundaryLabel: 'Visible boundary', boundary: 'It runs no task, message, channel, AI or live system change; everything needs an agreed scope.',
      webSlug: 'aurem', panelSlug: 'aurem', previewTitle: 'Aurem Hotel website + operations centre', previewNote: 'Website and workspace · local demo · actions blocked',
      previewItems: ['Arrivals', 'Operations', 'Supervision'], webCta: 'View web demo', panelCta: 'View workspace demo', assessCta: 'Assess this plan',
    },
  ],
};

export function getPlanCards(locale: Locale): readonly PlanCardData[] {
  return cards[locale];
}

export function planHandoffHref(locale: Locale, plan: PlanCardData, sourcePath: PlanHandoffSource, segment: PlanHandoffSegment = 'unknown', need?: AssessmentNeed): string {
  const prefix = locale === 'en' ? '/en' : '';
  const assessment = locale === 'en' ? 'assessment' : 'diagnostico';
  const params = new URLSearchParams({
    plan: plan.id,
    web: plan.webSlug,
    panel: plan.panelSlug,
    segment,
    sourcePath,
  });
  if (need) params.set('need', need);
  return `${prefix}/${assessment}/?${params.toString()}`;
}
