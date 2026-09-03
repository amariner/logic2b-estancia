import type { Locale } from '@logic-estancia/config';
import type { PlanLevel } from '@logic-estancia/domain';
import { getCanonicalWebPortfolio } from './web-portfolio';

export type HomeNavigationKey = 'webs' | 'gestor' | 'planes' | 'recorrido';

export interface HomeNavigationItem {
  key: HomeNavigationKey;
  label: string;
  href: string;
}

export interface HomeCase {
  slug: 'nivora' | 'terrava' | 'aurem';
  brand: string;
  label: string;
  text: string;
  plan: PlanLevel;
  planLabel: string;
  href: string;
  image: string;
}

export interface HomeJourneyMoment {
  number: string;
  phase: string;
  title: string;
  text: string;
  input: string;
  output: string;
  href: string;
  cta: string;
  control: string;
}

export interface HomeProductArea {
  id: 'web' | 'solicitudes' | 'planning' | 'huespedes' | 'operacion';
  number: string;
  title: string;
  text: string;
  plan: string;
  boundary: string;
  href: string;
  cta: string;
}

export interface HomeCapabilityGroup {
  id: 'web' | 'continuidad' | 'operacion' | 'conexiones';
  number: string;
  title: string;
  text: string;
  capabilityIds: readonly string[];
}

export interface HomeContract {
  navigation: readonly HomeNavigationItem[];
  heroCases: readonly HomeCase[];
  journey: readonly HomeJourneyMoment[];
  productAreas: readonly HomeProductArea[];
  capabilityGroups: readonly HomeCapabilityGroup[];
  capabilityStatusCopy: {
    eyebrow: string;
    title: string;
    body: string;
    evidence: string;
    boundary: string;
  };
  locale: Locale;
}

const spanish: Omit<HomeContract, 'locale'> = {
  navigation: [
    { key: 'webs', label: 'Webs', href: '/webs/' },
    { key: 'gestor', label: 'Gestor', href: '/paneles/' },
    { key: 'planes', label: 'Planes', href: '#planes' },
    { key: 'recorrido', label: 'Ver recorrido', href: '#recorrido' },
  ],
  heroCases: [
    { slug: 'nivora', brand: 'Nivora One', label: 'Web de marca', text: 'Una presencia propia que abre la conversación directa.', plan: 'basico', planLabel: 'Básico', href: '/demos/nivora/', image: '/media/nivora/hero.webp' },
    { slug: 'terrava', brand: 'Terrava Collection', label: 'Web + gestor', text: 'Una colección que conserva el contexto de cada solicitud.', plan: 'gestion', planLabel: 'Gestión', href: '/demos/terrava/', image: '/media/terrava/hero.webp' },
    { slug: 'aurem', brand: 'Aurem Hotel', label: 'Operación', text: 'Un centro visual para priorizar antes de la llegada.', plan: 'inteligente', planLabel: 'Inteligente', href: '/demos/aurem/', image: '/media/aurem/hero.webp' },
  ],
  journey: [
    { number: '01', phase: 'Descubrimiento', title: 'El huésped encuentra una historia clara', text: 'La marca y el SEO convierten interés en una visita con intención.', input: 'Búsqueda o recomendación', output: 'Visita cualificada', href: '#webs', cta: 'Ver las webs', control: 'La web explica; no consulta disponibilidad real.' },
    { number: '02', phase: 'Web', title: 'Entiende por qué elegirte', text: 'Contenido, contexto y una puerta a la conversación viven bajo tu marca.', input: 'Historia y propuesta', output: 'Interés directo', href: '/demos/nivora/#espacio', cta: 'Abrir Nivora', control: 'Web visual ficticia y sin captura de datos.' },
    { number: '03', phase: 'Solicitud', title: 'La consulta llega con contexto', text: 'Fechas, unidad y necesidad se leen juntas para que el equipo no empiece de cero.', input: 'Solicitud estructurada', output: 'Caso revisable', href: '/demos/terrava/gestion/?vista=enquiries', cta: 'Ver solicitudes', control: 'Solo lectura; no crea ni confirma reservas.' },
    { number: '04', phase: 'Planning', title: 'El equipo decide la mejor opción', text: 'Alternativas, estancias y tarifas comparten una vista preparada para revisar.', input: 'Caso y calendario', output: 'Alternativa visible', href: '/demos/terrava/gestion/?vista=planning', cta: 'Ver planning', control: 'La decisión y cualquier conexión quedan bajo alcance acordado.' },
    { number: '05', phase: 'Preparación', title: 'La llegada se prepara antes del turno', text: 'Habitación, tarea y responsable comparten el mismo escenario operativo.', input: 'Estancia acordada', output: 'Llegada preparada', href: '/demos/aurem/gestion/?vista=cleaning', cta: 'Ver preparación', control: 'No asigna tareas ni notifica al equipo real.' },
    { number: '06', phase: 'Estancia', title: 'El contexto acompaña al huésped', text: 'La información útil sigue disponible para el siguiente paso del equipo.', input: 'Llegada y huésped', output: 'Contexto compartido', href: '/demos/terrava/gestion/?vista=guests', cta: 'Ver huéspedes', control: 'Datos precargados y ficticios; no hay registro externo.' },
    { number: '07', phase: 'Lectura operativa', title: 'La dirección ve qué merece atención', text: 'Prioridades e incidencias quedan trazables antes de que mande la urgencia.', input: 'Señales del turno', output: 'Prioridad visible', href: '/demos/aurem/gestion/?vista=control', cta: 'Ver centro operativo', control: 'Las acciones sensibles requieren revisión humana.' },
  ],
  productAreas: [
    { id: 'web', number: '01', title: 'Web', text: 'Diseño, contenido y fundamentos SEO para que la estancia se entienda antes de comparar por precio.', plan: 'Básico', boundary: 'Sin dashboard, inventario, reserva ni cobro real.', href: '/demos/nivora/#espacio', cta: 'Ver evidencia en Nivora' },
    { id: 'solicitudes', number: '02', title: 'Solicitudes', text: 'Una consulta conserva fechas, huéspedes, unidad y alternativas para que el equipo responda con contexto.', plan: 'Gestión', boundary: 'Solo lectura en la demo; no envía ni confirma comunicaciones.', href: '/demos/terrava/gestion/?vista=enquiries', cta: 'Ver solicitudes en Terrava' },
    { id: 'planning', number: '03', title: 'Planning', text: 'Un calendario común reúne estancias, unidades y precios para revisar el siguiente paso.', plan: 'Gestión', boundary: 'No cambia inventario o tarifas y no conecta PMS, canales o pagos.', href: '/demos/terrava/gestion/?vista=planning', cta: 'Ver planning en Terrava' },
    { id: 'huespedes', number: '04', title: 'Huéspedes', text: 'El equipo consulta la información de la estancia sin repetirla entre conversaciones y hojas.', plan: 'Gestión', boundary: 'Fixture ficticio; no crea perfiles ni registros de viajeros.', href: '/demos/terrava/gestion/?vista=guests', cta: 'Ver huéspedes en Terrava' },
    { id: 'operacion', number: '05', title: 'Operación', text: 'Llegadas, preparación e incidencias se ordenan para que la atención tenga responsable y seguimiento.', plan: 'Inteligente', boundary: 'No ejecuta tareas, mensajes, canales, IA ni cambios en sistemas reales.', href: '/demos/aurem/gestion/?vista=control', cta: 'Ver operación en Aurem' },
  ],
  capabilityGroups: [
    { id: 'web', number: '01', title: 'Web y presencia', text: 'Lo que el huésped ve y lo que tu marca puede explicar hoy.', capabilityIds: ['brand-web', 'website-editor'] },
    { id: 'continuidad', number: '02', title: 'Solicitudes y continuidad', text: 'El contexto que pasa de la conversación al planning.', capabilityIds: ['email-enquiries', 'enquiry-workspace', 'planning'] },
    { id: 'operacion', number: '03', title: 'Equipo y operación', text: 'Preparación, prioridades y responsabilidad antes del turno.', capabilityIds: ['operations-centre', 'cleaning', 'maintenance', 'roles'] },
    { id: 'conexiones', number: '04', title: 'Conexiones supervisadas', text: 'Canales y automatización se validan por proyecto, no por asociación visual.', capabilityIds: ['channels', 'automation', 'supervised-ai'] },
  ],
  capabilityStatusCopy: {
    eyebrow: 'Capacidades a la vista',
    title: 'Conecta lo que ya funciona. Añade lo que el proyecto pueda sostener.',
    body: 'Cada grupo conserva su estado, evidencia y límite. La demo ayuda a decidir; no activa proveedores, reservas, mensajes ni automatizaciones.',
    evidence: 'Evidencia',
    boundary: 'Límite',
  },
};

const english: Omit<HomeContract, 'locale'> = {
  navigation: [
    { key: 'webs', label: 'Websites', href: '/webs/' },
    { key: 'gestor', label: 'Workspace', href: '/panels/' },
    { key: 'planes', label: 'Plans', href: '#planes' },
    { key: 'recorrido', label: 'See the journey', href: '#recorrido' },
  ],
  heroCases: [
    { slug: 'nivora', brand: 'Nivora One', label: 'Brand website', text: 'An owned presence that opens a direct conversation.', plan: 'basico', planLabel: 'Basic', href: '/en/demos/nivora/', image: '/media/nivora/hero.webp' },
    { slug: 'terrava', brand: 'Terrava Collection', label: 'Website + workspace', text: 'A collection that keeps every enquiry’s context intact.', plan: 'gestion', planLabel: 'Management', href: '/en/demos/terrava/', image: '/media/terrava/hero.webp' },
    { slug: 'aurem', brand: 'Aurem Hotel', label: 'Operations', text: 'A visual centre for prioritising before arrival.', plan: 'inteligente', planLabel: 'Intelligent', href: '/en/demos/aurem/', image: '/media/aurem/hero.webp' },
  ],
  journey: [
    { number: '01', phase: 'Discovery', title: 'Guests find a clear story', text: 'Brand and SEO turn interest into a visit with intent.', input: 'Search or referral', output: 'Qualified visit', href: '#webs', cta: 'See the websites', control: 'The website explains; it does not check live availability.' },
    { number: '02', phase: 'Website', title: 'They understand why to choose you', text: 'Content, context and a route to conversation live under your brand.', input: 'Story and proposition', output: 'Direct interest', href: '/en/demos/nivora/#espacio', cta: 'Open Nivora', control: 'Fictional visual website with no data capture.' },
    { number: '03', phase: 'Enquiry', title: 'The request arrives with context', text: 'Dates, unit and need stay together so the team does not start from zero.', input: 'Structured request', output: 'Reviewable case', href: '/en/demos/terrava/gestion/?vista=enquiries', cta: 'See enquiries', control: 'Read-only; it creates and confirms no booking.' },
    { number: '04', phase: 'Planning', title: 'The team chooses the best option', text: 'Alternatives, stays and rates share a prepared view for review.', input: 'Case and calendar', output: 'Visible alternative', href: '/en/demos/terrava/gestion/?vista=planning', cta: 'See planning', control: 'Decisions and connections stay within agreed scope.' },
    { number: '05', phase: 'Preparation', title: 'Arrival is prepared before the shift', text: 'Room, task and owner share the same operating scenario.', input: 'Agreed stay', output: 'Prepared arrival', href: '/en/demos/aurem/gestion/?vista=cleaning', cta: 'See preparation', control: 'It assigns no task and notifies no live team.' },
    { number: '06', phase: 'Stay', title: 'Context travels with the guest', text: 'Useful information remains available for the team’s next step.', input: 'Arrival and guest', output: 'Shared context', href: '/en/demos/terrava/gestion/?vista=guests', cta: 'See guests', control: 'Preloaded fictitious data; no external registration.' },
    { number: '07', phase: 'Operations view', title: 'Management sees what deserves attention', text: 'Priorities and incidents remain traceable before urgency takes over.', input: 'Shift signals', output: 'Visible priority', href: '/en/demos/aurem/gestion/?vista=control', cta: 'See operations centre', control: 'Sensitive actions require human review.' },
  ],
  productAreas: [
    { id: 'web', number: '01', title: 'Website', text: 'Design, content and SEO foundations so the stay is understood before it is compared on price.', plan: 'Basic', boundary: 'No workspace, inventory, booking or live payment.', href: '/en/demos/nivora/#espacio', cta: 'See evidence in Nivora' },
    { id: 'solicitudes', number: '02', title: 'Enquiries', text: 'Each request keeps dates, guests, unit and alternatives together for a contextual reply.', plan: 'Management', boundary: 'Read-only in the demo; it sends and confirms no communication.', href: '/en/demos/terrava/gestion/?vista=enquiries', cta: 'See enquiries in Terrava' },
    { id: 'planning', number: '03', title: 'Planning', text: 'A shared calendar brings stays, units and rates together for the next review.', plan: 'Management', boundary: 'It changes no inventory or rates and connects no PMS, channels or payments.', href: '/en/demos/terrava/gestion/?vista=planning', cta: 'See planning in Terrava' },
    { id: 'huespedes', number: '04', title: 'Guests', text: 'The team can consult stay information without repeating it across conversations and sheets.', plan: 'Management', boundary: 'Fictitious fixture; it creates no guest profile or traveller record.', href: '/en/demos/terrava/gestion/?vista=guests', cta: 'See guests in Terrava' },
    { id: 'operacion', number: '05', title: 'Operations', text: 'Arrivals, preparation and incidents are ordered so attention has an owner and follow-up.', plan: 'Intelligent', boundary: 'It runs no task, message, channel, AI or live system change.', href: '/en/demos/aurem/gestion/?vista=control', cta: 'See operations in Aurem' },
  ],
  capabilityGroups: [
    { id: 'web', number: '01', title: 'Website and presence', text: 'What guests see and what your brand can explain today.', capabilityIds: ['brand-web', 'website-editor'] },
    { id: 'continuidad', number: '02', title: 'Enquiries and continuity', text: 'The context that moves from conversation to planning.', capabilityIds: ['email-enquiries', 'enquiry-workspace', 'planning'] },
    { id: 'operacion', number: '03', title: 'Team and operations', text: 'Preparation, priorities and ownership before the shift.', capabilityIds: ['operations-centre', 'cleaning', 'maintenance', 'roles'] },
    { id: 'conexiones', number: '04', title: 'Supervised connections', text: 'Channels and automation are validated per project, not implied by a visual.', capabilityIds: ['channels', 'automation', 'supervised-ai'] },
  ],
  capabilityStatusCopy: {
    eyebrow: 'Capabilities in view',
    title: 'Connect what already works. Add what the project can sustain.',
    body: 'Every group keeps its status, evidence and boundary. The demo helps you decide; it activates no provider, booking, message or automation.',
    evidence: 'Evidence',
    boundary: 'Boundary',
  },
};

export function getHomeContract(locale: Locale): HomeContract {
  const homeCases = getCanonicalWebPortfolio(locale).map((concept) => ({
    slug: concept.slug,
    brand: concept.brand,
    label: concept.verticalLabel,
    text: concept.summary,
    plan: concept.plan,
    planLabel: concept.planLabel,
    href: concept.demoHref,
    image: concept.image,
  }));
  return { ...((locale === 'en' ? english : spanish)), locale, heroCases: homeCases };
}
