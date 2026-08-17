import { expect, test, type Page } from '@playwright/test';

const paths = [
  '/', '/en/', '/docs/', '/en/docs/',
  '/soluciones/gestores/', '/soluciones/hoteles/', '/planes/', '/diagnostico/',
  '/en/solutions/managers/', '/en/solutions/hotels/', '/en/plans/', '/en/assessment/',
  '/recursos/gestor-reservas-apartamentos-turisticos/', '/recursos/web-hotel-reservas-directas-operacion/',
  '/legal/', '/privacidad/', '/cookies/',
  '/en/legal/', '/en/privacidad/', '/en/cookies/',
  '/demos/nivora/', '/demos/terrava/', '/demos/aurem/',
  '/demos/terrava/gestion/', '/demos/aurem/gestion/',
  '/en/demos/nivora/', '/en/demos/terrava/', '/en/demos/aurem/',
  '/en/demos/terrava/gestion/', '/en/demos/aurem/gestion/',
];

async function expectCleanPage(page: Page, path: string) {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  const response = await page.goto(path, { waitUntil: 'networkidle' });
  expect(response?.status(), path).toBe(200);
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

for (const width of [320, 375, 430, 1366]) {
  test(`core experiences fit ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width < 500 ? 860 : 900 });
    for (const path of ['/', '/diagnostico/', '/demos/terrava/', '/demos/aurem/gestion/']) await expectCleanPage(page, path);
  });
}

test('Nivora submits a local enquiry without inventory', async ({ page }) => {
  await page.goto('/demos/nivora/');
  await page.locator('[data-demo-form] button[type="submit"]').click();
  await expect(page.locator('.demo-result')).toContainText('No se ha bloqueado inventario');
});

test('commercial pages expose bilingual SEO metadata and complete sitemap', async ({ page, request }) => {
  await page.goto('/');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://estancia.logic2b.com/');
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute('href', 'https://estancia.logic2b.com/en/');
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /Logic Estancia/);
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary');

  const schemas = await page.locator('script[type="application/ld+json"]').allTextContents();
  const schemaTypes = schemas.flatMap((schema) => {
    const parsed = JSON.parse(schema) as { '@type'?: string } | { '@type'?: string }[];
    return (Array.isArray(parsed) ? parsed : [parsed]).map((item) => item['@type']);
  });
  expect(schemaTypes).toEqual(expect.arrayContaining(['Organization', 'WebSite', 'FAQPage']));

  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.status()).toBe(200);
  const xml = await sitemap.text();
  expect(xml).toContain('https://estancia.logic2b.com/en/privacidad/');
  expect(xml).toContain('https://estancia.logic2b.com/en/cookies/');
  expect(xml).not.toContain('/demos/');
});

test('plan interest carries the selected plan into the assessment', async ({ page }) => {
  await page.goto('/');
  await page.locator('.level-grid article').nth(1).getByRole('link', { name: /Me interesa/ }).click();
  await expect(page).toHaveURL(/\/diagnostico\/\?plan=gestion$/);
  await expect(page.locator('[name="bookingNeeds"][value="bookings"]')).toBeChecked();
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
  await expect(page.getByRole('heading', { name: 'Recibe el resumen y una respuesta personalizada.' })).toBeVisible();
  await expect(page.locator('[data-demo-link]')).toHaveAttribute('href', '/demos/aurem/');
});

for (const meeting of [
  { name: 'configured agenda', url: 'https://meet.example.test/logic-estancia', copy: 'ya puedes elegir horario', linked: true },
  { name: 'missing agenda', url: null, copy: 'tu solicitud ya está en curso', linked: false },
]) {
  test(`assessment shows a safe follow-up for a ${meeting.name}`, async ({ page }) => {
    await page.route('**/api/leads', (route) => route.fulfill({
      status: 202,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, outcome: 'delivered', ref: 'test-ref', meetingUrl: meeting.url }),
    }));
    await page.goto('/diagnostico/');
    await page.getByText('Apartamentos', { exact: true }).click();
    for (let step = 0; step < 5; step += 1) await page.getByRole('button', { name: /Siguiente|Ver recomendación/ }).click();
    await page.getByRole('button', { name: /Ver recomendación/ }).click();
    await page.getByLabel('Nombre').fill('Ada Demo');
    await page.getByLabel('Empresa o alojamiento').fill('Casa Demo');
    await page.getByRole('textbox', { name: 'Email', exact: true }).fill('ada@example.test');
    await page.getByLabel(/Acepto la política/).check();
    await page.getByRole('button', { name: /Enviarme el resumen/ }).click();

    const followUp = page.locator('[data-meeting]');
    await expect(followUp).toContainText(meeting.copy);
    const link = followUp.locator('[data-meeting-link]');
    if (meeting.linked) await expect(link).toHaveAttribute('href', meeting.url!);
    else await expect(link).toBeHidden();
  });
}

test('analytics remains consent-gated on commercial pages and demos', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('script[data-gtm]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Aceptar analítica' }).click();
  await expect(page.locator('script[data-gtm]')).toHaveCount(1);
  await page.goto('/demos/terrava/');
  await expect(page.locator('script[data-gtm]')).toHaveCount(1);
});

test('Terrava carries a website enquiry into the workspace, converts it and resets', async ({ page }) => {
  await page.goto('/demos/terrava/');
  await page.getByLabel('Nombre').fill('Lucía Prado');
  await page.getByLabel('Huéspedes').fill('3');
  await page.getByLabel('Entrada').fill('2026-08-22');
  await page.getByLabel('Salida').fill('2026-08-26');
  await page.locator('[data-demo-form] button[type="submit"]').click();
  await page.getByRole('link', { name: 'Abrir la solicitud en el gestor' }).click();
  await page.getByRole('button', { name: 'Explorar libremente' }).click();
  await expect(page).toHaveURL(/vista=enquiries/);
  await expect(page.getByText('Lucía Prado · 3 huéspedes')).toBeVisible();
  await expect(page.getByText('Desde la web demo')).toBeVisible();
  await expect(page.getByText('€ 816')).toBeVisible();
  await page.getByRole('button', { name: 'Preparar alternativa' }).click();
  await page.getByRole('button', { name: 'Convertir en reserva' }).click();
  await expect(page.getByText('TER-104')).toBeVisible();
  await expect(page.getByText('Lucía Prado', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: /Restablecer/ }).click();
  await page.getByRole('button', { name: 'Solicitudes', exact: true }).click();
  await expect(page.getByText('Marina Costa · 4 huéspedes')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Preparar alternativa' })).toBeVisible();
});

test('the shared Terrava journey remains localized in English', async ({ page }) => {
  await page.goto('/en/demos/terrava/');
  await page.getByLabel('Name').fill('Jamie Demo');
  await page.locator('[data-demo-form] button[type="submit"]').click();
  await page.getByRole('link', { name: 'Open the enquiry in the workspace' }).click();
  await page.getByRole('button', { name: 'Explore freely' }).click();
  await expect(page.getByRole('heading', { name: 'Enquiries' })).toBeVisible();
  await expect(page.getByText('Jamie Demo · 2 guests')).toBeVisible();
  await expect(page.getByText('From demo website')).toBeVisible();
});

test('Terrava operates a stay and publishes a reversible website draft', async ({ page }) => {
  await page.goto('/demos/terrava/gestion/');
  await page.getByRole('button', { name: 'Explorar libremente' }).click();
  await page.getByRole('button', { name: 'Planning', exact: true }).click();
  await page.getByRole('button', { name: 'Reasignar a Casa Bruma' }).click();
  await page.getByRole('button', { name: 'Aplicar tarifa flexible +48 €' }).click();
  await expect(page.getByText('Planning y perfil actualizados')).toBeVisible();
  await page.getByRole('button', { name: 'Mi web', exact: true }).click();
  await page.getByLabel('Texto del hero').fill('Ocho casas. Una forma distinta de volver.');
  await page.getByRole('button', { name: 'Publicar cambio simulado' }).click();
  await expect(page.getByText('Publicada en esta demo')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Ocho casas. Una forma distinta de volver.' })).toBeVisible();
});

test('workspace search opens from the keyboard and navigates to a matching area', async ({ page }) => {
  await page.goto('/demos/aurem/gestion/');
  await page.getByRole('button', { name: 'Explorar libremente' }).click();
  await page.getByRole('button', { name: 'Buscar en el gestor' }).click();
  const search = page.getByRole('dialog', { name: 'Búsqueda rápida' });
  await expect(search).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(search).toBeHidden();
  await page.keyboard.press('/');
  await expect(search).toBeVisible();
  await search.getByPlaceholder('Reservas, limpieza, informes…').fill('limpieza');
  await search.getByRole('button', { name: 'Limpieza', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Limpieza', exact: true })).toBeVisible();
  await expect(page).toHaveURL(/vista=cleaning/);

  await page.getByRole('button', { name: 'Buscar en el gestor' }).click();
  await expect(page.getByRole('dialog', { name: 'Búsqueda rápida' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Búsqueda rápida' })).toBeHidden();
});

test('operational notifications expose context and open the related area', async ({ page }) => {
  await page.goto('/demos/aurem/gestion/');
  await page.getByRole('button', { name: 'Explorar libremente' }).click();
  await page.getByRole('button', { name: 'Abrir avisos' }).click();
  const notifications = page.getByRole('dialog', { name: 'Avisos operativos' });
  await expect(notifications.getByText('Habitación 408 requiere atención')).toBeVisible();
  await notifications.getByRole('button', { name: /Habitación 408 requiere atención/ }).click();
  await expect(page.getByRole('heading', { name: 'Limpieza', exact: true })).toBeVisible();
  await expect(page).toHaveURL(/vista=cleaning/);
});

test('Aurem completes checkout-cleaning-arrival handoff and resets', async ({ page }) => {
  await page.goto('/demos/aurem/gestion/');
  await page.getByRole('button', { name: 'Explorar libremente' }).click();
  await page.locator('.role-select select').selectOption('cleaning');
  await page.getByRole('button', { name: 'Limpieza', exact: true }).click();
  await page.getByRole('button', { name: 'Empezar preparación' }).click();
  await page.getByRole('button', { name: 'Marcar lista para revisar' }).click();
  await page.locator('.role-select select').selectOption('reception');
  await page.getByRole('button', { name: 'Validar habitación' }).click();
  await expect(page.getByText('Habitación disponible para la entrada')).toBeVisible();
  await page.getByRole('button', { name: 'Abrir avisos' }).click();
  await expect(page.getByRole('dialog', { name: 'Avisos operativos' }).getByText('Habitación 408 validada')).toBeVisible();
  await page.getByRole('button', { name: 'Cerrar', exact: true }).click();
  await page.getByRole('button', { name: /Restablecer/ }).click();
  await expect(page.getByText('Pendiente', { exact: true })).toBeVisible();
});

test('Aurem assigns and resolves a maintenance incident locally', async ({ page }) => {
  await page.goto('/demos/aurem/gestion/');
  await page.getByRole('button', { name: 'Explorar libremente' }).click();
  await page.getByRole('button', { name: 'Mantenimiento', exact: true }).click();
  await page.getByRole('button', { name: 'Asignar a mantenimiento' }).click();
  await page.getByRole('button', { name: 'Resolver y liberar' }).click();
  await expect(page.getByText('Sin impacto en la llegada')).toBeVisible();
  await expect(page.getByText('Resuelta', { exact: true })).toBeVisible();
});

test('Aurem rejects an impossible stay before opening demo payment', async ({ page }) => {
  await page.goto('/demos/aurem/');
  await page.getByLabel('Entrada').fill('2026-08-18');
  await page.getByLabel('Salida').fill('2026-08-17');
  await page.locator('[data-demo-form] button[type="submit"]').click();
  await expect(page.locator('.demo-result')).toHaveText('La salida debe ser posterior a la entrada.');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.getByRole('link', { name: 'Ver la reserva en el gestor' })).toBeHidden();

  await page.getByLabel('Salida').fill('2026-08-19');
  await page.locator('[data-demo-form] button[type="submit"]').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByText('Terrace · 1 noche')).toBeVisible();
  await expect(page.getByText('€ 228')).toBeVisible();
});

test('Aurem neutral payment carries the simulated booking into the workspace', async ({ page }) => {
  await page.goto('/demos/aurem/');
  await page.getByLabel('Nombre').fill('Álex Moreno');
  await page.getByLabel('Huéspedes').fill('3');
  await page.getByLabel('Salida').fill('2026-08-18');
  await page.locator('[data-demo-form] button[type="submit"]').click();
  await expect(page.getByText('No se realizará ningún cobro.')).toBeVisible();
  await expect(page.getByText('Terrace · 4 noches')).toBeVisible();
  await expect(page.getByText('€ 912')).toBeVisible();
  await page.getByRole('button', { name: 'Confirmar reserva simulada' }).click();
  await expect(page.locator('.demo-result')).toContainText('No se ha realizado ningún cobro');
  await page.getByRole('link', { name: 'Ver la reserva en el gestor' }).click();
  await page.getByRole('button', { name: 'Explorar libremente' }).click();
  await expect(page).toHaveURL(/vista=bookings/);
  await expect(page.getByText('Álex Moreno llega desde la reserva simulada de la web.')).toBeVisible();
  await expect(page.getByText('Álex Moreno', { exact: true })).toBeVisible();
});
