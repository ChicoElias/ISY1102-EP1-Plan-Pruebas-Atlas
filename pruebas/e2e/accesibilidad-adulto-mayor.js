// FASE 4.2 - NFR-USAB-1 (tipografía >= 12px, contraste y ARIA, WCAG 2.1 AA) y NFR-COMPAT-2 (responsivo)
// Playwright Chromium en móvil 375x812 y escritorio 1440x900 sobre /login, /home y /clientes.
// Uso: node pruebas/e2e/accesibilidad-adulto-mayor.js   (requiere el environment local de preparar-datos.js)
const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const { renderEvidencia, tabla, badge, esc, EVID } = require('../reportes/evidencia');

const FRONT = process.env.FRONT_URL || 'http://localhost:3350';
const env = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'api', 'atlas-docker.postman_environment.local.json'), 'utf8'));
const v = (k) => env.values.find((x) => x.key === k).value;

const VIEWPORTS = [
  { nombre: 'móvil 375x812', w: 375, h: 812, movil: true },
  { nombre: 'escritorio 1440x900', w: 1440, h: 900, movil: false },
];
const PAGINAS = ['/login', '/home', '/clientes'];

async function medir(page) {
  return page.evaluate(() => {
    const visible = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
    const textos = [...document.querySelectorAll('body *')].filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && visible(el));
    const tam = textos.map((el) => ({ px: parseFloat(getComputedStyle(el).fontSize), txt: el.textContent.trim().slice(0, 40), tag: el.tagName.toLowerCase() }));
    const chicos = tam.filter((t) => t.px < 12);
    const controles = [...document.querySelectorAll('button, a[href], input:not([type=hidden]), select, textarea, [role=button]')].filter(visible);
    const pequenos = controles.map((el) => { const r = el.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), txt: (el.getAttribute('aria-label') || el.textContent || el.id || el.tagName).trim().slice(0, 30) }; }).filter((c) => c.w < 44 || c.h < 44);
    return {
      fuenteMin: tam.length ? Math.min(...tam.map((t) => t.px)) : null,
      textos: tam.length,
      bajo12: chicos.length,
      ejemplosBajo12: [...new Map(chicos.map((c) => [c.txt, c])).values()].slice(0, 4),
      controles: controles.length,
      pequenos44: pequenos.length,
      ejemplosPequenos: pequenos.slice(0, 4),
      ariaLabel: document.querySelectorAll('[aria-label],[aria-labelledby]').length,
      roles: document.querySelectorAll('[role]').length,
      landmarks: document.querySelectorAll('main,nav,header,[role=main],[role=navigation]').length,
      anchoMain: document.querySelector('main') ? Math.round(document.querySelector('main').getBoundingClientRect().width) : null,
      overflowX: document.documentElement.scrollWidth > window.innerWidth + 1,
      scrollWidth: document.documentElement.scrollWidth,
    };
  });
}

(async () => {
  const img = path.join(EVID, 'html', 'img');
  fs.mkdirSync(img, { recursive: true });
  const browser = await chromium.launch();
  const resultados = [];
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, isMobile: vp.movil, hasTouch: vp.movil, deviceScaleFactor: vp.movil ? 2 : 1, locale: 'es-CL' });
    const page = await ctx.newPage();
    for (const ruta of PAGINAS) {
      if (ruta === '/home') {
        await page.goto(`${FRONT}/login`, { waitUntil: 'networkidle' });
        await page.fill('#nombre_usuario', v('adminUser'));
        await page.fill('#password', v('adminPass'));
        await page.click('[data-testid=button-login]');
        await page.waitForURL(/\/home/, { timeout: 20000 });
      } else {
        await page.goto(`${FRONT}${ruta}`, { waitUntil: 'domcontentloaded' });
      }
      await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
      await page.waitForTimeout(800);
      const m = await medir(page);
      const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      const viol = axe.violations.map((x) => ({ id: x.id, impacto: x.impact, nodos: x.nodes.length }));
      const shot = `cap08-${vp.w}${ruta.replace(/\//g, '-')}.png`;
      await page.screenshot({ path: path.join(img, shot) });
      const contraste = viol.filter((x) => x.id === 'color-contrast').reduce((a, x) => a + x.nodos, 0);
      const nombres = viol.filter((x) => /name|label|aria/.test(x.id)).reduce((a, x) => a + x.nodos, 0);
      resultados.push({ viewport: vp.nombre, movil: vp.movil, ruta, ...m, axe: viol, contraste, nombres, shot });
    }
    await ctx.close();
  }
  await browser.close();

  const usab1 = resultados.every((r) => r.bajo12 === 0 && r.contraste === 0 && r.nombres === 0 && (!r.movil || r.pequenos44 === 0));
  const compat2 = resultados.filter((r) => r.movil).every((r) => !r.overflowX && (r.anchoMain === null || r.anchoMain >= 280));
  fs.writeFileSync(path.join(EVID, 'logs', '04-accesibilidad.json'), JSON.stringify({ fecha: new Date().toISOString(), usab1, compat2, resultados }, null, 2));

  const ok = (b) => ({ html: badge(b) });
  const cuerpo = `
<div class="kpi"><div><b>${badge(usab1)}</b>NFR-USAB-1 tipografía ≥ 12px · contraste AA · ARIA · objetivos táctiles ≥ 44px</div><div><b>${badge(compat2)}</b>NFR-COMPAT-2 en 375px: sin scroll horizontal y área de contenido (main) ≥ 280px</div></div>
${tabla(['Viewport', 'Ruta', 'Fuente mín.', 'Textos < 12px', 'Contraste (nodos)', 'Nombre/ARIA (nodos)', 'Táctiles < 44px', 'aria-label / role', 'Scroll X', 'Ancho main'],
    resultados.map((r) => [r.viewport, r.ruta, `${r.fuenteMin}px`, { html: `${badge(r.bajo12 === 0)} ${r.bajo12}` }, { html: `${badge(r.contraste === 0)} ${r.contraste}` }, { html: `${badge(r.nombres === 0)} ${r.nombres}` }, r.movil ? { html: `${badge(r.pequenos44 === 0)} ${r.pequenos44}/${r.controles}` } : `${r.pequenos44}/${r.controles} (ref.)`, `${r.ariaLabel} / ${r.roles}`, ok(!r.overflowX), r.anchoMain === null ? '— (sin layout)' : r.movil ? { html: `${badge(r.anchoMain >= 280)} ${r.anchoMain}px` } : `${r.anchoMain}px`]))}
<h2>Violaciones axe-core WCAG 2.1 A/AA</h2>
${tabla(['Viewport', 'Ruta', 'Regla', 'Impacto', 'Nodos'], resultados.flatMap((r) => r.axe.map((x) => [r.viewport, r.ruta, x.id, x.impacto, x.nodos])))}
<h2>Ejemplos de texto &lt; 12px y controles &lt; 44px (móvil)</h2>
${tabla(['Ruta', 'Texto &lt; 12px', 'Control pequeño'], resultados.filter((r) => r.movil).map((r) => [r.ruta, r.ejemplosBajo12.map((e) => `${e.px}px “${e.txt}”`).join(' · ') || '—', r.ejemplosPequenos.map((e) => `${e.w}x${e.h} “${e.txt}”`).join(' · ') || '—']))}
<div class="row" style="margin-top:14px">${resultados.filter((r) => r.movil).map((r) => `<div><h2>${esc(r.ruta)} · 375px</h2><img class="shot" style="width:260px" src="img/${r.shot}"></div>`).join('')}
<div style="flex:1"><h2>/home · 1440px</h2><img class="shot" src="img/${resultados.find((r) => !r.movil && r.ruta === '/home').shot}"></div></div>`;
  await renderEvidencia({
    archivo: 'CAP-08_usabilidad-adulto-mayor.png',
    titulo: 'CAP-08 · NFR-USAB-1 / NFR-COMPAT-2 accesibilidad para adultos mayores',
    subtitulo: 'Playwright Chromium + axe-core (wcag2a, wcag2aa, wcag21a, wcag21aa) · móvil 375x812 y escritorio 1440x900',
    comando: 'node pruebas/e2e/accesibilidad-adulto-mayor.js',
    cuerpo,
  });
  console.log(JSON.stringify({ usab1, compat2, resumen: resultados.map((r) => [r.viewport, r.ruta, r.fuenteMin, r.bajo12, r.contraste, r.nombres, r.pequenos44, r.overflowX, r.anchoMain]) }));
})().catch((e) => { console.error(e); process.exit(1); });
