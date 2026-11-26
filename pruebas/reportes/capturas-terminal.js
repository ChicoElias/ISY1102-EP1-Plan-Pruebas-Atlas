// CAP-03 y CAP-06 como capturas de terminal: ejecuta los comandos reales y renderiza su salida
// en ventanas de consola oscuras, en una sola vista de 1440x900 (Playwright Chromium, sin fullPage).
// Las salidas largas de npm audit se filtran con Select-String en el mismo comando que se muestra.
// Uso: node pruebas/reportes/capturas-terminal.js
//   FRONTEND_LINT_DIR = copia de FRONTEND con node_modules para ESLint (el SUT no se toca).
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { chromium } = require('@playwright/test');
const { EVID, RAIZ, esc } = require('./evidencia');

const SUT = process.env.SUT_DIR || path.resolve(RAIZ, '..', 'CodigoFuenteETA');
const ANSI = /\x1b\[[0-9;]*m/g;

function ejecutar(cmd, args, cwd) {
  const r = spawnSync(cmd, args, { cwd, encoding: 'utf8', shell: process.platform === 'win32' && !['docker', 'pwsh'].includes(cmd), maxBuffer: 32 * 1024 * 1024 });
  return `${r.stdout || ''}${r.stderr || ''}`.replace(ANSI, '').replace(/\r/g, '').trimEnd();
}

const ventana = (titulo, bloques) => `<div class="win"><div class="bar"><i></i><i></i><i></i><span>${esc(titulo)}</span></div><pre>${bloques
  .map((b) => `<b class="p">PS ${esc(b.cwd)}&gt;</b> <b>${esc(b.cmd)}</b>\n${esc(b.out)}`).join('\n\n')}</pre></div>`;

async function capturar(archivo, columnas) {
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
html,body{height:100%;overflow:hidden}
body{margin:0;background:#0b0e14;padding:14px;box-sizing:border-box;display:flex;gap:14px;align-items:flex-start}
.win{flex:1;min-width:0;background:#0c0c0c;border:1px solid #333;border-radius:8px;overflow:hidden}
.bar{background:#1f1f1f;color:#ccc;font:12px "Segoe UI",sans-serif;padding:7px 10px;display:flex;gap:6px;align-items:center}
.bar i{width:11px;height:11px;border-radius:50%;background:#555;display:inline-block}.bar span{margin-left:8px}
pre{margin:0;padding:10px 12px;color:#cccccc;font:11px/1.28 Consolas,"Cascadia Mono",monospace;white-space:pre-wrap;word-break:break-word}
b{color:#f2f2f2;font-weight:normal}.p{color:#3a96dd}</style></head><body>${columnas.join('')}</body></html>`;
  const tmp = path.join(EVID, 'html', archivo.replace(/\.png$/, '.terminal.html'));
  fs.mkdirSync(path.dirname(tmp), { recursive: true });
  fs.writeFileSync(tmp, html);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('file:///' + tmp.replace(/\\/g, '/'));
  const alto = await page.evaluate(() => Math.max(...[...document.querySelectorAll('.win')].map((w) => w.getBoundingClientRect().bottom)));
  if (alto > 900) console.warn(`AVISO ${archivo}: el contenido mide ${Math.round(alto)}px y supera la vista de 900px`);
  await page.screenshot({ path: path.join(EVID, 'capturas', archivo), fullPage: false });
  await browser.close();
}

(async () => {
  const fecha = ejecutar('pwsh', ['-NoProfile', '-Command', "Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz'"], RAIZ);

  // CAP-03: npm audit (BACKEND, FRONTEND) + ESLint (FRONTEND/src)
  const be = path.join(SUT, 'BACKEND');
  const fe = path.join(SUT, 'FRONTEND');
  const FILTRO = String.raw`npm audit | Select-String -Pattern '^\S+\s{2}\S|Severity:|vulnerabilities \(' | ForEach-Object Line`;
  const izq = [
    { cwd: 'CodigoFuenteETA', cmd: "Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz'", out: fecha },
    { cwd: 'CodigoFuenteETA\\BACKEND', cmd: FILTRO, out: ejecutar('pwsh', ['-NoProfile', '-Command', FILTRO], be) },
  ];
  const lintDir = process.env.FRONTEND_LINT_DIR;
  if (lintDir && fs.existsSync(path.join(lintDir, 'node_modules'))) {
    izq.push({ cwd: 'CodigoFuenteETA\\FRONTEND (copia con node_modules)', cmd: 'npx eslint src', out: ejecutar('npx', ['eslint', 'src'], lintDir).replace(/^.*fe-lint/gm, '  FRONTEND') });
  }
  await capturar('CAP-03_sast-npm-audit.png', [
    ventana('Windows PowerShell · SAST backend + ESLint', izq),
    ventana('Windows PowerShell · SAST frontend', [{ cwd: 'CodigoFuenteETA\\FRONTEND', cmd: FILTRO, out: ejecutar('pwsh', ['-NoProfile', '-Command', FILTRO], fe) }]),
  ]);

  // CAP-06: consulta real a atlas-postgres; la contraseña se enmascara en el propio SQL (inicial + '*')
  const sql = "SELECT id, nombre_usuario, length(contrasena_hash) AS largo, left(contrasena_hash, 1) || '*' AS prefijo_enmascarado, contrasena_hash ~ '^\\$2[aby]\\$' AS es_bcrypt FROM usuarios ORDER BY id;";
  const salida = ejecutar('docker', ['exec', 'atlas-postgres', 'psql', '-U', 'postgres', '-d', 'atlas', '-c', sql], RAIZ);
  await capturar('CAP-06_postgres-bcrypt.png', [
    ventana('Windows PowerShell · NFR-SEG-2 atlas-postgres', [
      { cwd: 'EFT-ISY1102', cmd: "Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz'", out: fecha },
      { cwd: 'EFT-ISY1102', cmd: 'docker ps --filter name=atlas-postgres --format "{{.Names}}  {{.Status}}  {{.Ports}}"', out: ejecutar('docker', ['ps', '--filter', 'name=atlas-postgres', '--format', '{{.Names}}  {{.Status}}  {{.Ports}}'], RAIZ) },
      { cwd: 'EFT-ISY1102', cmd: `docker exec atlas-postgres psql -U postgres -d atlas -c "${sql}"`, out: salida },
    ]),
  ]);
  console.log('ok CAP-03, CAP-06');
})().catch((e) => { console.error(e); process.exit(1); });
