import type { Locale } from '@logic-estancia/config';

export type BusinessSegment = 'rural' | 'apartments' | 'hotels';

const businesses = {
  rural: {
    image: '/media/terrava/hero.webp',
    demo: 'terrava',
    es: {
      label: 'Casa rural',
      plural: 'Casas rurales',
      href: '/soluciones/casas-rurales/',
      homeTitle: 'Haz que recuerden tu casa antes de compararla por precio.',
      homeText: 'Marca propia, consultas directas y una gestión que respeta el carácter de cada estancia.',
    },
    en: {
      label: 'Rural stays',
      plural: 'Rural stays',
      href: '/en/solutions/rural-stays/',
      homeTitle: 'Make guests remember your stay before comparing it on price.',
      homeText: 'Your own brand, direct enquiries and management that protects each stay’s character.',
    },
  },
  apartments: {
    image: '/media/nivora/hero.webp',
    demo: 'nivora',
    es: {
      label: 'Apartamentos',
      plural: 'Apartamentos turísticos',
      href: '/soluciones/apartamentos/',
      homeTitle: 'Crece sin abrir otra hoja por cada apartamento.',
      homeText: 'Una vía directa para vender y un recorrido común para consultas, reservas y huéspedes.',
    },
    en: {
      label: 'Apartments',
      plural: 'Holiday apartments',
      href: '/en/solutions/apartments/',
      homeTitle: 'Grow without opening another sheet for every apartment.',
      homeText: 'A direct route to market and one journey for enquiries, bookings and guests.',
    },
  },
  hotels: {
    image: '/media/aurem/hero.webp',
    demo: 'aurem',
    es: {
      label: 'Hoteles',
      plural: 'Hoteles',
      href: '/soluciones/hoteles/',
      homeTitle: 'Llega al turno sabiendo qué necesita atención.',
      homeText: 'Llegadas, habitaciones e incidencias con un contexto compartido antes de que mande la urgencia.',
    },
    en: {
      label: 'Hotels',
      plural: 'Hotels',
      href: '/en/solutions/hotels/',
      homeTitle: 'Start the shift knowing what needs attention.',
      homeText: 'Arrivals, rooms and incidents with shared context before urgency takes over.',
    },
  },
} as const;

export const BUSINESS_SEGMENTS = ['rural', 'apartments', 'hotels'] as const;

export function getBusiness(segment: BusinessSegment, locale: Locale) {
  const business = businesses[segment];
  return { id: segment, image: business.image, demo: business.demo, ...business[locale] };
}

export function getBusinesses(locale: Locale) {
  return BUSINESS_SEGMENTS.map((segment) => getBusiness(segment, locale));
}
