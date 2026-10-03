import { expect, test, type Locator, type Page, type TestInfo } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { enlargeTextTo200Percent } from './helpers/text-resize';

type Locale = 'es' | 'en';
type IsolationEvidence = { writes: string[]; external: string[]; api: string[]; sockets: string[]; storage: string[] };
const evidence = new WeakMap<Page, IsolationEvidence>();
const writeMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

// Record and block unexpected network side effects before exercising any fixture.
test.beforeEach(async ({ page, baseURL }) => {
  const seen: IsolationEvidence = { writes: [], external: [], api: [], sockets: [], storage: [] };
  evidence.set(page, seen);
  const origin = new URL(baseURL!).origin;
  page.on('request', request => {
    if (writeMethods.has(request.method())) seen.writes.push(request.url());
    const url = new URL(request.url());
    if (url.origin !== origin) seen.external.push(request.url());
    if (url.pathname.startsWith('/api/')) seen.api.push(request.url());
  });
  await page.route('**/*', route => {
    const request = route.request();
    const url = new URL(request.url());
    return writeMethods.has(request.method()) || url.origin !== origin || url.pathname.startsWith('/api/')
      ? route.abort('blockedbyclient')
      : route.continue();
  });
  await page.routeWebSocket('**', socket => {
    seen.sockets.push(socket.url());
    socket.close();
  });
  await page.exposeFunction('__recordR4StorageWrite', (key: string) => { seen.storage.push(key); });
  await page.addInitScript(() => {
    const record = (key: string) => {
      void (window as Window & { __recordR4StorageWrite: (key: string) => Promise<void> }).__recordR4StorageWrite(key);
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
    expect(await page.evaluate(() => ({ local: Object.keys(localStorage), session: Object.keys(sessionStorage) }))).toEqual({ local: [], session: [] });
  }
});

const label = (locale: Locale, es: string, en: string) => locale === 'es' ? es : en;
const taskDetail = (page: Page, id = 'PREP-312') => page.locator(`[data-operation-detail="${id}"]`);

async function openWorkspace(page: Page, locale: Locale) {
  const response = await page.goto(`${locale === 'en' ? '/en' : ''}/demos/aurem/gestion/?vista=cleaning`);
  expect(response?.headers()['content-security-policy']).toContain("connect-src 'none'");
  expect(response?.headers()['content-security-policy']).toContain("form-action 'none'");
  await expect(page.locator('[data-operations-workspace]')).toBeVisible();
  await expect(page.locator('.demo-banner')).toContainText(label(locale, 'memoria', 'memory'));
  await expect(page.locator('[name="name"], [name="email"], [type="email"], [type="tel"], [type="file"], textarea')).toHaveCount(0);
}

async function navigate(page: Page, locale: Locale, es: string, en: string) {
  const menu = page.getByRole('button', { name: label(locale, 'Abrir menú', 'Open menu'), exact: true });
  if (await menu.isVisible()) await menu.click();
  const name = label(locale, es, en);
  await page.getByRole('navigation', { name: label(locale, 'Gestor', 'Workspace'), exact: true }).getByRole('button', { name, exact: true }).click();
  await expect(page.getByRole('heading', { name, level: 1, exact: true })).toBeVisible();
}

async function selectRole(page: Page, locale: Locale, role: 'direction' | 'reception' | 'cleaning') {
  const selector = page.getByRole('combobox', { name: label(locale, 'Rol', 'Role'), exact: true });
  await expect(selector).toBeVisible();
  await selector.selectOption(role);
}

async function openTask(page: Page, id = 'PREP-312') {
  await page.locator(`[data-operation-task="${id}"]`).click();
  await expect(taskDetail(page, id)).toBeVisible();
}

async function clickAction(scope: Page | Locator, locale: Locale, es: string, en: string) {
  await scope.getByRole('button', { name: label(locale, es, en), exact: true }).click();
}

async function assignTask(page: Page, locale: Locale, id = 'PREP-312', assignee = 'marta') {
  await selectRole(page, locale, 'reception');
  await openTask(page, id);
  await clickAction(taskDetail(page, id), locale, 'Confirmar salida', 'Confirm departure');
  await selectRole(page, locale, 'direction');
  await taskDetail(page, id).getByRole('combobox', { name: label(locale, 'Asignar a', 'Assign to'), exact: true }).selectOption(assignee);
  await clickAction(taskDetail(page, id), locale, 'Asignar tarea', 'Assign task');
}

async function acceptTask(page: Page, locale: Locale, id = 'PREP-312', actor = 'marta') {
  await selectRole(page, locale, 'cleaning');
  await page.getByRole('combobox', { name: label(locale, 'Persona de muestra', 'Demo team member'), exact: true }).selectOption(actor);
  await openTask(page, id);
  await clickAction(taskDetail(page, id), locale, 'Aceptar tarea', 'Accept task');
}

async function completeChecklist(page: Page, id = 'PREP-312') {
  const checks = taskDetail(page, id).getByRole('checkbox');
  await expect(checks).toHaveCount(3);
  for (const check of await checks.all()) await check.check();
}

async function requestReview(page: Page, locale: Locale, id = 'PREP-312') {
  await completeChecklist(page, id);
  await clickAction(taskDetail(page, id), locale, 'Solicitar revisión', 'Request review');
}

async function readiness(scope: Locator, status: 'ready' | 'blocked' | 'pending' | 'review') {
  await expect(scope).toHaveAttribute('data-task-readiness', status);
  await expect(scope.locator('[data-task-readiness]')).toHaveAttribute('data-task-readiness', status);
}

async function auditExpanded(page: Page, testInfo: TestInfo, state: string) {
  const history = page.locator('.ops-history');
  if (await history.count() && await history.getAttribute('open') === null) {
    await history.locator('summary').click();
  }
  await expect(history).toHaveAttribute('open');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), state).toBe(true);
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  expect(result.violations.map(({ id, nodes }) => ({ state, id, targets: nodes.map(node => node.target) }))).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath(`${state}.png`), fullPage: true });
}

for (const locale of ['es', 'en'] as const) {
  const en = locale === 'en';

  test(`R4 a normal turnover requires departure assignment acceptance and a separate review ${locale}`, async ({ page }) => {
    await openWorkspace(page, locale);
    await openTask(page);
    await readiness(taskDetail(page), 'blocked');
    await assignTask(page, locale);
    await readiness(taskDetail(page), 'pending');
    await expect(taskDetail(page)).toHaveAttribute('data-operation-status', 'assigned');
    await acceptTask(page, locale);
    await expect(taskDetail(page)).toHaveAttribute('data-operation-status', 'accepted');
    await expect(taskDetail(page).getByRole('button', { name: label(locale, 'Solicitar revisión', 'Request review'), exact: true })).toBeDisabled();
    await requestReview(page, locale);
    await readiness(taskDetail(page), 'review');
    await expect(taskDetail(page)).toHaveAttribute('data-operation-status', 'review');
    await selectRole(page, locale, 'reception');
    await clickAction(taskDetail(page), locale, 'Validar habitación preparada', 'Validate room readiness');
    await readiness(taskDetail(page), 'ready');
    await expect(taskDetail(page)).toHaveAttribute('data-operation-status', 'ready');
    for (const [es, translated] of [['Inicio', 'Home'], ['Centro operativo', 'Operations centre'], ['Planning', 'Planning'], ['Reservas', 'Bookings'], ['Huéspedes', 'Guests']]) {
      await navigate(page, locale, es, translated);
      const stay = page.locator('[data-operation-stay="AUR-813"]');
      await expect(stay).toBeVisible();
      await readiness(stay, 'ready');
    }
  });

  test(`R4 an incident blocks preparation until resolution cleaning and human review ${locale}`, async ({ page }) => {
    const id = 'PREP-408';
    await openWorkspace(page, locale);
    await assignTask(page, locale, id);
    await acceptTask(page, locale, id);
    await completeChecklist(page, id);
    await clickAction(taskDetail(page, id), locale, 'Registrar incidencia ficticia', 'Report fictitious issue');
    await readiness(taskDetail(page, id), 'blocked');
    await clickAction(page, locale, 'Con incidencia', 'With an issue');
    await expect(page.locator('[data-operation-task]')).toHaveCount(1);
    await expect(page.locator('[data-operation-task="PREP-408"]')).toBeVisible();
    await clickAction(page, locale, 'Hoy', 'Today');
    const bathroom = taskDetail(page, id).getByRole('checkbox', { name: label(locale, 'Baño limpio y revisado', 'Bathroom cleaned and checked'), exact: true });
    await expect(bathroom).not.toBeChecked();
    for (const check of await taskDetail(page, id).getByRole('checkbox').all()) await expect(check).toBeDisabled();
    await expect(taskDetail(page, id).getByRole('button', { name: label(locale, 'Solicitar revisión', 'Request review'), exact: true })).toBeDisabled();
    await selectRole(page, locale, 'direction');
    await navigate(page, locale, 'Mantenimiento', 'Maintenance');
    await openTask(page, id);
    await clickAction(taskDetail(page, id), locale, 'Resolver incidencia', 'Resolve issue');
    await readiness(taskDetail(page, id), 'pending');
    await navigate(page, locale, 'Limpieza', 'Cleaning');
    await selectRole(page, locale, 'cleaning');
    await openTask(page, id);
    await bathroom.check();
    await clickAction(taskDetail(page, id), locale, 'Solicitar revisión', 'Request review');
    await readiness(taskDetail(page, id), 'review');
    await selectRole(page, locale, 'reception');
    await clickAction(taskDetail(page, id), locale, 'Validar habitación preparada', 'Validate room readiness');
    await readiness(taskDetail(page, id), 'ready');
    await navigate(page, locale, 'Planning', 'Planning');
    await readiness(page.locator('[data-operation-stay="AUR-812"]'), 'ready');
  });

  test(`R4 rejected work can be reassigned and a returned checklist needs another review ${locale}`, async ({ page }) => {
    await openWorkspace(page, locale);
    await assignTask(page, locale);
    await selectRole(page, locale, 'cleaning');
    await openTask(page);
    await clickAction(taskDetail(page), locale, 'Rechazar tarea', 'Decline task');
    await taskDetail(page).getByRole('combobox', { name: label(locale, 'Motivo de rechazo', 'Decline reason'), exact: true }).selectOption('workload');
    await clickAction(taskDetail(page), locale, 'Confirmar rechazo', 'Confirm decline');
    await expect(taskDetail(page)).toHaveAttribute('data-operation-status', 'declined');
    await selectRole(page, locale, 'direction');
    await openTask(page);
    await readiness(taskDetail(page), 'blocked');
    await taskDetail(page).getByRole('combobox', { name: label(locale, 'Asignar a', 'Assign to'), exact: true }).selectOption('leo');
    await clickAction(taskDetail(page), locale, 'Reasignar tarea', 'Reassign task');
    await expect(taskDetail(page).getByRole('checkbox', { checked: true })).toHaveCount(0);
    await acceptTask(page, locale, 'PREP-312', 'leo');
    await requestReview(page, locale);
    await selectRole(page, locale, 'reception');
    await clickAction(taskDetail(page), locale, 'Devolver a limpieza', 'Return to cleaning');
    await taskDetail(page).getByRole('combobox', { name: label(locale, 'Comprobación a repetir', 'Check to repeat'), exact: true }).selectOption('bathroom');
    await clickAction(taskDetail(page), locale, 'Confirmar devolución', 'Confirm return');
    await readiness(taskDetail(page), 'pending');
    await selectRole(page, locale, 'cleaning');
    await expect(taskDetail(page).getByRole('checkbox', { checked: true })).toHaveCount(2);
    const bathroom = taskDetail(page).getByRole('checkbox', { name: label(locale, 'Baño limpio y revisado', 'Bathroom cleaned and checked'), exact: true });
    await expect(bathroom).not.toBeChecked();
    await bathroom.check();
    await clickAction(taskDetail(page), locale, 'Solicitar revisión', 'Request review');
    await selectRole(page, locale, 'direction');
    await clickAction(taskDetail(page), locale, 'Validar habitación preparada', 'Validate room readiness');
    await readiness(taskDetail(page), 'ready');
  });

  test(`R4 role and team-member boundaries prevent another cleaner from operating a task ${locale}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await openWorkspace(page, locale);
    await selectRole(page, locale, 'reception');
    await openTask(page);
    await clickAction(taskDetail(page), locale, 'Confirmar salida', 'Confirm departure');
    await expect(taskDetail(page).getByRole('button', { name: label(locale, 'Asignar tarea', 'Assign task'), exact: true }).and(page.locator(':enabled'))).toHaveCount(0);
    await selectRole(page, locale, 'direction');
    await taskDetail(page).getByRole('combobox', { name: label(locale, 'Asignar a', 'Assign to'), exact: true }).selectOption('marta');
    await clickAction(taskDetail(page), locale, 'Asignar tarea', 'Assign task');
    await selectRole(page, locale, 'cleaning');
    await page.getByRole('combobox', { name: label(locale, 'Persona de muestra', 'Demo team member'), exact: true }).selectOption('leo');
    await expect(page.locator('[data-operation-task="PREP-312"]')).toHaveCount(0);
    await expect(page.locator('[data-operation-task="PREP-205"]')).toBeVisible();
    await page.getByRole('combobox', { name: label(locale, 'Tareas visibles', 'Visible tasks'), exact: true }).selectOption('all');
    await openTask(page);
    await expect(taskDetail(page).getByRole('button', { name: label(locale, 'Aceptar tarea', 'Accept task'), exact: true }).and(page.locator(':enabled'))).toHaveCount(0);
    for (const check of await taskDetail(page).getByRole('checkbox').all()) await expect(check).toBeDisabled();
    await expect(taskDetail(page).getByRole('button', { name: label(locale, 'Validar habitación preparada', 'Validate room readiness'), exact: true }).and(page.locator(':enabled'))).toHaveCount(0);
    await readiness(taskDetail(page), 'pending');
    await page.getByRole('combobox', { name: label(locale, 'Persona de muestra', 'Demo team member'), exact: true }).selectOption('marta');
    await openTask(page);
    await clickAction(taskDetail(page), locale, 'Aceptar tarea', 'Accept task');
    await expect(taskDetail(page).getByRole('checkbox')).toHaveCount(3);
    for (const check of await taskDetail(page).getByRole('checkbox').all()) await expect(check).toBeEnabled();

    const searchTrigger = page.getByRole('button', { name: label(locale, 'Buscar en el gestor', 'Search workspace'), exact: true });
    const search = page.getByRole('dialog', { name: label(locale, 'Búsqueda rápida', 'Quick search'), exact: true });
    for (let repeat = 0; repeat < 2; repeat++) {
      await clickAction(taskDetail(page), locale, 'Cerrar ficha de preparación', 'Close preparation record');
      await searchTrigger.click();
      await search.getByRole('textbox', { name: label(locale, 'Buscar sección, huésped o estancia', 'Search section, guest or stay'), exact: true }).fill('PREP-312');
      await search.getByRole('button', { name: /AUR-813.*PREP-312/ }).click();
      await expect(taskDetail(page)).toBeVisible();
      await expect(taskDetail(page).getByRole('heading', { level: 2 })).toBeFocused();
    }
    await searchTrigger.click();
    await expect(page.locator('.dash-main')).toHaveAttribute('inert');
    await page.keyboard.press('Escape');
    await expect(search).toHaveCount(0);
    await expect(taskDetail(page)).toBeVisible();
    await expect(searchTrigger).toBeFocused();
    const menu = page.getByRole('button', { name: label(locale, 'Abrir menú', 'Open menu'), exact: true });
    await menu.click();
    await expect(page.locator('.dash-main')).toHaveAttribute('inert');
    await page.keyboard.press('Escape');
    await expect(menu).toBeFocused();
    await expect(taskDetail(page)).toBeVisible();
  });

  test(`R4 undo reset and reload restore task state and simulated roles ${locale}`, async ({ page }) => {
    await openWorkspace(page, locale);
    await clickAction(page, locale, 'Con incidencia', 'With an issue');
    await expect(page.getByRole('heading', { name: label(locale, 'No hay tareas en esta vista', 'No tasks in this view'), exact: true })).toBeVisible();
    await expect(page.locator('[data-operation-task]')).toHaveCount(0);
    await clickAction(page, locale, 'Hoy', 'Today');
    await assignTask(page, locale);
    await acceptTask(page, locale);
    const linen = taskDetail(page).getByRole('checkbox', { name: label(locale, 'Ropa de cama y toallas', 'Bed linen and towels'), exact: true });
    await linen.check();
    await clickAction(page, locale, 'Deshacer último cambio', 'Undo last change');
    await expect(linen).not.toBeChecked();
    await linen.check();
    await clickAction(page, locale, 'Restablecer demo', 'Reset demo');
    await clickAction(page, locale, 'Restablecer casos', 'Reset cases');
    await selectRole(page, locale, 'direction');
    await openTask(page);
    await readiness(taskDetail(page), 'blocked');
    await expect(taskDetail(page).getByRole('button', { name: label(locale, 'Confirmar salida', 'Confirm departure'), exact: true })).toBeEnabled();
    await expect(page.getByRole('button', { name: label(locale, 'Deshacer último cambio', 'Undo last change'), exact: true }).and(page.locator(':enabled'))).toHaveCount(0);
    await assignTask(page, locale);
    await selectRole(page, locale, 'cleaning');
    await page.reload();
    await expect(page.getByRole('combobox', { name: label(locale, 'Rol', 'Role'), exact: true })).toHaveValue('direction');
    await openTask(page);
    await readiness(taskDetail(page), 'blocked');
    await expect(taskDetail(page).getByRole('button', { name: label(locale, 'Confirmar salida', 'Confirm departure'), exact: true })).toBeEnabled();
    await expect(page.getByRole('button', { name: label(locale, 'Deshacer último cambio', 'Undo last change'), exact: true }).and(page.locator(':enabled'))).toHaveCount(0);
  });

  test(`R4 preparation changes invalidate copilot review while preserving the human draft ${locale}`, async ({ page }) => {
    await openWorkspace(page, locale);
    await navigate(page, locale, 'Copiloto', 'Copilot');
    const humanDraft = en ? 'Human draft: check preparation with reception before answering.' : 'Borrador humano: contrastar la preparación con recepción antes de responder.';
    const draft = page.getByRole('textbox', { name: label(locale, 'Mensaje preparado', 'Prepared message'), exact: true });
    await draft.fill(humanDraft);
    await clickAction(page, locale, 'Guardar borrador local', 'Save local draft');
    await clickAction(page, locale, 'Marcar como revisado', 'Mark as reviewed');
    await expect(page.getByText(label(locale, 'Revisado', 'Reviewed'), { exact: true })).toBeVisible();
    await navigate(page, locale, 'Limpieza', 'Cleaning');
    await openTask(page, 'PREP-408');
    await clickAction(taskDetail(page, 'PREP-408'), locale, 'Confirmar salida', 'Confirm departure');
    await navigate(page, locale, 'Copiloto', 'Copilot');
    await expect(draft).toHaveValue(humanDraft);
    await expect(page.locator('[data-preparation-source-change]')).toBeVisible();
    await expect(page.getByText(label(locale, 'Revisado', 'Reviewed'), { exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: label(locale, 'Marcar como revisado', 'Mark as reviewed'), exact: true })).toBeEnabled();
    await expect(page.getByRole('button', { name: label(locale, 'Enviar deshabilitado · proveedor no conectado', 'Send disabled · provider not connected'), exact: true })).toBeDisabled();
    await clickAction(page, locale, 'Marcar como revisado', 'Mark as reviewed');
    await navigate(page, locale, 'Limpieza', 'Cleaning');
    await clickAction(page, locale, 'Restablecer demo', 'Reset demo');
    await clickAction(page, locale, 'Restablecer casos', 'Reset cases');
    await navigate(page, locale, 'Copiloto', 'Copilot');
    await expect(draft).toHaveValue(humanDraft);
    await expect(page.locator('[data-preparation-source-change]')).toBeVisible();
    await expect(page.getByText(label(locale, 'Revisado', 'Reviewed'), { exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: label(locale, 'Enviar deshabilitado · proveedor no conectado', 'Send disabled · provider not connected'), exact: true })).toBeDisabled();
    await page.reload();
    await expect(draft).not.toHaveValue(humanDraft);
    await expect(page.locator('[data-preparation-source-change]')).toHaveCount(0);
    await expect(page.getByRole('button', { name: label(locale, 'Enviar deshabilitado · proveedor no conectado', 'Send disabled · provider not connected'), exact: true })).toBeDisabled();
  });

  for (const width of [320, 390, 1440]) {
    test(`R4 preparation preserves context and all expanded states reflow accessibly ${locale} ${width}`, async ({ page }, testInfo) => {
      test.setTimeout(90_000);
      const id = 'PREP-408';
      await page.setViewportSize({ width, height: 900 });
      await openWorkspace(page, locale);
      await page.evaluate(() => document.fonts.ready);
      const trigger = page.locator(`[data-operation-task="${id}"]`);
      await trigger.focus();
      await page.keyboard.press('Enter');
      const detail = taskDetail(page, id);
      await expect(detail.getByRole('heading', { level: 2 })).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(detail).toHaveCount(0);
      await expect(trigger).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(detail.getByRole('heading', { level: 2 })).toBeFocused();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: testInfo.outputPath('initial-preparation.png'), fullPage: true });
      await enlargeTextTo200Percent(page);
      await assignTask(page, locale, id);
      await selectRole(page, locale, 'cleaning');
      await openTask(page, id);
      await clickAction(detail, locale, 'Rechazar tarea', 'Decline task');
      await expect(detail.getByRole('combobox', { name: label(locale, 'Motivo de rechazo', 'Decline reason'), exact: true })).toBeVisible();
      await auditExpanded(page, testInfo, 'decline-expanded-text-200');
      await clickAction(detail, locale, 'Conservar asignación', 'Keep assignment');
      await clickAction(detail, locale, 'Aceptar tarea', 'Accept task');
      const linen = detail.getByRole('checkbox', { name: label(locale, 'Ropa de cama y toallas', 'Bed linen and towels'), exact: true });
      await linen.check();
      await page.setViewportSize({ width: width === 1440 ? 390 : 1440, height: 900 });
      await expect(detail).toBeVisible();
      await expect(linen).toBeChecked();
      await expect(page.getByRole('combobox', { name: label(locale, 'Rol', 'Role'), exact: true })).toHaveValue('cleaning');
      await page.setViewportSize({ width, height: 900 });
      await expect(detail).toBeVisible();
      await expect(linen).toBeChecked();

      await clickAction(detail, locale, 'Registrar incidencia ficticia', 'Report fictitious issue');
      await readiness(detail, 'blocked');
      await auditExpanded(page, testInfo, 'incident-open-text-200');
      await selectRole(page, locale, 'direction');
      await clickAction(detail, locale, 'Resolver incidencia', 'Resolve issue');
      await readiness(detail, 'pending');
      await selectRole(page, locale, 'cleaning');
      await requestReview(page, locale, id);
      await selectRole(page, locale, 'reception');
      await clickAction(detail, locale, 'Devolver a limpieza', 'Return to cleaning');
      await expect(detail.getByRole('combobox', { name: label(locale, 'Comprobación a repetir', 'Check to repeat'), exact: true })).toBeVisible();
      await auditExpanded(page, testInfo, 'review-return-expanded-text-200');
      await clickAction(detail, locale, 'Conservar revisión', 'Keep review');
      await clickAction(detail, locale, 'Validar habitación preparada', 'Validate room readiness');
      await readiness(detail, 'ready');
      await clickAction(page, locale, 'Restablecer demo', 'Reset demo');
      await expect(page.getByRole('button', { name: label(locale, 'Restablecer casos', 'Reset cases'), exact: true })).toBeVisible();
      await auditExpanded(page, testInfo, 'ready-reset-expanded-text-200');
      await clickAction(page, locale, 'Seguir trabajando', 'Keep working');
      await expect(page.getByRole('button', { name: label(locale, 'Restablecer demo', 'Reset demo'), exact: true })).toBeFocused();
      await clickAction(detail, locale, 'Cerrar ficha de preparación', 'Close preparation record');
      await expect(trigger).toBeFocused();
    });
  }
}
