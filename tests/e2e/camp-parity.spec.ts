import { expect, test, type Locator, type Page } from '@playwright/test';

const webSlugs = [
  'nivora',
  'terrava',
  'aurem',
  'linde',
  'cobalto',
  'oria',
  'boscara',
  'velares',
  'nocta',
  'riscoa',
  'solerna',
  'cendra',
] as const;

const locales = [
  {
    home: '/',
    prefix: '',
    route: { webs: 'webs', panels: 'paneles', plans: 'planes' },
    panelSlugs: ['solicitudes', 'planning', 'huespedes-llegadas', 'preparacion', 'operacion-ingresos', 'copiloto-supervisado'],
    guideSlugs: ['direccion-propiedad', 'reservas-recepcion', 'operaciones', 'marketing-ingresos', 'tecnica-privacidad'],
    tourProgress: (step: number) => `Paso ${step} de 5`,
  },
  {
    home: '/en/',
    prefix: '/en',
    route: { webs: 'webs', panels: 'panels', plans: 'plans' },
    panelSlugs: ['enquiries', 'planning', 'guests-arrivals', 'preparation', 'operations-revenue', 'supervised-copilot'],
    guideSlugs: ['ownership-direction', 'reservations-reception', 'operations', 'marketing-revenue', 'technical-privacy'],
    tourProgress: (step: number) => `Step ${step} of 5`,
  },
] as const;

const mainBlockSelectors = [
  '[data-hero]',
  '[data-home-ecosystem]',
  '[data-home-journey]',
  '[data-product-explorer]',
  '[data-capability-band]',
  '#planes',
  '[data-theme-showcase]',
  '[data-home-panel-showcase]',
  '[data-home-aftercare]',
  'section.faq',
  '[data-home-closing]',
] as const;

async function rawHrefs(locator: Locator) {
  return locator.evaluateAll((links) => links.map((link) => link.getAttribute('href')));
}

async function expectCarouselToMove(
  page: Page,
  viewportSelector: string,
  previousSelector: string,
  nextSelector: string,
) {
  const viewport = page.locator(viewportSelector);
  const previous = page.locator(previousSelector);
  const next = page.locator(nextSelector);

  await expect(viewport).toBeVisible();
  await expect(previous).toBeDisabled();
  await expect(next).toBeEnabled();
  const initialPosition = await viewport.evaluate((element) => element.scrollLeft);

  await next.click();

  await expect.poll(() => viewport.evaluate((element) => element.scrollLeft)).toBeGreaterThan(initialPosition);
  await expect(previous).toBeEnabled();
}

test('the home keeps the reference block sequence and evidence counts in ES and EN', async ({ page }) => {
  for (const locale of locales) {
    await page.goto(locale.home);

    const blockContract = await page.locator('main').evaluate((main, selectors) => {
      const blocks = selectors.map((selector) => main.querySelector(selector));
      const allPresent = blocks.every((block) => block !== null);
      const inOrder = blocks.every((block, index) => {
        if (index === 0 || block === null || blocks[index - 1] === null) return true;
        return Boolean(blocks[index - 1]!.compareDocumentPosition(block) & Node.DOCUMENT_POSITION_FOLLOWING);
      });
      return { allPresent, inOrder };
    }, mainBlockSelectors);

    expect(blockContract, `${locale.home} main block contract`).toEqual({ allPresent: true, inOrder: true });
    await expect(page.locator('[data-home-journey] [data-flow-moment]')).toHaveCount(7);
    await expect(page.locator('[data-product-explorer] [data-product-tab]')).toHaveCount(5);
    await expect(page.locator('[data-product-explorer] [data-product-area]')).toHaveCount(5);
    await expect(page.locator('#planes [data-plan-card]')).toHaveCount(3);
    await expect(page.locator('[data-theme-showcase] [data-theme-card]')).toHaveCount(12);
    await expect(page.locator('[data-home-panel-showcase] [data-home-panel-card]')).toHaveCount(6);
    await expect(page.locator('[data-home-aftercare] [data-guide-context="home"] [data-guide-context-link]')).toHaveCount(5);

    const ecosystem = page.locator('[data-home-ecosystem]');
    await expect(ecosystem).toContainText('12/12');
    await expect(ecosystem).toContainText('6/6');
    await expect(ecosystem).toContainText('5/5');
  }
});

test('the tablet header keeps project actions beside the Camp-style menu', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 900 });

  for (const locale of locales) {
    await page.goto(locale.home);
    const header = page.locator('[data-site-header]');
    const menu = header.locator('.menu');
    const mobileNavigation = header.locator('#mobile-nav');

    await expect(header.locator('.header-primary')).toBeHidden();
    await expect(header.locator('.header-contact')).toBeVisible();
    await expect(header.locator('.header-tour')).toBeVisible();
    await expect(menu).toBeVisible();
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
    await expect(mobileNavigation).toBeHidden();

    await menu.click();
    await expect(menu).toHaveAttribute('aria-expanded', 'true');
    await expect(mobileNavigation).toBeVisible();
    await expect(mobileNavigation.locator('a').first()).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

    await page.keyboard.press('Escape');
    await expect(mobileNavigation).toBeHidden();
    await expect(menu).toBeFocused();
  }
});

test('the three horizontal journeys expose working controls in both languages', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });

  for (const locale of locales) {
    await page.goto(locale.home);

    await expectCarouselToMove(page, '[data-journey-viewport]', '[data-journey-previous]', '[data-journey-next]');
    await expectCarouselToMove(page, '[data-theme-track]', '[data-theme-previous]', '[data-theme-next]');
    await expectCarouselToMove(page, '[data-home-panel-viewport]', '[data-home-panel-previous]', '[data-home-panel-next]');
  }
});

test('website and workspace previews close back onto their launch controls', async ({ page }) => {
  for (const locale of locales) {
    await page.goto(locale.home);

    const themeTrigger = page.locator('[data-theme-preview-open]').first();
    const themeDialogId = await themeTrigger.getAttribute('data-theme-preview-open');
    expect(themeDialogId).toBeTruthy();
    const themeDialog = page.locator(`#${themeDialogId}`);
    await themeTrigger.click();
    await expect(themeDialog).toBeVisible();
    await expect(themeDialog).toHaveAttribute('open', '');
    await expect(themeDialog.locator('[data-theme-preview-frame]')).toHaveAttribute('src', `${locale.prefix}/demos/nivora/?embed=theme`);
    const themeFrame = page.frameLocator(`#${themeDialogId} [data-theme-preview-frame]`);
    await expect(themeFrame.locator('body')).toContainText('Nivora One');
    const firstScenario = themeFrame.locator('[data-email-enquiry-choice]').first();
    const secondScenario = themeFrame.locator('[data-email-enquiry-choice]').nth(1);
    await secondScenario.click();
    await expect(secondScenario).toHaveAttribute('aria-pressed', 'true');
    await expect(firstScenario).toHaveAttribute('aria-pressed', 'false');
    await themeDialog.locator('[data-theme-preview-close]').click();
    await expect(themeDialog).not.toHaveAttribute('open', '');
    await expect(themeTrigger).toBeFocused();

    const panelTrigger = page.locator('[data-home-panel-dialog-open]').first();
    const panelDialogId = await panelTrigger.getAttribute('data-home-panel-dialog-open');
    expect(panelDialogId).toBeTruthy();
    const panelDialog = page.locator(`#${panelDialogId}`);
    await panelTrigger.click();
    await expect(panelDialog).toBeVisible();
    await expect(panelDialog).toHaveAttribute('open', '');
    await expect(panelDialog.locator('[data-home-panel-dialog-close]')).toBeFocused();
    await panelDialog.locator('[data-home-panel-dialog-close]').click();
    await expect(panelDialog).not.toHaveAttribute('open', '');
    await expect(panelTrigger).toBeFocused();
  }
});

test('all twelve theme popups and all six workspace popups are wired in both languages', async ({ page, request }) => {
  for (const locale of locales) {
    await page.goto(locale.home);

    const expectedThemeSources = webSlugs.map((slug, index) => (
      index < 3
        ? `${locale.prefix}/demos/${slug}/?embed=theme`
        : `${locale.prefix}/${locale.route.webs}/${slug}/?embed=theme`
    ));
    const themeConnections = await page.locator('[data-theme-preview-open]').evaluateAll((triggers) => triggers.map((trigger) => {
      const dialogId = trigger.getAttribute('data-theme-preview-open') ?? '';
      const dialog = document.getElementById(dialogId);
      const frame = dialog?.querySelector<HTMLIFrameElement>('[data-theme-preview-frame]');
      return {
        dialogId,
        dialogFound: dialog instanceof HTMLDialogElement,
        source: frame?.dataset.themePreviewSrc ?? null,
        sandbox: frame?.getAttribute('sandbox') ?? null,
      };
    }));
    expect(themeConnections).toEqual(webSlugs.map((slug, index) => ({
      dialogId: `theme-preview-${slug}`,
      dialogFound: true,
      source: expectedThemeSources[index],
      sandbox: 'allow-scripts',
    })));

    const originalTrigger = page.locator('[data-theme-preview-open]').nth(3);
    const originalDialog = page.locator('#theme-preview-linde');
    await originalTrigger.click();
    await expect(originalDialog).toBeVisible();
    await expect(page.frameLocator('#theme-preview-linde [data-theme-preview-frame]').locator('body')).toContainText('Linde Casa');
    await originalDialog.locator('[data-theme-preview-close]').click();
    await expect(originalTrigger).toBeFocused();

    const panelTriggers = page.locator('[data-home-panel-dialog-open]');
    await expect(panelTriggers).toHaveCount(6);
    const panelDialogIds = await panelTriggers.evaluateAll((triggers) => triggers.map((trigger) => trigger.getAttribute('data-home-panel-dialog-open')));
    expect(new Set(panelDialogIds).size).toBe(6);
    for (let index = 0; index < panelDialogIds.length; index += 1) {
      const dialogId = panelDialogIds[index];
      expect(dialogId).toBeTruthy();
      const trigger = panelTriggers.nth(index);
      const dialog = page.locator(`#${dialogId}`);
      await expect(dialog).toHaveCount(1);
      await expect(dialog.locator('[data-panel-preview]')).toHaveCount(1);
      await trigger.click();
      await expect(dialog).toHaveAttribute('open', '');
      await dialog.locator('[data-home-panel-dialog-close]').click();
      await expect(trigger).toBeFocused();
    }

    const embeddedOriginal = await request.get(`${locale.prefix}/${locale.route.webs}/linde/?embed=theme`);
    expect(embeddedOriginal.status()).toBe(200);
    expect(embeddedOriginal.headers()['x-frame-options']).toBe('SAMEORIGIN');
    expect(embeddedOriginal.headers()['x-robots-tag']).toBe('noindex, nofollow');
    expect(embeddedOriginal.headers()['content-security-policy']).toContain("connect-src 'none'");
    expect(embeddedOriginal.headers()['content-security-policy']).toContain("form-action 'none'");
    expect(embeddedOriginal.headers()['content-security-policy']).toContain("frame-ancestors 'self'");
  }
});

test('the five-step home journey completes and restores focus in ES and EN', async ({ page }) => {
  for (const locale of locales) {
    await page.goto(locale.home);

    const trigger = page.locator('[data-home-journey] [data-estancia-tour-trigger]');
    await expect(trigger).toHaveAttribute('href', `${locale.prefix}/${locale.prefix ? 'journey' : 'recorrido'}/`);
    await trigger.click();

    const dialog = page.locator('[data-home-tour-dialog]');
    const progress = dialog.locator('[data-home-tour-progress]');
    const progressText = dialog.locator('[data-home-tour-progress-text]');
    const visibleSteps = dialog.locator('[data-home-tour-step]:not([hidden])');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('[data-home-tour-step]')).toHaveCount(5);
    await expect(visibleSteps).toHaveCount(1);

    for (let step = 1; step <= 5; step += 1) {
      await expect(progressText).toHaveText(locale.tourProgress(step));
      await expect.poll(() => progress.evaluate((element: HTMLProgressElement) => element.value)).toBe(step);
      await expect(visibleSteps).toHaveCount(1);
      if (step < 5) await dialog.locator('[data-home-tour-next]').click();
    }

    await expect(dialog.locator('[data-home-tour-next]')).toBeHidden();
    const complete = dialog.locator('[data-home-tour-complete]');
    await expect(complete).toBeVisible();
    await complete.click();
    await expect(dialog).not.toHaveAttribute('open', '');
    await expect(trigger).toBeFocused();
  }
});

test('the home keeps one live lead form, form-free previews, and canonical local links', async ({ page }) => {
  for (const locale of locales) {
    await page.goto(locale.home);

    await expect(page.locator('form[data-lead]')).toHaveCount(1);
    await expect(page.locator('[data-lead]')).toHaveAttribute('method', 'dialog');
    await expect(page.locator([
      '[data-hero] form',
      '[data-home-journey] form',
      '[data-theme-showcase] form',
      '[data-home-panel-showcase] form',
      '[data-home-tour-dialog] form',
    ].join(', '))).toHaveCount(0);

    const websiteRoot = `${locale.prefix}/${locale.route.webs}`;
    const expectedWebsiteDetails = webSlugs.map((slug) => `${websiteRoot}/${slug}/`);
    const expectedWebsitePreviews = webSlugs.map((slug, index) => (
      index < 3 ? `${locale.prefix}/demos/${slug}/` : `${websiteRoot}/${slug}/`
    ));
    expect(await rawHrefs(page.locator('[data-theme-card] .home-theme-card-visual'))).toEqual(expectedWebsitePreviews);
    expect(await rawHrefs(page.locator('[data-theme-card] .home-theme-card-copy a'))).toEqual(expectedWebsiteDetails);
    await expect(page.locator('[data-theme-showcase] .demo-portfolio-link')).toHaveAttribute('href', `${websiteRoot}/`);

    const panelRoot = `${locale.prefix}/${locale.route.panels}`;
    const expectedPanelDetails = locale.panelSlugs.map((slug) => `${panelRoot}/${slug}/`);
    expect(await rawHrefs(page.locator('[data-home-panel-card] .home-panel-detail-link'))).toEqual(expectedPanelDetails);
    await expect(page.locator('[data-home-panel-showcase] .home-panel-all-link')).toHaveAttribute('href', `${panelRoot}/`);

    const expectedGuides = locale.guideSlugs.map((slug) => `${locale.prefix}/docs/${slug}/`);
    expect(await rawHrefs(page.locator('[data-guide-context="home"] [data-guide-context-link]'))).toEqual(expectedGuides);
    await expect(page.locator('#planes > .shell > .text-link')).toHaveAttribute('href', `${locale.prefix}/${locale.route.plans}/`);
  }
});
