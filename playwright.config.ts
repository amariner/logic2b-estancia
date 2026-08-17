import { defineConfig, devices } from '@playwright/test';
import { existsSync } from 'node:fs';

const localChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const inspectorPort = process.env.PLAYWRIGHT_INSPECTOR_PORT ?? '9231';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://127.0.0.1:8790',
    launchOptions: existsSync(localChrome) ? { executablePath: localChrome } : undefined,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `pnpm --filter @logic-estancia/worker exec wrangler dev --config wrangler.jsonc --ip 127.0.0.1 --port 8790 --inspector-port ${inspectorPort}`,
    url: 'http://127.0.0.1:8790',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
