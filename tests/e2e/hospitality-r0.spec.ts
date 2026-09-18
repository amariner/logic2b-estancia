import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { enlargeTextTo200Percent } from './helpers/text-resize';

for (const prefix of ['', '/en']) {
  for (const width of [320, 390, 1440]) {
    test(`R0 visible boundaries and theme keyboard flow ${prefix || 'es'} ${width}`, async ({ page }, testInfo) => {
      const writes: string[] = [];
      const resourceFailures: string[] = [];
      page.on('request', request => { if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method())) writes.push(request.url()); });
      page.on('requestfailed', request => {
        if (/\.(?:woff2|js)(?:\?|$)/.test(request.url()) && request.failure()?.errorText !== 'net::ERR_ABORTED') resourceFailures.push(request.url());
      });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`${prefix}/`);
      await page.locator('[data-consent-reject]').first().click();
      await expect(page.locator('.connection-note')).toBeVisible();
      await expect(page.locator('[data-technical-details]')).not.toHaveAttribute('open');
      await page.locator('[data-capability-band]').screenshot({ path: testInfo.outputPath('connections.png') });
      await page.locator('[data-technical-details] > summary').focus();
      await page.keyboard.press('Enter');
      await expect(page.locator('[data-validated-provider-count]')).toHaveText('0');
      await expect(page.locator('[data-activation-count]')).toHaveText('0');
      await expect(page.locator('[data-readiness-registry-item]')).toHaveCount(5);
      await expect(page.locator('[data-technical-details] form, [data-technical-details] button')).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
      if (width === 390) {
        await page.locator('[data-provider-validation-details] > summary').click();
        await page.locator('[data-provider-validation-gate]').screenshot({ path: testInfo.outputPath('validation.png') });
        const violations = (await new AxeBuilder({ page }).include('[data-capability-band]').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze()).violations;
        expect(violations.map(({ id }) => id)).toEqual([]);
      }

      await page.goto(`${prefix}/temas/linde/`);
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator('.theme-detail-head [role="note"]')).toContainText(prefix ? 'Fictional' : 'ficticio');
      const frame = page.locator('[data-theme-detail-frame]');
      await expect(frame).toHaveAttribute('sandbox', 'allow-scripts');
      await expect(frame).toHaveAttribute('src', `${prefix}/webs/linde/?embed=theme`);
      await expect(page.frameLocator('[data-theme-detail-frame]').locator('h1')).toBeVisible();
      await expect(page.frameLocator('[data-theme-detail-frame]').locator('[data-site-header]')).toBeHidden();
      await expect(page.frameLocator('[data-theme-detail-frame]').locator('[data-consent-banner]')).toBeHidden();
      await expect(page.frameLocator('[data-theme-detail-frame]').locator('.web-concept-notice')).toContainText(prefix ? 'Fictional' : 'ficticio');
      await page.frameLocator('[data-theme-detail-frame]').locator('html').evaluate(() => document.fonts.ready);
      await page.locator('[data-theme-detail]').screenshot({ path: testInfo.outputPath('theme.png') });
      const expand = page.locator('[data-theme-detail-expand]');
      await expand.focus();
      await page.keyboard.press('Enter');
      await expect(expand).toHaveAttribute('aria-expanded', 'true');
      await expect(page.locator('[data-theme-detail-stage]')).toHaveJSProperty('open', true);
      await page.keyboard.press('Escape');
      await expect(expand).toHaveAttribute('aria-expanded', 'false');
      await expect(expand).toBeFocused();
      await expect(page.locator('[data-theme-open]')).toHaveAttribute('href', `${prefix}/webs/linde/`);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
      const violations = (await new AxeBuilder({ page }).options({ preload: false }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze()).violations;
      expect(violations.map(({ id, nodes }) => ({ id, targets: nodes.map(({ target }) => target) }))).toEqual([]);
      await enlargeTextTo200Percent(page);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect(writes).toEqual([]);
      expect(resourceFailures).toEqual([]);
    });
  }

  test(`R0 theme request reaches the single form with safe editable context ${prefix || 'es'}`, async ({ page }) => {
    const submitted: Record<string, unknown>[] = [];
    await page.route('**/api/capabilities', route => route.fulfill({ json: {
      schemaVersion: '1.0.0', mode: 'demo', demoMode: true, commercialLeadsEnabled: true,
      sideEffects: true, durableWrites: true, jobs: false,
      providers: { analytics: 'disabled', email: 'live', payments: 'disabled', webhooks: 'disabled', externalStorage: 'disabled' },
      operations: { commercialLead: 'active', payments: 'unavailable', webhooks: 'unavailable', automations: 'unavailable' },
    } }));
    await page.route('**/api/leads', route => {
      submitted.push(route.request().postDataJSON());
      return route.fulfill({ status: 202, json: { ok: true, outcome: 'delivered', ref: 'r0-mocked', meetingUrl: null } });
    });
    await page.goto(`${prefix}/webs/`);
    await page.locator('[data-portfolio-detail="nivora"]').click();
    await expect(page).toHaveURL(new RegExp(`${prefix}/temas/nivora/$`));
    await page.locator('[data-theme-request="nivora"]').click();
    const form = page.locator('[data-lead]');
    await expect(form).toHaveCount(1);
    await expect(form.locator('[name="plan"]')).toHaveValue('basico');
    await expect(form.locator('[name="accommodationType"]')).toHaveValue('apartment');
    await expect(form.locator('[name="message"]')).toHaveValue(/Nivora One/);
    await form.locator('[name="name"]').fill('QA Demo');
    await form.locator('[name="businessName"]').fill('Demo ficticia');
    await form.locator('[name="email"]').fill('qa@example.test');
    await form.locator('[name="plan"]').selectOption('gestion');
    await form.locator('[name="accept"]').check();
    await form.locator('[data-lead-submit]').click();
    await expect.poll(() => submitted.length).toBe(1);
    expect(submitted[0]).toMatchObject({ plan: 'gestion', accommodationType: 'apartment', sourcePath: `${prefix}/webs/` });
    expect(submitted[0].message).toContain('Nivora One');

    await page.goto(`${prefix}/?theme=nivora&plan=inteligente&sourcePath=https%3A%2F%2Fexample.test%2Fprivate#contacto`);
    await expect(form.locator('[name="plan"]')).toHaveValue('basico');
    await expect(form).toHaveAttribute('data-theme-source-path', `${prefix}/webs/`);
    await page.goto(`${prefix}/?theme=unknown&sourcePath=%2Fwebs%2F#contacto`);
    await expect(form).not.toHaveAttribute('data-theme-source-path');
    await expect(form.locator('[name="message"]')).toHaveValue('');
  });
}
