import type { Locale } from '@logic-estancia/config';
import type { PlanLevel } from '@logic-estancia/domain';

/** One stage of the illustrated service flow, from the guest to daily operations. */
export interface ServiceMapStage {
  id: 'guest' | 'web' | 'enquiry' | 'workspace' | 'operations';
  index: string;
  name: string;
  role: string;
  details: readonly string[];
  /** The lowest plan that covers this stage; `null` for the guest, who is outside any plan. */
  from: PlanLevel | null;
}

export interface ServiceMapCoverage {
  plan: PlanLevel;
  name: string;
  /** Number of stages covered, counted from the guest (the guest is always included). */
  span: number;
  label: string;
}

export interface ServiceMapContent {
  eyebrow: string;
  title: string;
  lead: string;
  flowLabel: string;
  coverageTitle: string;
  coverageLabel: string;
  serviceTitle: string;
  service: readonly string[];
  note: string;
  plansCta: string;
  stages: readonly ServiceMapStage[];
  coverage: readonly ServiceMapCoverage[];
  handoffs: readonly string[];
}

const content: Record<Locale, ServiceMapContent> = {
  es: {
    eyebrow: 'Cómo funciona',
    title: 'Tres piezas que trabajan como una sola.',
    lead: 'Tu web atrae y explica. El gestor ordena lo que llega. El equipo de Logic2B lo configura y lo mantiene. Así encaja cada pieza, de la primera visita a la llegada del huésped.',
    flowLabel: 'Esquema del recorrido: del huésped a la operación diaria',
    coverageTitle: 'Qué cubre cada plan',
    coverageLabel: 'Cobertura de cada plan sobre el recorrido',
    serviceTitle: 'Debajo de todo: el servicio de Logic2B',
    service: ['Implantación y configuración', 'Hosting y mantenimiento técnico', 'Soporte base y revisión contigo'],
    note: 'Esquema ilustrativo con datos ficticios. Las demos no envían solicitudes ni ejecutan reservas, pagos, mensajes o sincronizaciones.',
    plansCta: 'Comparar los tres planes',
    handoffs: ['visita', 'consulta', 'contexto', 'prioridad'],
    stages: [
      { id: 'guest', index: '00', name: 'Huésped', role: 'Busca, compara y decide dónde alojarse.', details: ['Buscadores', 'Redes y recomendaciones'], from: null },
      { id: 'web', index: '01', name: 'Tu web', role: 'Presenta el alojamiento con tu marca y abre una consulta directa.', details: ['Diseño y marca', 'SEO y contenido', 'Contacto directo'], from: 'basico' },
      { id: 'enquiry', index: '02', name: 'Solicitud', role: 'Llega con fechas, huéspedes y alojamiento, lista para revisar.', details: ['Fechas', 'Huéspedes', 'Alternativa'], from: 'gestion' },
      { id: 'workspace', index: '03', name: 'Gestor', role: 'Solicitudes, planning y huéspedes comparten una misma vista.', details: ['Solicitudes', 'Planning', 'Huéspedes'], from: 'gestion' },
      { id: 'operations', index: '04', name: 'Operación', role: 'Llegadas, limpieza, mantenimiento e ingresos, con supervisión humana.', details: ['Equipo y tareas', 'Ingresos', 'Copiloto supervisado'], from: 'inteligente' },
    ],
    coverage: [
      { plan: 'basico', name: 'Básico', span: 2, label: 'Web + consulta directa' },
      { plan: 'gestion', name: 'Gestión', span: 4, label: 'Web + solicitudes, planning y huéspedes' },
      { plan: 'inteligente', name: 'Inteligente', span: 5, label: 'Web + gestor + operación e ingresos' },
    ],
  },
  en: {
    eyebrow: 'How it works',
    title: 'Three pieces that work as one.',
    lead: 'Your website attracts and explains. The workspace organises what arrives. The Logic2B team configures and maintains it. Here is how each piece fits, from the first visit to the guest’s arrival.',
    flowLabel: 'Journey diagram: from the guest to daily operations',
    coverageTitle: 'What each plan covers',
    coverageLabel: 'Coverage of each plan across the journey',
    serviceTitle: 'Underneath it all: the Logic2B service',
    service: ['Setup and configuration', 'Hosting and technical maintenance', 'Base support and reviews with you'],
    note: 'Illustrative diagram with fictional data. Demos send no enquiries and run no bookings, payments, messages or syncs.',
    plansCta: 'Compare the three plans',
    handoffs: ['visit', 'enquiry', 'context', 'priority'],
    stages: [
      { id: 'guest', index: '00', name: 'Guest', role: 'Searches, compares and decides where to stay.', details: ['Search engines', 'Social and referrals'], from: null },
      { id: 'web', index: '01', name: 'Your website', role: 'Presents the property under your brand and opens a direct enquiry.', details: ['Design and brand', 'SEO and content', 'Direct contact'], from: 'basico' },
      { id: 'enquiry', index: '02', name: 'Enquiry', role: 'Arrives with dates, guests and property, ready to review.', details: ['Dates', 'Guests', 'Alternative'], from: 'gestion' },
      { id: 'workspace', index: '03', name: 'Workspace', role: 'Enquiries, planning and guests share a single view.', details: ['Enquiries', 'Planning', 'Guests'], from: 'gestion' },
      { id: 'operations', index: '04', name: 'Operations', role: 'Arrivals, cleaning, maintenance and revenue, with human supervision.', details: ['Team and tasks', 'Revenue', 'Supervised copilot'], from: 'inteligente' },
    ],
    coverage: [
      { plan: 'basico', name: 'Basic', span: 2, label: 'Website + direct enquiry' },
      { plan: 'gestion', name: 'Management', span: 4, label: 'Website + enquiries, planning and guests' },
      { plan: 'inteligente', name: 'Intelligent', span: 5, label: 'Website + workspace + operations and revenue' },
    ],
  },
};

export function getServiceMap(locale: Locale): ServiceMapContent {
  return content[locale];
}
