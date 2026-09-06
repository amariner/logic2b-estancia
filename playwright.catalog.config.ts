import { defineConfig, devices } from '@playwright/test';
import base from './playwright.config';

// Optional catalogue matrix; the default E2E command keeps its Chromium setup.
export default defineConfig(base, {
  testMatch: 'theme-catalog.spec.ts',
  projects: [
    { name: 'chromium', use: base.projects?.[0]?.use },
    { name: 'webkit', use: { ...devices['Desktop Safari'], launchOptions: { executablePath: undefined } } },
  ],
});
