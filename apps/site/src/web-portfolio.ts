import type { Locale } from '@logic-estancia/config';
import type { DemoSlug, PlanLevel } from '@logic-estancia/domain';

export type PortfolioVertical = 'rural' | 'apartments' | 'hotels';
export type PortfolioStatus = 'canonical';

export interface WebPortfolioConcept {
  slug: DemoSlug;
  number: string;
  brand: string;
  vertical: PortfolioVertical;
  verticalLabel: string;
  plan: PlanLevel;
  planLabel: string;
  status: PortfolioStatus;
  statusLabel: string;
  summary: string;
  visualIntent: string;
  businessProblem: string;
  visibleLabel: string;
  visiblePages: readonly string[];
  boundaryLabel: string;
  boundary: string;
  image: string;
  imageAlt: string;
  demoHref: string;
  demoCta: string;
  assessmentCta: string;
}

const concepts: Record<Locale, readonly WebPortfolioConcept[]> = {
  es: [
    {
      slug: 'nivora', number: '01', brand: 'Nivora One', vertical: 'apartments', verticalLabel: 'Apartamentos', plan: 'basico', planLabel: 'Básico', status: 'canonical', statusLabel: 'Caso canónico',
      summary: 'Una web serena para un apartamento urbano que quiere ser elegido por su forma de vivir la ciudad.',
      visualIntent: 'Minimalismo urbano, luz natural y una guía local que convierte la identidad en una decisión concreta.',
      businessProblem: 'Una sola propiedad necesita una presencia propia que explique el valor antes de que todo se reduzca a fecha y precio.',
      visibleLabel: 'Páginas y superficies visibles', visiblePages: ['Inicio', 'El espacio', 'Guía local'],
      boundaryLabel: 'Límite de la evidencia', boundary: 'Web visual ficticia; no consulta disponibilidad, recoge solicitudes ni incluye gestor.',
      image: '/media/nivora/hero.webp', imageAlt: 'Escena visual ficticia de Nivora One', demoHref: '/demos/nivora/', demoCta: 'Explorar web demo', assessmentCta: 'Evaluar este punto de partida',
    },
    {
      slug: 'terrava', number: '02', brand: 'Terrava Collection', vertical: 'rural', verticalLabel: 'Casa rural', plan: 'gestion', planLabel: 'Gestión', status: 'canonical', statusLabel: 'Caso canónico',
      summary: 'Una colección rural donde cada casa conserva su carácter y el equipo gana una lectura común.',
      visualIntent: 'Paisaje, materia y ritmo editorial para presentar varias casas sin convertirlas en un listado indiferenciado.',
      businessProblem: 'Ocho propiedades comparten demanda, pero la respuesta y la preparación no deberían reconstruirse ocho veces.',
      visibleLabel: 'Páginas y superficies visibles', visiblePages: ['Las casas', 'Experiencias', 'Panel de solicitudes', 'Planning visual'],
      boundaryLabel: 'Límite de la evidencia', boundary: 'Web y workspace ficticios de solo lectura; no confirma reservas, cambia tarifas ni envía comunicaciones.',
      image: '/media/terrava/hero.webp', imageAlt: 'Escena visual ficticia de Terrava Collection', demoHref: '/demos/terrava/', demoCta: 'Explorar web demo', assessmentCta: 'Evaluar este punto de partida',
    },
    {
      slug: 'aurem', number: '03', brand: 'Aurem Hotel', vertical: 'hotels', verticalLabel: 'Hotel', plan: 'inteligente', planLabel: 'Inteligente', status: 'canonical', statusLabel: 'Caso canónico',
      summary: 'Una dirección visual contemporánea conectada a una lectura operativa antes de cada llegada.',
      visualIntent: 'Calma, precisión y jerarquía para que la experiencia del huésped y las prioridades del equipo hablen el mismo idioma.',
      businessProblem: 'Un equipo hotelero necesita detectar llegadas, habitaciones e incidencias antes de que la urgencia marque el turno.',
      visibleLabel: 'Páginas y superficies visibles', visiblePages: ['Habitaciones', 'Servicios', 'Centro operativo', 'Revenue visual'],
      boundaryLabel: 'Límite de la evidencia', boundary: 'Caso local con datos ficticios; no ejecuta tareas, canales, IA, pagos ni cambios en sistemas reales.',
      image: '/media/aurem/hero.webp', imageAlt: 'Escena visual ficticia de Aurem Hotel', demoHref: '/demos/aurem/', demoCta: 'Explorar web demo', assessmentCta: 'Evaluar este punto de partida',
    },
  ],
  en: [
    {
      slug: 'nivora', number: '01', brand: 'Nivora One', vertical: 'apartments', verticalLabel: 'Apartments', plan: 'basico', planLabel: 'Basic', status: 'canonical', statusLabel: 'Canonical case',
      summary: 'A calm website for an urban apartment that wants to be chosen for how the city is experienced.',
      visualIntent: 'Urban minimalism, natural light and a local guide that turns identity into a clear decision.',
      businessProblem: 'One property needs an owned presence that explains its value before everything is reduced to date and price.',
      visibleLabel: 'Visible pages and surfaces', visiblePages: ['Home', 'The space', 'Local guide'],
      boundaryLabel: 'Evidence boundary', boundary: 'Fictional visual website; it checks no availability, collects no enquiries and includes no workspace.',
      image: '/media/nivora/hero.webp', imageAlt: 'Fictional visual scene for Nivora One', demoHref: '/en/demos/nivora/', demoCta: 'Explore website demo', assessmentCta: 'Assess this starting point',
    },
    {
      slug: 'terrava', number: '02', brand: 'Terrava Collection', vertical: 'rural', verticalLabel: 'Rural stays', plan: 'gestion', planLabel: 'Management', status: 'canonical', statusLabel: 'Canonical case',
      summary: 'A rural collection where every home keeps its character and the team gains one shared view.',
      visualIntent: 'Landscape, material and editorial pace present several homes without turning them into an undifferentiated list.',
      businessProblem: 'Eight properties share demand, but replies and preparation should not be rebuilt eight times.',
      visibleLabel: 'Visible pages and surfaces', visiblePages: ['The homes', 'Experiences', 'Enquiries workspace', 'Visual planning'],
      boundaryLabel: 'Evidence boundary', boundary: 'Fictional read-only website and workspace; it confirms no booking, changes no rates and sends no communication.',
      image: '/media/terrava/hero.webp', imageAlt: 'Fictional visual scene for Terrava Collection', demoHref: '/en/demos/terrava/', demoCta: 'Explore website demo', assessmentCta: 'Assess this starting point',
    },
    {
      slug: 'aurem', number: '03', brand: 'Aurem Hotel', vertical: 'hotels', verticalLabel: 'Hotel', plan: 'inteligente', planLabel: 'Intelligent', status: 'canonical', statusLabel: 'Canonical case',
      summary: 'A contemporary visual direction connected to an operating view before every arrival.',
      visualIntent: 'Calm, precision and hierarchy let the guest experience and the team’s priorities speak the same language.',
      businessProblem: 'A hotel team needs to spot arrivals, rooms and incidents before urgency takes over the shift.',
      visibleLabel: 'Visible pages and surfaces', visiblePages: ['Rooms', 'Services', 'Operations centre', 'Visual revenue'],
      boundaryLabel: 'Evidence boundary', boundary: 'Local case with fictitious data; it runs no task, channel, AI, payment or live system change.',
      image: '/media/aurem/hero.webp', imageAlt: 'Fictional visual scene for Aurem Hotel', demoHref: '/en/demos/aurem/', demoCta: 'Explore website demo', assessmentCta: 'Assess this starting point',
    },
  ],
};

export function getWebPortfolio(locale: Locale): readonly WebPortfolioConcept[] {
  return concepts[locale];
}

