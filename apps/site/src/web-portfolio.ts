import type { Locale } from '@logic-estancia/config';
import type { DemoSlug, PlanLevel } from '@logic-estancia/domain';

export type PortfolioVertical = 'rural' | 'apartments' | 'hotels';
export type PortfolioOriginalSlug = 'linde' | 'cobalto' | 'oria';
export type PortfolioStatus = 'canonical' | 'original';

export interface PortfolioShowcaseMoment {
  number: string;
  title: string;
  text: string;
}

export interface PortfolioShowcase {
  eyebrow: string;
  title: string;
  intro: string;
  moments: readonly PortfolioShowcaseMoment[];
}

interface WebPortfolioConceptBase {
  slug: DemoSlug | PortfolioOriginalSlug;
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

export interface CanonicalWebPortfolioConcept extends WebPortfolioConceptBase {
  slug: DemoSlug;
  status: 'canonical';
  showcase: null;
}

export interface OriginalWebPortfolioConcept extends WebPortfolioConceptBase {
  slug: PortfolioOriginalSlug;
  status: 'original';
  showcase: PortfolioShowcase;
}

export type WebPortfolioConcept = CanonicalWebPortfolioConcept | OriginalWebPortfolioConcept;

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
      showcase: null,
    },
    {
      slug: 'terrava', number: '02', brand: 'Terrava Collection', vertical: 'rural', verticalLabel: 'Casa rural', plan: 'gestion', planLabel: 'Gestión', status: 'canonical', statusLabel: 'Caso canónico',
      summary: 'Una colección rural donde cada casa conserva su carácter y el equipo gana una lectura común.',
      visualIntent: 'Paisaje, materia y ritmo editorial para presentar varias casas sin convertirlas en un listado indiferenciado.',
      businessProblem: 'Ocho propiedades comparten demanda, pero la respuesta y la preparación no deberían reconstruirse ocho veces.',
      visibleLabel: 'Páginas y superficies visibles', visiblePages: ['Las casas', 'Experiencias', 'Panel de solicitudes', 'Planning visual'],
      boundaryLabel: 'Límite de la evidencia', boundary: 'Web y workspace ficticios de solo lectura; no confirma reservas, cambia tarifas ni envía comunicaciones.',
      image: '/media/terrava/hero.webp', imageAlt: 'Escena visual ficticia de Terrava Collection', demoHref: '/demos/terrava/', demoCta: 'Explorar web demo', assessmentCta: 'Evaluar este punto de partida',
      showcase: null,
    },
    {
      slug: 'aurem', number: '03', brand: 'Aurem Hotel', vertical: 'hotels', verticalLabel: 'Hotel', plan: 'inteligente', planLabel: 'Inteligente', status: 'canonical', statusLabel: 'Caso canónico',
      summary: 'Una dirección visual contemporánea conectada a una lectura operativa antes de cada llegada.',
      visualIntent: 'Calma, precisión y jerarquía para que la experiencia del huésped y las prioridades del equipo hablen el mismo idioma.',
      businessProblem: 'Un equipo hotelero necesita detectar llegadas, habitaciones e incidencias antes de que la urgencia marque el turno.',
      visibleLabel: 'Páginas y superficies visibles', visiblePages: ['Habitaciones', 'Servicios', 'Centro operativo', 'Revenue visual'],
      boundaryLabel: 'Límite de la evidencia', boundary: 'Caso local con datos ficticios; no ejecuta tareas, canales, IA, pagos ni cambios en sistemas reales.',
      image: '/media/aurem/hero.webp', imageAlt: 'Escena visual ficticia de Aurem Hotel', demoHref: '/demos/aurem/', demoCta: 'Explorar web demo', assessmentCta: 'Evaluar este punto de partida',
      showcase: null,
    },
    {
      slug: 'linde', number: '04', brand: 'Linde Casa', vertical: 'rural', verticalLabel: 'Casa rural', plan: 'basico', planLabel: 'Básico', status: 'original', statusLabel: 'Concepto navegable',
      summary: 'Una casa entre olivos que convierte el paisaje y el ritmo lento en una razón clara para reservar directamente.',
      visualIntent: 'Piedra, sombra y vegetación seca para una identidad rural sobria, cercana y alejada del tópico rústico.',
      businessProblem: 'Una casa independiente necesita destacar por su carácter sin asumir un gestor que todavía no necesita.',
      visibleLabel: 'Páginas y superficies visibles', visiblePages: ['Inicio editorial', 'La casa', 'El paisaje', 'Guía local'],
      boundaryLabel: 'Límite de la evidencia', boundary: 'Concepto web ficticio; no representa un cliente, consulta disponibilidad, recoge solicitudes ni incluye gestor.',
      image: '/media/linde/hero.webp', imageAlt: 'Casa rural ficticia de piedra entre olivos para Linde Casa', demoHref: '/webs/linde/', demoCta: 'Explorar concepto web', assessmentCta: 'Evaluar este punto de partida',
      showcase: {
        eyebrow: 'Una casa al final del camino', title: 'Respira donde termina el ruido.', intro: 'Linde convierte una sola casa, su luz y el paisaje que la rodea en un relato directo. La propuesta no necesita inventario ni automatización para resultar memorable.',
        moments: [
          { number: '01', title: 'Una casa, un ritmo', text: 'La arquitectura y los materiales explican la estancia antes de enumerar servicios.' },
          { number: '02', title: 'El paisaje como guía', text: 'Caminos, pueblos y temporadas ayudan a imaginar qué hacer y cuándo venir.' },
          { number: '03', title: 'Contacto con contexto', text: 'El siguiente paso se plantea como conversación; la demo no envía ni bloquea fechas.' },
        ],
      },
    },
    {
      slug: 'cobalto', number: '05', brand: 'Cobalto Stays', vertical: 'apartments', verticalLabel: 'Apartamentos', plan: 'inteligente', planLabel: 'Inteligente', status: 'original', statusLabel: 'Concepto navegable',
      summary: 'Apartamentos urbanos para estancias largas, con una marca común y una promesa de continuidad más allá de la primera noche.',
      visualIntent: 'Azul mineral, madera y profundidad urbana para combinar hospitalidad, trabajo y vida de barrio.',
      businessProblem: 'Una cartera de apartamentos necesita diferenciar estancias y anticipar prioridades sin parecer un catálogo de unidades.',
      visibleLabel: 'Páginas y superficies visibles', visiblePages: ['Inicio editorial', 'Apartamentos', 'Estancias largas', 'El barrio'],
      boundaryLabel: 'Límite de la evidencia', boundary: 'Dirección web ficticia; no demuestra el gestor Inteligente, disponibilidad, reservas, mensajería ni operaciones reales.',
      image: '/media/cobalto/hero.webp', imageAlt: 'Apartamento urbano ficticio con balcón para Cobalto Stays', demoHref: '/webs/cobalto/', demoCta: 'Explorar concepto web', assessmentCta: 'Evaluar este punto de partida',
      showcase: {
        eyebrow: 'Otra forma de quedarse en la ciudad', title: 'Tu ciudad, con otro ritmo.', intro: 'Cobalto presenta una colección pensada para semanas, trabajo y vida cotidiana. La web ordena la propuesta; la capacidad operativa se valida por separado.',
        moments: [
          { number: '01', title: 'Elige por forma de vivir', text: 'Cada apartamento se explica por luz, barrio y duración, no solo por metros y camas.' },
          { number: '02', title: 'Estancias que necesitan contexto', text: 'Trabajo, descanso y servicios de barrio preparan una conversación más útil.' },
          { number: '03', title: 'Operación bajo revisión', text: 'Inteligente es un punto de partida por capacidades; esta página no simula su panel.' },
        ],
      },
    },
    {
      slug: 'oria', number: '06', brand: 'Oria Hotel', vertical: 'hotels', verticalLabel: 'Hotel', plan: 'gestion', planLabel: 'Gestión', status: 'original', statusLabel: 'Concepto navegable',
      summary: 'Un hotel costero pequeño que presenta habitaciones, llegada y atención con una serenidad muy operativa.',
      visualIntent: 'Luz marina, cal y madera para una experiencia clara, luminosa y organizada sin recurrir al lujo genérico.',
      businessProblem: 'Un hotel independiente necesita que la promesa de calma continúe cuando la consulta llega a recepción.',
      visibleLabel: 'Páginas y superficies visibles', visiblePages: ['Inicio editorial', 'Habitaciones', 'La llegada', 'Entorno'],
      boundaryLabel: 'Límite de la evidencia', boundary: 'Concepto web ficticio; no representa un hotel real, consulta inventario, registra huéspedes, cobra ni confirma reservas.',
      image: '/media/oria/hero.webp', imageAlt: 'Recepción ficticia de hotel costero para Oria Hotel', demoHref: '/webs/oria/', demoCta: 'Explorar concepto web', assessmentCta: 'Evaluar este punto de partida',
      showcase: {
        eyebrow: 'Un hotel donde llegar es sencillo', title: 'La calma empieza en la entrada.', intro: 'Oria alinea el lenguaje de la web con una llegada clara. El concepto muestra cómo vender esa promesa sin fingir que la operativa está conectada.',
        moments: [
          { number: '01', title: 'Habitaciones sin ruido', text: 'La elección se apoya en orientación, luz y uso, con información fácil de comparar.' },
          { number: '02', title: 'La llegada ya está explicada', text: 'Acceso, horarios y contexto reducen preguntas sin convertir la página en un check-in.' },
          { number: '03', title: 'Gestión como siguiente capa', text: 'La continuidad con recepción pertenece al alcance Gestión y se prueba en el caso canónico.' },
        ],
      },
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
      showcase: null,
    },
    {
      slug: 'terrava', number: '02', brand: 'Terrava Collection', vertical: 'rural', verticalLabel: 'Rural stays', plan: 'gestion', planLabel: 'Management', status: 'canonical', statusLabel: 'Canonical case',
      summary: 'A rural collection where every home keeps its character and the team gains one shared view.',
      visualIntent: 'Landscape, material and editorial pace present several homes without turning them into an undifferentiated list.',
      businessProblem: 'Eight properties share demand, but replies and preparation should not be rebuilt eight times.',
      visibleLabel: 'Visible pages and surfaces', visiblePages: ['The homes', 'Experiences', 'Enquiries workspace', 'Visual planning'],
      boundaryLabel: 'Evidence boundary', boundary: 'Fictional read-only website and workspace; it confirms no booking, changes no rates and sends no communication.',
      image: '/media/terrava/hero.webp', imageAlt: 'Fictional visual scene for Terrava Collection', demoHref: '/en/demos/terrava/', demoCta: 'Explore website demo', assessmentCta: 'Assess this starting point',
      showcase: null,
    },
    {
      slug: 'aurem', number: '03', brand: 'Aurem Hotel', vertical: 'hotels', verticalLabel: 'Hotel', plan: 'inteligente', planLabel: 'Intelligent', status: 'canonical', statusLabel: 'Canonical case',
      summary: 'A contemporary visual direction connected to an operating view before every arrival.',
      visualIntent: 'Calm, precision and hierarchy let the guest experience and the team’s priorities speak the same language.',
      businessProblem: 'A hotel team needs to spot arrivals, rooms and incidents before urgency takes over the shift.',
      visibleLabel: 'Visible pages and surfaces', visiblePages: ['Rooms', 'Services', 'Operations centre', 'Visual revenue'],
      boundaryLabel: 'Evidence boundary', boundary: 'Local case with fictitious data; it runs no task, channel, AI, payment or live system change.',
      image: '/media/aurem/hero.webp', imageAlt: 'Fictional visual scene for Aurem Hotel', demoHref: '/en/demos/aurem/', demoCta: 'Explore website demo', assessmentCta: 'Assess this starting point',
      showcase: null,
    },
    {
      slug: 'linde', number: '04', brand: 'Linde Casa', vertical: 'rural', verticalLabel: 'Rural stay', plan: 'basico', planLabel: 'Basic', status: 'original', statusLabel: 'Navigable concept',
      summary: 'A home among olive trees that turns landscape and a slower pace into a clear reason to book direct.',
      visualIntent: 'Stone, shade and dry planting create a restrained, intimate rural identity beyond rustic clichés.',
      businessProblem: 'An independent home needs to stand out through character without taking on a workspace it does not yet need.',
      visibleLabel: 'Visible pages and surfaces', visiblePages: ['Editorial home', 'The house', 'The landscape', 'Local guide'],
      boundaryLabel: 'Evidence boundary', boundary: 'Fictional website concept; it is not a client, checks no availability, collects no enquiry and includes no workspace.',
      image: '/media/linde/hero.webp', imageAlt: 'Fictional stone rural home among olive trees for Linde Casa', demoHref: '/en/webs/linde/', demoCta: 'Explore website concept', assessmentCta: 'Assess this starting point',
      showcase: {
        eyebrow: 'A home at the end of the road', title: 'Breathe where the noise ends.', intro: 'Linde turns one home, its light and surrounding landscape into a direct story. The proposition needs neither inventory nor automation to become memorable.',
        moments: [
          { number: '01', title: 'One home, one pace', text: 'Architecture and materials explain the stay before services are listed.' },
          { number: '02', title: 'Landscape as a guide', text: 'Paths, villages and seasons help guests imagine what to do and when to visit.' },
          { number: '03', title: 'A contextual conversation', text: 'The next step is framed as a conversation; the demo sends nothing and blocks no dates.' },
        ],
      },
    },
    {
      slug: 'cobalto', number: '05', brand: 'Cobalto Stays', vertical: 'apartments', verticalLabel: 'Apartments', plan: 'inteligente', planLabel: 'Intelligent', status: 'original', statusLabel: 'Navigable concept',
      summary: 'Urban apartments for longer stays, with one shared brand and continuity beyond the first night.',
      visualIntent: 'Mineral blue, timber and urban depth combine hospitality, work and neighbourhood life.',
      businessProblem: 'An apartment portfolio needs to distinguish stays and anticipate priorities without looking like a list of units.',
      visibleLabel: 'Visible pages and surfaces', visiblePages: ['Editorial home', 'Apartments', 'Long stays', 'The neighbourhood'],
      boundaryLabel: 'Evidence boundary', boundary: 'Fictional website direction; it does not demonstrate the Intelligent workspace, availability, bookings, messaging or live operations.',
      image: '/media/cobalto/hero.webp', imageAlt: 'Fictional city apartment with balcony for Cobalto Stays', demoHref: '/en/webs/cobalto/', demoCta: 'Explore website concept', assessmentCta: 'Assess this starting point',
      showcase: {
        eyebrow: 'Another way to stay in the city', title: 'Your city, at another pace.', intro: 'Cobalto presents a collection designed for weeks, work and everyday life. The website organises the proposition; operating capability is validated separately.',
        moments: [
          { number: '01', title: 'Choose by how you live', text: 'Every apartment is explained through light, neighbourhood and duration, not only beds and square metres.' },
          { number: '02', title: 'Stays need context', text: 'Work, rest and neighbourhood services prepare a more useful conversation.' },
          { number: '03', title: 'Operations remain under review', text: 'Intelligent is a capability-led starting point; this page does not simulate its workspace.' },
        ],
      },
    },
    {
      slug: 'oria', number: '06', brand: 'Oria Hotel', vertical: 'hotels', verticalLabel: 'Hotel', plan: 'gestion', planLabel: 'Management', status: 'original', statusLabel: 'Navigable concept',
      summary: 'A small coastal hotel that presents rooms, arrival and care with a distinctly operational calm.',
      visualIntent: 'Sea light, limewash and timber create a clear, bright, organised experience without generic luxury.',
      businessProblem: 'An independent hotel needs its promise of calm to continue when the enquiry reaches reception.',
      visibleLabel: 'Visible pages and surfaces', visiblePages: ['Editorial home', 'Rooms', 'Arrival', 'Surroundings'],
      boundaryLabel: 'Evidence boundary', boundary: 'Fictional website concept; it is not a real hotel and checks no inventory, registers no guest, takes no payment and confirms no booking.',
      image: '/media/oria/hero.webp', imageAlt: 'Fictional coastal hotel reception for Oria Hotel', demoHref: '/en/webs/oria/', demoCta: 'Explore website concept', assessmentCta: 'Assess this starting point',
      showcase: {
        eyebrow: 'A hotel where arriving feels simple', title: 'Calm begins at the entrance.', intro: 'Oria aligns the language of the website with a clear arrival. The concept shows how to sell that promise without pretending operations are connected.',
        moments: [
          { number: '01', title: 'Rooms without noise', text: 'Choice is built around orientation, light and use, with information that is easy to compare.' },
          { number: '02', title: 'Arrival is already explained', text: 'Access, times and context reduce questions without turning the page into check-in.' },
          { number: '03', title: 'Management as the next layer', text: 'Continuity with reception belongs to Management scope and is proven in the canonical case.' },
        ],
      },
    },
  ],
};

export function getWebPortfolio(locale: Locale): readonly WebPortfolioConcept[] {
  return concepts[locale];
}

export function getCanonicalWebPortfolio(locale: Locale): readonly CanonicalWebPortfolioConcept[] {
  return concepts[locale].filter((concept): concept is CanonicalWebPortfolioConcept => concept.status === 'canonical');
}

export function getOriginalWebPortfolio(locale: Locale): readonly OriginalWebPortfolioConcept[] {
  return concepts[locale].filter((concept): concept is OriginalWebPortfolioConcept => concept.status === 'original');
}
