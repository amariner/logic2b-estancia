import { defineConfig, devices } from '@playwright/test';
import base from './playwright.config';

// Optional catalogue/shared-preview matrix; default E2E keeps its Chromium setup.
export default defineConfig(base, {
  testMatch: ['theme-catalog.spec.ts', 'ui-refinement.spec.ts'],
  projects: [
    { name: 'chromium', use: base.projects?.[0]?.use },
    { name: 'webkit', use: { ...devices['Desktop Safari'], launchOptions: { executablePath: undefined } } },
  ],
});
