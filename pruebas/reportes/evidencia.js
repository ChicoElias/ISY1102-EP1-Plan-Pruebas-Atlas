// Renderiza una evidencia HTML (resultado real + comando + marca de tiempo) y la captura con Playwright.
const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

const RAIZ = path.resolve(__dirname, '..', '..');
const EVID = process.env.EVID_DIR || path.resolve(RAIZ, '..', 'evidencias-release');

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const badge = (ok) => `<span class="b ${ok ? 'ok' : 'ko'}">${ok ? 'PASS' : 'FAIL'}</span>`;

function tabla(cols, filas) {
  return `<table><thead><tr>${cols.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${filas
    .map((f) => `<tr>${f.map((v) => `<td>${typeof v === 'object' && v && v.html ? v.html : esc(v)}</td>`).join('')}</tr>`)
    .join('')}</tbody></table>`;
}

const CSS = `
*{box-sizing:border-box}body{margin:0;font:15px/1.5 "Segoe UI",system-ui,sans-serif;color:#1d2430;background:#f4f6f9}
.w{max-width:1360px;margin:0 auto;padding:28px 32px}
header{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:3px solid #1d3d6b;padding-bottom:12px;margin-bottom:18px}
h1{font-size:24px;margin:0;color:#1d3d6b}h2{font-size:17px;margin:22px 0 8px;color:#1d3d6b}
.meta{font-size:13px;color:#4a5566;text-align:right}
.cmd{background:#11161f;color:#d6e2f0;font:13px/1.5 Consolas,monospace;padding:10px 14px;border-radius:6px;white-space:pre-wrap;word-break:break-all}
table{width:100%;border-collapse:collapse;background:#fff;font-size:13.5px;margin:6px 0}
th{background:#1d3d6b;color:#fff;text-align:left;padding:7px 9px;font-weight:600}
td{padding:6px 9px;border-bottom:1px solid #e1e6ee;vertical-align:top}tr:nth-child(even) td{background:#f9fafc}
.b{display:inline-block;min-width:52px;text-align:center;padding:2px 8px;border-radius:4px;font-weight:700;font-size:12px;color:#fff}
.ok{background:#1b7f3b}.ko{background:#b3261e}.warn{background:#a86400}
.kpi{display:flex;gap:12px;margin:8px 0}.kpi div{flex:1;background:#fff;border:1px solid #dbe1ea;border-radius:6px;padding:10px 14px}
.kpi b{display:block;font-size:26px}.note{font-size:12.5px;color:#4a5566;margin-top:12px}
img.shot{border:1px solid #c9d1dd;max-width:100%}.row{display:flex;gap:16px;align-items:flex-start}`;

async function renderEvidencia({ archivo, titulo, subtitulo, comando, cuerpo, ancho = 1440 }) {
  const ahora = new Date();
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${esc(titulo)}</title><style>${CSS}</style></head><body><div class="w">
<header><div><h1>${esc(titulo)}</h1><div>${esc(subtitulo || '')}</div></div>
<div class="meta">Atlas · Caso A Docker · QA Grupo 15<br>${esc(ahora.toLocaleString('es-CL', { timeZone: 'America/Santiago' }))} (America/Santiago)<br>${esc(ahora.toISOString())}</div></header>
${comando ? `<div class="cmd">$ ${esc(comando)}</div>` : ''}
${cuerpo}
</div></body></html>`;
  const dirHtml = path.join(EVID, 'html');
  fs.mkdirSync(dirHtml, { recursive: true });
  fs.mkdirSync(path.join(EVID, 'capturas'), { recursive: true });
  const rutaHtml = path.join(dirHtml, archivo.replace(/\.png$/, '.html'));
  fs.writeFileSync(rutaHtml, html);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: ancho, height: 900 } });
  await page.goto('file:///' + rutaHtml.replace(/\\/g, '/'));
  await page.screenshot({ path: path.join(EVID, 'capturas', archivo), fullPage: true });
  await browser.close();
  return path.join(EVID, 'capturas', archivo);
}

module.exports = { renderEvidencia, tabla, badge, esc, EVID, RAIZ };
