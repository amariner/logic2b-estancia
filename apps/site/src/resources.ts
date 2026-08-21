export const SPANISH_RESOURCE_SLUGS = [
  'gestor-reservas-apartamentos-turisticos',
  'web-hotel-reservas-directas-operacion',
] as const;

export type SpanishResourceSlug = (typeof SPANISH_RESOURCE_SLUGS)[number];

export const SPANISH_RESOURCES = {
  'gestor-reservas-apartamentos-turisticos': {
    slug: 'gestor-reservas-apartamentos-turisticos',
    href: '/recursos/gestor-reservas-apartamentos-turisticos/',
    segment: 'apartments',
    title: 'Cómo elegir un gestor de reservas para apartamentos turísticos',
    seoTitle: 'Gestor de reservas para apartamentos: guía',
    description: 'Criterios para conectar solicitudes, reservas, planning, huéspedes y web sin añadir complejidad innecesaria.',
    eyebrow: 'Guía para gestores multiunidad',
    intro: 'El mejor punto de partida no es el software con más módulos, sino el que elimina los cambios de contexto que hoy frenan la venta y la operación.',
    homeSummary: 'Consulta, reservas, planning, huéspedes y web: qué debe avanzar junto y qué exige validación.',
    related: {
      title: 'Antes de elegir gestor, revisa el recorrido real.',
      body: 'Separar web, inventario, planning y reservas evita comprar complejidad que todavía no necesitas.',
      cta: 'Leer la guía para elegir gestor',
    },
    sections: [
      ['Empieza por el recorrido real', 'Documenta desde dónde llega una solicitud, quién comprueba disponibilidad, cómo se propone una alternativa y en qué momento se convierte en reserva. Ese recorrido revela qué debe compartir contexto.'],
      ['Distingue web de inventario', 'Una web puede recibir una solicitud sin prometer disponibilidad. Un gestor real, en cambio, necesita reglas de inventario, asignación y actualización que deben validarse antes de conectarse.'],
      ['Decide por capacidades', 'Si solo necesitas captar consultas, una web gestionada puede bastar. Cuando necesitas reservas, planning, huéspedes o tarifas, aparece el valor de un dashboard. Equipos, incidencias y automatización pertenecen a una capa operativa posterior.'],
      ['Pide una demostración honesta', 'Comprueba qué interacciones son locales, qué proveedores están conectados y qué trabajo requiere una implantación real. Una etiqueta clara evita convertir una demo en una promesa de producción.'],
    ],
  },
  'web-hotel-reservas-directas-operacion': {
    slug: 'web-hotel-reservas-directas-operacion',
    href: '/recursos/web-hotel-reservas-directas-operacion/',
    segment: 'hotels',
    title: 'Web de hotel y operación: qué debe conectarse de verdad',
    seoTitle: 'Web de hotel y operación: guía',
    description: 'Una guía para separar venta directa, reservas y operación hotelera antes de presupuestar una solución todo en uno.',
    eyebrow: 'Guía para hoteles independientes',
    intro: 'La venta directa no termina al confirmar una estancia. La promesa al huésped solo se sostiene cuando reserva, habitación y equipo comparten el mismo contexto.',
    homeSummary: 'Venta directa, llegadas, equipo e integraciones: separa el alcance antes de presupuestar.',
    related: {
      title: 'Antes de conectar web y operación, define la fuente de verdad.',
      body: 'Distingue venta directa, llegadas, equipo e integraciones que requieren un alcance explícito.',
      cta: 'Leer la guía sobre web y operación',
    },
    sections: [
      ['La web debe expresar la marca', 'La arquitectura puede ser modular sin convertir el hotel en una plantilla genérica. Contenido, fotografías, propuesta y recorrido de compra se adaptan; hosting y mantenimiento se estandarizan.'],
      ['Una llegada concentra el riesgo', 'Asignación, cobro, preferencias, limpieza e incidencias convergen antes del check-in. Un centro operativo debe priorizar excepciones y responsables, no limitarse a mostrar métricas.'],
      ['La IA necesita límites', 'Un copiloto útil prepara una respuesta o recomendación, muestra sus fuentes y espera confirmación. No debe enviar mensajes, cambiar precios o modificar reservas de forma autónoma.'],
      ['Valida cada integración', 'Canales, pagos, cerraduras o mensajería tienen proveedores y contratos distintos. Deben presupuestarse y probarse como alcance explícito, nunca aparecer conectados solo porque existen en una pantalla.'],
    ],
  },
} as const satisfies Record<SpanishResourceSlug, {
  slug: SpanishResourceSlug;
  href: `/recursos/${string}/`;
  segment: 'apartments' | 'hotels';
  title: string;
  seoTitle: string;
  description: string;
  eyebrow: string;
  intro: string;
  homeSummary: string;
  related: { title: string; body: string; cta: string };
  sections: readonly (readonly [string, string])[];
}>;

export const spanishResources = SPANISH_RESOURCE_SLUGS.map((slug) => SPANISH_RESOURCES[slug]);

export function getSpanishResourceForSegment(segment: string) {
  return spanishResources.find((resource) => resource.segment === segment);
}
