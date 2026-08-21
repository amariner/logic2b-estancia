export const PRODUCT = {
  name: 'Logic2B Estancias',
  publicName: 'Logic2B Estancias',
  lockup: 'Logic2B Estancias',
  domain: 'estancia.logic2b.com',
  url: 'https://estancia.logic2b.com',
  email: 'hola@logic2b.com',
  locales: ['es', 'en'] as const,
  futureLocales: ['ca', 'fr', 'de', 'nl'] as const,
  demoSlugs: ['nivora', 'terrava', 'aurem'] as const,
};

export const CONSENT = {
  key: 'logic-estancia-consent',
  legacyKey: 'logic-estancia-consent-v1',
  version: '1.0.0',
} as const;

export type Locale = (typeof PRODUCT.locales)[number];

export const demoUrl = (slug: (typeof PRODUCT.demoSlugs)[number], locale: Locale = 'es') =>
  `${locale === 'en' ? '/en' : ''}/demos/${slug}/`;
