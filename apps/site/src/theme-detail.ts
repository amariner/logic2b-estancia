import type { Locale } from '@logic-estancia/config';
import type { WebPortfolioConcept } from './web-portfolio';
import type { PlanHandoffSource } from './plan-contract';

export const THEME_HANDOFF_SOURCES: readonly PlanHandoffSource[] = ['/', '/en/', '/webs/', '/en/webs/'];

export const themeDetailHref = (locale: Locale, slug: WebPortfolioConcept['slug']) => `${locale === 'en' ? '/en' : ''}/temas/${slug}/`;
export function themeRequestHref(locale: Locale, concept: WebPortfolioConcept, sourcePath: PlanHandoffSource = locale === 'en' ? '/en/webs/' : '/webs/'): string {
  const source = THEME_HANDOFF_SOURCES.includes(sourcePath) ? sourcePath : (locale === 'en' ? '/en/webs/' : '/webs/');
  const params = new URLSearchParams({ theme: concept.slug, plan: concept.plan, sourcePath: source });
  return `${locale === 'en' ? '/en' : ''}/?${params}#contacto`;
}

export function themeMetadata(locale: Locale, concept: WebPortfolioConcept) {
  return locale === 'en' ? {
    title: `${concept.brand}: website design | Logic2B Estancias`,
    description: `Explore the ${concept.brand} design for ${concept.verticalLabel.toLowerCase()}: preview, brand adaptation and starting plan. Fictional example with no live bookings.`,
  } : {
    title: `${concept.brand}: diseño de web | Logic2B Estancias`,
    description: `Explora el diseño ${concept.brand} para ${concept.verticalLabel.toLowerCase()}: vista previa, adaptación de marca y plan de partida. Ejemplo ficticio sin reservas reales.`,
  };
}

export function themeBenefits(locale: Locale, concept: WebPortfolioConcept): string[] {
  return locale === 'en' ? [
    `A clear structure for ${concept.visiblePages.map(page => page.toLowerCase()).join(', ')}.`,
    'Photography, typography and colour adapted to your identity.',
    'Straightforward navigation on mobile and desktop.',
    'Clear contact routes, with content focused on your guests.',
  ] : [
    `Una estructura clara para ${concept.visiblePages.map(page => page.toLowerCase()).join(', ')}.`,
    'Fotografía, tipografía y color adaptados a tu identidad.',
    'Navegación sencilla en móvil y escritorio.',
    'Accesos claros al contacto, con contenido pensado para tus huéspedes.',
  ];
}
