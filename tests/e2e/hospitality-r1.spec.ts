import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const prefix of ['', '/en']) {
  const en = Boolean(prefix);
  const rural = en ? '/en/solutions/rural-stays/' : '/soluciones/casas-rurales/';
  const journey = en ? '/en/journey/' : '/recorrido/';
  for (const width of [320, 390, 1440]) {
    test(`R1 evidence and readable actions ${en ? 'en' : 'es'} ${width}`, async ({ page }, testInfo) => {
      const writes: string[] = [];
      page.on('request', request => { if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method())) writes.push(request.url()); });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`${prefix}/`);
      await page.locator('[data-consent-reject]').first().click();
      await page.locator('[data-hero]').screenshot({ path: testInfo.outputPath('hero.png') });
      await expect(page.locator('[data-evaluation-expectation]')).toContainText(en ? 'No sign-up' : 'Sin registro');
      const evidence = page.locator('[data-commercial-evidence]');
      await expect(evidence.locator('[data-evidence-web]')).toHaveAttribute('href', `${prefix}/demos/nivora/`);
      await expect(evidence.locator('[data-evidence-panel]')).toHaveAttribute('href', `${prefix}/demos/terrava/gestion/?vista=enquiries`);
      await evidence.screenshot({ path: testInfo.outputPath('evidence.png') });
      await expect(page.locator('[data-plan-card="basico"] [data-plan-panel]')).toHaveCount(0);
      for (const plan of ['basico', 'gestion', 'inteligente']) await expect(page.locator(`[data-plan-card="${plan}"] [data-plan-boundary]`)).toBeVisible();
      await page.locator('[data-plan-showcase]').screenshot({ path: testInfo.outputPath('plans.png') });
      const homeAxe = await new AxeBuilder({ page }).include('[data-hero]').include('[data-commercial-evidence]').include('[data-plan-showcase]').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
      expect(homeAxe.violations.map(({ id, nodes }) => ({ id, targets: nodes.map(n => n.target) }))).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.evaluate(async () => {
        document.documentElement.style.fontSize = '200%';
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

      await page.goto(rural);
      await expect(page.locator('[data-evidence-web]')).toHaveAttribute('href', `${prefix}/demos/terrava/`);
      await expect(page.locator('[data-evidence-panel]')).toHaveAttribute('href', `${prefix}/demos/terrava/gestion/?vista=enquiries`);
      await page.locator('.solution-hero').screenshot({ path: testInfo.outputPath('rural.png') });
      await page.locator('.solution-hero .pill.ghost').click();
      await expect(page.locator('[data-tour-entry]')).toHaveValue('enquiries');
      await page.locator('[data-tour-start]').focus();
      await page.keyboard.press('Enter');
      const active = page.locator('[data-tour-step="enquiries"]');
      await expect(active.locator('h2')).toBeFocused();
      await expect(active).toBeVisible();
      await page.locator('[data-tour-workspace]').screenshot({ path: testInfo.outputPath('journey.png') });
      expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations.map(({ id }) => id)).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.evaluate(async () => {
        document.documentElement.style.fontSize = '200%';
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect(writes).toEqual([]);
    });
  }

  test(`R1 contextual journey reaches one editable commercial form ${en ? 'en' : 'es'}`, async ({ page }) => {
    const submitted: Record<string, unknown>[] = [];
    await page.route('**/api/capabilities', route => route.fulfill({ json: {
      schemaVersion: '1.0.0', mode: 'demo', demoMode: true, commercialLeadsEnabled: true,
      sideEffects: true, durableWrites: true, jobs: false,
      providers: { analytics: 'disabled', email: 'live', payments: 'disabled', webhooks: 'disabled', externalStorage: 'disabled' },
      operations: { commercialLead: 'active', payments: 'unavailable', webhooks: 'unavailable', automations: 'unavailable' },
    } }));
    await page.route('**/api/leads', route => {
      submitted.push(route.request().postDataJSON());
      return route.fulfill({ status: 202, json: { ok: true, outcome: 'delivered', ref: 'r1-mocked', meetingUrl: null } });
    });
    await page.goto(rural);
    await page.locator('[data-consent-reject]').first().click();
    await page.locator('.solution-hero .pill.ghost').click();
    await page.locator('[data-tour-start]').click();
    await page.locator('[data-tour-assess="enquiries"]').click();
    await expect(page.locator('[name="accommodationType"][value="rural"]')).toBeChecked();
    await expect(page.locator('[name="bookingNeeds"][value="enquiries"]')).toBeChecked();
    await expect(page.locator('[name="bookingNeeds"][value="bookings"]')).not.toBeChecked();
    for (let step = 0; step < 6; step++) await page.locator('[data-next]').click();
    await expect(page.locator('[data-result-name]')).toHaveText(en ? 'Management' : 'Gestión');
    await page.locator('[data-sales-link]').click();
    const form = page.locator('[data-lead]');
    await expect(form).toHaveCount(1);
    await expect(form.locator('[data-lead-context]')).not.toHaveAttribute('open');
    await form.locator('[data-lead-context] > summary').click();
    await expect(form.locator('[data-assessment-handoff]')).toBeVisible();
    await expect(form.locator('[name="plan"]')).toHaveValue('gestion');
    await expect(form.locator('[name="accommodationType"]')).toHaveValue('rural');
    await form.locator('[name="plan"]').selectOption('basico');
    await form.locator('[name="name"]').fill('QA Sample');
    await form.locator('[name="businessName"]').fill('Fictional stay');
    await form.locator('[name="email"]').fill('qa@example.test');
    await form.locator('[name="accept"]').check();
    await form.locator('[data-lead-submit]').click();
    await expect.poll(() => submitted.length).toBe(1);
    expect(submitted[0]).toMatchObject({ plan: 'basico', accommodationType: 'rural', sourcePath: rural, requestedCapabilities: ['enquiries'] });
    await expect(form.locator('[data-lead-receipt]')).toBeVisible();
  });

  test(`R1 selecting the last stage cannot complete unseen stages ${en ? 'en' : 'es'}`, async ({ page }) => {
    await page.goto(`${journey}?step=operations&segment=rural&sourcePath=https%3A%2F%2Fexample.test%2Fprivate&email=secret`);
    await page.locator('[data-tour-start]').click();
    await expect(page.locator('[data-tour-step="operations"]')).toBeVisible();
    await expect(page.locator('[data-tour-progress]')).toHaveAttribute('aria-valuenow', '1');
    await expect(page.locator('[data-tour-complete]')).toBeHidden();
    const assessment = new URL((await page.locator('[data-tour-assess="operations"]').getAttribute('href'))!, 'https://example.test');
    expect(assessment.searchParams.get('sourcePath')).toBe(journey);
    expect(assessment.searchParams.get('plan')).toBe('inteligente');
    expect(assessment.searchParams.has('email')).toBe(false);
    expect(assessment.searchParams.get('need')).toBe('metrics');
    for (const id of ['brand-web', 'enquiries', 'planning', 'preparation']) {
      await page.locator('[data-tour-next]').click();
      await expect(page.locator(`[data-tour-step="${id}"]`)).toBeVisible();
    }
    await expect(page.locator('[data-tour-completion]')).toBeHidden();
    await expect(page.locator('[data-tour-progress]')).toHaveAttribute('aria-valuenow', '5');
    await page.locator('[data-tour-previous]').click();
    await expect(page.locator('[data-tour-step="planning"]')).toBeVisible();
    await expect(page.locator('[data-tour-next]')).toBeVisible();
    await page.locator('[data-tour-next]').click();
    await expect(page.locator('[data-tour-step="preparation"]')).toBeVisible();
    await expect(page.locator('[data-tour-progress]')).toHaveAttribute('aria-valuenow', '5');
    await expect(page.locator('[data-tour-completion]')).toBeHidden();
    await page.locator('[data-tour-complete]').click();
    await expect(page.locator('[data-tour-completion] h2')).toBeFocused();
    await expect(page.locator('[data-tour-complete-assess]')).toHaveAttribute('href', /plan=inteligente.*segment=rural/);
  });

  test(`R1 evidence remains available without JavaScript ${en ? 'en' : 'es'}`, async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(`http://127.0.0.1:${process.env.PLAYWRIGHT_PORT ?? '8790'}${journey}`);
    await expect(page.locator('[data-tour-step]')).toHaveCount(5);
    for (const link of await page.locator('[data-tour-assess]').all()) await expect(link).toBeVisible();
    await expect(page.locator('[data-tour-entry]')).toBeHidden();
    await context.close();
  });

  test(`R1 home journey resumes only stages actually seen ${en ? 'en' : 'es'}`, async ({ page }) => {
    await page.addInitScript(locale => {
      sessionStorage.setItem(`logic-estancia:home-tour:${locale}`, '4');
    }, en ? 'en' : 'es');
    await page.goto(`${prefix}/`);
    await page.locator('[data-consent-reject]').first().click();
    const trigger = page.locator('[data-home-journey] [data-estancia-tour-trigger]');
    await trigger.click();
    const dialog = page.locator('[data-home-tour-dialog]');
    await expect(dialog.locator('[data-home-tour-step="operations"]')).toBeVisible();
    await expect(dialog.locator('[data-home-tour-progress]')).toHaveJSProperty('value', 1);
    await expect(dialog.locator('[data-home-tour-complete]')).toBeHidden();
    await dialog.locator('[data-home-tour-next]').click();
    await expect(dialog.locator('[data-home-tour-step="brand-web"]')).toBeVisible();
    await expect(dialog.locator('[data-home-tour-progress]')).toHaveJSProperty('value', 2);
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
    await trigger.click();
    await expect(dialog.locator('[data-home-tour-step="brand-web"]')).toBeVisible();
    await expect(dialog.locator('[data-home-tour-progress]')).toHaveJSProperty('value', 2);
    await expect(dialog.locator('[data-home-tour-complete]')).toBeHidden();
    await dialog.locator('[data-home-tour-next]').click();
    await expect(dialog.locator('[data-home-tour-step="enquiries"]')).toBeVisible();
    await expect(dialog.locator('[data-home-tour-progress]')).toHaveJSProperty('value', 3);
  });
}
