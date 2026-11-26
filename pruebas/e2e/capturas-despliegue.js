// CAP-02: capturas directas de navegador (Playwright Chromium 1440x900) del frontend /login y de Swagger UI /docs,
// combinadas lado a lado sin banners ni texto agregado.
const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');
const { EVID } = require('../reportes/evidencia');

const FRONT = process.env.FRONT_URL || 'http://localhost:3350';
const API = process.env.BASE_URL || 'http://localhost:4450';

(async () => {
  const img = path.join(EVID, 'html', 'img');
  fs.mkdirSync(img, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const rFront = await page.goto(`${FRONT}/login`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-testid=button-login]', { state: 'visible' });
  await page.screenshot({ path: path.join(img, 'cap02-frontend.png') });

  const rDocs = await page.goto(`${API}/docs`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.swagger-ui .info .title', { state: 'visible', timeout: 15000 });
  await page.waitForSelector('.swagger-ui .opblock', { state: 'visible' });
  await page.screenshot({ path: path.join(img, 'cap02-swagger.png') });

  // composición: dos capturas 1440x900 una al lado de la otra, sin márgenes
  const comp = await browser.newPage({ viewport: { width: 2880, height: 900 } });
  // se carga desde un archivo local: una página about:blank no puede leer imágenes file://
  const compHtml = path.join(img, 'cap02-composicion.html');
  fs.writeFileSync(compHtml, '<!doctype html><body style="margin:0;display:flex;background:#fff"><img src="cap02-frontend.png"><img src="cap02-swagger.png"></body>');
  await comp.goto('file:///' + compHtml.split(path.sep).join('/'));
  await comp.waitForFunction(() => [...document.images].every((i) => i.complete && i.naturalWidth));
  const salida = path.join(EVID, 'capturas', 'CAP-02_atlas-swagger.png');
  await comp.screenshot({ path: salida });
  await browser.close();
  console.log(JSON.stringify({ login: rFront.status(), docs: rDocs.status(), salida }));
})().catch((e) => { console.error(e); process.exit(1); });
