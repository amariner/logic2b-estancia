import { expect, test, type Page } from '@playwright/test';

const origin = 'https://estancia.logic2b.com';
const translatedPairs = [
  ['/', '/en/'],
  ['/docs/', '/en/docs/'],
  ['/legal/', '/en/legal/'],
  ['/privacidad/', '/en/privacidad/'],
  ['/cookies/', '/en/cookies/'],
  ['/soluciones/gestores/', '/en/solutions/managers/'],
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
