import type { Locale } from '@logic-estancia/config';
import type { DemoSlug, PlanLevel } from '@logic-estancia/domain';

export type PortfolioVertical = 'rural' | 'apartments' | 'hotels';
export const PORTFOLIO_ORIGINAL_SLUGS = ['linde', 'cobalto', 'oria', 'boscara', 'velares', 'nocta', 'riscoa', 'solerna', 'cendra'] as const;
export type PortfolioOriginalSlug = (typeof PORTFOLIO_ORIGINAL_SLUGS)[number];
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
  showcase: PortfolioShowcase;
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
      showcase: {
        eyebrow: 'Una web que empieza por el lugar', title: 'Vive la ciudad desde dentro.', intro: 'Nivora demuestra cómo una sola propiedad puede ganar una voz propia antes de añadir inventario, reservas o un gestor que todavía no necesita.',
        moments: [
          { number: '01', title: 'Presencia antes que inventario', text: 'Luz, materiales y una guía local explican la estancia sin consultar disponibilidad.' },
          { number: '02', title: 'Una consulta solo demostrada', text: 'Tres casos ficticios permiten revisar el contexto de un email sin recoger datos ni enviar nada.' },
          { number: '03', title: 'Básico conserva el límite', text: 'La evidencia termina en la web y su preview local; no existe dashboard, reserva, pago o proveedor.' },
        ],
      },
    },
    {
      slug: 'terrava', number: '02', brand: 'Terrava Collection', vertical: 'rural', verticalLabel: 'Casa rural', plan: 'gestion', planLabel: 'Gestión', status: 'canonical', statusLabel: 'Caso canónico',
      summary: 'Una colección rural donde cada casa conserva su carácter y el equipo gana una lectura común.',
      visualIntent: 'Paisaje, materia y ritmo editorial para presentar varias casas sin convertirlas en un listado indiferenciado.',
      businessProblem: 'Ocho propiedades comparten demanda, pero la respuesta y la preparación no deberían reconstruirse ocho veces.',
      visibleLabel: 'Páginas y superficies visibles', visiblePages: ['Las casas', 'Experiencias', 'Panel de solicitudes', 'Planning visual'],
      boundaryLabel: 'Límite de la evidencia', boundary: 'Web y workspace ficticios de solo lectura; no confirma reservas, cambia tarifas ni envía comunicaciones.',
      image: '/media/terrava/hero.webp', imageAlt: 'Escena visual ficticia de Terrava Collection', demoHref: '/demos/terrava/', demoCta: 'Explorar web demo', assessmentCta: 'Evaluar este punto de partida',
      showcase: {
        eyebrow: 'Ocho casas, una lectura común', title: 'Cada casa conserva su carácter.', intro: 'Terrava conecta una dirección rural propia con la continuidad de solicitudes y planning que corresponde al plan Gestión, siempre mediante datos ficticios.',
        moments: [
          { number: '01', title: 'La colección no borra las casas', text: 'Paisaje, materia y relato permiten distinguir cada estancia sin reducirla a una ficha.' },
          { number: '02', title: 'La solicitud mantiene contexto', text: 'La evidencia canónica enlaza fechas, alojamiento y alternativa sin confirmar ni enviar nada.' },
          { number: '03', title: 'Gestión sigue siendo supervisada', text: 'Planning y publicación web son vistas locales; no cambian tarifas, reservas, CMS o sistemas externos.' },
        ],
      },
    },
    {
      slug: 'aurem', number: '03', brand: 'Aurem Hotel', vertical: 'hotels', verticalLabel: 'Hotel', plan: 'inteligente', planLabel: 'Inteligente', status: 'canonical', statusLabel: 'Caso canónico',
      summary: 'Una dirección visual contemporánea conectada a una lectura operativa antes de cada llegada.',
      visualIntent: 'Calma, precisión y jerarquía para que la experiencia del huésped y las prioridades del equipo hablen el mismo idioma.',
      businessProblem: 'Un equipo hotelero necesita detectar llegadas, habitaciones e incidencias antes de que la urgencia marque el turno.',
      visibleLabel: 'Páginas y superficies visibles', visiblePages: ['Habitaciones', 'Servicios', 'Centro operativo', 'Revenue visual'],
      boundaryLabel: 'Límite de la evidencia', boundary: 'Caso local con datos ficticios; no ejecuta tareas, canales, IA, pagos ni cambios en sistemas reales.',
      image: '/media/aurem/hero.webp', imageAlt: 'Escena visual ficticia de Aurem Hotel', demoHref: '/demos/aurem/', demoCta: 'Explorar web demo', assessmentCta: 'Evaluar este punto de partida',
      showcase: {
        eyebrow: 'La calma también se prepara', title: 'Todo dispuesto antes de llegar.', intro: 'Aurem une una presencia hotelera contemporánea con una lectura operativa explicable, sin convertir el escenario en automatización o inteligencia activa.',
        moments: [
          { number: '01', title: 'La experiencia empieza en la web', text: 'Habitaciones y servicios construyen una promesa visual sin disponibilidad, checkout o pago.' },
          { number: '02', title: 'La operación hace visible la prioridad', text: 'Llegadas, preparación e incidencias se leen en fixtures locales y con responsabilidad humana.' },
          { number: '03', title: 'Inteligente no significa autónomo', text: 'Revenue y copiloto muestran fórmulas, fuentes y revisión; no predicen, ejecutan ni envían.' },
        ],
      },
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
    {
      slug: 'boscara', number: '07', brand: 'Boscara Finca', vertical: 'rural', verticalLabel: 'Casa rural', plan: 'inteligente', planLabel: 'Inteligente', status: 'original', statusLabel: 'Concepto navegable',
      summary: 'Una finca de montaña entre bosque y pradera para grupos que necesitan imaginar el lugar y preparar mejor cada llegada.',
      visualIntent: 'Piedra húmeda, niebla y bosque caducifolio construyen una identidad rural profunda, contemporánea y sin decorado folclórico.',
      businessProblem: 'Una finca con varios espacios y estancias de grupo necesita ordenar expectativas y prioridades sin convertir la web en un panel operativo.',
      visibleLabel: 'Páginas y superficies visibles', visiblePages: ['Inicio editorial', 'La finca', 'Casas y encuentros', 'El territorio'],
      boundaryLabel: 'Límite de la evidencia', boundary: 'Dirección web ficticia; no representa una finca real ni demuestra el gestor Inteligente, disponibilidad, tareas, automatizaciones o coordinación en vivo.',
      image: '/media/boscara/hero.webp', imageAlt: 'Finca rural ficticia de piedra entre bosque y niebla para Boscara Finca', demoHref: '/webs/boscara/', demoCta: 'Explorar concepto web', assessmentCta: 'Evaluar este punto de partida',
      showcase: {
        eyebrow: 'La montaña empieza antes de llegar', title: 'El bosque marca el ritmo.', intro: 'Boscara presenta una finca de grupo a través de sus espacios, estaciones y formas de encuentro. La coordinación avanzada pertenece al alcance Inteligente y se demuestra por separado.',
        moments: [
          { number: '01', title: 'Una finca, varios ritmos', text: 'Casas, pradera y espacios comunes se explican por el uso que permiten, no como una lista de metros.' },
          { number: '02', title: 'La llegada gana contexto', text: 'Camino, clima y composición del grupo preparan una conversación más concreta antes de decidir.' },
          { number: '03', title: 'La operación no se simula', text: 'El punto de partida Inteligente responde a capacidades; esta web no ejecuta planning, tareas ni avisos.' },
        ],
      },
    },
    {
      slug: 'velares', number: '08', brand: 'Velares Apartamentos', vertical: 'apartments', verticalLabel: 'Apartamentos', plan: 'gestion', planLabel: 'Gestión', status: 'original', statusLabel: 'Concepto navegable',
      summary: 'Apartamentos alrededor de un patio mediterráneo, con una identidad compartida y continuidad para cada solicitud.',
      visualIntent: 'Cal, terracota, sombra vegetal y umbrales habitados para convertir un edificio histórico en una marca contemporánea y cercana.',
      businessProblem: 'Varios apartamentos en una misma casa necesitan diferenciarse y compartir continuidad de solicitudes sin parecer un inventario anónimo.',
      visibleLabel: 'Páginas y superficies visibles', visiblePages: ['Inicio editorial', 'Apartamentos', 'El patio', 'La ciudad a pie'],
      boundaryLabel: 'Límite de la evidencia', boundary: 'Concepto web ficticio; no representa apartamentos reales, consulta disponibilidad, registra solicitudes, bloquea fechas ni modifica el planning de Gestión.',
      image: '/media/velares/hero.webp', imageAlt: 'Patio mediterráneo ficticio para Velares Apartamentos', demoHref: '/webs/velares/', demoCta: 'Explorar concepto web', assessmentCta: 'Evaluar este punto de partida',
      showcase: {
        eyebrow: 'Una casa que contiene muchas estancias', title: 'La ciudad sucede alrededor.', intro: 'Velares usa el patio como origen común para presentar apartamentos distintos y una vida de barrio accesible. La web explica; la continuidad operativa se valida en la evidencia canónica de Gestión.',
        moments: [
          { number: '01', title: 'El patio orienta', text: 'La arquitectura común da coherencia a la colección antes de entrar en cada apartamento.' },
          { number: '02', title: 'Cada estancia se distingue', text: 'Luz, altura y relación con la calle ayudan a elegir sin reducir la propuesta a capacidad y precio.' },
          { number: '03', title: 'Gestión continúa el relato', text: 'Solicitudes y planning pertenecen al caso canónico; esta ruta no guarda datos ni cambia calendarios.' },
        ],
      },
    },
    {
      slug: 'nocta', number: '09', brand: 'Nocta Hotel', vertical: 'hotels', verticalLabel: 'Hotel', plan: 'basico', planLabel: 'Básico', status: 'original', statusLabel: 'Concepto navegable',
      summary: 'Un hotel pequeño en una meseta silenciosa que convierte oscuridad, paisaje y descanso en una razón para elegirlo.',
      visualIntent: 'Azul profundo, tierra compactada y luz ámbar mínima para una identidad hotelera sobria que evita el lujo genérico.',
      businessProblem: 'Un hotel de pocas habitaciones necesita explicar su singularidad antes de incorporar una capa de gestión que todavía no ha validado.',
      visibleLabel: 'Páginas y superficies visibles', visiblePages: ['Inicio editorial', 'Habitaciones', 'La noche', 'Paisaje y silencio'],
      boundaryLabel: 'Límite de la evidencia', boundary: 'Concepto web ficticio; no representa un hotel real, consulta habitaciones, recoge solicitudes, cobra, confirma reservas ni incluye workspace.',
      image: '/media/nocta/hero.webp', imageAlt: 'Hotel ficticio de tierra en una meseta al anochecer para Nocta Hotel', demoHref: '/webs/nocta/', demoCta: 'Explorar concepto web', assessmentCta: 'Evaluar este punto de partida',
      showcase: {
        eyebrow: 'Un hotel pensado para bajar el volumen', title: 'Cuando cae la noche, todo se aclara.', intro: 'Nocta convierte oscuridad, materia y horizonte en una propuesta web directa. Básico demuestra presencia e identidad; no añade inventario, reserva ni panel.',
        moments: [
          { number: '01', title: 'La oscuridad forma parte del lugar', text: 'El relato prepara una estancia de cielo abierto sin fabricar disponibilidad ni experiencias.' },
          { number: '02', title: 'Dormir sin estímulos', text: 'Habitaciones, luz y materiales se explican desde el descanso, no desde una lista de extras.' },
          { number: '03', title: 'Conversación, no reserva', text: 'La salida conduce al diagnóstico comercial; la demo no recoge datos ni confirma noches.' },
        ],
      },
    },
    {
      slug: 'riscoa', number: '10', brand: 'Riscoa Casas', vertical: 'rural', verticalLabel: 'Casa rural', plan: 'gestion', planLabel: 'Gestión', status: 'original', statusLabel: 'Concepto navegable',
      summary: 'Tres casas en una ladera atlántica, conectadas por el paisaje y por una forma más clara de responder cada solicitud.',
      visualIntent: 'Granito mojado, helechos, madera oscura y niebla baja construyen una identidad atlántica precisa, natural y sin tópicos de cabaña.',
      businessProblem: 'Varias casas separadas necesitan conservar su carácter y compartir continuidad de solicitudes sin presentarse como un inventario indiferenciado.',
      visibleLabel: 'Páginas y superficies visibles', visiblePages: ['Inicio editorial', 'Las casas', 'Caminos y clima', 'Preparar la llegada'],
      boundaryLabel: 'Límite de la evidencia', boundary: 'Concepto web ficticio; no representa casas reales, registra solicitudes, consulta disponibilidad, modifica planning ni coordina llegadas.',
      image: '/media/riscoa/hero.webp', imageAlt: 'Casas rurales ficticias de madera y granito en una ladera con niebla para Riscoa Casas', demoHref: '/webs/riscoa/', demoCta: 'Explorar concepto web', assessmentCta: 'Evaluar este punto de partida',
      showcase: {
        eyebrow: 'Tres casas unidas por el paisaje', title: 'Cada camino llega a su casa.', intro: 'Riscoa ordena una pequeña colección sin borrar las diferencias entre sus casas. La web prepara la conversación; la continuidad de Gestión se demuestra en el caso canónico.',
        moments: [
          { number: '01', title: 'Separadas, pero coordinadas', text: 'Cada casa mantiene vistas, acceso y ritmo propios dentro de una lectura común.' },
          { number: '02', title: 'El clima también prepara', text: 'Camino, lluvia y equipaje aportan contexto útil sin convertir la página en un flujo de llegada.' },
          { number: '03', title: 'Gestión sin falsas conexiones', text: 'Solicitudes y planning pertenecen a Terrava; este concepto no guarda datos ni cambia calendarios.' },
        ],
      },
    },
    {
      slug: 'solerna', number: '11', brand: 'Solerna Apartamentos', vertical: 'apartments', verticalLabel: 'Apartamentos', plan: 'basico', planLabel: 'Básico', status: 'original', statusLabel: 'Concepto navegable',
      summary: 'Apartamentos serenos sobre los tejados de una ciudad histórica, explicados desde la luz, el umbral y la vida a pie.',
      visualIntent: 'Cal, terracota gastada, madera y sombra fresca convierten un interior sencillo en una identidad urbana cálida y reconocible.',
      businessProblem: 'Una colección compacta necesita una presencia propia que explique sus diferencias antes de asumir una capa de gestión todavía no validada.',
      visibleLabel: 'Páginas y superficies visibles', visiblePages: ['Inicio editorial', 'Apartamentos', 'Azoteas y luz', 'La ciudad cercana'],
      boundaryLabel: 'Límite de la evidencia', boundary: 'Dirección web ficticia; no representa apartamentos reales, recoge solicitudes, consulta fechas, cobra, confirma reservas ni incluye gestor.',
      image: '/media/solerna/hero.webp', imageAlt: 'Apartamento ficticio de cal abierto a tejados históricos para Solerna Apartamentos', demoHref: '/webs/solerna/', demoCta: 'Explorar concepto web', assessmentCta: 'Evaluar este punto de partida',
      showcase: {
        eyebrow: 'La ciudad empieza dentro', title: 'La luz entra antes que el ruido.', intro: 'Solerna usa sombra, altura y vistas próximas para presentar apartamentos sin reducirlos a una tabla de equipamiento. Básico demuestra presencia; no incorpora reserva ni workspace.',
        moments: [
          { number: '01', title: 'Elegir por la luz', text: 'Orientación, umbral y relación con los tejados distinguen cada estancia con pocos elementos.' },
          { number: '02', title: 'La ciudad queda a escala humana', text: 'Calles y ritmos cotidianos ayudan a imaginar la estancia sin inventar experiencias.' },
          { number: '03', title: 'Presencia antes que sistema', text: 'La salida abre el diagnóstico; esta ruta no consulta fechas, recoge datos ni confirma noches.' },
        ],
      },
    },
    {
      slug: 'cendra', number: '12', brand: 'Cendra Hotel', vertical: 'hotels', verticalLabel: 'Hotel', plan: 'inteligente', planLabel: 'Inteligente', status: 'original', statusLabel: 'Concepto navegable',
      summary: 'Un hotel urbano dentro de una antigua imprenta, donde arquitectura, llegada y capas operativas comparten una dirección clara.',
      visualIntent: 'Ladrillo ennegrecido, acero, vegetación contenida y luz ámbar mínima construyen una identidad urbana profunda y nada corporativa.',
      businessProblem: 'Un hotel con varias zonas y turnos necesita explicar su carácter y anticipar prioridades sin convertir la web en un centro de control.',
      visibleLabel: 'Páginas y superficies visibles', visiblePages: ['Inicio editorial', 'Habitaciones', 'El patio', 'Edificio y ciudad'],
      boundaryLabel: 'Límite de la evidencia', boundary: 'Concepto web ficticio; no representa un hotel real ni demuestra el gestor Inteligente, inventario, tareas, revenue, IA o coordinación en vivo.',
      image: '/media/cendra/hero.webp', imageAlt: 'Patio ficticio de hotel en una antigua imprenta de ladrillo para Cendra Hotel', demoHref: '/webs/cendra/', demoCta: 'Explorar concepto web', assessmentCta: 'Evaluar este punto de partida',
      showcase: {
        eyebrow: 'Una imprenta convertida en hotel', title: 'El edificio guarda el pulso.', intro: 'Cendra presenta habitaciones, circulaciones y espacios comunes como partes de una misma experiencia. La anticipación operativa pertenece a Inteligente y se prueba por separado.',
        moments: [
          { number: '01', title: 'Las capas siguen visibles', text: 'Ladrillo, patios y galerías cuentan la transformación sin convertirla en decorado industrial.' },
          { number: '02', title: 'Llegar también es orientarse', text: 'Recorridos y zonas comunes reducen incertidumbre sin simular check-in ni control de accesos.' },
          { number: '03', title: 'La inteligencia exige evidencia', text: 'Operación, revenue y copiloto viven en Aurem; esta web no ejecuta ni predice nada.' },
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
      showcase: {
        eyebrow: 'A website that starts with place', title: 'Live the city from within.', intro: 'Nivora shows how one property can gain a voice of its own before adding inventory, bookings or a workspace it does not yet need.',
        moments: [
          { number: '01', title: 'Presence before inventory', text: 'Light, materials and a local guide explain the stay without checking availability.' },
          { number: '02', title: 'An enquiry demonstrated only', text: 'Three fictitious cases make email context reviewable without collecting data or sending anything.' },
          { number: '03', title: 'Basic keeps the boundary', text: 'Evidence stops at the website and its local preview; there is no dashboard, booking, payment or provider.' },
        ],
      },
    },
    {
      slug: 'terrava', number: '02', brand: 'Terrava Collection', vertical: 'rural', verticalLabel: 'Rural stays', plan: 'gestion', planLabel: 'Management', status: 'canonical', statusLabel: 'Canonical case',
      summary: 'A rural collection where every home keeps its character and the team gains one shared view.',
      visualIntent: 'Landscape, material and editorial pace present several homes without turning them into an undifferentiated list.',
      businessProblem: 'Eight properties share demand, but replies and preparation should not be rebuilt eight times.',
      visibleLabel: 'Visible pages and surfaces', visiblePages: ['The homes', 'Experiences', 'Enquiries workspace', 'Visual planning'],
      boundaryLabel: 'Evidence boundary', boundary: 'Fictional read-only website and workspace; it confirms no booking, changes no rates and sends no communication.',
      image: '/media/terrava/hero.webp', imageAlt: 'Fictional visual scene for Terrava Collection', demoHref: '/en/demos/terrava/', demoCta: 'Explore website demo', assessmentCta: 'Assess this starting point',
      showcase: {
        eyebrow: 'Eight homes, one shared view', title: 'Every home keeps its character.', intro: 'Terrava connects an owned rural direction with the enquiry and planning continuity of Management, always through fictitious data.',
        moments: [
          { number: '01', title: 'The collection does not erase each home', text: 'Landscape, material and story distinguish every stay without reducing it to a listing.' },
          { number: '02', title: 'The enquiry keeps its context', text: 'Canonical evidence links dates, property and alternative without confirming or sending anything.' },
          { number: '03', title: 'Management remains supervised', text: 'Planning and website publication are local views; they change no rates, bookings, CMS or external system.' },
        ],
      },
    },
    {
      slug: 'aurem', number: '03', brand: 'Aurem Hotel', vertical: 'hotels', verticalLabel: 'Hotel', plan: 'inteligente', planLabel: 'Intelligent', status: 'canonical', statusLabel: 'Canonical case',
      summary: 'A contemporary visual direction connected to an operating view before every arrival.',
      visualIntent: 'Calm, precision and hierarchy let the guest experience and the team’s priorities speak the same language.',
      businessProblem: 'A hotel team needs to spot arrivals, rooms and incidents before urgency takes over the shift.',
      visibleLabel: 'Visible pages and surfaces', visiblePages: ['Rooms', 'Services', 'Operations centre', 'Visual revenue'],
      boundaryLabel: 'Evidence boundary', boundary: 'Local case with fictitious data; it runs no task, channel, AI, payment or live system change.',
      image: '/media/aurem/hero.webp', imageAlt: 'Fictional visual scene for Aurem Hotel', demoHref: '/en/demos/aurem/', demoCta: 'Explore website demo', assessmentCta: 'Assess this starting point',
      showcase: {
        eyebrow: 'Calm is prepared too', title: 'Everything ready before arrival.', intro: 'Aurem joins a contemporary hotel presence to an explainable operating view without presenting the scenario as active automation or intelligence.',
        moments: [
          { number: '01', title: 'The experience starts on the website', text: 'Rooms and services build a visual promise without availability, checkout or payment.' },
          { number: '02', title: 'Operations make the priority visible', text: 'Arrivals, preparation and incidents are read from local fixtures with human ownership.' },
          { number: '03', title: 'Intelligent does not mean autonomous', text: 'Revenue and copilot show formulas, sources and review; they predict, execute or send nothing.' },
        ],
      },
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
    {
      slug: 'boscara', number: '07', brand: 'Boscara Finca', vertical: 'rural', verticalLabel: 'Rural stay', plan: 'inteligente', planLabel: 'Intelligent', status: 'original', statusLabel: 'Navigable concept',
      summary: 'A mountain estate between forest and meadow for groups that need to picture the place and prepare every arrival.',
      visualIntent: 'Wet stone, mist and deciduous woodland create a deep, contemporary rural identity without folkloric set dressing.',
      businessProblem: 'An estate with several spaces and group stays needs to organise expectations and priorities without turning its website into an operations dashboard.',
      visibleLabel: 'Visible pages and surfaces', visiblePages: ['Editorial home', 'The estate', 'Houses and gatherings', 'The territory'],
      boundaryLabel: 'Evidence boundary', boundary: 'Fictional website direction; it is not a real estate and does not demonstrate the Intelligent workspace, availability, tasks, automations or live coordination.',
      image: '/media/boscara/hero.webp', imageAlt: 'Fictional stone rural estate among forest and mist for Boscara Finca', demoHref: '/en/webs/boscara/', demoCta: 'Explore website concept', assessmentCta: 'Assess this starting point',
      showcase: {
        eyebrow: 'The mountain begins before arrival', title: 'The forest sets the pace.', intro: 'Boscara presents a group estate through its spaces, seasons and ways of gathering. Advanced coordination belongs to Intelligent scope and is demonstrated elsewhere.',
        moments: [
          { number: '01', title: 'One estate, several rhythms', text: 'Houses, meadow and shared spaces are explained by what they make possible, not as a list of square metres.' },
          { number: '02', title: 'Arrival gains context', text: 'Road, weather and group composition prepare a more specific conversation before a decision.' },
          { number: '03', title: 'Operations are not simulated', text: 'Intelligent is capability-led; this website runs no planning, task or alert.' },
        ],
      },
    },
    {
      slug: 'velares', number: '08', brand: 'Velares Apartamentos', vertical: 'apartments', verticalLabel: 'Apartments', plan: 'gestion', planLabel: 'Management', status: 'original', statusLabel: 'Navigable concept',
      summary: 'Apartments around a Mediterranean courtyard, with a shared identity and clearer continuity for each enquiry.',
      visualIntent: 'Limewash, terracotta, leafy shade and inhabited thresholds turn a historic building into a warm contemporary brand.',
      businessProblem: 'Several apartments in one house need to feel distinct while sharing enquiry continuity instead of resembling anonymous inventory.',
      visibleLabel: 'Visible pages and surfaces', visiblePages: ['Editorial home', 'Apartments', 'The courtyard', 'The walkable city'],
      boundaryLabel: 'Evidence boundary', boundary: 'Fictional website concept; it is not a real apartment collection and checks no availability, records no enquiry, blocks no date and changes no Management planning.',
      image: '/media/velares/hero.webp', imageAlt: 'Fictional Mediterranean courtyard for Velares Apartments', demoHref: '/en/webs/velares/', demoCta: 'Explore website concept', assessmentCta: 'Assess this starting point',
      showcase: {
        eyebrow: 'One house containing many stays', title: 'The city happens around it.', intro: 'Velares uses the courtyard as a shared origin for distinct apartments and walkable neighbourhood life. The website explains; operating continuity is validated through canonical Management evidence.',
        moments: [
          { number: '01', title: 'The courtyard gives direction', text: 'Shared architecture makes the collection coherent before each apartment is introduced.' },
          { number: '02', title: 'Every stay remains distinct', text: 'Light, floor and relationship to the street support choice beyond capacity and price.' },
          { number: '03', title: 'Management continues the story', text: 'Enquiries and planning belong to the canonical case; this route stores no data and changes no calendar.' },
        ],
      },
    },
    {
      slug: 'nocta', number: '09', brand: 'Nocta Hotel', vertical: 'hotels', verticalLabel: 'Hotel', plan: 'basico', planLabel: 'Basic', status: 'original', statusLabel: 'Navigable concept',
      summary: 'A small hotel on a silent plateau that turns darkness, landscape and rest into a recognisable reason to choose it.',
      visualIntent: 'Deep blue, rammed earth and minimal amber light build a restrained hotel identity without generic luxury cues.',
      businessProblem: 'A small-room-count hotel needs to explain its singularity before adding a management layer it has not yet validated.',
      visibleLabel: 'Visible pages and surfaces', visiblePages: ['Editorial home', 'Rooms', 'The night', 'Landscape and silence'],
      boundaryLabel: 'Evidence boundary', boundary: 'Fictional website concept; it is not a real hotel and checks no room, collects no enquiry, takes no payment, confirms no booking and includes no workspace.',
      image: '/media/nocta/hero.webp', imageAlt: 'Fictional rammed-earth hotel on a plateau at dusk for Nocta Hotel', demoHref: '/en/webs/nocta/', demoCta: 'Explore website concept', assessmentCta: 'Assess this starting point',
      showcase: {
        eyebrow: 'A hotel designed to turn the volume down', title: 'When night falls, everything becomes clear.', intro: 'Nocta turns darkness, material and horizon into a direct website proposition. Basic proves presence and identity; it adds no inventory, booking or workspace.',
        moments: [
          { number: '01', title: 'Darkness belongs to the place', text: 'The story prepares an open-sky stay without fabricating availability or experiences.' },
          { number: '02', title: 'Sleep without stimulation', text: 'Rooms, light and materials are explained through rest, not a list of extras.' },
          { number: '03', title: 'Conversation, not booking', text: 'The exit leads to the commercial assessment; the demo collects no data and confirms no night.' },
        ],
      },
    },
    {
      slug: 'riscoa', number: '10', brand: 'Riscoa Casas', vertical: 'rural', verticalLabel: 'Rural stays', plan: 'gestion', planLabel: 'Management', status: 'original', statusLabel: 'Navigable concept',
      summary: 'Three homes on an Atlantic hillside, connected by landscape and a clearer way to continue every enquiry.',
      visualIntent: 'Wet granite, ferns, dark timber and low mist create a precise Atlantic identity without cabin clichés.',
      businessProblem: 'Several separate homes need to keep their character while sharing enquiry continuity instead of looking like undifferentiated inventory.',
      visibleLabel: 'Visible pages and surfaces', visiblePages: ['Editorial home', 'The homes', 'Paths and weather', 'Preparing arrival'],
      boundaryLabel: 'Evidence boundary', boundary: 'Fictional website concept; it is not a real collection and records no enquiry, checks no availability, changes no planning and coordinates no arrival.',
      image: '/media/riscoa/hero.webp', imageAlt: 'Fictional timber and granite rural homes on a misty hillside for Riscoa Casas', demoHref: '/en/webs/riscoa/', demoCta: 'Explore website concept', assessmentCta: 'Assess this starting point',
      showcase: {
        eyebrow: 'Three homes joined by landscape', title: 'Every path reaches its own home.', intro: 'Riscoa organises a small collection without erasing the differences between its homes. The website prepares the conversation; Management continuity is proven in the canonical case.',
        moments: [
          { number: '01', title: 'Separate, yet coordinated', text: 'Every home keeps its own view, access and pace within one shared reading.' },
          { number: '02', title: 'Weather prepares the stay too', text: 'Path, rain and luggage provide useful context without turning the page into an arrival flow.' },
          { number: '03', title: 'Management without false connections', text: 'Enquiries and planning belong to Terrava; this concept stores no data and changes no calendar.' },
        ],
      },
    },
    {
      slug: 'solerna', number: '11', brand: 'Solerna Apartamentos', vertical: 'apartments', verticalLabel: 'Apartments', plan: 'basico', planLabel: 'Basic', status: 'original', statusLabel: 'Navigable concept',
      summary: 'Calm apartments above a historic city’s rooftops, explained through light, thresholds and life on foot.',
      visualIntent: 'Limewash, worn terracotta, timber and cool shade turn a simple interior into a warm, recognisable urban identity.',
      businessProblem: 'A compact collection needs an owned presence that explains its differences before adopting a management layer it has not yet validated.',
      visibleLabel: 'Visible pages and surfaces', visiblePages: ['Editorial home', 'Apartments', 'Rooftops and light', 'The nearby city'],
      boundaryLabel: 'Evidence boundary', boundary: 'Fictional website direction; it is not a real apartment collection and collects no enquiry, checks no date, takes no payment, confirms no booking and includes no workspace.',
      image: '/media/solerna/hero.webp', imageAlt: 'Fictional limewashed apartment opening to historic rooftops for Solerna Apartments', demoHref: '/en/webs/solerna/', demoCta: 'Explore website concept', assessmentCta: 'Assess this starting point',
      showcase: {
        eyebrow: 'The city begins indoors', title: 'Light arrives before the noise.', intro: 'Solerna uses shade, height and nearby views to present apartments without reducing them to an equipment table. Basic proves presence; it adds no booking or workspace.',
        moments: [
          { number: '01', title: 'Choose through light', text: 'Orientation, threshold and relationship to the rooftops distinguish every stay with few elements.' },
          { number: '02', title: 'The city stays human in scale', text: 'Streets and everyday rhythms help picture the stay without inventing experiences.' },
          { number: '03', title: 'Presence before system', text: 'The exit opens the assessment; this route checks no date, collects no data and confirms no night.' },
        ],
      },
    },
    {
      slug: 'cendra', number: '12', brand: 'Cendra Hotel', vertical: 'hotels', verticalLabel: 'Hotel', plan: 'inteligente', planLabel: 'Intelligent', status: 'original', statusLabel: 'Navigable concept',
      summary: 'A city hotel in a former printing works, where architecture, arrival and operations share one clear direction.',
      visualIntent: 'Blackened brick, steel, restrained planting and minimal amber light create a deep urban identity without corporate polish.',
      businessProblem: 'A hotel with several zones and shifts needs to explain its character and anticipate priorities without turning its website into a control centre.',
      visibleLabel: 'Visible pages and surfaces', visiblePages: ['Editorial home', 'Rooms', 'The courtyard', 'Building and city'],
      boundaryLabel: 'Evidence boundary', boundary: 'Fictional website concept; it is not a real hotel and does not demonstrate the Intelligent workspace, inventory, tasks, revenue, AI or live coordination.',
      image: '/media/cendra/hero.webp', imageAlt: 'Fictional hotel courtyard in a former brick printing works for Cendra Hotel', demoHref: '/en/webs/cendra/', demoCta: 'Explore website concept', assessmentCta: 'Assess this starting point',
      showcase: {
        eyebrow: 'A printing works turned hotel', title: 'The building keeps its pulse.', intro: 'Cendra presents rooms, circulation and shared spaces as parts of one experience. Operational anticipation belongs to Intelligent scope and is proven elsewhere.',
        moments: [
          { number: '01', title: 'The layers remain visible', text: 'Brick, courtyards and galleries tell the transformation without becoming industrial set dressing.' },
          { number: '02', title: 'Arrival also means orientation', text: 'Routes and shared spaces reduce uncertainty without simulating check-in or access control.' },
          { number: '03', title: 'Intelligence requires evidence', text: 'Operations, revenue and copilot live in Aurem; this website runs and predicts nothing.' },
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
