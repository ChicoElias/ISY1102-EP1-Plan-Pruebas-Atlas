// Configuración de Playwright para CP-09 (compatibilidad entre navegadores y dispositivos).
// Los navegadores reales (Safari en iOS, Edge en Windows) se revisan aparte en BrowserStack.
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: '.',
  timeout: 60_000,
  retries: 1,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: process.env.BASE_URL || 'https://qa.atlas.example',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    locale: 'es-CL',
  },
  projects: [
    // escritorio (notebook 1080p)
    { name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'], viewport: { width: 1920, height: 1080 } } },
    { name: 'webkit', use: { ...devices['Desktop Safari'], viewport: { width: 1920, height: 1080 } } },
    // tablet (768 px de ancho) y celulares (375 px y Galaxy)
    { name: 'ipad', use: { ...devices['iPad Mini'] } },
    { name: 'iphone', use: { ...devices['iPhone SE'] } },
    { name: 'galaxy', use: { ...devices['Galaxy S9+'] } },
  ],
});
