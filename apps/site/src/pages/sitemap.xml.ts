import { PRODUCT } from '@logic-estancia/config';
export const GET = () => new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['/','/en/','/docs/','/en/docs/','/legal/','/privacidad/','/cookies/'].map((path) => `<url><loc>${PRODUCT.url}${path}</loc></url>`).join('')}</urlset>`, { headers: { 'content-type': 'application/xml' } });
