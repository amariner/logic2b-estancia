import { expect, test, type Page } from '@playwright/test';

const origin = 'https://estancia.logic2b.com';
const translatedPairs = [
  ['/', '/en/'],
  ['/docs/', '/en/docs/'],
  ['/legal/', '/en/legal/'],
  ['/privacidad/', '/en/privacidad/'],
  ['/cookies/', '/en/cookies/'],
  ['/soluciones/casas-rurales/', '/en/solutions/rural-stays/'],
  ['/soluciones/apartamentos/', '/en/solutions/apartments/'],
  ['/soluciones/hoteles/', '/en/solutions/hotels/'],
  ['/planes/', '/en/plans/'],
  ['/diagnostico/', '/en/assessment/'],
] as const;
const spanishOnly = [
  '/recursos/gestor-reservas-apartamentos-turisticos/',
  '/recursos/web-hotel-reservas-directas-operacion/',
];
const indexableRoutes = [...translatedPairs.flat(), ...spanishOnly];

async function expectTechnicalSeo(page: Page, path: string) {
  const response = await page.goto(path);
  expect(response?.status(), path).toBe(200);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${origin}${path}`);
  const schemaTypes = (await page.locator('script[type="application/ld+json"]').allTextContents()).flatMap((value) => {
    const parsed = JSON.parse(value) as { '@type'?: string } | { '@type'?: string }[];
    return (Array.isArray(parsed) ? parsed : [parsed]).map((item) => item['@type']);
  });
  expect(schemaTypes, path).toEqual(expect.arrayContaining(['Organization', 'WebSite']));
}

test('canonical and hreflang map every translated route to a real final URL', async ({ page, request }) => {
  for (const [esPath, enPath] of translatedPairs) {
    for (const path of [esPath, enPath]) {
      await expectTechnicalSeo(page, path);
      await expect(page.locator('link[rel="alternate"][hreflang="es"]')).toHaveAttribute('href', `${origin}${esPath}`);
      await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute('href', `${origin}${enPath}`);
      await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute('href', `${origin}${esPath}`);
    }
    expect((await request.get(esPath)).status()).toBe(200);
    expect((await request.get(enPath)).status()).toBe(200);
  }
});

test('Spanish-only resources do not advertise missing translations', async ({ page }) => {
  for (const path of spanishOnly) {
    await expectTechnicalSeo(page, path);
    await expect(page.locator('link[rel="alternate"]')).toHaveCount(0);
    await expect(page.locator('.locale')).toHaveCount(0);
  }
});

test('sitemap contains every indexable final URL exactly once and excludes demos', async ({ request }) => {
  const response = await request.get('/sitemap.xml');
  expect(response.status()).toBe(200);
  const xml = await response.text();
  const locations = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  expect(locations).toHaveLength(indexableRoutes.length);
  expect(new Set(locations).size).toBe(locations.length);
  expect(locations.sort()).toEqual(indexableRoutes.map((path) => `${origin}${path}`).sort());
  expect(xml).not.toContain('/demos/');
  for (const path of indexableRoutes) expect((await request.get(path)).status(), path).toBe(200);
});

test('commercial search surfaces use specific, unique metadata and people-first headings', async ({ page }) => {
  const commercialRoutes = [
    '/', '/en/', '/planes/', '/en/plans/',
    '/soluciones/casas-rurales/', '/en/solutions/rural-stays/',
    '/soluciones/apartamentos/', '/en/solutions/apartments/',
    '/soluciones/hoteles/', '/en/solutions/hotels/',
    '/diagnostico/', '/en/assessment/',
  ];
  const titles = new Set<string>();
  const descriptions = new Set<string>();

  for (const path of commercialRoutes) {
    await page.goto(path);
    const title = await page.title();
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    const heading = (await page.locator('h1').innerText()).trim();
    expect(title.length, `${path} title length`).toBeGreaterThanOrEqual(35);
    expect(title.length, `${path} title length`).toBeLessThanOrEqual(75);
    expect(description?.length, `${path} description length`).toBeGreaterThanOrEqual(110);
    expect(description?.length, `${path} description length`).toBeLessThanOrEqual(180);
    expect(heading.length, `${path} heading usefulness`).toBeGreaterThan(20);
    expect(titles.has(title), `${path} duplicate title`).toBe(false);
    expect(descriptions.has(description ?? ''), `${path} duplicate description`).toBe(false);
    titles.add(title);
    descriptions.add(description ?? '');
  }

  await page.goto('/');
  const schemas = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((value) => JSON.parse(value));
  expect(schemas.map((schema) => schema['@type'])).toEqual(expect.arrayContaining(['FAQPage', 'Service']));
  await expect(page.getByRole('link', { name: 'Casa rural', exact: true }).first()).toHaveAttribute('href', '/soluciones/casas-rurales/');
  await expect(page.getByRole('link', { name: 'Apartamentos', exact: true }).first()).toHaveAttribute('href', '/soluciones/apartamentos/');
  await expect(page.getByRole('link', { name: 'Hoteles', exact: true }).first()).toHaveAttribute('href', '/soluciones/hoteles/');
});
