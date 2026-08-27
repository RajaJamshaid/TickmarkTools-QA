// playwright.config.js
// Central config: which site, which browsers, which devices.
// Run `npx playwright test` to test EVERY spec against EVERY project below.

const { defineConfig, devices } = require('@playwright/test');

const BASE_URL = process.env.QA_BASE_URL || 'https://tickmarktools.com';

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: 1, // one retry to filter out network flakiness from real bugs
  workers: process.env.CI ? 2 : undefined,
  timeout: 30 * 1000,

  // Produces the QA report you can open in a browser
  reporter: [
    ['html', { outputFolder: 'qa-report', open: 'never' }],
    ['list'],
    ['json', { outputFile: 'qa-report/results.json' }],
  ],

  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',      // records a replay for any failed test
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // ---- Desktop browsers ----
    { name: 'Desktop Chrome', use: { ...devices['Desktop Chrome'] } },
    { name: 'Desktop Firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'Desktop Safari', use: { ...devices['Desktop Safari'] } },

    // ---- Mobile devices (real device emulation: viewport, UA, touch) ----
    { name: 'Mobile Chrome (Pixel 7)', use: { ...devices['Pixel 7'] } },
    { name: 'Mobile Safari (iPhone 14)', use: { ...devices['iPhone 14'] } },

    // ---- Tablet ----
    { name: 'Tablet (iPad Gen 9)', use: { ...devices['iPad (gen 9)'] } },
  ],
});
