import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { enlargeTextTo200Percent } from './helpers/text-resize';

type Locale = 'es' | 'en';
type NetworkEvidence = { writes: string[]; external: string[]; api: string[]; sockets: string[]; storage: string[] };
const evidence = new WeakMap<Page, NetworkEvidence>();
const writeMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

// Abort unexpected side effects as well as recording them: this suite must never
// turn a fixture regression into a real submission or a provider connection.
test.beforeEach(async ({ page, baseURL }) => {
  const seen: NetworkEvidence = { writes: [], external: [], api: [], sockets: [], storage: [] };
  evidence.set(page, seen);
  const origin = new URL(baseURL!).origin;
  page.on('request', request => {
    if (writeMethods.has(request.method())) seen.writes.push(request.url());
    const url = new URL(request.url());
    if (url.origin !== origin) seen.external.push(request.url());
    if (url.pathname.startsWith('/api/')) seen.api.push(request.url());
  });
  page.on('websocket', socket => seen.sockets.push(socket.url()));
  await page.route('**/*', route => {
    const request = route.request();
    return writeMethods.has(request.method()) || new URL(request.url()).origin !== origin
      ? route.abort('blockedbyclient')
      : route.continue();
  });
  await page.exposeFunction('__recordR3StorageWrite', (key: string) => { seen.storage.push(key); });
  await page.addInitScript(() => {
    const writes: string[] = [];
    Object.defineProperty(window, '__r3StorageWrites', { value: writes });
    const record = (key: string) => {
      writes.push(key);
      void (window as Window & { __recordR3StorageWrite: (key: string) => Promise<void> }).__recordR3StorageWrite(key);
    };
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      record(key);
      return originalSetItem.call(this, key, value);
    };
    const originalOpen = IDBFactory.prototype.open;
    IDBFactory.prototype.open = function (...args) {
      record(`indexedDB:${args[0]}`);
      return originalOpen.apply(this, args);
    };
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

test.afterEach(async ({ page }) => {
  expect(evidence.get(page)).toEqual({ writes: [], external: [], api: [], sockets: [], storage: [] });
  if (!page.isClosed() && page.url() !== 'about:blank') {
    expect(await page.evaluate(() => ({
      attempts: (window as Window & { __r3StorageWrites: string[] }).__r3StorageWrites,
      local: Object.keys(localStorage),
      session: Object.keys(sessionStorage),
    }))).toEqual({ attempts: [], local: [], session: [] });
  }
});

async function openWorkspace(page: Page, locale: Locale) {
  const response = await page.goto(`${locale === 'en' ? '/en' : ''}/demos/terrava/gestion/?vista=enquiries`);
  expect(response?.headers()['content-security-policy']).toContain("connect-src 'none'");
  expect(response?.headers()['content-security-policy']).toContain("form-action 'none'");
  await expect(page.locator('[data-stay-workspace]')).toBeVisible();
  await expect(page.locator('.demo-banner')).toContainText(locale === 'es' ? 'memoria' : 'memory');
  await expect(page.locator('[name="name"], [name="email"], [type="email"], [type="tel"], textarea')).toHaveCount(0);
}

async function navigate(page: Page, locale: Locale, name: string) {
  const menu = page.getByRole('button', { name: locale === 'es' ? 'Abrir menú' : 'Open menu', exact: true });
  if (await menu.isVisible()) await menu.click();
  await page.getByRole('navigation', { name: locale === 'es' ? 'Gestor' : 'Workspace', exact: true })
    .getByRole('button', { name, exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name, exact: true })).toBeVisible();
}

async function chooseCase(page: Page, locale: Locale, id: string) {
  await page.getByRole('combobox', { name: locale === 'es' ? 'Caso de demostración' : 'Demo case', exact: true }).selectOption(id);
}

async function confirmCase(page: Page, locale: Locale, property: string) {
  await page.getByRole('button', { name: `${locale === 'es' ? 'Seleccionar' : 'Select'} ${property}`, exact: true }).click();
  await page.getByRole('button', { name: locale === 'es' ? 'Confirmar estancia ficticia' : 'Confirm fictitious stay', exact: true }).click();
}

async function showConfirmedStay(page: Page, locale: Locale) {
  await page.getByRole('button', { name: locale === 'es' ? 'Ver estancia' : 'View stay', exact: true }).click();
  await expect(page.locator('[data-stay-detail]')).toBeVisible();
}

async function expectStay(page: Page, guest: string, unit: string, start: string, end: string, amount: number) {
  const detail = page.locator('[data-stay-detail]');
  await expect(detail).toContainText('EST-025');
  await expect(detail).toContainText(guest);
  await expect(detail).toContainText(unit);
  await expect(detail.locator(`time[datetime="${start}"]`)).toBeVisible();
  await expect(detail.locator(`time[datetime="${end}"]`)).toBeVisible();
  await expect(detail.locator('[data-stay-total]')).toHaveText(new RegExp(`^(?:€\\s*)?${amount}(?:\\s*€)?$`));
}

for (const locale of ['es', 'en'] as const) {
  const en = locale === 'en';

  test(`R3 normal enquiry confirms on the previous guest's departure ${locale}`, async ({ page }) => {
    await openWorkspace(page, locale);
    await chooseCase(page, locale, 'REQ-025');
    await expect(page.locator('[data-stay-workspace]')).toContainText('Diego Vidal');
    await confirmCase(page, locale, 'Casa Cauce');
    await showConfirmedStay(page, locale);
    await expectStay(page, 'Diego Vidal', 'Casa Cauce', '2026-08-24', '2026-08-27', 544);
    await expect(page.locator('[data-stay-detail]')).toContainText(en ? '3 nights' : '3 noches');
    await navigate(page, locale, en ? 'Enquiries' : 'Solicitudes');
    await chooseCase(page, locale, 'REQ-025');
    await expect(page.getByRole('button', { name: en ? 'View stay' : 'Ver estancia', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: en ? 'Confirm fictitious stay' : 'Confirmar estancia ficticia', exact: true }).and(page.locator(':enabled'))).toHaveCount(0);
    await page.getByRole('button', { name: en ? 'Undo last change' : 'Deshacer último cambio', exact: true }).click();
    await expect(page.getByRole('region', { name: en ? 'Stay workspace' : 'Gestor de estancias', exact: true })).toBeFocused();
    await expect(page.getByRole('button', { name: en ? 'Confirm fictitious stay' : 'Confirmar estancia ficticia', exact: true })).toBeEnabled();
  });

  test(`R3 conflict alternative is one coherent stay across planning bookings and guests ${locale}`, async ({ page }) => {
    await openWorkspace(page, locale);
    await expect(page.locator('[data-unit-option="aira"]')).toContainText(en ? 'Overlaps another stay' : 'Coincide con otra estancia');
    await expect(page.locator('[data-unit-option="aira"] button:enabled')).toHaveCount(0);
    await page.locator('.sw-more-options > summary').click();
    await expect(page.locator('[data-unit-option="duna"]')).toContainText(en ? /out of service/i : /fuera de servicio/i);
    await expect(page.locator('[data-unit-option="duna"] button:enabled')).toHaveCount(0);
    await confirmCase(page, locale, 'Casa Bruma');
    await showConfirmedStay(page, locale);
    await expectStay(page, 'Marina Costa', 'Casa Bruma', '2026-08-21', '2026-08-24', 612);

    await navigate(page, locale, 'Planning');
    for (const referenceDay of await page.locator('.sw-calendar-cell.is-today').all()) {
      await expect(referenceDay).toHaveCSS('grid-column-start', '4');
    }
    const occupancy = page.locator('[data-planning-stay="EST-025"]');
    await expect(occupancy.first()).toBeVisible();
    await occupancy.first().click();
    await expectStay(page, 'Marina Costa', 'Casa Bruma', '2026-08-21', '2026-08-24', 612);

    await navigate(page, locale, en ? 'Bookings' : 'Reservas');
    const booking = page.locator('[data-stay-id="EST-025"]');
    await expect(booking).toHaveCount(1);
    await expect(booking).toContainText('Marina Costa');
    await expect(booking.locator('.sw-stay-amount')).toHaveText(en ? '€612' : '612 €');

    await navigate(page, locale, en ? 'Guests' : 'Huéspedes');
    const guest = page.locator('[data-guest-stay="EST-025"]');
    await expect(guest).toContainText('Marina Costa');
    await expect(guest).toContainText('Casa Bruma');
    await guest.click();
    await expectStay(page, 'Marina Costa', 'Casa Bruma', '2026-08-21', '2026-08-24', 612);
    await page.getByRole('combobox', { name: en ? 'Property' : 'Propiedad', exact: true }).selectOption('Casa Bruma');
    await navigate(page, locale, en ? 'Reports' : 'Informes');
    await expect(page.locator('[data-report-stays]')).toHaveText('3');
    await expect(page.locator('[data-report-value]')).toContainText(/1[.,]?647/);
  });

  test(`R3 modification recalculates the same stay and undo restores dates and price ${locale}`, async ({ page }) => {
    await openWorkspace(page, locale);
    await confirmCase(page, locale, 'Casa Bruma');
    await showConfirmedStay(page, locale);
    await page.getByRole('button', { name: en ? 'Edit stay' : 'Modificar estancia', exact: true }).click();
    await page.getByLabel(en ? 'Check-out' : 'Salida', { exact: true }).fill('2026-08-25');
    await page.getByRole('button', { name: en ? 'Save changes' : 'Guardar cambios', exact: true }).click();
    await expect(page.locator('[data-stay-detail] h2')).toBeFocused();
    await expectStay(page, 'Marina Costa', 'Casa Bruma', '2026-08-21', '2026-08-25', 801);
    await expect(page.locator('[data-stay-detail]')).toContainText(en ? '4 nights' : '4 noches');

    await navigate(page, locale, en ? 'Enquiries' : 'Solicitudes');
    await chooseCase(page, locale, 'REQ-024');
    await showConfirmedStay(page, locale);
    await expectStay(page, 'Marina Costa', 'Casa Bruma', '2026-08-21', '2026-08-25', 801);
    await page.getByRole('button', { name: en ? 'Undo last change' : 'Deshacer último cambio', exact: true }).click();
    await expectStay(page, 'Marina Costa', 'Casa Bruma', '2026-08-21', '2026-08-24', 612);
    await navigate(page, locale, 'Planning');
    await expect(page.locator('[data-planning-stay="EST-025"]')).toHaveCSS('grid-column-start', '4');
    await expect(page.locator('[data-planning-stay="EST-025"]')).toHaveCSS('grid-column-end', '7');
  });

  test(`R3 cancellation releases occupancy and undo restores the enquiry and guest ${locale}`, async ({ page }) => {
    await openWorkspace(page, locale);
    await confirmCase(page, locale, 'Casa Bruma');
    await showConfirmedStay(page, locale);
    await page.getByRole('button', { name: en ? 'Cancel stay' : 'Cancelar estancia', exact: true }).click();
    await page.getByRole('button', { name: en ? 'Confirm cancellation' : 'Confirmar cancelación', exact: true }).click();
    await expect(page.locator('[data-stay-detail] h2')).toBeFocused();
    await expect(page.locator('[data-stay-detail]')).toContainText(en ? /cancelled/i : /cancelada/i);
    await navigate(page, locale, 'Planning');
    await expect(page.locator('[data-planning-stay="EST-025"]')).toHaveCount(0);
    await navigate(page, locale, en ? 'Guests' : 'Huéspedes');
    await expect(page.locator('[data-guest-stay="EST-025"]')).toHaveCount(0);
    const property = page.getByRole('combobox', { name: en ? 'Property' : 'Propiedad', exact: true });
    await property.selectOption('Casa Bruma');
    await navigate(page, locale, en ? 'Reports' : 'Informes');
    await expect(page.locator('[data-report-stays]')).toHaveText('2');
    await expect(page.locator('[data-report-value]')).toContainText(/1[.,]?035/);
    await property.selectOption('all');
    await navigate(page, locale, en ? 'Enquiries' : 'Solicitudes');
    await chooseCase(page, locale, 'REQ-024');
    await expect(page.getByRole('button', { name: en ? 'Select Casa Bruma' : 'Seleccionar Casa Bruma', exact: true })).toBeEnabled();
    await page.getByRole('button', { name: en ? 'Undo last change' : 'Deshacer último cambio', exact: true }).click();
    await showConfirmedStay(page, locale);
    await expectStay(page, 'Marina Costa', 'Casa Bruma', '2026-08-21', '2026-08-24', 612);
    await navigate(page, locale, 'Planning');
    await expect(page.locator('[data-planning-stay="EST-025"]')).toHaveCSS('grid-column-start', '4');
    await expect(page.locator('[data-planning-stay="EST-025"]')).toHaveCSS('grid-column-end', '7');
    await navigate(page, locale, en ? 'Guests' : 'Huéspedes');
    await expect(page.locator('[data-guest-stay="EST-025"]')).toContainText('Marina Costa');
  });

  test(`R3 unavailable cases explain full occupancy and insufficient capacity without confirmation ${locale}`, async ({ page }) => {
    await openWorkspace(page, locale);
    for (const [id, reason] of [
      ['REQ-026', en ? 'Overlaps another stay' : 'Coincide con otra estancia'],
      ['REQ-027', en ? 'Not enough guest capacity' : 'La capacidad no es suficiente'],
    ]) {
      await chooseCase(page, locale, id);
      await expect(page.getByRole('heading', { name: en ? 'No suitable alternative' : 'No hay una alternativa que encaje', exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: en ? 'Confirm fictitious stay' : 'Confirmar estancia ficticia', exact: true })).toBeDisabled();
      await page.locator('.sw-more-options > summary').click();
      await expect(page.locator('[data-unit-option]')).toHaveCount(8);
      for (const option of await page.locator('[data-unit-option]').all()) {
        await expect(option).toContainText(reason);
        await expect(option.locator('button:enabled')).toHaveCount(0);
      }
    }
    await navigate(page, locale, en ? 'Bookings' : 'Reservas');
    await expect(page.locator('[data-stay-id="EST-025"]')).toHaveCount(0);
    await page.getByRole('combobox', { name: en ? 'Stay status' : 'Estado de la estancia', exact: true }).selectOption('cancelled');
    await expect(page.getByRole('heading', { name: en ? 'No stays in this view' : 'Ninguna estancia en esta vista', exact: true })).toBeVisible();
    await expect(page.locator('[data-stay-id]')).toHaveCount(0);
  });

  test(`R3 an enquiry draft blocks confirmation and reset discards the unsaved dates ${locale}`, async ({ page }) => {
    await openWorkspace(page, locale);
    const adjust = page.getByRole('button', { name: en ? 'Adjust enquiry' : 'Ajustar solicitud', exact: true });
    await adjust.click();
    const checkOut = page.getByLabel(en ? 'Check-out' : 'Salida', { exact: true });
    await checkOut.fill('2026-08-25');
    const confirm = page.getByRole('button', { name: en ? 'Confirm fictitious stay' : 'Confirmar estancia ficticia', exact: true });
    await expect(confirm).toBeDisabled();
    await expect(page.locator('.sw-request-facts time[datetime="2026-08-24"]')).toBeVisible();
    await expect(page.getByRole('button', { name: en ? 'View stay' : 'Ver estancia', exact: true })).toHaveCount(0);

    await page.getByRole('button', { name: en ? 'Reset demo' : 'Restablecer demo', exact: true }).click();
    await page.getByRole('button', { name: en ? 'Reset cases' : 'Restablecer casos', exact: true }).click();
    await expect(page.getByRole('button', { name: en ? 'Reset demo' : 'Restablecer demo', exact: true })).toBeFocused();
    await expect(page.locator('.sw-edit-form')).toHaveCount(0);
    await expect(confirm).toBeEnabled();
    await adjust.click();
    await expect(checkOut).toHaveValue('2026-08-24');
    await expect(page.getByRole('combobox', { name: en ? 'Unit' : 'Unidad', exact: true })).toHaveValue('aira');
    await expect(confirm).toBeDisabled();
    await page.getByRole('button', { name: en ? 'Discard edits' : 'Descartar edición', exact: true }).click();
    await confirmCase(page, locale, 'Casa Bruma');
    await showConfirmedStay(page, locale);
    await expectStay(page, 'Marina Costa', 'Casa Bruma', '2026-08-21', '2026-08-24', 612);
  });

  test(`R3 property filters every stay view and reset plus reload restore disposable fixtures ${locale}`, async ({ page }) => {
    await openWorkspace(page, locale);
    await confirmCase(page, locale, 'Casa Bruma');
    await showConfirmedStay(page, locale);
    const property = page.getByRole('combobox', { name: en ? 'Property' : 'Propiedad', exact: true });
    await property.selectOption('Casa Aira');
    await expect(page.locator('[data-stay-id="EST-025"]')).toHaveCount(0);
    await expect(page.locator('[data-stay-detail]')).toHaveCount(0);
    for (const row of await page.locator('[data-stay-id]').all()) await expect(row).toContainText('Casa Aira');

    await property.selectOption('Casa Bruma');
    await navigate(page, locale, en ? 'Home' : 'Inicio');
    await expect(page.locator('[data-stay-id="EST-025"]')).toBeVisible();
    for (const row of await page.locator('[data-stay-id]').all()) await expect(row).toContainText('Casa Bruma');
    await navigate(page, locale, 'Planning');
    await expect(page.locator('.sw-calendar-unit')).toHaveCount(1);
    await expect(page.locator('.sw-calendar-unit')).toContainText('Casa Bruma');
    await expect(page.locator('[data-planning-stay="EST-025"]')).toBeVisible();
    await navigate(page, locale, en ? 'Guests' : 'Huéspedes');
    await expect(page.locator('[data-guest-stay]')).toHaveCount(3);
    for (const guest of await page.locator('[data-guest-stay]').all()) await expect(guest).toContainText('Casa Bruma');

    await property.selectOption('Casa Duna');
    await navigate(page, locale, en ? 'Enquiries' : 'Solicitudes');
    await expect(page.getByRole('combobox', { name: en ? 'Demo case' : 'Caso de demostración', exact: true })).toBeDisabled();
    await expect(page.getByRole('heading', { name: en ? 'No enquiries for this house' : 'No hay solicitudes para esta casa', exact: true })).toBeVisible();

    await property.selectOption('all');
    await chooseCase(page, locale, 'REQ-024');
    await page.getByRole('button', { name: en ? 'Reset demo' : 'Restablecer demo', exact: true }).click();
    await page.getByRole('button', { name: en ? 'Reset cases' : 'Restablecer casos', exact: true }).click();
    await expect(page.getByRole('button', { name: en ? 'Undo last change' : 'Deshacer último cambio', exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: en ? 'Select Casa Bruma' : 'Seleccionar Casa Bruma', exact: true })).toBeEnabled();
    await navigate(page, locale, en ? 'Bookings' : 'Reservas');
    await expect(page.locator('[data-stay-id]')).toHaveCount(15);
    await expect(page.locator('[data-stay-id="EST-025"]')).toHaveCount(0);

    await navigate(page, locale, en ? 'Enquiries' : 'Solicitudes');
    await confirmCase(page, locale, 'Casa Bruma');
    await showConfirmedStay(page, locale);
    await property.selectOption('Casa Bruma');
    await page.reload();
    await expect(property).toHaveValue('all');
    await expect(page.locator('[data-stay-id]')).toHaveCount(15);
    await expect(page.locator('[data-stay-id="EST-025"]')).toHaveCount(0);
    await expect(page.getByRole('button', { name: en ? 'Undo last change' : 'Deshacer último cambio', exact: true })).toHaveCount(0);
  });

  for (const width of [320, 390, 1440]) {
    test(`R3 keyboard flow accessibility and text reflow ${locale} ${width}`, async ({ page }, testInfo) => {
      test.setTimeout(60_000);
      await page.setViewportSize({ width, height: 900 });
      await openWorkspace(page, locale);
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: testInfo.outputPath('enquiry.png'), fullPage: true });
      const alternative = page.getByRole('button', { name: en ? 'Select Casa Bruma' : 'Seleccionar Casa Bruma', exact: true });
      await alternative.focus();
      await page.keyboard.press('Enter');
      const confirm = page.getByRole('button', { name: en ? 'Confirm fictitious stay' : 'Confirmar estancia ficticia', exact: true });
      await confirm.focus();
      await page.keyboard.press('Enter');
      const view = page.getByRole('button', { name: en ? 'View stay' : 'Ver estancia', exact: true });
      await view.focus();
      await page.keyboard.press('Enter');
      await expectStay(page, 'Marina Costa', 'Casa Bruma', '2026-08-21', '2026-08-24', 612);
      await expect(page.locator('[data-stay-detail] h2')).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(page.locator('[data-stay-detail]')).toHaveCount(0);

      const row = page.locator('[data-stay-id="EST-025"]');
      await row.focus();
      await page.keyboard.press('Enter');
      await expect(page.locator('[data-stay-detail] h2')).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(row).toBeFocused();
      await page.keyboard.press('Enter');
      await page.getByRole('button', { name: en ? 'Edit stay' : 'Modificar estancia', exact: true }).click();
      await page.getByLabel(en ? 'Check-out' : 'Salida', { exact: true }).fill('2026-08-20');
      await expect(page.getByRole('button', { name: en ? 'Save changes' : 'Guardar cambios', exact: true })).toBeDisabled();
      await expect(page.locator('.sw-edit-check')).toContainText(en ? 'Check-out must be after check-in' : 'La salida debe ser posterior a la entrada');
      await expectStay(page, 'Marina Costa', 'Casa Bruma', '2026-08-21', '2026-08-24', 612);
      await page.screenshot({ path: testInfo.outputPath('stay-invalid-edit.png'), fullPage: true });
      const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
      expect(axe.violations.map(({ id, nodes }) => ({ id, targets: nodes.map(node => node.target) }))).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await enlargeTextTo200Percent(page);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.getByRole('button', { name: en ? 'Discard edits' : 'Descartar edición', exact: true }).click();
      await page.getByRole('button', { name: en ? 'Close stay details' : 'Cerrar ficha de estancia', exact: true }).click();
      await navigate(page, locale, 'Planning');
      await expect(page.locator('[data-planning-stay="EST-025"]')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: testInfo.outputPath('planning-text-200.png'), fullPage: true });
      await navigate(page, locale, en ? 'Reports' : 'Informes');
      await expect(page.locator('[data-report-stays]')).toHaveText('16');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect(await page.locator('.stay-report-chart > div:last-child small').evaluate(label => {
        const range = document.createRange();
        range.selectNodeContents(label);
        return range.getClientRects().length;
      })).toBe(1);
      expect(await page.locator('.stay-report-chart').evaluate(chart => {
        const bounds = chart.getBoundingClientRect();
        const first = chart.querySelector('div:first-child small')!.getBoundingClientRect();
        const last = chart.querySelector('div:last-child small')!.getBoundingClientRect();
        return first.left >= bounds.left - 1 && last.right <= bounds.right + 1;
      })).toBe(true);
      await page.locator('.stay-report-ledger > summary').click();
      const reportAxe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
      expect(reportAxe.violations.map(({ id, nodes }) => ({ id, targets: nodes.map(node => node.target) }))).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: testInfo.outputPath('report-text-200.png'), fullPage: true });
    });
  }
}

test('R3 mobile notifications and accent-insensitive search open the exact local case with keyboard recovery', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await openWorkspace(page, 'es');
  const menu = page.getByRole('button', { name: 'Abrir menú', exact: true });
  await menu.focus();
  await page.keyboard.press('Enter');
  const closeMenu = page.locator('.sidebar').getByRole('button', { name: 'Cerrar menú', exact: true });
  await expect(closeMenu).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.locator('.sidebar').getByRole('link', { name: /Contacto comercial/ })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(closeMenu).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu).toBeFocused();

  await page.getByRole('button', { name: 'Abrir avisos', exact: true }).click();
  await page.getByRole('dialog', { name: 'Avisos operativos', exact: true }).getByRole('button', { name: /REQ-026/ }).click();
  await expect(page.getByRole('combobox', { name: 'Caso de demostración', exact: true })).toHaveValue('REQ-026');
  await expect(page.getByRole('heading', { name: 'No hay una alternativa que encaje', exact: true })).toBeVisible();

  const searchTrigger = page.getByRole('button', { name: 'Buscar en el gestor', exact: true });
  await searchTrigger.click();
  const search = page.getByRole('dialog', { name: 'Búsqueda rápida', exact: true });
  await search.getByLabel('Buscar sección, huésped o estancia', { exact: true }).fill('lucia');
  const result = search.getByRole('button', { name: /Lucía Vega.*EST-006/ });
  await expect(result).toBeVisible();
  await result.focus();
  await page.keyboard.press('Tab');
  await expect(search.getByRole('button', { name: 'Cerrar', exact: true })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(result).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(searchTrigger).toBeFocused();

  await page.keyboard.press('Enter');
  await search.getByLabel('Buscar sección, huésped o estancia', { exact: true }).fill('lucia');
  await result.click();
  const detail = page.locator('[data-stay-detail]');
  await expect(detail).toContainText('EST-006');
  await expect(detail).toContainText('Casa Linde');
  await expect(detail.getByRole('heading', { name: 'Lucía Vega', exact: true })).toBeFocused();
  await menu.click();
  await expect(closeMenu).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu).toBeFocused();
  await expect(detail).toBeVisible();
  await searchTrigger.click();
  await expect(search).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(search).toHaveCount(0);
  await expect(searchTrigger).toBeFocused();
  await expect(detail).toBeVisible();
  await expect(detail).toContainText('EST-006');
  await page.getByRole('button', { name: 'Cerrar ficha de estancia', exact: true }).click();
  await expect(detail).toHaveCount(0);
  await navigate(page, 'es', 'Informes');
  await navigate(page, 'es', 'Reservas');
  await expect(detail).toHaveCount(0);
  await page.getByRole('combobox', { name: 'Propiedad', exact: true }).selectOption('Casa Bruma');
  await searchTrigger.click();
  await search.getByLabel('Buscar sección, huésped o estancia', { exact: true }).fill('lucia');
  await expect(search.getByText('No hay resultados con estos términos y el filtro actual.', { exact: true })).toBeVisible();
  await expect(result).toHaveCount(0);
});
