import { expect, test, type Locator, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const contextKey = 'logic-estancia-assessment-v1';
const operationalMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const commercialManifest = {
  schemaVersion: '1.0.0', mode: 'demo', demoMode: true, commercialLeadsEnabled: true,
  sideEffects: true, durableWrites: true, jobs: false,
  providers: { analytics: 'disabled', email: 'live', payments: 'disabled', webhooks: 'disabled', externalStorage: 'disabled' },
  operations: { commercialLead: 'active', payments: 'unavailable', webhooks: 'unavailable', automations: 'unavailable' },
};

// Every write is intercepted. Tests that submit install a more specific mock below.
test.beforeEach(async ({ page }) => {
  await page.route('**/*', route => operationalMethods.has(route.request().method()) ? route.abort('blockedbyclient') : route.continue());
  await page.route('**/api/capabilities', route => route.fulfill({ json: commercialManifest }));
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

async function captureLeads(page: Page) {
  const submitted: Record<string, unknown>[] = [];
  await page.route('**/api/leads', route => {
    submitted.push(route.request().postDataJSON());
    return route.fulfill({ status: 202, json: { ok: true, outcome: 'delivered', ref: 'r2-mocked', meetingUrl: null } });
  });
  return submitted;
}

async function fillContact(form: Locator) {
  await form.locator('[name="name"]').fill('R2 Sample');
  await form.locator('[name="businessName"]').fill('Fictional accommodation');
  await form.locator('[name="email"]').fill('r2@example.test');
  await form.locator('[name="accept"]').check();
}

async function expectContact(form: Locator) {
  await expect(form.locator('[name="name"]')).toHaveValue('R2 Sample');
  await expect(form.locator('[name="businessName"]')).toHaveValue('Fictional accommodation');
  await expect(form.locator('[name="email"]')).toHaveValue('r2@example.test');
}

async function rejectCookies(page: Page) {
  const reject = page.locator('[data-consent-reject]').first();
  if (await reject.isVisible()) await reject.click();
}

async function seedAssessment(page: Page, prefix: string) {
  await page.goto(`${prefix}/`);
  await rejectCookies(page);
  await page.evaluate(({ contextKey, prefix }) => sessionStorage.setItem(contextKey, JSON.stringify({
    version: '1.0.0', createdAt: Date.now(), locale: prefix ? 'en' : 'es', accommodationType: 'rural',
    businessMode: 'multi', propertyCount: 3, unitCount: 12, plan: 'gestion',
    currentStack: ['website', 'email'], requestedCapabilities: ['enquiries', 'planning'], timeline: '3-6',
    investmentRange: '8k-20k', web: 'terrava', panel: 'terrava', segment: 'rural',
    sourcePath: prefix ? '/en/journey/' : '/recorrido/',
  })), { contextKey, prefix });
  await page.goto(`${prefix}/?assessment=1#contacto`);
}

async function completeAssessment(page: Page, prefix: string) {
  const assessmentPath = prefix ? '/en/assessment/' : '/diagnostico/';
  const sourcePath = prefix ? '/en/journey/' : '/recorrido/';
  await page.goto(`${assessmentPath}?plan=gestion&web=terrava&panel=terrava&segment=rural&need=enquiries&sourcePath=${encodeURIComponent(sourcePath)}`);
  await rejectCookies(page);
  const form = page.locator('[data-assessment]');
  await form.locator('[name="businessMode"]').selectOption('multi');
  await form.locator('[data-next]').click();
  await form.locator('[name="propertyCount"]').fill('3');
  await form.locator('[name="unitCount"]').fill('12');
  await form.locator('[data-next]').click();
  await form.locator('[name="currentStack"][value="website"]').check();
  await form.locator('[name="currentStack"][value="email"]').check();
  await form.locator('[data-next]').click();
  await form.locator('[name="bookingNeeds"][value="planning"]').check();
  await form.locator('[data-next]').click();
  await form.locator('[data-next]').click();
  await form.locator('[name="timeline"]').selectOption('3-6');
  await form.locator('[name="investmentRange"]').selectOption('8k-20k');
  await form.locator('[data-next]').click();
  await expect(page.locator('[data-result-name]')).toHaveText(prefix ? 'Management' : 'Gestión');
  await page.locator('[data-sales-link]').click();
}

for (const prefix of ['', '/en']) {
  const en = Boolean(prefix);
  const locale = en ? 'en' : 'es';

  test(`R2 assessment edits become the collapsed summary and submitted payload ${locale}`, async ({ page }) => {
    const submitted = await captureLeads(page);
    await completeAssessment(page, prefix);
    const form = page.locator('[data-lead]');
    const context = form.locator('details[data-lead-context]');
    const summary = context.locator('[data-lead-context-summary]');
    await expect(form).toHaveCount(1);
    await expect(context).not.toHaveAttribute('open');
    await expect(context.locator('[data-assessment-included]')).toBeVisible();
    await expect(context.locator('[data-assessment-included]')).toContainText(en ? 'Assessment included' : 'Diagnóstico incluido');
    await expect(summary).toContainText(en ? 'Management' : 'Gestión');
    await expect(summary).toContainText('12');
    for (const name of ['name', 'businessName', 'email']) await expect(form.locator(`[name="${name}"]`)).toBeVisible();
    await expect(form.locator('[name="unitCount"]')).toBeHidden();
    expect(submitted).toEqual([]);

    await context.locator(':scope > summary').focus();
    await page.keyboard.press('Enter');
    await expect(context).toHaveAttribute('open', '');
    await expect(summary).toBeHidden();
    await expect(context.locator('[data-assessment-included]')).toBeHidden();
    const extras = context.locator('[data-assessment-handoff]');
    await expect(extras).toBeVisible();
    await extras.locator('details > summary').click();
    await expect(extras).toContainText(en ? 'Email and spreadsheets' : 'Email y hojas de cálculo');
    await expect(extras).toContainText(en ? 'Enquiries and alternatives' : 'Solicitudes y alternativas');
    await expect(extras).toContainText('terrava');
    const extraLabels = await extras.locator('dt').allTextContents();
    for (const label of en
      ? ['Recommended plan', 'Accommodation type', 'Scale', 'Timeframe']
      : ['Plan recomendado', 'Tipo de alojamiento', 'Escala', 'Plazo']) expect(extraLabels).not.toContain(label);
    await form.locator('[name="plan"]').selectOption('basico');
    await form.locator('[name="accommodationType"]').selectOption('hotel');
    await form.locator('[name="propertyCount"]').fill('4');
    await form.locator('[name="unitCount"]').fill('28');
    await form.locator('[name="timeline"]').selectOption('0-3');
    const timelineLabel = await form.locator('[name="timeline"] option:checked').textContent();
    await context.locator(':scope > summary').click();
    await expect(summary).toBeVisible();
    await expect(context.locator('[data-assessment-included]')).toBeVisible();
    await expect(summary).toContainText(en ? 'Basic' : 'Básico');
    await expect(summary).toContainText('Hotel');
    await expect(summary).toContainText(/4\s+(?:properties|propiedades)/);
    await expect(summary).toContainText(/28\s+(?:units|unidades)/);
    await expect(summary).toContainText(timelineLabel!);
    await expect(summary).not.toContainText(en ? 'Management' : 'Gestión');

    await fillContact(form);
    await form.locator('[data-lead-submit]').click();
    await expect(form.locator('[data-lead-receipt]')).toBeVisible();
    await expect(form.locator('[data-lead-receipt]')).toBeFocused();
    expect(submitted).toHaveLength(1);
    expect(submitted[0]).toMatchObject({
      name: 'R2 Sample', businessName: 'Fictional accommodation', email: 'r2@example.test',
      plan: 'basico', accommodationType: 'hotel', propertyCount: 4, unitCount: 28, timeline: '0-3',
      businessMode: 'multi', currentStack: ['website', 'email'], requestedCapabilities: ['enquiries', 'planning'],
      investmentRange: '8k-20k', web: 'terrava', panel: 'terrava', sourcePath: en ? '/en/journey/' : '/recorrido/',
    });
    expect(await page.evaluate(key => sessionStorage.getItem(key), contextKey)).toBeNull();
  });

  test(`R2 discarding assessment preserves contact and every edited value ${locale}`, async ({ page }) => {
    const submitted = await captureLeads(page);
    await seedAssessment(page, prefix);
    const form = page.locator('[data-lead]');
    const context = form.locator('[data-lead-context]');
    await fillContact(form);
    await context.locator(':scope > summary').click();
    await form.locator('[name="plan"]').selectOption('inteligente');
    await form.locator('[name="accommodationType"]').selectOption('hotel');
    await form.locator('[name="propertyCount"]').fill('7');
    await form.locator('[name="unitCount"]').fill('64');
    await form.locator('[name="timeline"]').selectOption('6-12');
    await form.locator('[data-lead-optional] > summary').click();
    await form.locator('[name="phone"]').fill('+34 600 000 000');
    await form.locator('[name="message"]').fill('Keep this locally edited message.');
    await form.locator('[data-assessment-discard]').click();
    await expect(context).toHaveAttribute('open', '');
    await expect(form.locator('[name="accommodationType"]')).toBeFocused();
    await expect(form.locator('[data-assessment-handoff]')).toBeHidden();
    const status = form.locator('[data-assessment-removed]');
    await expect(status).toBeVisible();
    await expect(status).toContainText(en ? 'Assessment removed' : 'Diagnóstico retirado');
    // An aria-live announcement must also be readable on screen after removal.
    expect(await status.evaluate(element => element.getBoundingClientRect().height)).toBeGreaterThan(10);
    await expectContact(form);
    await context.locator(':scope > summary').click();
    await expect(context.locator('[data-assessment-included]')).toBeHidden();
    await context.locator(':scope > summary').click();
    for (const [name, value] of Object.entries({ plan: 'inteligente', accommodationType: 'hotel', propertyCount: '7', unitCount: '64', timeline: '6-12', phone: '+34 600 000 000', message: 'Keep this locally edited message.' })) {
      await expect(form.locator(`[name="${name}"]`)).toHaveValue(value);
    }
    expect(new URL(page.url()).searchParams.has('assessment')).toBe(false);
    expect(await page.evaluate(key => sessionStorage.getItem(key), contextKey)).toBeNull();
    await form.locator('[data-lead-submit]').click();
    await expect(form.locator('[data-lead-receipt]')).toBeVisible();
    expect(submitted).toHaveLength(1);
    expect(submitted[0]).toMatchObject({ plan: 'inteligente', accommodationType: 'hotel', propertyCount: 7, unitCount: 64, timeline: '6-12', phone: '+34 600 000 000', message: 'Keep this locally edited message.' });
    for (const key of ['businessMode', 'currentStack', 'requestedCapabilities', 'investmentRange', 'web', 'panel']) expect(submitted[0]).not.toHaveProperty(key);
  });

  test(`R2 direct and theme contact keep the optional choice clear ${locale}`, async ({ page }) => {
    const submitted = await captureLeads(page);
    await page.goto(`${prefix}/`);
    await rejectCookies(page);
    await page.goto(`${prefix}/#contacto`);
    const form = page.locator('[data-lead]');
    await expect(form).toHaveCount(1);
    await expect(form.locator('[data-lead-context]')).toHaveAttribute('open', '');
    await expect(form.locator('[data-assessment-included]')).toBeHidden();
    await expect(form.locator('[data-lead-optional]')).not.toHaveAttribute('open');
    await expect(form.locator('[name="message"]')).toBeHidden();
    await expect(form.locator('[name="phone"]')).toBeHidden();
    await expect(form.locator('[name="plan"]')).toHaveValue('');
    await expect(form.locator('[name="plan"] option:checked')).toHaveText(en ? 'Not sure yet' : 'Aún no lo sé');
    await fillContact(form);
    const unsentStorage = await page.evaluate(() => JSON.stringify({ local: { ...localStorage }, session: { ...sessionStorage } }));
    for (const value of ['R2 Sample', 'Fictional accommodation', 'r2@example.test']) expect(unsentStorage).not.toContain(value);
    await form.locator('[data-lead-submit]').click();
    await expect(form.locator('[data-lead-receipt]')).toBeVisible();
    expect(submitted[0]).toMatchObject({ plan: '', message: '', phone: '', accommodationType: 'apartment', propertyCount: 1, unitCount: 1, timeline: 'exploring' });

    await page.goto(`${prefix}/?theme=terrava&sourcePath=${encodeURIComponent(`${prefix}/webs/`)}#contacto`);
    await expect(form).toHaveCount(1);
    await expect(form.locator('[data-lead-context]')).toHaveAttribute('open', '');
    await expect(form.locator('[data-lead-optional]')).toHaveAttribute('open', '');
    await expect(form.locator('[name="message"]')).toBeVisible();
    await expect(form.locator('[name="message"]')).toHaveValue(/Terrava Collection/);
    await expect(form.locator('[name="plan"]')).toHaveValue('gestion');
    await expect(form.locator('[name="accommodationType"]')).toHaveValue('rural');
    const message = await form.locator('[name="message"]').inputValue();
    await fillContact(form);
    await form.locator('[data-lead-submit]').click();
    await expect(form.locator('[data-lead-receipt]')).toBeVisible();
    expect(submitted).toHaveLength(2);
    expect(submitted[1]).toMatchObject({ plan: 'gestion', accommodationType: 'rural', message, sourcePath: `${prefix}/webs/` });
    const storage = await page.evaluate(() => JSON.stringify({ local: { ...localStorage }, session: { ...sessionStorage } }));
    for (const value of ['R2 Sample', 'Fictional accommodation', 'r2@example.test']) expect(storage).not.toContain(value);
    await page.goto(`${prefix}/#contacto`);
    for (const name of ['name', 'businessName', 'email', 'phone', 'message']) await expect(form.locator(`[name="${name}"]`)).toHaveValue('');
  });

  test(`R2 absent and expired assessments leave accommodation fields available ${locale}`, async ({ page }) => {
    await page.goto(`${prefix}/`);
    await rejectCookies(page);
    await page.goto(`${prefix}/?assessment=1#contacto`);
    const form = page.locator('[data-lead]');
    await expect(form.locator('[data-lead-context]')).toHaveAttribute('open', '');
    await expect(form.locator('[data-assessment-included]')).toBeHidden();
    await expect(form.locator('[name="unitCount"]')).toBeVisible();
    expect(new URL(page.url()).searchParams.has('assessment')).toBe(false);
    await seedAssessment(page, prefix);
    await page.evaluate(key => {
      const context = JSON.parse(sessionStorage.getItem(key)!);
      context.createdAt -= 3 * 60 * 60 * 1000;
      sessionStorage.setItem(key, JSON.stringify(context));
    }, contextKey);
    await page.reload();
    await expect(form.locator('[data-lead-context]')).toHaveAttribute('open', '');
    await expect(form.locator('[data-assessment-included]')).toBeHidden();
    await expect(form.locator('[data-assessment-handoff]')).toBeHidden();
    await expect(form.locator('[name="plan"]')).toHaveValue('');
    await expect(form.locator('[name="unitCount"]')).toHaveValue('1');
    expect(await page.evaluate(key => sessionStorage.getItem(key), contextKey)).toBeNull();
    expect(new URL(page.url()).searchParams.has('assessment')).toBe(false);
  });

  test(`R2 submitting opens a closed invalid group and focuses its field ${locale}`, async ({ page }) => {
    const submitted = await captureLeads(page);
    const errors: string[] = [];
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('pageerror', error => errors.push(error.message));
    await seedAssessment(page, prefix);
    const form = page.locator('[data-lead]');
    const context = form.locator('[data-lead-context]');
    await fillContact(form);
    await context.locator(':scope > summary').click();
    await form.locator('[name="unitCount"]').fill('0');
    await context.locator(':scope > summary').click();
    await expect(form.locator('[name="unitCount"]')).toBeHidden();
    await form.locator('[data-lead-submit]').click();
    await expect(context).toHaveAttribute('open', '');
    await expect(form.locator('[name="unitCount"]')).toBeFocused();
    await expectContact(form);
    expect(submitted).toEqual([]);
    expect(errors).toEqual([]);
    await form.locator('[name="unitCount"]').fill('29');
    await context.locator(':scope > summary').click();
    await form.locator('[data-lead-submit]').click();
    await expect(form.locator('[data-lead-receipt]')).toBeVisible();
    expect(submitted).toHaveLength(1);
    expect(submitted[0]).toMatchObject({ unitCount: 29 });
  });

  for (const width of [320, 390, 1440]) {
    test(`R2 contact disclosure is readable accessible and reflows ${locale} ${width}`, async ({ page }, testInfo) => {
      const writes: string[] = [];
      page.on('request', request => { if (operationalMethods.has(request.method())) writes.push(request.url()); });
      await page.setViewportSize({ width, height: 900 });
      await seedAssessment(page, prefix);
      const form = page.locator('[data-lead]');
      await page.screenshot({ path: testInfo.outputPath('contact-initial.png') });
      await form.locator('[name="name"]').scrollIntoViewIfNeeded();
      await page.screenshot({ path: testInfo.outputPath('assessment-contact.png') });
      await expect(form.locator('[data-lead-context]')).not.toHaveAttribute('open');
      await form.locator('[data-lead-context] > summary').click();
      await form.locator('[data-lead-optional] > summary').click();
      await form.locator('[data-assessment-handoff] details > summary').click();
      await form.locator('[name="accommodationType"]').scrollIntoViewIfNeeded();
      await page.screenshot({ path: testInfo.outputPath('expanded-contact.png') });
      const scan = await new AxeBuilder({ page }).include('[data-lead]').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
      expect(scan.violations.map(({ id, nodes }) => ({ id, targets: nodes.map(node => node.target) }))).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.evaluate(async () => {
        document.documentElement.style.fontSize = '200%';
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect(await form.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
      const closeBounds = await page.locator('[data-contact-dialog-close]').evaluate(button => {
        const close = button.getBoundingClientRect();
        const dialog = button.closest('dialog')!.getBoundingClientRect();
        return { left: close.left, right: close.right, dialogLeft: dialog.left, dialogRight: dialog.right, viewport: innerWidth };
      });
      expect(closeBounds.left, 'Close control fits inside the dialog at 200% text').toBeGreaterThanOrEqual(closeBounds.dialogLeft);
      expect(closeBounds.right, 'Close control is not clipped by the dialog at 200% text').toBeLessThanOrEqual(Math.min(closeBounds.dialogRight, closeBounds.viewport));
      await form.locator('[name="accommodationType"]').scrollIntoViewIfNeeded();
      await page.screenshot({ path: testInfo.outputPath('contact-text-200.png') });
      await fillContact(form);
      await form.locator('[name="unitCount"]').fill('0');
      await form.locator('[data-lead-context] > summary').click();
      await form.locator('[data-lead-submit]').click();
      await expect(form.locator('[data-lead-context]')).toHaveAttribute('open', '');
      await expect(form.locator('[name="unitCount"]')).toBeFocused();
      const invalidBounds = await form.locator('[name="unitCount"]').evaluate(input => {
        const field = input.getBoundingClientRect();
        const dialog = input.closest('dialog')!;
        return { top: field.top, bottom: field.bottom, barBottom: dialog.querySelector('.contact-dialog-bar')!.getBoundingClientRect().bottom, dialogBottom: dialog.getBoundingClientRect().bottom };
      });
      expect(invalidBounds.top, 'Invalid field is not hidden behind the sticky header').toBeGreaterThanOrEqual(invalidBounds.barBottom);
      expect(invalidBounds.bottom, 'Invalid field remains inside the visible dialog').toBeLessThanOrEqual(invalidBounds.dialogBottom);
      await page.screenshot({ path: testInfo.outputPath('contact-invalid-200.png') });
      expect(writes).toEqual([]);
    });
  }
}
