import { PORTFOLIO_ORIGINAL_SLUGS } from './web-portfolio';
import { getPublishedPanels } from './panel-portfolio';

const sharedRoutes = ['/', '/docs/', '/legal/', '/privacidad/', '/cookies/'] as const;
const originalPortfolioRoutes = PORTFOLIO_ORIGINAL_SLUGS.flatMap((slug) => [`/webs/${slug}/`, `/en/webs/${slug}/`]);
const publishedPanelRoutes = [
  '/paneles/', '/en/panels/',
  ...getPublishedPanels('es').map((panel) => `/paneles/${panel.slug}/`),
  ...getPublishedPanels('en').map((panel) => `/en/panels/${panel.slug}/`),
];

export const INDEXABLE_PATHS = [
  ...sharedRoutes.flatMap((route) => [route, `/en${route}`]),
  '/soluciones/casas-rurales/', '/en/solutions/rural-stays/',
  '/soluciones/apartamentos/', '/en/solutions/apartments/',
  '/soluciones/hoteles/', '/en/solutions/hotels/',
  '/planes/', '/en/plans/', '/webs/', '/en/webs/', '/diagnostico/', '/en/assessment/',
  ...originalPortfolioRoutes,
  ...publishedPanelRoutes,
  '/recursos/gestor-reservas-apartamentos-turisticos/',
  '/recursos/web-hotel-reservas-directas-operacion/',
] as const;

export const ANALYTICS_SAFE_PATHS = [
  ...INDEXABLE_PATHS,
  '/soluciones/gestores/',
  '/en/solutions/managers/',
] as const;
