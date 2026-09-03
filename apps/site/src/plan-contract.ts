import type { Locale } from '@logic-estancia/config';
import type { PlanLevel } from '@logic-estancia/domain';

export type PlanWebSlug = 'nivora' | 'terrava' | 'aurem';
export type PlanPanelSlug = 'none' | 'terrava' | 'aurem';
export type PlanHandoffSource = '/' | '/planes/' | '/en/' | '/en/plans/' | '/webs/' | '/en/webs/';
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
      summary: 'Una web de marca gestionada para que te encuentren, te entiendan y abran una conversación directa.',
      visibleLabel: 'Qué puedes comprobar', visible: ['Web de marca gestionada', 'Fundamentos SEO y contenido', 'Acompañamiento de Logic2B'],
      boundaryLabel: 'Límite visible', boundary: 'Sin dashboard, inventario, reservas, pagos ni solicitudes enviadas desde la demo.',
      webSlug: 'nivora', panelSlug: 'none', previewTitle: 'Web editorial de Nivora One', previewNote: 'Web responsive · demo local · sin disponibilidad real',
      previewItems: ['Historia propia', 'Navegación clara', 'Puerta a contacto'], webCta: 'Ver web demo', panelCta: '', assessCta: 'Evaluar este plan',
    },
    {
      id: 'gestion', number: '01', name: 'Gestión',
      summary: 'Continuidad para solicitudes, reservas, planning y huéspedes sin reconstruir cada historia entre herramientas.',
      visibleLabel: 'Qué puedes comprobar', visible: ['Solicitudes y alternativas', 'Planning y tarifas', 'Huéspedes e informes'],
      boundaryLabel: 'Límite visible', boundary: 'Workspace ficticio de solo lectura; no confirma reservas, cambia tarifas ni envía comunicaciones.',
      webSlug: 'terrava', panelSlug: 'terrava', previewTitle: 'Web + workspace Terrava Collection', previewNote: 'Web y gestor · demo local · solo lectura',
      previewItems: ['Solicitudes', 'Planning', 'Huéspedes'], webCta: 'Ver web demo', panelCta: 'Ver gestor demo', assessCta: 'Evaluar este plan',
    },
    {
      id: 'inteligente', number: '02', name: 'Inteligente',
      summary: 'Un centro operativo para priorizar llegadas, equipos, incidencias e ingresos con revisión humana.',
      visibleLabel: 'Qué puedes comprobar', visible: ['Operación, limpieza y mantenimiento', 'Roles y lectura de revenue', 'Copiloto supervisado local'],
      boundaryLabel: 'Límite visible', boundary: 'No ejecuta tareas, mensajes, canales, IA ni cambios en sistemas reales; todo requiere alcance validado.',
      webSlug: 'aurem', panelSlug: 'aurem', previewTitle: 'Web + centro operativo Aurem Hotel', previewNote: 'Web y gestor · demo local · acciones bloqueadas',
      previewItems: ['Llegadas', 'Operación', 'Supervisión'], webCta: 'Ver web demo', panelCta: 'Ver gestor demo', assessCta: 'Evaluar este plan',
    },
  ],
  en: [
    {
      id: 'basico', number: '00', name: 'Basic',
      summary: 'A managed brand website to be found, understood and start a direct commercial conversation.',
      visibleLabel: 'What you can check', visible: ['Managed brand website', 'SEO and content foundations', 'Logic2B support'],
      boundaryLabel: 'Visible boundary', boundary: 'No workspace, inventory, bookings, payments or enquiries sent from the demo.',
      webSlug: 'nivora', panelSlug: 'none', previewTitle: 'Nivora One editorial website', previewNote: 'Responsive website · local demo · no live availability',
      previewItems: ['Owned story', 'Clear navigation', 'Route to contact'], webCta: 'View web demo', panelCta: '', assessCta: 'Assess this plan',
    },
    {
      id: 'gestion', number: '01', name: 'Management',
      summary: 'Continuity for enquiries, bookings, planning and guests without rebuilding every story across tools.',
      visibleLabel: 'What you can check', visible: ['Enquiries and alternatives', 'Planning and rates', 'Guests and reports'],
      boundaryLabel: 'Visible boundary', boundary: 'Fictitious read-only workspace; it confirms no booking, changes no rates and sends no communication.',
      webSlug: 'terrava', panelSlug: 'terrava', previewTitle: 'Terrava Collection website + workspace', previewNote: 'Website and workspace · local demo · read-only',
      previewItems: ['Enquiries', 'Planning', 'Guests'], webCta: 'View web demo', panelCta: 'View workspace demo', assessCta: 'Assess this plan',
    },
    {
      id: 'inteligente', number: '02', name: 'Intelligent',
      summary: 'An operations centre to prioritise arrivals, teams, incidents and revenue with human review.',
      visibleLabel: 'What you can check', visible: ['Operations, cleaning and maintenance', 'Roles and revenue view', 'Local supervised copilot'],
      boundaryLabel: 'Visible boundary', boundary: 'It runs no task, message, channel, AI or live system change; everything needs an agreed scope.',
      webSlug: 'aurem', panelSlug: 'aurem', previewTitle: 'Aurem Hotel website + operations centre', previewNote: 'Website and workspace · local demo · actions blocked',
      previewItems: ['Arrivals', 'Operations', 'Supervision'], webCta: 'View web demo', panelCta: 'View workspace demo', assessCta: 'Assess this plan',
    },
  ],
};

export function getPlanCards(locale: Locale): readonly PlanCardData[] {
  return cards[locale];
}

export function planHandoffHref(locale: Locale, plan: PlanCardData, sourcePath: PlanHandoffSource, segment: PlanHandoffSegment = 'unknown'): string {
  const prefix = locale === 'en' ? '/en' : '';
  const assessment = locale === 'en' ? 'assessment' : 'diagnostico';
  const params = new URLSearchParams({
    plan: plan.id,
    web: plan.webSlug,
    panel: plan.panelSlug,
    segment,
    sourcePath,
  });
  return `${prefix}/${assessment}/?${params.toString()}`;
}
