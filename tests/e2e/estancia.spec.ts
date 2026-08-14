import { expect, test, type Page } from '@playwright/test';

const paths = [
  '/', '/en/', '/docs/', '/en/docs/',
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
    for (const path of ['/', '/demos/terrava/', '/demos/aurem/gestion/']) await expectCleanPage(page, path);
  });
}

test('Nivora submits a local enquiry without inventory', async ({ page }) => {
  await page.goto('/demos/nivora/');
  await page.locator('[data-demo-form] button[type="submit"]').click();
  await expect(page.locator('.demo-result')).toContainText('No se ha bloqueado inventario');
});

test('Terrava prepares an alternative, converts it and resets', async ({ page }) => {
  await page.goto('/demos/terrava/gestion/');
  await page.getByRole('button', { name: 'Solicitudes', exact: true }).click();
  await page.getByRole('button', { name: 'Preparar alternativa' }).click();
  await page.getByRole('button', { name: 'Convertir en reserva' }).click();
  await expect(page.getByText('TER-104')).toBeVisible();
  await page.getByRole('button', { name: /Restablecer/ }).click();
  await page.getByRole('button', { name: 'Solicitudes', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Preparar alternativa' })).toBeVisible();
});

test('Aurem completes checkout-cleaning-arrival handoff and resets', async ({ page }) => {
  await page.goto('/demos/aurem/gestion/');
  await page.locator('.role-select select').selectOption('cleaning');
  await page.getByRole('button', { name: 'Limpieza', exact: true }).click();
  await page.getByRole('button', { name: 'Empezar preparación' }).click();
  await page.getByRole('button', { name: 'Marcar lista para revisar' }).click();
  await page.locator('.role-select select').selectOption('reception');
  await page.getByRole('button', { name: 'Validar habitación' }).click();
  await expect(page.getByText('Habitación disponible para la entrada')).toBeVisible();
  await page.getByRole('button', { name: /Restablecer/ }).click();
  await expect(page.getByText('Pendiente', { exact: true })).toBeVisible();
});

test('Aurem neutral payment never claims a real charge', async ({ page }) => {
  await page.goto('/demos/aurem/');
  await page.locator('[data-demo-form] button[type="submit"]').click();
  await expect(page.getByText('No se realizará ningún cobro.')).toBeVisible();
  await page.getByRole('button', { name: 'Confirmar reserva simulada' }).click();
  await expect(page.locator('.demo-result')).toContainText('No se ha realizado ningún cobro');
});
