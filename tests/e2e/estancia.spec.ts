import { expect, test, type Page } from '@playwright/test';

const appOrigin = 'http://127.0.0.1:8790';
const originalWebConcepts = ['linde', 'cobalto', 'oria', 'boscara', 'velares', 'nocta', 'riscoa', 'solerna', 'cendra'] as const;
const originalWebPaths = originalWebConcepts.flatMap((slug) => [`/webs/${slug}/`, `/en/webs/${slug}/`]);

const paths = [
  '/', '/en/', '/docs/', '/en/docs/',
  '/docs/direccion-propiedad/', '/docs/reservas-recepcion/',
  '/en/docs/ownership-direction/', '/en/docs/reservations-reception/',
  '/docs/operaciones/', '/en/docs/operations/',
  '/docs/marketing-ingresos/', '/en/docs/marketing-revenue/',
  '/soluciones/casas-rurales/', '/soluciones/apartamentos/', '/soluciones/hoteles/', '/planes/', '/webs/', '/diagnostico/',
  '/paneles/', '/paneles/solicitudes/', '/paneles/planning/', '/paneles/huespedes-llegadas/', '/paneles/preparacion/', '/paneles/operacion-ingresos/', '/paneles/copiloto-supervisado/',
  '/en/solutions/rural-stays/', '/en/solutions/apartments/', '/en/solutions/hotels/', '/en/plans/', '/en/webs/', '/en/assessment/',
  '/en/panels/', '/en/panels/enquiries/', '/en/panels/planning/', '/en/panels/guests-arrivals/', '/en/panels/preparation/', '/en/panels/operations-revenue/', '/en/panels/supervised-copilot/',
  ...originalWebPaths,
  '/recursos/gestor-reservas-apartamentos-turisticos/', '/recursos/web-hotel-reservas-directas-operacion/',
  '/legal/', '/privacidad/', '/cookies/',
  '/en/legal/', '/en/privacidad/', '/en/cookies/',
  '/demos/nivora/', '/demos/terrava/', '/demos/aurem/',
  '/demos/terrava/gestion/', '/demos/aurem/gestion/',
  '/en/demos/nivora/', '/en/demos/terrava/', '/en/demos/aurem/',
  '/en/demos/terrava/gestion/', '/en/demos/aurem/gestion/',
];

const demoLandingCases = [
  { path: '/demos/nivora/', managerHref: null, panelName: 'Simulación local de una solicitud por email para Nivora One' },
  { path: '/demos/terrava/', managerHref: '/demos/terrava/gestion/?vista=home', panelName: 'Panel visual ficticio de Terrava Collection' },
  { path: '/demos/aurem/', managerHref: '/demos/aurem/gestion/?vista=home', panelName: 'Panel visual ficticio de Aurem Hotel' },
  { path: '/en/demos/nivora/', managerHref: null, panelName: 'Local email enquiry simulation for Nivora One' },
  { path: '/en/demos/terrava/', managerHref: '/en/demos/terrava/gestion/?vista=home', panelName: 'Terrava Collection fictitious visual panel' },
  { path: '/en/demos/aurem/', managerHref: '/en/demos/aurem/gestion/?vista=home', panelName: 'Aurem Hotel fictitious visual panel' },
] as const;

const demoDashboardPaths = [
  '/demos/terrava/gestion/', '/demos/aurem/gestion/',
  '/en/demos/terrava/gestion/', '/en/demos/aurem/gestion/',
] as const;

const operationalMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

const commercialLeadManifest = {
  schemaVersion: '1.0.0', mode: 'demo', demoMode: true, commercialLeadsEnabled: true,
  sideEffects: true, durableWrites: true, jobs: false,
  providers: { analytics: 'disabled', email: 'live', payments: 'disabled', webhooks: 'disabled', externalStorage: 'disabled' },
  operations: { commercialLead: 'active', payments: 'unavailable', webhooks: 'unavailable', automations: 'unavailable' },
};

async function enableCommercialLead(page: Page) {
  await page.route('**/api/capabilities', (route) => route.fulfill({ contentType: 'application/json', body: JSON.stringify(commercialLeadManifest) }));
}

async function expectCleanPage(page: Page, path: string) {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
  expect(response?.status(), path).toBe(200);
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${path} has horizontal overflow`).toBe(true);
  expect(errors, `${path} emitted browser errors`).toEqual([]);
}

test('public routes are complete and demos remain isolated', async ({ page }) => {
  for (const path of paths) {
    await expectCleanPage(page, path);
    if (path.includes('/demos/')) {
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
      expect(await page.locator('script[src*="googletagmanager"], script[src*="google-analytics"]').count()).toBe(0);
      expect(await page.locator('img').evaluateAll((images) => images.every((image) => image.complete && image.naturalWidth > 0))).toBe(true);
    }
  }
});

test('capability maps expose truthful evidence and exact localized targets', async ({ page, request }) => {
  await page.goto('/soluciones/casas-rurales/');
  await expect(page.locator('[data-capability-evidence]')).toHaveCount(7);
  const planning = page.locator('[data-capability="planning"]');
  await expect(planning).toContainText('Desde Gestión');
  await expect(planning).toContainText('Calendario ficticio de solo lectura');
  await expect(planning).toContainText('No cambia inventario o tarifas ni conecta PMS, disponibilidad o pagos');
  await expect(planning.locator('[data-capability-evidence]')).toHaveAttribute('href', '/demos/terrava/gestion/?vista=planning');

  await page.goto('/soluciones/hoteles/');
  await expect(page.locator('[data-capability-evidence]')).toHaveCount(6);
  await expect(page.locator('[data-capability="channels"]')).toContainText('Activable por proyecto');
  await expect(page.locator('[data-capability-evidence="channels"]')).toHaveAttribute('href', '/demos/aurem/gestion/?vista=channels');

  await page.goto('/en/plans/');
  const evidenceLinks = page.locator('[data-capability-evidence]');
  await expect(evidenceLinks).toHaveCount(14);
  await expect(page.locator('[data-capability-evidence="explainable-revenue"]')).toHaveAttribute('href', '/en/demos/aurem/gestion/?vista=reports');
  await expect(page.locator('[data-capability="supervised-ai"]')).toContainText('Visible in the demo');
  await expect(page.locator('[data-capability-evidence="supervised-ai"]')).toHaveAttribute('href', '/en/demos/aurem/gestion/?vista=automation');
  await expect(page.locator('[data-capability="revenue"]')).toContainText('Starting plan: Intelligent');
  await expect(page.locator('[data-capability="revenue"]')).toContainText('On the roadmap');
  await expect(page.locator('[data-capability-evidence-unavailable="revenue"]')).toBeVisible();
  await expect(page.locator('[data-capability-evidence="email-enquiries"]')).toHaveAttribute('href', '/en/demos/nivora/#reserva');
  await expect(page.locator('[data-capability-evidence="website-editor"]')).toHaveAttribute('href', '/en/demos/terrava/gestion/?vista=website');

  for (const href of await evidenceLinks.evaluateAll((links) => links.map((link) => link.getAttribute('href')).filter(Boolean) as string[])) {
    expect((await request.get(href)).status(), href).toBe(200);
  }
});

test('fictional cases keep their canonical plans truthful and localized', async ({ page }) => {
  const cases = [
    { slug: 'nivora', plan: 'basico', es: 'Básico', en: 'Basic', solutionEs: '/soluciones/apartamentos/', solutionEn: '/en/solutions/apartments/' },
    { slug: 'terrava', plan: 'gestion', es: 'Gestión', en: 'Management', solutionEs: '/soluciones/casas-rurales/', solutionEn: '/en/solutions/rural-stays/' },
    { slug: 'aurem', plan: 'inteligente', es: 'Inteligente', en: 'Intelligent', solutionEs: '/soluciones/hoteles/', solutionEn: '/en/solutions/hotels/' },
  ] as const;

  for (const locale of ['es', 'en'] as const) {
    const prefix = locale === 'en' ? '/en' : '';
    await page.goto(`${prefix}/`);
    for (const demo of cases) {
      const card = page.locator(`[data-demo-card="${demo.slug}"]`);
      await expect(card).toContainText(`${locale === 'es' ? 'Caso ficticio' : 'Fictional case'} · ${demo[locale]}`);
      await expect(card).toHaveAttribute('href', `${prefix}/demos/${demo.slug}/`);
    }

    for (const demo of cases) {
      await page.goto(locale === 'es' ? demo.solutionEs : demo.solutionEn);
      const proof = page.locator(`[data-demo-proof="${demo.slug}"]`);
      await expect(proof.locator('[data-demo-plan]')).toHaveAttribute('data-demo-plan', demo.plan);
      await expect(proof.locator('[data-demo-plan]')).toHaveText(demo[locale]);
      await expect(proof.locator('a')).toHaveAttribute('href', `${prefix}/demos/${demo.slug}/`);

      await page.goto(`${prefix}/demos/${demo.slug}/`);
      const demoPlan = page.locator('[data-demo-plan]');
      await expect(demoPlan).toHaveAttribute('data-demo-plan', demo.plan);
      await expect(demoPlan).toContainText(`${demo[locale]} · Logic2B Estancias`);
    }
  }
});

test('home exposes the connected product spine in both languages', async ({ page, request }) => {
  for (const [path, prefix, labels] of [
    ['/', '', { webs: 'Webs', panels: '/paneles/', gestor: 'Gestor', plans: 'Planes', recorrido: 'Ver recorrido', evidence: 'Evidencia' }],
    ['/en/', '/en', { webs: 'Websites', panels: '/en/panels/', gestor: 'Workspace', plans: 'Plans', recorrido: 'See the journey', evidence: 'Evidence' }],
  ] as const) {
    await page.goto(path);
    const header = page.locator('.site-header');
    await expect(header.getByRole('link', { name: labels.webs, exact: true })).toHaveAttribute('href', `${prefix}/webs/`);
    await expect(header.getByRole('link', { name: labels.gestor, exact: true })).toHaveAttribute('href', labels.panels);
    await expect(header.getByRole('link', { name: labels.plans, exact: true })).toHaveAttribute('href', '#planes');
    await expect(header.getByRole('link', { name: labels.recorrido, exact: true })).toHaveAttribute('href', '#recorrido');

    await expect(page.locator('[data-hero-proof]')).toHaveCount(3);
    await expect(page.locator('[data-hero-proof="nivora"]')).toContainText(/Nivora One/);
    await expect(page.locator('[data-hero-proof="terrava"]')).toContainText(/Terrava Collection/);
    await expect(page.locator('[data-hero-proof="aurem"]')).toContainText(/Aurem Hotel/);
    await expect(page.locator('[data-home-journey] [data-flow-moment]')).toHaveCount(7);
    await expect(page.locator('[data-product-explorer] [data-product-area]')).toHaveCount(5);
    await expect(page.locator('[data-capability-band] [data-capability-group]')).toHaveCount(4);

    const deepLinks = await page.locator('[data-home-journey] a, [data-product-explorer] a').evaluateAll((links) => links
      .map((link) => link.getAttribute('href'))
      .filter((href): href is string => Boolean(href && href.startsWith('/'))));
    for (const href of new Set(deepLinks)) expect((await request.get(href)).status(), href).toBe(200);
    await expect(page.locator('[data-capability-band]')).toContainText(labels.evidence);

    await page.goto(prefix ? '/en/plans/' : '/planes/');
    await expect(header.getByRole('link', { name: labels.webs, exact: true })).toHaveAttribute('href', `${prefix}/webs/`);
    await expect(header.getByRole('link', { name: labels.gestor, exact: true })).toHaveAttribute('href', labels.panels);
    await expect(header.getByRole('link', { name: labels.plans, exact: true })).toHaveAttribute('href', `${prefix}/#planes`);
    await expect(header.getByRole('link', { name: labels.recorrido, exact: true })).toHaveAttribute('href', `${prefix}/#recorrido`);
  }
});

test('panel portfolio publishes only complete localized evidence pages', async ({ page, request }) => {
  const writes: string[] = [];
  page.on('request', (request) => operationalMethods.has(request.method()) && writes.push(request.url()));

  for (const [indexPath, published] of [
    ['/paneles/', [
      ['enquiries', '/paneles/solicitudes/', '/demos/terrava/gestion/?vista=enquiries'],
      ['planning', '/paneles/planning/', '/demos/terrava/gestion/?vista=planning'],
      ['guests-arrivals', '/paneles/huespedes-llegadas/', '/demos/terrava/gestion/?vista=guests'],
      ['preparation', '/paneles/preparacion/', '/demos/aurem/gestion/?vista=cleaning'],
      ['operations-revenue', '/paneles/operacion-ingresos/', '/demos/aurem/gestion/?vista=reports'],
      ['copilot', '/paneles/copiloto-supervisado/', '/demos/aurem/gestion/?vista=automation'],
    ]],
    ['/en/panels/', [
      ['enquiries', '/en/panels/enquiries/', '/en/demos/terrava/gestion/?vista=enquiries'],
      ['planning', '/en/panels/planning/', '/en/demos/terrava/gestion/?vista=planning'],
      ['guests-arrivals', '/en/panels/guests-arrivals/', '/en/demos/terrava/gestion/?vista=guests'],
      ['preparation', '/en/panels/preparation/', '/en/demos/aurem/gestion/?vista=cleaning'],
      ['operations-revenue', '/en/panels/operations-revenue/', '/en/demos/aurem/gestion/?vista=reports'],
      ['copilot', '/en/panels/supervised-copilot/', '/en/demos/aurem/gestion/?vista=automation'],
    ]],
  ] as const) {
    await expectCleanPage(page, indexPath);
    const portfolio = page.locator('[data-panel-portfolio]');
    await expect(portfolio.locator('[data-panel-card]')).toHaveCount(6);
    await expect(portfolio.locator('[data-panel-status="published"]')).toHaveCount(6);
    await expect(portfolio.locator('[data-panel-status="preparation"]')).toHaveCount(0);
    await expect(portfolio.locator('[data-panel-status="preparation"] a')).toHaveCount(0);

    for (const [id, detailHref, evidenceHref] of published) {
      await page.goto(indexPath);
      await expect(page.locator(`[data-panel-portfolio] [data-panel-open="${id}"]`)).toHaveAttribute('href', detailHref);
      expect((await request.get(detailHref)).status(), detailHref).toBe(200);
      await expectCleanPage(page, detailHref);
      await expect(page.locator(`[data-panel-detail="${id}"]`)).toBeVisible();
      await expect(page.locator(`[data-panel-evidence="${id}"]`)).toHaveAttribute('href', evidenceHref);
      await expect(page.locator('[data-panel-boundary]')).toBeVisible();
      if (id === 'operations-revenue') await expect(page.locator('[data-panel-capability-scope]')).toContainText(indexPath === '/paneles/' ? 'Previsión de demanda y precioEn ruta' : 'Demand and pricing forecastsOn the roadmap');
      if (id === 'copilot') await expect(page.locator('[data-panel-capability-scope]')).toContainText(indexPath === '/paneles/' ? 'AutomatizacionesDemo visual pendiente' : 'AutomationsVisual demo pending');
      await expect(page.locator('[data-panel-detail] form, [data-panel-detail] input, [data-panel-detail] textarea, [data-panel-detail] select')).toHaveCount(0);
      const assessmentHref = await page.locator(`[data-panel-assess="${id}"]`).getAttribute('href');
      expect(new URL(assessmentHref ?? '', appOrigin).searchParams.get('sourcePath')).toBe(indexPath);
      expect((await request.get(evidenceHref)).status(), evidenceHref).toBe(200);
    }
  }
  expect(writes).toEqual([]);
});

test('role guides publish five complete journeys with truthful capability maturity', async ({ page, request }) => {
  const writes: string[] = [];
  page.on('request', (request) => operationalMethods.has(request.method()) && writes.push(request.url()));

  for (const [indexPath, published] of [
    ['/docs/', [
      ['direction', '/docs/direccion-propiedad/', 2, 0],
      ['reception', '/docs/reservas-recepcion/', 3, 0],
      ['operations', '/docs/operaciones/', 2, 3],
      ['marketing-revenue', '/docs/marketing-ingresos/', 1, 2],
      ['technical-privacy', '/docs/tecnica-privacidad/', 1, 3],
    ]],
    ['/en/docs/', [
      ['direction', '/en/docs/ownership-direction/', 2, 0],
      ['reception', '/en/docs/reservations-reception/', 3, 0],
      ['operations', '/en/docs/operations/', 2, 3],
      ['marketing-revenue', '/en/docs/marketing-revenue/', 1, 2],
      ['technical-privacy', '/en/docs/technical-privacy/', 1, 3],
    ]],
  ] as const) {
    await expectCleanPage(page, indexPath);
    const portfolio = page.locator('[data-guide-portfolio]');
    await expect(portfolio.locator('[data-guide-card]')).toHaveCount(5);
    await expect(portfolio.locator('[data-guide-status="published"]')).toHaveCount(5);
    await expect(portfolio.locator('[data-guide-status="preparation"]')).toHaveCount(0);
    await expect(portfolio.locator('[data-guide-status="preparation"] a')).toHaveCount(0);
    await expect(portfolio.locator('[data-guide-implementation] li')).toHaveCount(6);

    for (const [id, detailHref, evidenceCount, capabilityEvidenceCount] of published) {
      await page.goto(indexPath);
      await expect(page.locator(`[data-guide-open="${id}"]`)).toHaveAttribute('href', detailHref);
      expect((await request.get(detailHref)).status(), detailHref).toBe(200);
      await expectCleanPage(page, detailHref);
      const detail = page.locator(`[data-guide-detail="${id}"]`);
      await expect(detail).toBeVisible();
      await expect(detail.locator('[data-guide-evidence]')).toHaveCount(evidenceCount);
      await expect(detail.locator('[data-guide-capability-evidence]')).toHaveCount(capabilityEvidenceCount);
      await expect(detail.locator('[data-guide-boundary]')).toBeVisible();
      await expect(detail.locator('form, input, textarea, select')).toHaveCount(0);
      await expect(detail.locator('[data-guide-assess]')).toHaveAttribute('href', indexPath.startsWith('/en') ? '/en/assessment/' : '/diagnostico/');
      for (const href of await detail.locator('[data-guide-evidence]').evaluateAll((links) => links.map((link) => link.getAttribute('href')).filter(Boolean) as string[])) {
        expect((await request.get(href)).status(), href).toBe(200);
      }
      for (const href of await detail.locator('[data-guide-capability-evidence]').evaluateAll((links) => links.map((link) => link.getAttribute('href')).filter(Boolean) as string[])) {
        expect((await request.get(href)).status(), href).toBe(200);
      }
      if (id === 'operations') {
        const prefix = indexPath.startsWith('/en') ? '/en' : '';
        await expect(detail.locator('[data-guide-capability-evidence="operations-centre"]')).toHaveAttribute('href', `${prefix}/demos/aurem/gestion/?vista=control`);
        await expect(detail.locator('[data-guide-capability-evidence="cleaning"]')).toHaveAttribute('href', `${prefix}/demos/aurem/gestion/?vista=cleaning`);
        await expect(detail.locator('[data-guide-capability-evidence="maintenance"]')).toHaveAttribute('href', `${prefix}/demos/aurem/gestion/?vista=maintenance`);
      }
      if (id === 'marketing-revenue') {
        const prefix = indexPath.startsWith('/en') ? '/en' : '';
        await expect(detail.locator('[data-guide-capability-evidence="brand-web"]')).toHaveAttribute('href', `${prefix}/demos/nivora/#espacio`);
        await expect(detail.locator('[data-guide-capability-evidence="explainable-revenue"]')).toHaveAttribute('href', `${prefix}/demos/aurem/gestion/?vista=reports`);
        await expect(detail.locator('[data-guide-capability="revenue"]')).toContainText(indexPath.startsWith('/en') ? 'On the roadmap' : 'En ruta');
        await expect(detail.locator('[data-guide-capability-evidence="revenue"]')).toHaveCount(0);
      }
      if (id === 'technical-privacy') {
        const prefix = indexPath.startsWith('/en') ? '/en' : '';
        await expect(detail.locator('[data-guide-capability-evidence="roles"]')).toHaveAttribute('href', `${prefix}/demos/aurem/gestion/?vista=home`);
        await expect(detail.locator('[data-guide-capability-evidence="channels"]')).toHaveAttribute('href', `${prefix}/demos/aurem/gestion/?vista=channels`);
        await expect(detail.locator('[data-guide-capability-evidence="supervised-ai"]')).toHaveAttribute('href', `${prefix}/demos/aurem/gestion/?vista=automation`);
        await expect(detail.locator('[data-guide-capability="channels"]')).toContainText(indexPath.startsWith('/en') ? 'Activated per project' : 'Activable por proyecto');
        await expect(detail.locator('[data-guide-capability="automation"]')).toContainText(indexPath.startsWith('/en') ? 'Visual demo pending' : 'Demo visual pendiente');
        await expect(detail.locator('[data-guide-capability-evidence="automation"]')).toHaveCount(0);
      }
    }
  }
  expect(writes).toEqual([]);
});

test('contextual role guides connect every commercial family to its accountable journey', async ({ page, request }) => {
  const writes: string[] = [];
  page.on('request', (request) => operationalMethods.has(request.method()) && writes.push(request.url()));
  const cases = [
    ['/', 'home', [
      ['direction', '/docs/direccion-propiedad/'], ['reception', '/docs/reservas-recepcion/'], ['operations', '/docs/operaciones/'],
      ['marketing-revenue', '/docs/marketing-ingresos/'], ['technical-privacy', '/docs/tecnica-privacidad/'],
    ]],
    ['/en/', 'home', [
      ['direction', '/en/docs/ownership-direction/'], ['reception', '/en/docs/reservations-reception/'], ['operations', '/en/docs/operations/'],
      ['marketing-revenue', '/en/docs/marketing-revenue/'], ['technical-privacy', '/en/docs/technical-privacy/'],
    ]],
    ['/planes/', 'plans', [['direction', '/docs/direccion-propiedad/'], ['technical-privacy', '/docs/tecnica-privacidad/']]],
    ['/en/plans/', 'plans', [['direction', '/en/docs/ownership-direction/'], ['technical-privacy', '/en/docs/technical-privacy/']]],
    ['/soluciones/casas-rurales/', 'solution-rural', [['reception', '/docs/reservas-recepcion/']]],
    ['/en/solutions/rural-stays/', 'solution-rural', [['reception', '/en/docs/reservations-reception/']]],
    ['/soluciones/apartamentos/', 'solution-apartments', [['reception', '/docs/reservas-recepcion/']]],
    ['/en/solutions/apartments/', 'solution-apartments', [['reception', '/en/docs/reservations-reception/']]],
    ['/soluciones/hoteles/', 'solution-hotels', [['operations', '/docs/operaciones/']]],
    ['/en/solutions/hotels/', 'solution-hotels', [['operations', '/en/docs/operations/']]],
    ['/webs/', 'webs', [['marketing-revenue', '/docs/marketing-ingresos/']]],
    ['/en/webs/', 'webs', [['marketing-revenue', '/en/docs/marketing-revenue/']]],
    ['/webs/linde/', 'webs', [['marketing-revenue', '/docs/marketing-ingresos/']]],
    ['/en/webs/linde/', 'webs', [['marketing-revenue', '/en/docs/marketing-revenue/']]],
    ['/paneles/', 'panels', [['reception', '/docs/reservas-recepcion/'], ['operations', '/docs/operaciones/'], ['technical-privacy', '/docs/tecnica-privacidad/']]],
    ['/en/panels/', 'panels', [['reception', '/en/docs/reservations-reception/'], ['operations', '/en/docs/operations/'], ['technical-privacy', '/en/docs/technical-privacy/']]],
    ['/paneles/solicitudes/', 'panel-enquiries', [['reception', '/docs/reservas-recepcion/']]],
    ['/en/panels/enquiries/', 'panel-enquiries', [['reception', '/en/docs/reservations-reception/']]],
    ['/paneles/planning/', 'panel-planning', [['reception', '/docs/reservas-recepcion/']]],
    ['/en/panels/planning/', 'panel-planning', [['reception', '/en/docs/reservations-reception/']]],
    ['/paneles/huespedes-llegadas/', 'panel-guests-arrivals', [['reception', '/docs/reservas-recepcion/']]],
    ['/en/panels/guests-arrivals/', 'panel-guests-arrivals', [['reception', '/en/docs/reservations-reception/']]],
    ['/paneles/preparacion/', 'panel-preparation', [['operations', '/docs/operaciones/']]],
    ['/en/panels/preparation/', 'panel-preparation', [['operations', '/en/docs/operations/']]],
    ['/paneles/operacion-ingresos/', 'panel-operations-revenue', [['marketing-revenue', '/docs/marketing-ingresos/']]],
    ['/en/panels/operations-revenue/', 'panel-operations-revenue', [['marketing-revenue', '/en/docs/marketing-revenue/']]],
    ['/paneles/copiloto-supervisado/', 'panel-copilot', [['technical-privacy', '/docs/tecnica-privacidad/']]],
    ['/en/panels/supervised-copilot/', 'panel-copilot', [['technical-privacy', '/en/docs/technical-privacy/']]],
  ] as const;

  for (const [path, contextId, expectedLinks] of cases) {
    await expectCleanPage(page, path);
    const context = page.locator(`[data-guide-context="${contextId}"]`);
    await expect(context, path).toBeVisible();
    await expect(context.locator('[data-guide-context-link]')).toHaveCount(expectedLinks.length);
    await expect(context.locator('form, input, textarea, select')).toHaveCount(0);
    for (const [guideId, href] of expectedLinks) {
      const link = context.locator(`[data-guide-context-link="${guideId}"]`);
      await expect(link).toHaveAttribute('href', href);
      expect((await request.get(href)).status(), `${path} -> ${href}`).toBe(200);
    }
  }
  expect(writes).toEqual([]);
});

test('portfolio exposes twelve truthful navigable directions in both languages', async ({ page, request }) => {
  for (const [path, prefix] of [['/webs/', ''], ['/en/webs/', '/en']] as const) {
    await page.goto(path);
    await expect(page.locator('[data-portfolio-card]')).toHaveCount(12);
    await expect(page.locator('[data-portfolio-card][data-portfolio-vertical="rural"]')).toHaveCount(4);
    await expect(page.locator('[data-portfolio-card][data-portfolio-vertical="apartments"]')).toHaveCount(4);
    await expect(page.locator('[data-portfolio-card][data-portfolio-vertical="hotels"]')).toHaveCount(4);

    for (const slug of originalWebConcepts) {
      const card = page.locator(`[data-portfolio-card="${slug}"]`);
      await expect(card).toContainText(path === '/webs/' ? 'Concepto navegable' : 'Navigable concept');
      const href = `${prefix}/webs/${slug}/`;
      await expect(card.locator(`[data-portfolio-open="${slug}"]`)).toHaveAttribute('href', href);
      await card.scrollIntoViewIfNeeded();
      await expect.poll(() => card.locator('img').evaluate((image) => image.naturalWidth)).toBeGreaterThan(0);
      expect((await request.get(href)).status(), href).toBe(200);
    }
  }
});

test('original website concepts are localized, indexable and non-operational', async ({ page }) => {
  const writes: string[] = [];
  page.on('request', (request) => operationalMethods.has(request.method()) && writes.push(request.url()));

  for (const slug of originalWebConcepts) {
    for (const [path, otherLocale] of [[`/webs/${slug}/`, `/en/webs/${slug}/`], [`/en/webs/${slug}/`, `/webs/${slug}/`]] as const) {
      await expectCleanPage(page, path);
      await expect(page.locator(`[data-web-concept="${slug}"]`)).toBeVisible();
      await expect.poll(() => page.locator('.web-concept-hero img').evaluate((image) => image.naturalWidth)).toBeGreaterThan(0);
      await expect(page.locator('[data-web-concept] form, [data-web-concept] input, [data-web-concept] textarea, [data-web-concept] select')).toHaveCount(0);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /index,follow/);
      await expect(page.locator('link[rel="alternate"]')).toHaveCount(3);
      const alternates = await page.locator('link[rel="alternate"]').evaluateAll((links) => links.map((link) => link.getAttribute('href')));
      expect(alternates.some((href) => href?.endsWith(otherLocale))).toBe(true);
    }
  }
  expect(writes).toEqual([]);
});

test('capability evidence opens the exact fictitious flow without external writes', async ({ page }) => {
  const externalWrites: string[] = [];
  page.on('request', (request) => {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method())) externalWrites.push(request.url());
  });

  await page.goto('/soluciones/hoteles/');
  await page.locator('[data-capability-evidence="channels"]').click();
  await expect(page).toHaveURL(/\/demos\/aurem\/gestion\/\?vista=channels$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Canales' })).toBeVisible();
  await expect(page.getByRole('note')).toContainText('0 canales conectados');

  await page.goto('/planes/');
  await expect(page.locator('[data-capability-evidence="email-enquiries"]')).toHaveAttribute('href', '/demos/nivora/#reserva');
  expect(externalWrites).toEqual([]);
});

for (const width of [320, 375, 430, 1366]) {
  test(`core experiences fit ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width < 500 ? 860 : 900 });
    for (const path of ['/', '/webs/linde/', '/diagnostico/', '/demos/nivora/', '/demos/terrava/', '/demos/aurem/gestion/']) await expectCleanPage(page, path);
  });
}

test('all ten demo routes are non-operational and the landing panels collect no visitor data', async ({ page, request }) => {
  const externalWrites: string[] = [];
  const externalOrigins = new Set<string>();
  await page.addInitScript(() => {
    localStorage.setItem('logic-estancia-consent', JSON.stringify({ essential: true, analytics: false, version: '1.0.0' }));
  });
  page.on('request', (request) => {
    if (operationalMethods.has(request.method())) externalWrites.push(request.url());
    const origin = new URL(request.url()).origin;
    if (origin !== appOrigin) externalOrigins.add(origin);
  });

  for (const demo of demoLandingCases) {
    const response = await page.goto(demo.path);
    expect(response?.headers()['content-security-policy']).toContain("form-action 'none'");
    await expect(page.locator('[data-demo-panel]')).toBeVisible();
    await expect(page.getByRole('article', { name: demo.panelName })).toBeVisible();
    await expect(page.locator('form, dialog, input, textarea, select')).toHaveCount(0);
    await expect(page.locator('[name="name"], [name="email"], [type="email"], [type="tel"]')).toHaveCount(0);

    const managerLink = page.locator('.demo-manager-next');
    if (demo.managerHref) await expect(managerLink).toHaveAttribute('href', demo.managerHref);
    else {
      await expect(managerLink).toHaveCount(0);
      await expect(page.locator('a[href*="/demos/nivora/gestion/"]')).toHaveCount(0);
    }
  }

  for (const path of demoDashboardPaths) {
    const response = await page.goto(path);
    expect(response?.headers()['content-security-policy']).toContain("form-action 'none'");
    await expect(page.locator('.demo-banner')).toContainText(/solo lectura|read-only/i);
    await expect(page.locator('form, dialog')).toHaveCount(0);
    await expect(page.locator('[name="name"], [name="email"], [type="email"], [type="tel"], textarea')).toHaveCount(0);
  }

  expect((await request.get('/demos/nivora/gestion/')).status()).toBe(404);
  expect((await request.get('/en/demos/nivora/gestion/')).status()).toBe(404);
  expect(externalWrites).toEqual([]);
  expect([...externalOrigins]).toEqual([]);
});

test('Nivora email enquiries stay fictitious, local and reversible in both languages', async ({ page }) => {
  const writes: string[] = [];
  const leadRequests: string[] = [];
  page.on('request', (request) => {
    if (operationalMethods.has(request.method())) writes.push(request.url());
    if (new URL(request.url()).pathname === '/api/leads') leadRequests.push(request.url());
  });

  for (const [path, family, initialSubject, updatedSubject, updatedStatus] of [
    ['/demos/nivora/', 'Viaje en familia', 'Consulta ficticia · escapada de 3 noches', 'Consulta ficticia · estancia familiar', 'Vista previa actualizada localmente. Nada se ha enviado.'],
    ['/en/demos/nivora/', 'Family trip', 'Fictitious enquiry · 3-night city break', 'Fictitious enquiry · family stay', 'Preview updated locally. Nothing was sent.'],
  ] as const) {
    await page.goto(path);
    const demo = page.locator('[data-email-enquiry-demo]');
    await expect(demo).toBeVisible();
    await expect(demo.locator('[data-email-enquiry-subject]')).toHaveText(initialSubject);
    await expect(demo).toContainText(path.startsWith('/en') ? 'collects no personal data, sends no email' : 'No recoge datos personales, no envía ningún email');
    const storageBefore = await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage } }));

    await demo.getByRole('button', { name: family }).click();
    await expect(demo.getByRole('button', { name: family })).toHaveAttribute('aria-pressed', 'true');
    await expect(demo.locator('[data-email-enquiry-subject]')).toHaveText(updatedSubject);
    await expect(demo.locator('[data-email-enquiry-status]')).toHaveText(updatedStatus);
    expect(await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage } }))).toEqual(storageBefore);

    await demo.getByRole('button', { name: path.startsWith('/en') ? 'Restore example' : 'Restaurar ejemplo' }).click();
    await expect(demo.locator('[data-email-enquiry-subject]')).toHaveText(initialSubject);
    await demo.getByRole('button', { name: family }).click();
    await page.reload();
    await expect(page.locator('[data-email-enquiry-subject]')).toHaveText(initialSubject);
  }

  expect(writes).toEqual([]);
  expect(leadRequests).toEqual([]);
});

test('Terrava website editing is supervised, local and reversible in both languages', async ({ page }) => {
  const writes: string[] = [];
  page.on('request', (request) => {
    if (operationalMethods.has(request.method())) writes.push(request.url());
  });

  for (const [path, heading, roleLabel, reception, direction, fieldLabel, draft, discard, approve, approved] of [
    ['/demos/terrava/gestion/?vista=website', 'Mi web', 'Rol', 'reception', 'direction', 'Texto del hero', 'Cada estancia empieza antes de llegar.', 'Descartar borrador', 'Aprobar vista local', 'Aprobada en esta demo'],
    ['/en/demos/terrava/gestion/?vista=website', 'My website', 'Role', 'reception', 'direction', 'Hero copy', 'Every stay begins before arrival.', 'Discard draft', 'Approve local preview', 'Approved in this demo'],
  ] as const) {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
    await expect(page.locator('.demo-banner')).toContainText(path.startsWith('/en') ? 'Changes live in memory' : 'Los cambios viven en memoria');
    const storageBefore = await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage } }));
    const role = page.getByLabel(roleLabel);
    await expect(role).toHaveValue(reception);
    const field = page.getByLabel(fieldLabel);
    const original = await field.inputValue();
    const approveButton = page.getByRole('button', { name: approve });

    await field.fill(draft);
    await expect(page.locator('.editor-workflow [aria-current="step"]')).toContainText(path.startsWith('/en') ? 'Draft' : 'Borrador');
    await expect(approveButton).toBeDisabled();
    await expect(page.getByRole('note')).toContainText(path.startsWith('/en') ? 'Direction must approve it' : 'Dirección debe aprobarlo');
    await page.getByRole('button', { name: discard }).click();
    await expect(field).toHaveValue(original);

    await field.fill(draft);
    await role.selectOption(direction);
    await expect(approveButton).toBeEnabled();
    await approveButton.click();
    await expect(page.locator('.editor-controls .tag')).toHaveText(approved);
    await expect(page.locator('.editor-workflow [aria-current="step"]')).toContainText(path.startsWith('/en') ? 'Human approval' : 'Aprobación humana');
    await expect(page.locator('.website-preview h2')).toHaveText(draft);
    await expect(page.locator('.website-preview button, .website-preview a')).toHaveCount(0);
    await expect(page.locator('.website-boundary')).toContainText(path.startsWith('/en') ? 'No CMS, repository, deployment, provider or HTTP write' : 'Sin CMS, repositorio, despliegue, proveedor ni escritura HTTP');
    await expect(page.locator('.demo-conversion')).toHaveCount(0);
    await expect(page.locator('.website-diagnostic')).toHaveAttribute('href', path.startsWith('/en') ? '/en/assessment/?segment=managers&plan=gestion&demo=terrava' : '/diagnostico/?segment=managers&plan=gestion&demo=terrava');
    expect(await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage } }))).toEqual(storageBefore);

    await page.reload();
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
    await expect(page.getByLabel(fieldLabel)).toHaveValue(original);
    await expect(page.getByLabel(roleLabel)).toHaveValue(reception);
  }

  expect(writes).toEqual([]);
});

test('the lead endpoint rejects every commercial payload before parsing when its allowlist is absent', async ({ request }) => {
  for (const payload of [
    { name: 'Demo local', businessName: 'Terrava ficticia', email: 'demo@example.test', accommodationType: 'rural', propertyCount: 1, unitCount: 1, sourcePath: '/%2564emos/terrava/', accept: true },
    { name: 'Oversized', businessName: 'Casa ficticia', email: 'demo@example.test', accommodationType: 'rural', propertyCount: 1, unitCount: 1, accept: true, padding: 'x'.repeat(33_000) },
  ]) {
    const response = await request.post('/api/leads', { data: payload });
    expect(response.status()).toBe(403);
    expect(await response.json()).toEqual({ ok: false, outcome: 'blocked', error: 'commercial_leads_disabled' });
  }
});

test('the lead endpoint exposes a private JSON-only HTTP contract', async ({ request }) => {
  const unsupported = await request.post('/api/leads', {
    headers: { 'content-type': 'text/plain' },
    data: '{}',
  });
  expect(unsupported.status()).toBe(403);
  expect(await unsupported.json()).toEqual({ ok: false, outcome: 'blocked', error: 'commercial_leads_disabled' });
  expect(unsupported.headers()['cache-control']).toBe('no-store');
  expect(unsupported.headers()['cross-origin-resource-policy']).toBe('same-origin');
  expect(unsupported.headers()['x-content-type-options']).toBe('nosniff');

  const wrongMethod = await request.get('/api/leads');
  expect(wrongMethod.status()).toBe(405);
  expect(wrongMethod.headers().allow).toBe('POST');
  expect(wrongMethod.headers()['cache-control']).toBe('no-store');

  const invalid = await request.post('/api/leads', { data: {
    name: 'Invalid contract test', businessName: 'Casa ficticia', email: 'private-invalid-value', accommodationType: 'rural', propertyCount: 1, unitCount: 1, sourcePath: '/', accept: true,
  } });
  expect(invalid.status()).toBe(403);
  expect(await invalid.json()).toEqual({ ok: false, outcome: 'blocked', error: 'commercial_leads_disabled' });

  for (const path of ['/api', '/api/unknown']) {
    const unknown = await request.get(path);
    expect(unknown.status()).toBe(404);
    expect(await unknown.json()).toEqual({ error: 'not_found' });
    expect(unknown.headers()['cache-control']).toBe('no-store');
    expect(unknown.headers()['cross-origin-resource-policy']).toBe('same-origin');
  }

  const publicPage = await request.get('/');
  expect(publicPage.status()).toBe(200);
  expect(publicPage.headers()['cross-origin-resource-policy']).toBeUndefined();
  expect(publicPage.headers()['content-security-policy']).toContain("base-uri 'self'");
  expect(publicPage.headers()['content-security-policy']).toContain("form-action 'none'");
  expect(publicPage.headers()['content-security-policy']).toContain("frame-ancestors 'none'");
  expect(publicPage.headers()['content-security-policy']).toContain("object-src 'none'");
});

test('commercial pages expose bilingual SEO metadata and complete sitemap', async ({ page, request }) => {
  for (const [path, canonical, alternate] of [
    ['/', 'https://estancia.logic2b.com/', 'https://estancia.logic2b.com/en/'],
    ['/en/', 'https://estancia.logic2b.com/en/', 'https://estancia.logic2b.com/'],
  ] as const) {
    await page.goto(path);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonical);
    await expect(page.locator(`link[rel="alternate"][hreflang="${path === '/' ? 'en' : 'es'}"]`)).toHaveAttribute('href', alternate);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /Logic2B Estancias/);
    await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute('content', 'Logic2B Estancias');
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', canonical);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://estancia.logic2b.com/og-estancias.jpg');
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', 'https://estancia.logic2b.com/og-estancias.jpg');
    await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute('content', /Logic2B Estancias/);
    await expect(page.locator('meta[name="twitter:image:alt"]')).toHaveAttribute('content', /Logic2B Estancias/);

    const schemas = await page.locator('script[type="application/ld+json"]').allTextContents();
    const parsedSchemas = schemas.flatMap((schema) => {
      const parsed = JSON.parse(schema) as { '@type'?: string; name?: string } | { '@type'?: string; name?: string }[];
      return Array.isArray(parsed) ? parsed : [parsed];
    });
    expect(parsedSchemas.map((item) => item['@type'])).toEqual(expect.arrayContaining(['Organization', 'WebSite', 'FAQPage']));
    expect(parsedSchemas.find((item) => item['@type'] === 'WebSite')?.name).toBe('Logic2B Estancias');
    expect(parsedSchemas.find((item) => item['@type'] === 'Service')?.name).toBe('Logic2B Estancias');
  }

  const socialCard = await request.get('/og-estancias.jpg');
  expect(socialCard.status()).toBe(200);
  expect(socialCard.headers()['content-type']).toContain('image/jpeg');

  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.status()).toBe(200);
  const xml = await sitemap.text();
  expect(xml).toContain('https://estancia.logic2b.com/en/privacidad/');
  expect(xml).toContain('https://estancia.logic2b.com/en/cookies/');
  expect(xml).not.toContain('/demos/');
});

test('Logic2B and Estancias keep distinct brand destinations in both languages', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 860 });
  for (const [path, home, parentLabel, productLabel] of [
    ['/', '/', 'Logic2B — ir a logic2b.com', 'Logic2B Estancias — ir al inicio'],
    ['/en/', '/en/', 'Logic2B — visit logic2b.com', 'Logic2B Estancias — home'],
  ] as const) {
    await page.goto(path);
    const header = page.locator('.site-header');
    const footer = page.locator('footer');

    const parentLink = header.getByRole('link', { name: parentLabel, exact: true });
    const productLink = header.getByRole('link', { name: productLabel, exact: true });
    await expect(parentLink).toBeVisible();
    await expect(productLink).toBeVisible();
    await expect(parentLink).toHaveAttribute('href', 'https://logic2b.com/');
    await expect(productLink).toHaveAttribute('href', home);
    await expect(footer.getByRole('link', { name: parentLabel, exact: true })).toHaveAttribute('href', 'https://logic2b.com/');
    await expect(footer.getByRole('link', { name: productLabel, exact: true })).toHaveAttribute('href', home);
  }
});

test('mobile navigation keeps Contactar visible and opens the accessible project form', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 860 });
  await page.goto('/');
  const menu = page.getByRole('button', { name: 'Menú' });
  const mobileNav = page.getByRole('navigation', { name: 'Principal móvil' });
  const contact = mobileNav.getByRole('link', { name: 'Contactar', exact: true });

  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await expect(mobileNav).toBeVisible();
  await expect(mobileNav.locator('a').first()).toBeFocused();
  await expect(contact).toBeVisible();
  await expect(contact).toHaveAttribute('href', '/#contacto');
  const contactBox = await contact.boundingBox();
  expect(contactBox).not.toBeNull();
  expect((contactBox?.y ?? 0) + (contactBox?.height ?? 0)).toBeLessThanOrEqual(860);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

  await contact.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Cuéntanos dónde se atasca hoy una reserva.' });
  await expect(mobileNav).toBeHidden();
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('heading', { name: 'Cuéntanos dónde se atasca hoy una reserva.' })).toBeFocused();
  await expect(dialog.locator('[data-lead]')).toHaveCount(1);
  await expect(page.locator('[data-lead]')).toHaveCount(1);
  await expect(page.locator('body')).toHaveClass(/contact-dialog-open/);

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(page.locator('[data-contact-origin] > #contacto')).toHaveCount(1);
  await expect(page.locator('body')).not.toHaveClass(/contact-dialog-open/);
  await expect(menu).toBeFocused();
});

test('mobile contact always reaches the localized home modal from other marketing routes', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 860 });
  for (const item of [
    { path: '/planes/', menu: 'Menú', nav: 'Principal móvil', contact: 'Contactar', href: '/#contacto', url: /\/#contacto$/, dialog: 'Cuéntanos dónde se atasca hoy una reserva.', close: 'Cerrar formulario de contacto' },
    { path: '/en/plans/', menu: 'Menu', nav: 'Mobile main', contact: 'Contact us', href: '/en/#contacto', url: /\/en\/#contacto$/, dialog: 'Tell us where a booking gets stuck today.', close: 'Close contact form' },
  ] as const) {
    await page.goto(item.path);
    await page.getByRole('button', { name: item.menu }).click();
    const contact = page.getByRole('navigation', { name: item.nav }).getByRole('link', { name: item.contact, exact: true });
    await expect(contact).toBeVisible();
    await expect(contact).toHaveAttribute('href', item.href);
    await contact.focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(item.url);
    const dialog = page.getByRole('dialog', { name: item.dialog });
    await expect(dialog).toBeVisible();
    await expect(page.locator('[data-lead]')).toHaveCount(1);
    await dialog.getByRole('button', { name: item.close }).click();
    await expect(dialog).toBeHidden();
    await expect(page.locator('[data-contact-dialog-title]')).toBeFocused();
  }
});

test('hero follows the case-led structure and keeps its demos explicitly local', async ({ page, request }) => {
  await page.goto('/');
  const hero = page.locator('.hero');
  await expect(hero.getByRole('heading', { level: 1 })).toHaveAttribute('aria-label', 'Gestiona solicitudes, estancias y operación sin perder el contexto.');
  await expect(hero.locator('[data-hero-word]')).toHaveCount(3);
  await expect(hero.getByRole('link', { name: /Encuentra tu punto de partida/ })).toHaveAttribute('href', '/diagnostico/');
  await expect(hero.getByRole('link', { name: /Ver cómo se conecta/ })).toHaveAttribute('href', '#producto');
  await expect(hero).toContainText('Casos locales con datos ficticios');
  await expect(hero.locator('form, input, select, textarea, [data-lead], [data-commercial-lead]')).toHaveCount(0);

  const shortcuts = hero.locator('[data-hero-shortcut]');
  await expect(shortcuts).toHaveCount(3);
  for (const index of [0, 1, 2]) {
    const href = await shortcuts.nth(index).getAttribute('href');
    expect(href).toBeTruthy();
    if (href?.startsWith('#')) await expect(page.locator(href)).toHaveCount(1);
    else expect((await request.get(href ?? '')).status(), href).toBe(200);
  }

  const gallery = hero.locator('[data-hero-rail]');
  await expect(gallery).toBeVisible();
  await expect(hero.locator('[data-hero-proof]')).toHaveCount(3);
  await expect(hero.locator('[data-hero-case-clone]')).toHaveCount(3);
  for (const slug of ['nivora', 'terrava', 'aurem']) {
    const proof = hero.locator(`[data-hero-proof="${slug}"]`);
    await expect(proof).toHaveAttribute('href', `/demos/${slug}/`);
    await expect(proof.locator('img')).toHaveAttribute('alt', '');
    await expect(proof.locator('source[type="image/avif"]')).toHaveAttribute('srcset', new RegExp(`/media/${slug}/hero-640\\.avif`));
  }
  const toggle = hero.locator('[data-hero-motion-toggle]');
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect(gallery).toHaveAttribute('data-paused', 'true');

  await page.goto('/en/');
  const englishHero = page.locator('.hero');
  await expect(englishHero.getByRole('heading', { level: 1 })).toHaveAttribute('aria-label', 'Manage enquiries, stays and operations without losing context.');
  await expect(englishHero.getByRole('link', { name: /Find your starting point/ })).toHaveAttribute('href', '/en/assessment/');
  await expect(englishHero.locator('[data-hero-proof]')).toHaveCount(3);
  await expect(englishHero).toContainText('Local cases with fictitious data');
});

test('hero rail stays inside the viewport at every compact breakpoint', async ({ page }) => {
  for (const width of [320, 640, 901, 1024, 1100]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const layout = await page.locator('.hero-layout').evaluate((element) => {
      const copy = element.querySelector('.hero-copy')?.getBoundingClientRect();
      const gallery = element.querySelector('.hero-case-gallery')?.getBoundingClientRect();
      const rail = element.querySelector('[data-hero-rail]')?.getBoundingClientRect();
      const cases = [...element.querySelectorAll('[data-hero-proof]')].map((card) => card.getBoundingClientRect());
      if (!copy || !gallery || !rail || cases.length !== 3) throw new Error('Hero rail contract is incomplete');
      return {
        columns: getComputedStyle(element).gridTemplateColumns.trim().split(/\s+/).length,
        copy: { left: copy.left, right: copy.right, bottom: copy.bottom },
        gallery: { left: gallery.left, right: gallery.right, top: gallery.top, bottom: gallery.bottom, height: gallery.height },
        rail: { left: rail.left, right: rail.right, top: rail.top, bottom: rail.bottom, height: rail.height },
        cases: cases.map((card) => ({ left: card.left, right: card.right })),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        viewportWidth: innerWidth,
      };
    });
    expect(layout.overflow, `${width}px overflow`).toBeLessThanOrEqual(0);
    expect(layout.columns, `${width}px grid columns`).toBe(1);
    expect(layout.gallery.top, `${width}px gallery position`).toBeGreaterThan(layout.copy.bottom);
    for (const [name, bounds] of [['copy', layout.copy], ['gallery', layout.gallery], ['rail', layout.rail]] as const) {
      expect(bounds.left, `${width}px ${name} left bound`).toBeGreaterThanOrEqual(-0.5);
      expect(bounds.right, `${width}px ${name} right bound`).toBeLessThanOrEqual(layout.viewportWidth + 0.5);
    }
    expect(layout.rail.height, `${width}px rail height`).toBeGreaterThan(300);
    expect(layout.gallery.height, `${width}px gallery height`).toBeGreaterThan(layout.rail.height);
    for (const [index, card] of layout.cases.entries()) {
      expect(card.left, `${width}px case ${index} left bound`).toBeGreaterThanOrEqual(layout.rail.left - 0.5);
      expect(card.right, `${width}px case ${index} right bound`).toBeLessThanOrEqual(layout.rail.right + 0.5);
    }
  }
});

test('rich plan cards expose canonical previews and carry evidence context into assessment', async ({ page, request }) => {
  for (const [path, prefix, labels, sourcePath] of [
    ['/', '', ['Básico', 'Gestión', 'Inteligente'], '/'],
    ['/en/', '/en', ['Basic', 'Management', 'Intelligent'], '/en/'],
    ['/planes/', '', ['Básico', 'Gestión', 'Inteligente'], '/planes/'],
    ['/en/plans/', '/en', ['Basic', 'Management', 'Intelligent'], '/en/plans/'],
  ] as const) {
    await page.goto(path);
    await expect(page.locator('[data-plan-card]')).toHaveCount(3);
    for (const [index, plan] of ['basico', 'gestion', 'inteligente'].entries()) {
      const card = page.locator(`[data-plan-card="${plan}"]`);
      await expect(card).toContainText(labels[index]);
      await expect(card.locator(`[data-plan-preview="${plan}"]`)).toBeVisible();
      await expect(card.locator(`[data-plan-web="${plan}"]`)).toHaveAttribute('href', `${prefix}/demos/${plan === 'basico' ? 'nivora' : plan === 'gestion' ? 'terrava' : 'aurem'}/`);
      const panel = card.locator(`[data-plan-panel="${plan}"]`);
      if (plan === 'basico') await expect(panel).toHaveCount(0);
      else await expect(panel).toHaveAttribute('href', `${prefix}/demos/${plan === 'gestion' ? 'terrava' : 'aurem'}/gestion/?vista=home`);
      const assessmentHref = await card.locator(`[data-plan-assess="${plan}"]`).getAttribute('href');
      expect(assessmentHref).toBeTruthy();
      const target = new URL(assessmentHref ?? '', appOrigin);
      expect(target.searchParams.get('plan')).toBe(plan);
      expect(target.searchParams.get('web')).toBe(plan === 'basico' ? 'nivora' : plan === 'gestion' ? 'terrava' : 'aurem');
      expect(target.searchParams.get('panel')).toBe(plan === 'basico' ? 'none' : plan === 'gestion' ? 'terrava' : 'aurem');
      expect(target.searchParams.get('sourcePath')).toBe(sourcePath);
      expect((await request.get(assessmentHref ?? '')).status()).toBe(200);
    }
  }

  await page.goto('/');
  await page.locator('[data-plan-card="gestion"]').getByRole('link', { name: 'Evaluar este plan' }).click();
  await expect(page).toHaveURL(/\/diagnostico\/\?plan=gestion&web=terrava&panel=terrava&segment=unknown&sourcePath=%2F$/);
  await expect(page.locator('[name="bookingNeeds"][value="bookings"]')).toBeChecked();
  await page.locator('[data-step="1"]').getByText('Apartamentos', { exact: true }).click();
  for (let step = 0; step < 5; step += 1) await page.getByRole('button', { name: /Siguiente/ }).click();
  await page.getByRole('button', { name: /Ver recomendación/ }).click();
  const localContext = await page.evaluate(() => sessionStorage.getItem('logic-estancia-assessment-v1'));
  expect(localContext).toContain('"web":"terrava"');
  expect(localContext).toContain('"panel":"terrava"');
  expect(localContext).toContain('"sourcePath":"/"');
  await page.getByRole('link', { name: /Continuar con este contexto/ }).click();
  await expect(page.locator('[data-assessment-handoff]')).toContainText('Evidencia web');
  await expect(page.locator('[data-assessment-handoff]')).toContainText('terrava');
});

test('web portfolio exposes localized collections and accessible filters', async ({ page, request }) => {
  for (const [path, prefix, labels, sourcePath] of [
    ['/webs/', '', ['Nivora One', 'Terrava Collection', 'Aurem Hotel'], '/webs/'],
    ['/en/webs/', '/en', ['Nivora One', 'Terrava Collection', 'Aurem Hotel'], '/en/webs/'],
  ] as const) {
    await page.goto(path);
    const portfolio = page.locator('[data-web-portfolio]');
    await expect(portfolio.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(portfolio.locator('[data-portfolio-card]')).toHaveCount(12);
    await expect(portfolio.locator('[data-portfolio-vertical-filter]')).toHaveCount(4);
    await expect(portfolio.locator('[data-portfolio-plan-filter]')).toHaveCount(4);
    for (const [index, slug] of ['nivora', 'terrava', 'aurem'].entries()) {
      const card = portfolio.locator(`[data-portfolio-card="${slug}"]`);
      await expect(card).toContainText(labels[index]);
      await expect(card.locator(`[data-portfolio-demo="${slug}"]`)).toHaveAttribute('href', `${prefix}/demos/${slug}/`);
      await expect(card.locator(`[data-portfolio-open="${slug}"]`)).toHaveAttribute('href', `${prefix}/demos/${slug}/`);
      const assessmentHref = await card.locator(`[data-portfolio-assess="${slug}"]`).getAttribute('href');
      expect(assessmentHref).toBeTruthy();
      const target = new URL(assessmentHref ?? '', appOrigin);
      expect(target.searchParams.get('web')).toBe(slug);
      expect(target.searchParams.get('panel')).toBe(slug === 'nivora' ? 'none' : slug);
      expect(target.searchParams.get('segment')).toBe(slug === 'nivora' ? 'apartments' : slug === 'terrava' ? 'rural' : 'hotels');
      expect(target.searchParams.get('sourcePath')).toBe(sourcePath);
      expect((await request.get(`${prefix}/demos/${slug}/`)).status()).toBe(200);
      expect((await request.get(assessmentHref ?? '')).status()).toBe(200);
    }
    await portfolio.locator('[data-portfolio-vertical-filter="rural"]').click();
    await expect(portfolio.locator('[data-portfolio-card]:not([hidden])')).toHaveCount(4);
    await expect(portfolio.locator('[data-portfolio-card="terrava"]')).toBeVisible();
    await expect(portfolio.locator('[data-portfolio-card="linde"]')).toBeVisible();
    await expect(portfolio.locator('[data-portfolio-card="boscara"]')).toBeVisible();
    await expect(portfolio.locator('[data-portfolio-card="riscoa"]')).toBeVisible();
    await expect(portfolio.locator('[data-portfolio-filter-status]')).toContainText(/4/);
    await expect(portfolio.locator('[data-portfolio-vertical-filter="rural"]')).toHaveAttribute('aria-pressed', 'true');
    await portfolio.locator('[data-portfolio-plan-filter="inteligente"]').click();
    await expect(portfolio.locator('[data-portfolio-card]:not([hidden])')).toHaveCount(1);
    await expect(portfolio.locator('[data-portfolio-card="boscara"]')).toBeVisible();
    await expect(portfolio.locator('[data-portfolio-filter-empty]')).toBeHidden();
    await portfolio.locator('[data-portfolio-vertical-filter="all"]').click();
    await portfolio.locator('[data-portfolio-plan-filter="all"]').click();
    await expect(portfolio.locator('[data-portfolio-card]:not([hidden])')).toHaveCount(12);
  }
});

test('offscreen portfolio media keeps its responsive aspect ratio before lazy loading', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/webs/');

  const image = page.locator('[data-portfolio-card="boscara"] .portfolio-card-media img');
  const box = await image.boundingBox();

  expect(box).not.toBeNull();
  expect(box?.width).toBeGreaterThan(300);
  expect(box?.height).toBeLessThan(240);
  expect(Math.abs((box?.width ?? 0) / (box?.height ?? 1) - 1.6)).toBeLessThan(0.02);
});

test('floating contact stays withdrawn over portfolio actions on mobile', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('logic-estancia-consent', JSON.stringify({ essential: true, analytics: false, timestamp: new Date().toISOString(), version: '1.0.0' })));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/webs/');

  const card = page.locator('[data-portfolio-card="cendra"]');
  await card.locator('.portfolio-card-links').scrollIntoViewIfNeeded();
  await expect(card.locator('.portfolio-card-links')).toBeInViewport();
  await expect(page.locator('[data-whatsapp]')).toHaveAttribute('data-visible', 'false');
});

test('business landing links preserve the prospect segment in the assessment and contact handoff', async ({ page }) => {
  for (const [path, segment, type] of [
    ['/soluciones/casas-rurales/', 'rural', 'rural'],
    ['/soluciones/apartamentos/', 'apartments', 'apartment'],
    ['/soluciones/hoteles/', 'hotels', 'hotel'],
  ] as const) {
    await page.goto(path);
    const contact = page.locator('.solution-hero').getByRole('link', { name: 'Pedir una conversación' });
    await expect(contact).toHaveAttribute('href', `/?contact=${segment}#contacto`);
    await page.locator('.human-service').getByRole('link', { name: 'Cuéntanos cómo trabajas' }).click();
    await expect(page).toHaveURL(new RegExp(`/diagnostico/\\?segment=${segment}$`));
    await expect(page.locator(`[name="accommodationType"][value="${type}"]`)).toBeChecked();
    await page.goto(path);
    await page.locator('.solution-hero').getByRole('link', { name: 'Pedir una conversación' }).click();
    await expect(page).toHaveURL(new RegExp(`/\\?contact=${segment}#contacto$`));
    const dialog = page.getByRole('dialog', { name: 'Cuéntanos dónde se atasca hoy una reserva.' });
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('[name="accommodationType"]')).toHaveValue(type);
  }
});

test('managed human service is explicit across the commercial journey', async ({ page }) => {
  for (const path of ['/', '/soluciones/casas-rurales/', '/planes/']) {
    await page.goto(path);
    const service = page.locator('.human-service');
    await expect(service.getByRole('heading', { name: 'No te damos un software para que te apañes solo.' })).toBeVisible();
    await expect(service.getByRole('heading', { name: 'Lo configuramos por ti' })).toBeVisible();
    await expect(service).toContainText('todo lo acordado');
    await expect(service).toContainText('soporte base');
  }

  await page.goto('/en/solutions/apartments/');
  const service = page.locator('.human-service');
  await expect(service.getByRole('heading', { name: "We don't hand you software and leave you to figure it out." })).toBeVisible();
  await expect(service.getByRole('heading', { name: 'We configure it for you' })).toBeVisible();
  await expect(service).toContainText('everything agreed in scope');
});

test('WhatsApp contact follows the Camp pattern without covering the footer', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Rechazar' }).click();
  const contact = page.getByRole('link', { name: 'Contacta con Logic2B por WhatsApp' });
  await expect(contact).toHaveAttribute('data-visible', 'false');
  await page.evaluate(() => window.scrollTo(0, 700));
  await expect(contact).toHaveAttribute('data-visible', 'true');
  await expect(contact).toHaveAttribute('tabindex', '0');
  await expect(contact.locator('svg')).toBeVisible();

  expect(await contact.evaluate((node) => {
    const style = getComputedStyle(node);
    const rect = node.getBoundingClientRect();
    return {
      text: node.textContent?.trim(),
      height: rect.height,
      border: style.border,
      borderRadius: style.borderRadius,
      background: style.backgroundColor,
      color: style.color,
    };
  })).toEqual({
    text: 'Contacta',
    height: 48,
    border: '3px solid rgb(19, 122, 59)',
    borderRadius: '14px',
    background: 'rgba(19, 122, 59, 0.1)',
    color: 'rgb(19, 122, 59)',
  });

  await page.locator('[data-guide-context="home"]').scrollIntoViewIfNeeded();
  await expect(contact).toHaveAttribute('data-visible', 'false');
  await expect(contact).toHaveAttribute('tabindex', '-1');

  await page.locator('#contacto').scrollIntoViewIfNeeded();
  await expect(contact).toHaveAttribute('data-visible', 'false');
  await expect(contact).toHaveAttribute('tabindex', '-1');

  await page.locator('footer').scrollIntoViewIfNeeded();
  await expect(contact).toHaveAttribute('data-visible', 'false');
  await expect(contact).toHaveAttribute('tabindex', '-1');

  await page.goto('/en/');
  await expect(page.getByRole('link', { name: 'Contact Logic2B on WhatsApp' })).toContainText('Contact');
});

test('each accommodation landing explains its own detailed workflow', async ({ page }) => {
  for (const [path, heading, result] of [
    ['/soluciones/casas-rurales/', 'De descubrir tu historia a preparar la llegada.', 'Relación directa · contexto hasta la estancia'],
    ['/soluciones/apartamentos/', 'Una consulta entra una vez. El contexto acompaña todo el camino.', 'Una marca · un contexto · varias unidades'],
    ['/soluciones/hoteles/', 'De una señal dispersa a una incidencia cerrada y trazable.', 'Prioridad visible · responsable · seguimiento'],
  ] as const) {
    await page.goto(path);
    const workflow = page.locator('.workflow-section');
    await expect(workflow.getByRole('heading', { name: heading })).toBeVisible();
    await expect(workflow.locator('.workflow-step')).toHaveCount(5);
    await expect(workflow.locator('.workflow-step.human')).toHaveCount(1);
    await expect(workflow.locator('.workflow-branch')).toBeVisible();
    await expect(workflow.locator('.workflow-result')).toContainText(result);
  }

  await page.goto('/en/solutions/hotels/');
  const workflow = page.locator('.workflow-section');
  await expect(workflow.getByRole('heading', { name: 'From a scattered signal to a closed, traceable incident.' })).toBeVisible();
  await expect(workflow.locator('.workflow-step')).toHaveCount(5);
});

test('capability evidence and its boundary are visible without a hidden disclosure', async ({ page }) => {
  await page.goto('/soluciones/hoteles/');
  const capability = page.locator('[data-capability="operations-centre"]');
  await expect(capability.getByRole('link', { name: /Ver evidencia visual en Aurem/ })).toBeVisible();
  await expect(capability).toContainText('No toma decisiones ni ejecuta acciones de forma autónoma');
  await expect(capability.locator('.capability-boundary')).toBeVisible();
});

test('scope configurator recommends progressively and prefills the commercial form', async ({ page }) => {
  await page.goto('/');
  const scope = page.locator('[data-scope-estimator]');
  await expect(scope).toHaveAttribute('data-level', 'basico');
  await expect(scope.getByRole('heading', { name: 'Básico', exact: true })).toBeVisible();

  await scope.getByLabel('Propiedades').fill('8');
  await scope.getByLabel('Unidades').fill('8');
  await expect(scope).toHaveAttribute('data-level', 'basico');

  await scope.getByLabel('Reservas, huéspedes y planning').check();
  await expect(scope).toHaveAttribute('data-level', 'gestion');
  await expect(scope.getByRole('heading', { name: 'Gestión', exact: true })).toBeVisible();

  await scope.getByLabel('Mensajes, recordatorios y canales').check();
  await expect(scope).toHaveAttribute('data-level', 'inteligente');
  await scope.getByLabel('Equipo, mantenimiento y revenue').check();
  await expect(scope).toHaveAttribute('data-level', 'inteligente');
  await scope.getByRole('link', { name: 'Usar esta recomendación' }).click();

  await expect(page).toHaveURL(/\/diagnostico\/\?plan=inteligente&properties=8&units=8$/);
  await expect(page.locator('[name="propertyCount"]')).toHaveValue('8');
  await expect(page.locator('[name="unitCount"]')).toHaveValue('8');
});

test('scope configurator remains localized in English', async ({ page }) => {
  await page.goto('/en/');
  const scope = page.locator('[data-scope-estimator]');
  await scope.getByLabel('Messages, reminders and channels').check();
  await expect(scope).toHaveAttribute('data-level', 'inteligente');
  await expect(scope.getByRole('heading', { name: 'Intelligent', exact: true })).toBeVisible();
  await expect(scope.getByText('You included automation and channels.')).toBeVisible();
});

test('assessment reveals an operations recommendation before asking for contact details', async ({ page }) => {
  await page.goto('/diagnostico/');
  await page.getByText('Hotel', { exact: true }).click();
  await page.getByRole('button', { name: /Siguiente/ }).click();
  await page.getByLabel('Propiedades').fill('1');
  await page.getByLabel('Unidades o habitaciones').fill('48');
  await page.getByRole('button', { name: /Siguiente/ }).click();
  await page.getByText('PMS', { exact: true }).click();
  await page.getByRole('button', { name: /Siguiente/ }).click();
  await page.getByText('Reservas', { exact: true }).click();
  await page.getByRole('button', { name: /Siguiente/ }).click();
  await page.getByText('Mantenimiento', { exact: true }).click();
  await page.getByRole('button', { name: /Siguiente/ }).click();
  await page.getByRole('button', { name: /Ver recomendación/ }).click();
  await expect(page.locator('[data-result-name]')).toHaveText('Inteligente');
  await expect(page.getByRole('heading', { name: 'Hablemos sobre esta recomendación.' })).toBeVisible();
  await expect(page.locator('[data-demo-link]')).toHaveAttribute('href', '/demos/aurem/');
});

test('assessment keeps context local until the single sales form is reviewed and submitted', async ({ page }) => {
  let leadRequests = 0;
  let submitted: Record<string, unknown> | null = null;
  await page.route('**/api/leads', async (route) => {
    leadRequests += 1;
    submitted = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({ status: 202, contentType: 'application/json', body: JSON.stringify({ ok: true, outcome: 'delivered', ref: 'assessment-ref', meetingUrl: null }) });
  });
  await enableCommercialLead(page);
  await page.goto('/diagnostico/');
  await page.locator('[data-step="1"]').getByText('Apartamentos', { exact: true }).click();
  await page.getByLabel('Modelo de operación').selectOption('multi');
  await page.getByRole('button', { name: /Siguiente/ }).click();
  await page.getByLabel('Propiedades').fill('3');
  await page.getByLabel('Unidades o habitaciones').fill('12');
  await page.getByRole('button', { name: /Siguiente/ }).click();
  await page.getByText('Web', { exact: true }).click();
  await page.getByText('Email y hojas de cálculo', { exact: true }).click();
  await page.getByRole('button', { name: /Siguiente/ }).click();
  await page.getByText('Reservas', { exact: true }).click();
  await page.getByText('Planning', { exact: true }).click();
  await page.getByRole('button', { name: /Siguiente/ }).click();
  await page.getByRole('button', { name: /Siguiente/ }).click();
  await page.getByLabel('Plazo').selectOption('3-6');
  await page.getByLabel('Inversión de implantación').selectOption('8k-20k');
  await page.getByRole('button', { name: /Ver recomendación/ }).click();
  await expect(page.locator('[data-diagnostic-lead]')).toHaveCount(0);
  await expect(page.getByText(/este contexto se conserva temporalmente en esta pestaña/)).toBeVisible();
  const salesLink = page.getByRole('link', { name: /Continuar con este contexto/ });
  await expect(salesLink).toHaveAttribute('href', '/?assessment=1#contacto');
  const localContext = await page.evaluate(() => sessionStorage.getItem('logic-estancia-assessment-v1'));
  expect(localContext).toContain('"plan":"gestion"');
  for (const piiField of ['name', 'email', 'phone', 'message']) expect(Object.keys(JSON.parse(localContext ?? '{}'))).not.toContain(piiField);
  expect(leadRequests).toBe(0);
  await salesLink.click();
  await expect(page).toHaveURL(/\/\?assessment=1#contacto$/);
  const form = page.locator('[data-lead]');
  const handoff = form.locator('[data-assessment-handoff]');
  await expect(handoff).toBeVisible();
  await expect(handoff.getByRole('heading', { name: 'No tienes que empezar de nuevo.' })).toBeVisible();
  await expect(form.locator('[name="accommodationType"]')).toHaveValue('apartment');
  await expect(form.locator('[name="plan"]')).toHaveValue('gestion');
  await expect(form.locator('[name="timeline"]')).toHaveValue('3-6');
  await expect(form.locator('[name="propertyCount"]')).toHaveValue('3');
  await expect(form.locator('[name="unitCount"]')).toHaveValue('12');
  await handoff.getByText('Revisar el contexto que se adjuntará').click();
  await expect(handoff).toContainText('Email y hojas de cálculo');
  await expect(handoff).toContainText('Reservas, Planning');
  expect(leadRequests).toBe(0);

  await form.locator('[name="name"]').fill('Ada Demo');
  await form.locator('[name="businessName"]').fill('Apartamentos Demo');
  await form.locator('[name="email"]').fill('ada@example.test');
  await form.locator('[name="timeline"]').selectOption('0-3');
  await form.locator('[name="accept"]').check();
  await form.getByRole('button', { name: /Quiero una recomendación/ }).click();
  await expect(form.locator('[data-lead-receipt]')).toBeVisible();
  expect(leadRequests).toBe(1);
  expect(submitted).toMatchObject({
    accommodationType: 'apartment', businessMode: 'multi', propertyCount: 3, unitCount: 12, plan: 'gestion',
    currentStack: ['website', 'email'], requestedCapabilities: ['bookings', 'planning'], timeline: '0-3', investmentRange: '8k-20k',
    sourcePath: '/diagnostico/', name: 'Ada Demo', email: 'ada@example.test',
  });
  expect(await page.evaluate(() => sessionStorage.getItem('logic-estancia-assessment-v1'))).toBeNull();
});

test('English assessment context is reviewable and can be discarded before contact', async ({ page }) => {
  await page.goto('/en/assessment/');
  await page.evaluate(() => sessionStorage.setItem('logic-estancia-assessment-v1', JSON.stringify({
    version: '1.0.0', createdAt: Date.now(), locale: 'en', accommodationType: 'hotel', businessMode: 'mono',
    propertyCount: 1, unitCount: 32, plan: 'inteligente', currentStack: ['pms'], requestedCapabilities: ['maintenance'],
    timeline: 'exploring', investmentRange: 'unknown',
  })));
  await page.goto('/en/?assessment=1#contacto');
  const form = page.locator('[data-lead]');
  const handoff = form.locator('[data-assessment-handoff]');
  await expect(handoff.getByRole('heading', { name: 'You do not have to start again.' })).toBeVisible();
  await expect(form.locator('[name="accommodationType"]')).toHaveValue('hotel');
  await expect(form.locator('[name="plan"]')).toHaveValue('inteligente');
  await handoff.getByText('Review the context that will be attached').click();
  await expect(handoff).toContainText('Maintenance');
  await expect(handoff).toContainText('To be defined');
  await handoff.getByRole('button', { name: 'Do not attach these answers' }).click();
  await expect(handoff).toBeHidden();
  await expect(page).toHaveURL(/\/en\/#contacto$/);
  await expect(form.locator('[name="accommodationType"]')).toBeFocused();
  expect(await page.evaluate(() => sessionStorage.getItem('logic-estancia-assessment-v1'))).toBeNull();
});

test('only the home landing exposes and submits the real commercial lead form', async ({ page }) => {
  let leadRequests = 0;
  let submitted: Record<string, unknown> | null = null;
  await page.route('**/api/leads', (route) => {
    leadRequests += 1;
    submitted = route.request().postDataJSON() as Record<string, unknown>;
    return route.fulfill({ status: 202, contentType: 'application/json', body: JSON.stringify({ ok: true, outcome: 'delivered', ref: 'test-ref', meetingUrl: null }) });
  });
  await enableCommercialLead(page);
  await page.goto('/');
  const form = page.locator('[data-lead]');
  await expect(form.getByText('Revisaremos el contexto y responderemos en un día laborable.')).toBeVisible();
  await expect(form.getByRole('link', { name: 'política de privacidad' })).toHaveAttribute('href', '/privacidad/');
  await expect(form.locator('label.honeypot')).toHaveCSS('position', 'absolute');
  await expect(form.locator('label.honeypot')).toHaveAttribute('inert', '');
  await form.locator('[name="name"]').fill('Ada Demo');
  await form.locator('[name="businessName"]').fill('Casa Demo');
  await form.locator('[name="email"]').fill('ada@example.test');
  await form.locator('[name="message"]').fill('Solicitud comercial de prueba.');
  await form.locator('[name="accept"]').check();
  await form.getByRole('button', { name: /Quiero una recomendación/ }).click();
  const receipt = form.locator('[data-lead-receipt]');
  await expect(receipt).toBeVisible();
  await expect(receipt).toBeFocused();
  await expect(receipt).toHaveAttribute('role', 'status');
  await expect(receipt).toContainText('La conversación ya está en marcha.');
  await expect(receipt.locator('[data-lead-reference]')).toContainText('test-ref');
  await expect(receipt.locator('[data-meeting-copy]')).toHaveText('No necesitas hacer nada más: te responderemos por email.');
  await expect(receipt.locator('[data-meeting-link]')).toBeHidden();
  expect(leadRequests).toBe(1);
  expect(submitted).toMatchObject({
    accommodationType: 'apartment',
    propertyCount: 1,
    unitCount: 1,
    timeline: 'exploring',
    sourcePath: '/',
  });

  for (const [path, segment, type] of [
    ['/soluciones/casas-rurales/', 'rural', 'rural'],
    ['/soluciones/apartamentos/', 'apartments', 'apartment'],
    ['/soluciones/hoteles/', 'hotels', 'hotel'],
  ] as const) {
    await page.goto(path);
    await expect(page.locator('[data-commercial-lead]')).toHaveCount(0);
    await expect(page.locator('[data-lead]')).toHaveCount(0);
    const contact = page.locator('.solution-hero').getByRole('link', { name: 'Pedir una conversación' });
    await expect(contact).toHaveAttribute('href', `/?contact=${segment}#contacto`);
    await contact.click();
    await expect(page).toHaveURL(new RegExp(`/\\?contact=${segment}#contacto$`));
    const dialog = page.getByRole('dialog', { name: 'Cuéntanos dónde se atasca hoy una reserva.' });
    await expect(dialog).toBeVisible();
    const solutionForm = dialog.locator('[data-lead]');
    await expect(solutionForm).toHaveCount(1);
    await expect(page.locator('[data-lead]')).toHaveCount(1);
    await expect(solutionForm.locator('[name="accommodationType"]')).toHaveValue(type);
    await solutionForm.locator('[name="name"]').fill('Ada Vertical');
    await solutionForm.locator('[name="businessName"]').fill('Estancia Vertical');
    await solutionForm.locator('[name="email"]').fill('ada@example.test');
    await solutionForm.locator('[name="accept"]').check();
    await solutionForm.getByRole('button', { name: /Quiero una recomendación/ }).click();
    await expect(solutionForm.locator('[data-lead-receipt]')).toBeVisible();
    expect(submitted).toMatchObject({ accommodationType: type, sourcePath: path });
    await dialog.getByRole('button', { name: 'Cerrar formulario de contacto' }).click();
    await expect(dialog).toBeHidden();
  }
  expect(leadRequests).toBe(4);

  await page.goto('/demos/terrava/');
  await expect(page.locator('[data-demo-panel]')).toBeVisible();
  await expect(page.locator('form')).toHaveCount(0);
  expect(leadRequests).toBe(4);
});

test('the English receipt exposes only a valid optional meeting link', async ({ page }) => {
  await page.route('**/api/leads', (route) => route.fulfill({ status: 202, contentType: 'application/json', body: JSON.stringify({ ok: true, outcome: 'delivered', ref: 'safe-ref-01', meetingUrl: 'https://meet.example.test/logic-estancia' }) }));
  await enableCommercialLead(page);
  await page.goto('/en/');
  const form = page.locator('[data-lead]');
  await expect(form.getByRole('link', { name: 'privacy policy' })).toHaveAttribute('href', '/en/privacidad/');
  await form.locator('[name="name"]').fill('Ada Demo');
  await form.locator('[name="businessName"]').fill('Demo Stay');
  await form.locator('[name="email"]').fill('ada@example.test');
  await form.locator('[name="accept"]').check();
  await form.getByRole('button', { name: /Get my recommendation/ }).click();
  const receipt = form.locator('[data-lead-receipt]');
  await expect(receipt).toContainText('The conversation is now under way.');
  await expect(receipt.locator('[data-meeting-copy]')).toHaveText('If useful, you can also choose a time.');
  await expect(receipt.locator('[data-meeting-link]')).toHaveAttribute('href', 'https://meet.example.test/logic-estancia');
  await expect(receipt.locator('[data-meeting-link]')).toHaveAttribute('rel', 'noopener noreferrer');
});

test('the sales form does not claim delivery for a non-delivery 202 response', async ({ page }) => {
  await page.route('**/api/leads', (route) => route.fulfill({ status: 202, contentType: 'application/json', body: JSON.stringify({ ok: true, outcome: 'demo' }) }));
  await enableCommercialLead(page);
  await page.goto('/');
  const form = page.locator('[data-lead]');
  await form.locator('[name="name"]').fill('Ada Demo');
  await form.locator('[name="businessName"]').fill('Casa Demo');
  await form.locator('[name="email"]').fill('ada@example.test');
  await form.locator('[name="accept"]').check();
  await form.getByRole('button', { name: /Quiero una recomendación/ }).click();
  await expect(form.locator('[data-lead-receipt]')).toBeHidden();
  await expect(form.locator('.form-status')).toHaveText('No hemos podido entregarla. Prueba por WhatsApp o vuelve a intentarlo.');
  await expect(form.getByRole('button', { name: /Quiero una recomendación/ })).toBeEnabled();
});

test('the sales form explains rate limiting and re-enables itself in both locales', async ({ page }) => {
  await page.clock.install();
  let requests = 0;
  await page.route('**/api/leads', (route) => {
    requests += 1;
    return route.fulfill({ status: 429, headers: { 'retry-after': '2' }, contentType: 'application/json', body: JSON.stringify({ ok: false, outcome: 'limited', error: 'rate_limited', retryAfter: 2 }) });
  });
  await enableCommercialLead(page);
  const cases = [
    { path: '/', submit: 'Quiero una recomendación', waiting: 'Reintentar en 2 s', status: 'Has hecho varios intentos. Conservamos tus datos en el formulario; podrás volver a enviarlo en 2 s.' },
    { path: '/en/', submit: 'Get my recommendation', waiting: 'Try again in 2s', status: 'You have made several attempts. Your details remain in the form; you can send it again in 2s.' },
  ];
  for (const item of cases) {
    await page.goto(item.path);
    const form = page.locator('[data-lead]');
    await form.locator('[name="name"]').fill('Ada Demo');
    await form.locator('[name="businessName"]').fill('Casa Demo');
    await form.locator('[name="email"]').fill('ada@example.test');
    await form.locator('[name="accept"]').check();
    await form.getByRole('button', { name: item.submit }).click();
    await expect(form.locator('[data-lead-receipt]')).toBeHidden();
    await expect(form.locator('.form-status')).toHaveText(item.status);
    await expect(form.getByRole('button', { name: item.waiting })).toBeDisabled();
    await page.clock.fastForward(2_000);
    await expect(form.getByRole('button', { name: item.submit })).toBeEnabled();
  }
  expect(requests).toBe(2);
});

test('the sales form bounds a stalled request and can retry without claiming delivery', async ({ page }) => {
  await page.clock.install();
  let requests = 0;
  await page.route('**/api/leads', () => { requests += 1; });
  await enableCommercialLead(page);
  await page.goto('/');
  const form = page.locator('[data-lead]');
  await form.locator('[name="name"]').fill('Ada Demo');
  await form.locator('[name="businessName"]').fill('Casa Demo');
  await form.locator('[name="email"]').fill('ada@example.test');
  await form.locator('[name="accept"]').check();
  await form.getByRole('button', { name: /Quiero una recomendación/ }).click();
  await expect(form.getByRole('button', { name: /Enviando/ })).toBeDisabled();

  await page.clock.fastForward(15_000);

  await expect(form.locator('[data-lead-receipt]')).toBeHidden();
  await expect(form.locator('.form-status')).toHaveText('La conexión está tardando demasiado y no podemos confirmar la entrega. Vuelve a intentarlo: si la solicitud ya llegó, conservaremos una única referencia.');
  await expect(form.getByRole('button', { name: /Quiero una recomendación/ })).toBeEnabled();
  expect(requests).toBe(1);

  await page.unrouteAll({ behavior: 'ignoreErrors' });
  await page.route('**/api/leads', (route) => route.fulfill({ status: 202, contentType: 'application/json', body: JSON.stringify({ ok: true, outcome: 'delivered', ref: 'retry-ref', meetingUrl: null }) }));
  await form.getByRole('button', { name: /Quiero una recomendación/ }).click();
  await expect(form.locator('[data-lead-receipt]')).toContainText('retry-ref');
});

test('cookie preferences remain consent-gated, revocable and shared with demos', async ({ page }) => {
  await page.goto('/');
  const banner = page.getByRole('dialog', { name: 'Configuración de cookies' });
  await expect(banner).toBeVisible();
  await expect(page.locator('script[data-gtm]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Configurar preferencias' }).click();
  await expect(page.getByRole('heading', { name: 'Almacenamiento esencial' })).toBeVisible();
  await expect(page.getByText('Siempre activo')).toBeVisible();
  await page.getByRole('checkbox', { name: 'Cookies de analítica' }).check();
  await page.getByRole('button', { name: 'Guardar preferencias' }).click();
  await expect(banner).toBeHidden();
  await expect(page.locator('script[data-gtm]')).toHaveCount(0);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('logic-estancia-consent') ?? 'null'))).toMatchObject({
    essential: true,
    analytics: true,
    version: '1.0.0',
  });

  await page.goto('/demos/terrava/');
  await expect(page.locator('script[data-gtm]')).toHaveCount(0);

  await page.goto('/cookies/');
  await expect(page.getByRole('heading', { name: 'Almacenamiento y cookies' })).toBeVisible();
  await page.getByRole('button', { name: 'Cambiar mi elección de cookies' }).click();
  await expect(banner).toBeVisible();
  await expect(page.locator('script[data-gtm]')).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem('logic-estancia-consent'))).toBeNull();
  await page.getByRole('button', { name: 'Rechazar' }).click();
  await expect(banner).toBeHidden();
  await expect(page.locator('script[data-gtm]')).toHaveCount(0);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('logic-estancia-consent') ?? 'null'))).toMatchObject({ analytics: false });
});

test('consented analytics remains inert in the default demo deployment', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Configurar preferencias' }).click();
  await page.getByRole('checkbox', { name: 'Cookies de analítica' }).check();
  await page.getByRole('button', { name: 'Guardar preferencias' }).click();
  const before = await page.evaluate(() => window.dataLayer?.length ?? 0);
  await page.evaluate(() => {
    window.estanciaTrack?.('lead_submit', {
      locale: 'es',
      plan: 'gestion',
      source_section: 'homepage_contact',
      email: 'pii@example.test',
      message: 'No debe salir',
    });
    window.estanciaTrack?.('invented_event', { locale: 'es' });
  });
  await expect.poll(() => page.evaluate(() => window.dataLayer?.length ?? 0)).toBe(before);
  await expect(page.locator('script[data-gtm]')).toHaveCount(0);
});

test('the cookie choice and complete legal surfaces are localized in English', async ({ page }) => {
  await page.goto('/en/');
  const banner = page.getByRole('dialog', { name: 'Cookie settings' });
  await expect(banner).toBeVisible();
  await page.getByRole('button', { name: 'Configure preferences' }).click();
  await expect(page.getByText('Always active')).toBeVisible();
  await page.getByRole('button', { name: 'Reject all' }).click();
  await expect(banner).toBeHidden();

  await page.goto('/en/legal/');
  await expect(page.getByText('Logic2b S.L.', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Demonstrations and scope' })).toBeVisible();
  await page.goto('/en/privacidad/');
  await expect(page.getByRole('heading', { name: 'Data, purpose and lawful basis' })).toBeVisible();
  await expect(page.getByText(/Resend: transport/)).toBeVisible();
  await expect(page.getByText(/HubSpot:/)).toHaveCount(0);
  await page.goto('/en/cookies/');
  await expect(page.getByRole('columnheader', { name: 'Category' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Change my cookie choice' })).toBeVisible();
});

test('Terrava workspace keeps enquiries, planning and bookings read-only', async ({ page }) => {
  const externalWrites: string[] = [];
  page.on('request', (request) => {
    if (operationalMethods.has(request.method())) externalWrites.push(request.url());
  });

  await page.goto('/demos/terrava/gestion/?vista=enquiries');
  await expect(page.getByRole('heading', { level: 1, name: 'Solicitudes' })).toBeVisible();
  await expect(page.getByText('Marina Costa · 4 huéspedes')).toBeVisible();
  await expect(page.getByText('Vista de solo lectura: compara el caso y la alternativa sin crear ni convertir reservas.')).toBeVisible();
  await expect(page.locator('.dash-content .actions button')).toHaveCount(0);

  await page.getByRole('button', { name: 'Planning', exact: true }).click();
  await expect(page).toHaveURL(/vista=planning/);
  await expect(page.getByText('Calendario ficticio · EUR')).toBeVisible();
  await expect(page.getByText('Solo visualización · sin cambios de inventario o tarifa')).toBeVisible();

  await page.getByRole('button', { name: 'Reservas', exact: true }).click();
  await expect(page).toHaveURL(/vista=bookings/);
  await expect(page.getByRole('heading', { level: 1, name: 'Reservas' })).toBeVisible();
  await expect(page.getByText('TER-101')).toBeVisible();
  expect(externalWrites).toEqual([]);
});

test('Terrava read-only boundaries remain localized in English', async ({ page }) => {
  await page.goto('/en/demos/terrava/gestion/?vista=enquiries');
  await expect(page.getByRole('heading', { level: 1, name: 'Enquiries' })).toBeVisible();
  await expect(page.getByText('Read-only view: compare the case and alternative without creating or converting bookings.')).toBeVisible();
  await expect(page.getByText('The panel represents dates, guests and preferences with a preloaded fixture; it does not move or store visitor data.')).toBeVisible();

  await page.getByRole('button', { name: 'Planning', exact: true }).click();
  await expect(page.getByText('Fictitious calendar · EUR')).toBeVisible();
  await expect(page.getByText('View only · no inventory or rate changes')).toBeVisible();
});

test('dashboard filters are ephemeral and reload restores the fixture', async ({ page }) => {
  await page.goto('/demos/aurem/gestion/');
  const role = page.getByLabel('Rol');
  await role.selectOption('cleaning');
  await expect(role).toHaveValue('cleaning');
  expect(await page.evaluate(() => Object.keys(localStorage).filter((key) => key.startsWith('logic-estancia-demo-')))).toEqual([]);

  await page.reload();

  await expect(page.getByLabel('Rol')).toHaveValue('direction');
  await expect(page.locator('.dash-content')).toContainText('Elena Rossi');
  await expect(page.locator('.demo-banner')).toContainText('Panel de solo lectura con datos ficticios');
});

test('Aurem guided journey connects read-only evidence to the assessment', async ({ page }) => {
  const externalWrites: string[] = [];
  page.on('request', (request) => {
    if (operationalMethods.has(request.method())) externalWrites.push(request.url());
  });

  await page.goto('/demos/aurem/gestion/');
  await page.getByRole('button', { name: 'Ver recorrido' }).click();

  await expect(page.getByRole('dialog', { name: 'Detecta la habitación en riesgo' })).toBeVisible();
  await expect(page.getByRole('progressbar', { name: 'Progreso del recorrido' })).toHaveAttribute('aria-valuemax', '7');

  await page.getByRole('button', { name: 'Siguiente hito' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Limpieza' })).toBeVisible();
  await expect(page.getByRole('dialog', { name: 'Limpieza prepara la 408' })).toContainText('sin avisos enviados');

  await page.getByRole('button', { name: 'Siguiente hito' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Planning' })).toBeVisible();
  await expect(page.getByRole('dialog', { name: 'Recepción revisa la entrada' })).toContainText('sin reserva real');

  await page.getByRole('button', { name: 'Siguiente hito' }).click();
  await expect(page.getByRole('dialog', { name: 'Explica cada métrica' })).toContainText('96 habitaciones ficticias · sin predicción ni contabilidad');

  await page.getByRole('button', { name: 'Siguiente hito' }).click();
  await expect(page.getByRole('dialog', { name: 'Revisa antes de conectar' })).toContainText('0 canales conectados · publicación bloqueada');

  await page.getByRole('button', { name: 'Siguiente hito' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Copiloto' })).toBeVisible();
  await expect(page.getByRole('dialog', { name: 'Edita y revisa con control humano' })).toContainText('Sin modelo ni proveedor · envío siempre bloqueado');

  await page.getByRole('button', { name: 'Siguiente hito' }).click();
  const finalStep = page.getByRole('dialog', { name: 'Convierte la evidencia en alcance' });
  await expect(finalStep).toContainText('Resultado visible antes de pedir datos');
  await expect(finalStep.getByRole('link', { name: 'Abrir diagnóstico' })).toHaveAttribute(
    'href',
    '/diagnostico/?segment=hotels&plan=inteligente&demo=aurem',
  );
  expect(externalWrites).toEqual([]);
});

test('Aurem guided journey and assessment exit remain localized in English', async ({ page }) => {
  await page.goto('/en/demos/aurem/gestion/');
  await page.getByRole('button', { name: 'Start tour' }).click();
  await expect(page.getByRole('dialog', { name: 'Find the room at risk' })).toContainText('no connected PMS');

  for (let step = 0; step < 5; step += 1) {
    await page.getByRole('button', { name: 'Next milestone' }).click();
  }

  await expect(page.getByRole('heading', { level: 1, name: 'Copilot' })).toBeVisible();
  await expect(page.getByRole('dialog', { name: 'Edit and review with human control' })).toContainText('No model or provider · sending always blocked');
  await page.getByRole('button', { name: 'Next milestone' }).click();

  const finalStep = page.getByRole('dialog', { name: 'Turn evidence into scope' });
  await expect(finalStep).toContainText('Result shown before any data is requested');
  await expect(finalStep.getByRole('link', { name: 'Open assessment' })).toHaveAttribute(
    'href',
    '/en/assessment/?segment=hotels&plan=inteligente&demo=aurem',
  );
});

test('Aurem revenue remains explainable and navigable in both locales', async ({ page }) => {
  for (const item of [
    {
      path: '/demos/aurem/gestion/?vista=reports',
      heading: 'Ingresos',
      boundary: '96 habitaciones ficticias durante 28 días',
      metric: /Tarifa media diaria/,
      formula: '€296.608 de ingresos ÷ 2.392 noches ocupadas',
      evidence: 'Abrir reservas ficticias',
      target: 'Reservas',
    },
    {
      path: '/en/demos/aurem/gestion/?vista=reports',
      heading: 'Revenue',
      boundary: '96 fictitious rooms over 28 days',
      metric: /Revenue per available room/,
      formula: '€296,608 revenue ÷ 2,688 available room nights',
      evidence: 'Open fictitious planning',
      target: 'Planning',
    },
  ]) {
    await page.goto(item.path);
    await expect(page.getByRole('heading', { level: 1, name: item.heading })).toBeVisible();
    await expect(page.getByRole('note')).toContainText(item.boundary);
    await expect(page.locator('.revenue-metrics button')).toHaveCount(4);
    await expect(page.locator('.revenue-ledger tbody tr')).toHaveCount(4);

    await page.getByRole('button', { name: item.metric }).click();
    await expect(page.locator('.revenue-explanation')).toContainText(item.formula);
    await page.getByRole('button', { name: item.evidence }).click();
    await expect(page.getByRole('heading', { level: 1, name: item.target })).toBeVisible();
  }
});

test('Aurem channel matrix is an inspectable fixture with no publish action', async ({ page }) => {
  const externalWrites: string[] = [];
  page.on('request', (request) => {
    if (operationalMethods.has(request.method())) externalWrites.push(request.url());
  });

  for (const item of [
    {
      path: '/demos/aurem/gestion/?vista=channels',
      heading: 'Canales',
      boundary: '0 canales conectados',
      channel: /iCal directo/,
      detail: 'zona horaria, deduplicación y gestión de errores',
      requirements: 'Qué exigiría conectar de verdad',
      readOnly: 'Inspección de solo lectura · no revisa ni publica nada',
    },
    {
      path: '/en/demos/aurem/gestion/?vista=channels',
      heading: 'Channels',
      boundary: '0 connected channels',
      channel: /Direct iCal/,
      detail: 'timezone, deduplication and error handling',
      requirements: 'What a live connection would require',
      readOnly: 'Read-only inspection · reviews and publishes nothing',
    },
  ]) {
    await page.goto(item.path);
    await expect(page.getByRole('heading', { level: 1, name: item.heading })).toBeVisible();
    await expect(page.getByRole('note')).toContainText(item.boundary);
    await expect(page.locator('.channel-matrix tbody tr')).toHaveCount(4);
    await page.getByRole('button', { name: item.channel }).click();
    await expect(page.locator('.channel-review')).toContainText(item.detail);
    await expect(page.locator('.channel-review')).toContainText(item.readOnly);
    await expect(page.getByRole('heading', { name: item.requirements })).toBeVisible();
    await expect(page.locator('.dash-content form, .dash-content textarea')).toHaveCount(0);
  }

  expect(externalWrites).toEqual([]);
});

test('Aurem supervised copilot is public, role-gated and never sends', async ({ page }) => {
  const externalWrites: string[] = [];
  page.on('request', (request) => {
    if (operationalMethods.has(request.method())) externalWrites.push(request.url());
  });

  await page.goto('/demos/aurem/gestion/');
  await page.getByRole('button', { name: 'Copiloto', exact: true }).click();
  await expect(page).toHaveURL(/vista=automation/);
  await expect(page.getByRole('heading', { level: 1, name: 'Copiloto' })).toBeVisible();
  await expect(page.getByRole('note')).toContainText('sin modelo ni proveedor');
  await expect(page.getByRole('button', { name: 'Enviar deshabilitado · proveedor no conectado' })).toBeDisabled();

  const draft = page.getByLabel('Mensaje preparado');
  await draft.fill('Borrador editado y revisado por una persona.');
  await page.getByRole('button', { name: 'Guardar borrador local' }).click();
  await expect(page.getByText('Versión 2 · edición local')).toBeVisible();
  await page.getByRole('button', { name: 'Marcar como revisado' }).click();
  await expect(page.getByText('Revisado', { exact: true })).toBeVisible();

  await page.reload();
  await expect(page.getByLabel('Mensaje preparado')).toHaveValue(/Hola Elena/);
  await expect(page.getByText('Versión 1 · edición local')).toBeVisible();
  await page.getByLabel('Rol').selectOption('cleaning');
  await expect(page.getByRole('button', { name: 'Requiere Dirección o Recepción' })).toBeDisabled();
  expect(externalWrites).toEqual([]);
});

test('Aurem supervised copilot remains localized and blocked in English', async ({ page }) => {
  const externalWrites: string[] = [];
  page.on('request', (request) => {
    if (operationalMethods.has(request.method())) externalWrites.push(request.url());
  });

  await page.goto('/en/demos/aurem/gestion/?vista=automation');
  await expect(page.getByRole('heading', { level: 1, name: 'Copilot' })).toBeVisible();
  await expect(page.getByRole('note')).toContainText('no model or provider');
  await expect(page.getByLabel('Prepared message')).toHaveValue(/Hello Elena/);
  await expect(page.getByRole('button', { name: 'Send disabled · provider not connected' })).toBeDisabled();
  await page.getByLabel('Role').selectOption('cleaning');
  await expect(page.getByRole('button', { name: 'Requires Direction or Reception' })).toBeDisabled();
  expect(externalWrites).toEqual([]);
});

test('Aurem cleaning and maintenance expose fixed states without operational controls', async ({ page }) => {
  const externalWrites: string[] = [];
  page.on('request', (request) => {
    if (operationalMethods.has(request.method())) externalWrites.push(request.url());
  });

  await page.goto('/demos/aurem/gestion/?vista=cleaning');
  await expect(page.getByRole('heading', { level: 1, name: 'Limpieza' })).toBeVisible();
  await expect(page.getByText('Checklist de ejemplo · no asigna, valida ni actualiza habitaciones')).toBeVisible();
  await expect(page.locator('.dash-content .actions button')).toHaveCount(0);

  await page.getByRole('button', { name: 'Mantenimiento', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Mantenimiento' })).toBeVisible();
  await expect(page.getByText('Timeline ficticio · no asigna ni resuelve incidencias')).toBeVisible();
  await expect(page.getByText('No modifica inventario ni comunica con proveedores.')).toBeVisible();
  await expect(page.locator('.dash-content .actions button')).toHaveCount(0);
  expect(externalWrites).toEqual([]);
});

test('operational notifications only navigate to the related fixture', async ({ page }) => {
  const externalWrites: string[] = [];
  page.on('request', (request) => {
    if (operationalMethods.has(request.method())) externalWrites.push(request.url());
  });

  await page.goto('/demos/aurem/gestion/');
  await page.getByRole('button', { name: 'Abrir avisos' }).click();
  const notifications = page.getByRole('dialog', { name: 'Avisos operativos' });
  await expect(notifications.getByText('Habitación 408 requiere atención')).toBeVisible();
  await notifications.getByRole('button', { name: /Habitación 408 requiere atención/ }).click();
  await expect(page.getByRole('heading', { name: 'Limpieza', exact: true })).toBeVisible();
  await expect(page).toHaveURL(/vista=cleaning/);
  expect(externalWrites).toEqual([]);
});
