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

export type ThemeComposition = 'split' | 'landscape' | 'framed';

export function themeCompositionLabel(locale: Locale, composition: ThemeComposition): string {
  const labels = locale === 'en'
    ? { split: 'Split: copy and image', landscape: 'Full-bleed landscape', framed: 'Framed and centred' }
    : { split: 'Dividida: texto e imagen', landscape: 'Paisaje a sangre', framed: 'Enmarcada y centrada' };
  return labels[composition];
}

export interface ThemeAnatomyPart { index: string; region: 'nav' | 'hero' | 'pages' | 'contact' | 'footer'; title: string; text: string }

/** Legend for the theme wireframe: every item describes what the design shows, never an operation. */
export function themeAnatomy(locale: Locale, concept: WebPortfolioConcept, composition: ThemeComposition): ThemeAnatomyPart[] {
  const pages = concept.visiblePages.join(' · ');
  return locale === 'en' ? [
    { index: '01', region: 'nav', title: 'Brand and navigation', text: `${concept.brand} name with direct access to ${concept.visiblePages.length} sections.` },
    { index: '02', region: 'hero', title: `Hero · ${themeCompositionLabel(locale, composition).toLowerCase()}`, text: concept.visualIntent },
    { index: '03', region: 'pages', title: 'Pages and surfaces', text: pages },
    { index: '04', region: 'contact', title: 'Route to contact', text: 'Clear calls to action on mobile and desktop, adapted to how you welcome guests.' },
    { index: '05', region: 'footer', title: 'Essential footer', text: 'Contact details, legal pages and key links, under your domain.' },
  ] : [
    { index: '01', region: 'nav', title: 'Marca y navegación', text: `Nombre de ${concept.brand} con acceso directo a ${concept.visiblePages.length} secciones.` },
    { index: '02', region: 'hero', title: `Portada · ${themeCompositionLabel(locale, composition).toLowerCase()}`, text: concept.visualIntent },
    { index: '03', region: 'pages', title: 'Páginas y superficies', text: pages },
    { index: '04', region: 'contact', title: 'Acceso al contacto', text: 'Llamadas a la acción claras en móvil y escritorio, adaptadas a tu forma de recibir huéspedes.' },
    { index: '05', region: 'footer', title: 'Pie esencial', text: 'Datos de contacto, páginas legales y enlaces clave, bajo tu dominio.' },
  ];
}

export function themeProcess(locale: Locale, concept: WebPortfolioConcept): Array<[string, string]> {
  return locale === 'en' ? [
    ['You choose the direction', `${concept.brand} sets the starting tone, structure and composition.`],
    ['We adapt your brand', 'Photography, typography and colour move to your identity.'],
    ['We prepare the content', 'Structure, copy and contact routes around your property.'],
    ['We publish it on your domain', 'You review it before launch; hosting and maintenance included.'],
  ] : [
    ['Eliges la dirección', `${concept.brand} marca el tono, la estructura y la composición de partida.`],
    ['Adaptamos tu marca', 'Fotografía, tipografía y color pasan a tu identidad.'],
    ['Preparamos el contenido', 'Estructura, textos y accesos al contacto alrededor de tu alojamiento.'],
    ['Lo publicamos en tu dominio', 'Lo revisas antes de publicar; hosting y mantenimiento incluidos.'],
  ];
}
