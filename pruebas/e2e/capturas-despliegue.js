// CAP-02: Frontend de Atlas + Swagger/OpenAPI expuesto por el backend (Playwright Chromium 1440x900).
const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');
const { renderEvidencia, tabla, EVID } = require('../reportes/evidencia');

const FRONT = process.env.FRONT_URL || 'http://localhost:3350';
const API = process.env.BASE_URL || 'http://localhost:4450';

(async () => {
  const img = path.join(EVID, 'html', 'img');
  fs.mkdirSync(img, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const rFront = await page.goto(`${FRONT}/login`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(img, 'cap02-frontend.png') });
  const tituloFront = await page.title();

  const rDocs = await page.goto(`${API}/docs/`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.swagger-ui .info', { timeout: 15000 });
  await page.screenshot({ path: path.join(img, 'cap02-swagger.png') });
  const spec = await (await page.request.get(`${API}/openapi.json`)).json();
  await browser.close();

  const rutas = Object.entries(spec.paths || {}).flatMap(([p, ops]) => Object.keys(ops).map((m) => `${m.toUpperCase()} ${p}`));
  const cuerpo = `
<h2>Servicios desplegados</h2>
${tabla(['Servicio', 'URL', 'HTTP', 'Detalle'], [
    ['atlas-frontend (React/Vite + nginx)', `${FRONT}/login`, rFront.status(), tituloFront],
    ['atlas-backend Swagger UI', `${API}/docs/`, rDocs.status(), `${spec.info?.title || ''} v${spec.info?.version || ''} · ${rutas.length} operaciones`],
  ])}
<div class="row" style="margin-top:14px">
  <div style="flex:1"><h2>Frontend /login</h2><img class="shot" src="img/cap02-frontend.png"></div>
  <div style="flex:1"><h2>Swagger /docs</h2><img class="shot" src="img/cap02-swagger.png"></div>
</div>`;
  const out = await renderEvidencia({
    archivo: 'CAP-02_atlas-swagger.png',
    titulo: 'CAP-02 · Atlas desplegado y contrato OpenAPI',
    subtitulo: 'Playwright Chromium 1440x900',
    comando: 'node pruebas/e2e/capturas-despliegue.js',
    cuerpo,
  });
  console.log(JSON.stringify({ front: rFront.status(), docs: rDocs.status(), operaciones: rutas.length, out }));
})().catch((e) => { console.error(e); process.exit(1); });
