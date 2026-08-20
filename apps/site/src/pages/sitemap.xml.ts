import { PRODUCT } from '@logic-estancia/config';
import { INDEXABLE_PATHS } from '../public-routes';

export const GET = () => new Response(
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${INDEXABLE_PATHS.map((path) => `<url><loc>${PRODUCT.url}${path}</loc></url>`).join('')}</urlset>`,
  { headers: { 'content-type': 'application/xml; charset=utf-8' } },
);
