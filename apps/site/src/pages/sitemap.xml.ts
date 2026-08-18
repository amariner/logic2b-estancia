import { PRODUCT } from '@logic-estancia/config';

const sharedRoutes = ['/', '/docs/', '/legal/', '/privacidad/', '/cookies/'];
const paths = [
  ...sharedRoutes.flatMap((route) => [route, `/en${route}`]),
  '/soluciones/casas-rurales/', '/en/solutions/rural-stays/',
  '/soluciones/apartamentos/', '/en/solutions/apartments/',
  '/soluciones/hoteles/', '/en/solutions/hotels/',
  '/planes/', '/en/plans/', '/diagnostico/', '/en/assessment/',
  '/recursos/gestor-reservas-apartamentos-turisticos/',
  '/recursos/web-hotel-reservas-directas-operacion/',
];

export const GET = () => new Response(
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((path) => `<url><loc>${PRODUCT.url}${path}</loc></url>`).join('')}</urlset>`,
  { headers: { 'content-type': 'application/xml; charset=utf-8' } },
);
