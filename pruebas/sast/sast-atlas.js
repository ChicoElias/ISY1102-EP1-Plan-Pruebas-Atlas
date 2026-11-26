// FASE 2 - SAST/SCA sobre el SUT oficial: npm audit (BACKEND y FRONTEND) + ESLint del FRONTEND.
// El SUT no se modifica: ESLint corre sobre una copia (ESLINT_JSON = salida de `npx eslint . -f json`).
// Salida: evidencias-release/logs/02-sast.json + capturas/CAP-03_sast-npm-audit.png
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { renderEvidencia, tabla, esc, EVID, RAIZ } = require('../reportes/evidencia');

const SUT = process.env.SUT_DIR || path.resolve(RAIZ, '..', 'CodigoFuenteETA');

function audit(dir) {
  const r = spawnSync('npm', ['audit', '--json'], { cwd: path.join(SUT, dir), encoding: 'utf8', shell: true, maxBuffer: 64 * 1024 * 1024 });
  return JSON.parse(r.stdout);
}

function resumenAudit(a) {
  return Object.values(a.vulnerabilities || {}).map((v) => {
    const via = v.via.filter((x) => typeof x === 'object');
    return {
      paquete: v.name,
      severidad: v.severity,
      directo: v.isDirect,
      rango: v.range,
      avisos: via.map((x) => `${x.title}${x.url ? ' (' + x.url.split('/').pop() + ')' : ''}`),
      fix: v.fixAvailable === true ? 'npm audit fix' : v.fixAvailable ? `${v.fixAvailable.name}@${v.fixAvailable.version}${v.fixAvailable.isSemVerMajor ? ' (major)' : ''}` : 'sin fix',
    };
  });
}

(async () => {
  const backend = audit('BACKEND');
  const frontend = audit('FRONTEND');
  let eslint = null;
  if (process.env.ESLINT_JSON && fs.existsSync(process.env.ESLINT_JSON)) {
    const raw = JSON.parse(fs.readFileSync(process.env.ESLINT_JSON, 'utf8'));
    const msgs = raw.flatMap((f) => f.messages.map((m) => ({ archivo: path.relative(path.dirname(process.env.ESLINT_JSON), f.filePath).replace(/\\/g, '/').replace(/^fe-lint\//, ''), linea: m.line, regla: m.ruleId, severidad: m.severity === 2 ? 'error' : 'warning', mensaje: m.message })));
    eslint = { errores: msgs.filter((m) => m.severidad === 'error').length, advertencias: msgs.filter((m) => m.severidad === 'warning').length, mensajes: msgs };
  }
  const salida = {
    fecha: new Date().toISOString(),
    comandos: ['cd CodigoFuenteETA/BACKEND && npm audit --json', 'cd CodigoFuenteETA/FRONTEND && npm audit --json', 'npx eslint . -f json (copia de FRONTEND, eslint.config.js oficial)'],
    backend: { metadata: backend.metadata, vulnerabilidades: resumenAudit(backend) },
    frontend: { metadata: frontend.metadata, vulnerabilidades: resumenAudit(frontend) },
    eslint_frontend: eslint,
    nota: 'BACKEND no declara ESLint; se cubre con revisión manual de patrones en routes/ (ver REPORTE_VERIFICACION_ATLAS_V2.md).',
  };
  fs.mkdirSync(path.join(EVID, 'logs'), { recursive: true });
  fs.writeFileSync(path.join(EVID, 'logs', '02-sast.json'), JSON.stringify(salida, null, 2));

  const kpis = (m) => ['critical', 'high', 'moderate', 'low'].map((s) => `<div><b>${m.vulnerabilities[s]}</b>${s}</div>`).join('');
  const filas = (lista) => lista
    .sort((a, b) => ['critical', 'high', 'moderate', 'low'].indexOf(a.severidad) - ['critical', 'high', 'moderate', 'low'].indexOf(b.severidad))
    .map((v) => [{ html: `<span class="b ${v.severidad === 'low' ? 'warn' : 'ko'}">${esc(v.severidad)}</span>` }, v.paquete + (v.directo ? ' (directa)' : ''), v.avisos.length ? v.avisos.slice(0, 2).join(' · ') + (v.avisos.length > 2 ? ` (+${v.avisos.length - 2} avisos más)` : '') : 'transitiva', v.fix]);
  const reglas = eslint ? Object.entries(eslint.mensajes.reduce((acc, m) => ((acc[m.regla || 'parse'] = (acc[m.regla || 'parse'] || 0) + 1), acc), {})).sort((a, b) => b[1] - a[1]) : [];
  const cuerpo = `
<h2>BACKEND (Node/Express) · ${backend.metadata.dependencies.total} dependencias</h2><div class="kpi">${kpis(backend.metadata)}</div>
${tabla(['Severidad', 'Paquete', 'Aviso (GHSA)', 'Remediación'], filas(salida.backend.vulnerabilidades))}
<h2>FRONTEND (React/MUI/Vite) · ${frontend.metadata.dependencies.total} dependencias</h2><div class="kpi">${kpis(frontend.metadata)}</div>
${tabla(['Severidad', 'Paquete', 'Aviso (GHSA)', 'Remediación'], filas(salida.frontend.vulnerabilidades))}
${eslint ? `<h2>ESLint FRONTEND · ${eslint.errores} errores, ${eslint.advertencias} advertencias</h2>${tabla(['Regla', 'Ocurrencias'], reglas)}` : ''}
<p class="note">Salida completa: evidencias-release/logs/02-sast.json</p>`;
  await renderEvidencia({
    archivo: 'CAP-03_sast-npm-audit.png',
    titulo: 'CAP-03 · SAST / SCA: npm audit + ESLint',
    subtitulo: 'Análisis estático de dependencias y código del SUT oficial',
    comando: salida.comandos.join('\n$ '),
    cuerpo,
  });
  console.log(JSON.stringify({ backend: backend.metadata.vulnerabilities, frontend: frontend.metadata.vulnerabilities, eslint: eslint && { errores: eslint.errores, advertencias: eslint.advertencias } }));
})().catch((e) => { console.error(e); process.exit(1); });
