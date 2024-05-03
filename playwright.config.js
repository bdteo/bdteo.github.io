const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './e2e',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:8000',
    viewport: { width: 1280, height: 720 },
  },
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:8000',
    reuseExistingServer: true,
    timeout: 60000,
  },
});
