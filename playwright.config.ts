import { defineConfig, devices } from '@playwright/test';
import { existsSync } from 'node:fs';

const localChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const appPort = process.env.PLAYWRIGHT_PORT ?? '8790';
const appOrigin = `http://127.0.0.1:${appPort}`;
const inspectorPort = process.env.PLAYWRIGHT_INSPECTOR_PORT ?? '9231';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: appOrigin,
    launchOptions: existsSync(localChrome) ? { executablePath: localChrome } : undefined,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `pnpm --filter @logic-estancia/worker exec wrangler dev --config wrangler.jsonc --var LEADS_ALLOW_LOCAL_JURISDICTION_FALLBACK:true --ip 127.0.0.1 --port ${appPort} --inspector-port ${inspectorPort}`,
    url: appOrigin,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
