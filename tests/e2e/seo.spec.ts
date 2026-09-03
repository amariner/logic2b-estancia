import { expect, test, type Page } from '@playwright/test';

const origin = 'https://estancia.logic2b.com';
const translatedPairs = [
  ['/', '/en/'],
  ['/docs/', '/en/docs/'],
  ['/docs/direccion-propiedad/', '/en/docs/ownership-direction/'],
  ['/docs/reservas-recepcion/', '/en/docs/reservations-reception/'],
  ['/legal/', '/en/legal/'],
  ['/privacidad/', '/en/privacidad/'],
  ['/cookies/', '/en/cookies/'],
  ['/soluciones/casas-rurales/', '/en/solutions/rural-stays/'],
  ['/soluciones/apartamentos/', '/en/solutions/apartments/'],
  ['/soluciones/hoteles/', '/en/solutions/hotels/'],
  ['/planes/', '/en/plans/'],
  ['/webs/', '/en/webs/'],
  ['/paneles/', '/en/panels/'],
  ['/paneles/solicitudes/', '/en/panels/enquiries/'],
  ['/paneles/planning/', '/en/panels/planning/'],
  ['/paneles/huespedes-llegadas/', '/en/panels/guests-arrivals/'],
  ['/paneles/preparacion/', '/en/panels/preparation/'],
  ['/paneles/operacion-ingresos/', '/en/panels/operations-revenue/'],
  ['/paneles/copiloto-supervisado/', '/en/panels/supervised-copilot/'],
  ['/webs/linde/', '/en/webs/linde/'],
  ['/webs/cobalto/', '/en/webs/cobalto/'],
  ['/webs/oria/', '/en/webs/oria/'],
  ['/webs/boscara/', '/en/webs/boscara/'],
  ['/webs/velares/', '/en/webs/velares/'],
  ['/webs/nocta/', '/en/webs/nocta/'],
  ['/webs/riscoa/', '/en/webs/riscoa/'],
  ['/webs/solerna/', '/en/webs/solerna/'],
  ['/webs/cendra/', '/en/webs/cendra/'],
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

async function resourceHrefs(page: Page) {
  return page.locator('a[href]').evaluateAll((links) => links
    .map((link) => link.getAttribute('href'))
    .filter((href): href is string => Boolean(href?.startsWith('/recursos/') || href?.startsWith('/en/recursos/'))));
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

test('every indexable title uses the public brand and stays within a useful search length', async ({ page }) => {
  const resourceTitles = new Map([
    [spanishOnly[0], 'Gestor de reservas para apartamentos: guía | Logic2B Estancias'],
    [spanishOnly[1], 'Web de hotel y operación: guía | Logic2B Estancias'],
  ]);

  for (const path of indexableRoutes) {
    await page.goto(path);
    const title = await page.title();
    expect(title, `${path} public brand`).toMatch(/(?:\||·) Logic2B Estancias$/);
    expect(title, `${path} legacy brand`).not.toMatch(/(?:\||·) Logic Estancia$/);
    expect(title.length, `${path} title minimum`).toBeGreaterThanOrEqual(20);
    expect(title.length, `${path} title maximum`).toBeLessThanOrEqual(spanishOnly.includes(path) ? 65 : 75);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', title);
    await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute('content', title);
    if (resourceTitles.has(path)) expect(title, path).toBe(resourceTitles.get(path));
  }

  for (const path of ['/docs/', '/en/docs/', '/legal/', '/en/legal/']) {
    await page.goto(path);
    await expect(page.locator('main')).toContainText('Logic2B Estancias');
    await expect(page.locator('main')).not.toContainText(/\bLogic Estancia\b/);
  }
});

test('Spanish home exposes exactly the two live resources', async ({ page, request }) => {
  await page.goto('/');
  expect(await resourceHrefs(page)).toEqual(spanishOnly);

  for (const href of spanishOnly) {
    const response = await request.get(href);
    expect(response.status(), href).toBe(200);
  }
});

test('resource links stay contextual on Spanish solutions and absent from English surfaces', async ({ page }) => {
  const spanishSolutions = [
    ['/soluciones/apartamentos/', spanishOnly[0]],
    ['/soluciones/hoteles/', spanishOnly[1]],
    ['/soluciones/casas-rurales/', null],
  ] as const;

  for (const [path, expectedHref] of spanishSolutions) {
    await page.goto(path);
    expect(await resourceHrefs(page), path).toEqual(expectedHref ? [expectedHref] : []);
  }

  const englishSurfaces = [
    '/en/',
    '/en/solutions/apartments/',
    '/en/solutions/hotels/',
    '/en/solutions/rural-stays/',
  ];

  for (const path of englishSurfaces) {
    await page.goto(path);
    expect(await resourceHrefs(page), path).toEqual([]);
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
    '/', '/en/', '/planes/', '/en/plans/', '/webs/', '/en/webs/',
    '/docs/', '/en/docs/', '/docs/direccion-propiedad/', '/en/docs/ownership-direction/', '/docs/reservas-recepcion/', '/en/docs/reservations-reception/',
    '/paneles/', '/en/panels/', '/paneles/solicitudes/', '/en/panels/enquiries/', '/paneles/planning/', '/en/panels/planning/',
    '/paneles/huespedes-llegadas/', '/en/panels/guests-arrivals/', '/paneles/preparacion/', '/en/panels/preparation/',
    '/paneles/operacion-ingresos/', '/en/panels/operations-revenue/', '/paneles/copiloto-supervisado/', '/en/panels/supervised-copilot/',
    '/webs/linde/', '/en/webs/linde/', '/webs/cobalto/', '/en/webs/cobalto/', '/webs/oria/', '/en/webs/oria/',
    '/webs/boscara/', '/en/webs/boscara/', '/webs/velares/', '/en/webs/velares/', '/webs/nocta/', '/en/webs/nocta/',
    '/webs/riscoa/', '/en/webs/riscoa/', '/webs/solerna/', '/en/webs/solerna/', '/webs/cendra/', '/en/webs/cendra/',
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
