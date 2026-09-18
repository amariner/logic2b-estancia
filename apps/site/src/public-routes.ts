import { getWebPortfolio } from './web-portfolio';
import { getPublishedPanels } from './panel-portfolio';
import { getPublishedGuides } from './guide-portfolio';

const sharedRoutes = ['/', '/docs/', '/legal/', '/privacidad/', '/cookies/'] as const;
// /webs/:slug is the editorial case; /temas/:slug is its commercial design brief.
// Both have distinct content and self canonicals; embedded variants are noindex in the Worker.
const portfolioRoutes = getWebPortfolio('es').flatMap(({ slug }) => [`/webs/${slug}/`, `/en/webs/${slug}/`]);
const themeRoutes = getWebPortfolio('es').flatMap(({ slug }) => [`/temas/${slug}/`, `/en/temas/${slug}/`]);
const publishedPanelRoutes = [
  '/paneles/', '/en/panels/',
  ...getPublishedPanels('es').map((panel) => `/paneles/${panel.slug}/`),
  ...getPublishedPanels('en').map((panel) => `/en/panels/${panel.slug}/`),
];
const publishedGuideRoutes = [
  ...getPublishedGuides('es').map((guide) => `/docs/${guide.slug}/`),
  ...getPublishedGuides('en').map((guide) => `/en/docs/${guide.slug}/`),
];

export const INDEXABLE_PATHS = [
  ...sharedRoutes.flatMap((route) => [route, `/en${route}`]),
  '/soluciones/casas-rurales/', '/en/solutions/rural-stays/',
  '/soluciones/apartamentos/', '/en/solutions/apartments/',
  '/soluciones/hoteles/', '/en/solutions/hotels/',
  '/planes/', '/en/plans/', '/webs/', '/en/webs/', '/diagnostico/', '/en/assessment/',
  '/recorrido/', '/en/journey/',
  ...portfolioRoutes,
  ...themeRoutes,
  ...publishedPanelRoutes,
  ...publishedGuideRoutes,
  '/recursos/gestor-reservas-apartamentos-turisticos/',
  '/recursos/web-hotel-reservas-directas-operacion/',
] as const;

export const ANALYTICS_SAFE_PATHS = [
  ...INDEXABLE_PATHS,
  '/soluciones/gestores/',
  '/en/solutions/managers/',
] as const;
