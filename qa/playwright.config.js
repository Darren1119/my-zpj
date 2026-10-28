const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.CI ? 2 : 3,
  timeout: 30000,
  globalTimeout: 10 * 60 * 1000,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.PORTFOLIO_URL || 'http://127.0.0.1:4177',
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: process.env.PORTFOLIO_URL ? undefined : {
    command: 'python3 serve.py',
    url: 'http://127.0.0.1:4177',
    reuseExistingServer: false,
    stderr: 'ignore',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 5'] } },
    { name: 'mobile-webkit', use: { ...devices['iPhone 13'] } },
  ],
});
