import { expect, type Page } from '@playwright/test';

/** Wait for rem-based layout to catch up with a 200% root text size. */
export async function enlargeTextTo200Percent(page: Page): Promise<void> {
  const expectedRem = await page.evaluate(() => {
    const probe = document.createElement('div');
    probe.dataset.textResizeProbe = '';
    probe.style.cssText = 'position:fixed;left:0;top:0;width:1rem;height:0;visibility:hidden;pointer-events:none;overflow:hidden';
    document.body.append(probe);
    const initialRem = probe.getBoundingClientRect().width;
    document.documentElement.style.fontSize = '200%';
    return initialRem * 2;
  });
  const probe = page.locator('[data-text-resize-probe]');
  try {
    await expect(probe).toHaveCSS('width', `${expectedRem}px`);
    await page.evaluate(async () => {
      await document.fonts.ready;
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });
  } finally {
    await probe.evaluate(element => element.remove());
  }
}
