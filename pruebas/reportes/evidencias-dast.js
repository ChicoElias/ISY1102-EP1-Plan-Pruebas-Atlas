// FASES 3-4: transforma resultados reales (Newman JSON, k6 summary, consulta PostgreSQL) en CAP-04..CAP-07.
// Entradas: evidencias-release/logs/03-newman.json y 04-k6.log. La consulta NFR-SEG-2 se ejecuta aquí.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { renderEvidencia, tabla, badge, esc, EVID } = require('./evidencia');

const LOGS = path.join(EVID, 'logs');
const run = JSON.parse(fs.readFileSync(path.join(LOGS, '03-newman.json'), 'utf8')).run;

// filas por ejecución: requerimiento, request, HTTP, ms, aserción, resultado
const filas = run.executions.flatMap((e) => (e.assertions || []).map((a) => ({
  id: (a.assertion.match(/^\[([^\]]+)\]/) || [, '-'])[1],
  req: `${e.request.method} ${'/' + e.request.url.path.join('/')}${e.request.url.query && e.request.url.query.length ? '?' + e.request.url.query.map((q) => `${q.key}=${q.value}`).join('&') : ''}`,
  item: e.item.name,
  code: e.response ? e.response.code : '-',
  ms: e.response ? e.response.responseTime : '-',
  texto: a.assertion.replace(/^\[[^\]]+\]\s*/, ''),
  ok: !a.error,
})));
const resumen = (ids) => filas.filter((f) => ids.includes(f.id));
const tablaPruebas = (lista) => tabla(['Req.', 'Request', 'HTTP', 'ms', 'Aserción', 'Resultado'],
  lista.map((f) => [f.id, f.req, f.code, f.ms, f.texto, { html: badge(f.ok) }]));
const kpi = (lista) => `<div class="kpi"><div><b>${lista.length}</b>aserciones</div><div><b style="color:#1b7f3b">${lista.filter((f) => f.ok).length}</b>PASS</div><div><b style="color:#b3261e">${lista.filter((f) => !f.ok).length}</b>FAIL</div></div>`;
const CMD_NEWMAN = 'node pruebas/api/preparar-datos.js && npx newman run pruebas/api/atlas-endpoints-criticos.postman_collection.json -e pruebas/api/atlas-docker.postman_environment.local.json --working-dir . -r cli,json';

function psql(sql) {
  return execFileSync('docker', ['exec', 'atlas-postgres', 'psql', '-U', 'postgres', '-d', 'atlas', '-A', '-F', '|', '-c', sql], { encoding: 'utf8' }).trim();
}

(async () => {
  const salida = {};

  // CAP-04 RF-1.3 + R-2.4
  const c4 = resumen(['RF-1.3', 'R-2.4']);
  await renderEvidencia({
    archivo: 'CAP-04_auth-bloqueo-politica.png',
    titulo: 'CAP-04 · RF-1.3 bloqueo de cuenta y Restricción 2.4 política de contraseñas',
    subtitulo: 'Usuario dedicado qa_lockout (la cuenta admin principal no se bloquea) · Newman',
    comando: CMD_NEWMAN,
    cuerpo: `${kpi(c4)}${tablaPruebas(c4)}
<p class="note">Lectura: tras 5 contraseñas erróneas el 6º intento con la contraseña correcta devuelve 200 y un JWT; routes/auth.js no lleva contador de intentos ni estado de bloqueo.
Las altas con contraseñas de 4 y 6 caracteres sin complejidad se aceptan (201): no existe validación de política en POST /usuarios ni POST /empresas.</p>`,
  });

  // CAP-05 RBAC + RB-2 + SQLi/XSS
  const c5 = resumen(['RBAC', 'RB-2', 'NFR-SEG-4', 'NFR-SEG-5']);
  await renderEvidencia({
    archivo: 'CAP-05_rbac-editor-403-sqli.png',
    titulo: 'CAP-05 · RF-3.2 / RB-4 / NFR-SEG-4 RBAC, RB-2 multi-empresa y NFR-SEG-5 SQLi/XSS',
    subtitulo: 'Token JWT del rol editor (seed) · empresa B creada en la misma corrida · Newman',
    comando: CMD_NEWMAN,
    cuerpo: `${kpi(c5)}${tablaPruebas(c5)}
<p class="note">Lectura: el backend no evalúa rol_id en ninguna ruta (el JWT no incluye rol); el rol solo se aplica en el frontend (RoleGuard + localStorage).
GET /contratos/:id, /contratos/:id/file y /usuarios/:id no filtran por empresa_id (IDOR, expone PDF de contratos y datos de terceros, Ley 19.628).
SQLi neutralizada por consultas parametrizadas ($1); el payload &lt;script&gt; se persiste sin sanitizar (React lo escapa al renderizar, pero queda almacenado).</p>`,
  });

  // CAP-06 NFR-SEG-2 bcrypt (valores enmascarados)
  const sql = `SELECT nombre_usuario,
  left(contrasena_hash, 1) || repeat('*', greatest(length(contrasena_hash) - 1, 0)) AS valor_enmascarado,
  length(contrasena_hash) AS largo,
  (contrasena_hash ~ '^\\$2[aby]\\$[0-9]{2}\\$[./A-Za-z0-9]{53}$') AS es_bcrypt
FROM usuarios ORDER BY id;`;
  const crudo = psql(sql);
  const lineas = crudo.split('\n').filter((l) => l.includes('|') && !/^nombre_usuario/.test(l));
  const usuarios = lineas.map((l) => l.split('|'));
  const bcrypt = usuarios.filter((u) => u[3] === 't').length;
  salida.seg2 = { total: usuarios.length, bcrypt };
  fs.writeFileSync(path.join(LOGS, '03-postgres-bcrypt.log'), `$ docker exec atlas-postgres psql -U postgres -d atlas -c "${sql}"\n\n${crudo}\n`);
  await renderEvidencia({
    archivo: 'CAP-06_postgres-bcrypt.png',
    titulo: 'CAP-06 · NFR-SEG-2 almacenamiento de contraseñas en PostgreSQL',
    subtitulo: 'Tabla usuarios del contenedor atlas-postgres (valores enmascarados en la evidencia)',
    comando: `docker exec atlas-postgres psql -U postgres -d atlas -c "${sql.replace(/\s+/g, ' ')}"`,
    cuerpo: `<div class="kpi"><div><b>${usuarios.length}</b>usuarios</div><div><b style="color:#1b7f3b">${bcrypt}</b>con hash bcrypt ($2a/$2b)</div><div><b style="color:#b3261e">${usuarios.length - bcrypt}</b>en texto plano</div><div><b>${bcrypt === usuarios.length ? badge(true) : badge(false)}</b>NFR-SEG-2</div></div>
${tabla(['nombre_usuario', 'contrasena_hash (enmascarado)', 'largo', '¿bcrypt?'], usuarios.map((u) => [u[0], u[1], u[2], { html: badge(u[3] === 't') }]))}
<p class="note">Un hash bcrypt mide 60 caracteres y empieza con $2a$/$2b$. La columna se llama contrasena_hash pero guarda el valor tal cual; routes/auth.js compara con !== y package.json no declara bcrypt.</p>`,
  });

  // CAP-07 RF-5.2 / RF-5.4 / RF-6.1 / NFR-PERF-1 (Newman + k6)
  const t = fs.readFileSync(path.join(LOGS, '04-k6.log'), 'utf8');
  const rest = t.slice(t.search(/^\{\s*$/m));
  const k6 = JSON.parse(rest.slice(0, rest.search(/^\}/m) + 1)).metrics;
  const crud = k6['http_req_duration{tipo:crud}'];
  salida.k6 = { p95: crud['p(95)'], med: crud.med, avg: crud.avg, max: crud.max, reqs: k6.http_reqs.count, errores: k6.http_req_failed.value, vus: k6.vus_max.value };
  const c7 = resumen(['RF-5.2', 'RF-5.4', 'RF-6.1', 'NFR-PERF-1']);
  const f = (n) => Math.round(n);
  await renderEvidencia({
    archivo: 'CAP-07_contratos-auditoria-perf.png',
    titulo: 'CAP-07 · RF-5.2 PDF, RF-5.4 estado, RF-6.1 auditoría y NFR-PERF-1 latencia',
    subtitulo: 'Newman (latencia por endpoint) + k6 grafana/k6 en atlas-network (perfil de humo)',
    comando: `${CMD_NEWMAN}\n$ docker run --rm -i --network atlas-network -e BASE_URL=http://atlas-backend:4000 -e VUS=10 -e SUBIDA=15s -e MESETA=45s -e BAJADA=5s grafana/k6 run - < pruebas/rendimiento/carga_atlas.js`,
    cuerpo: `${kpi(c7)}${tablaPruebas(c7)}
<h2>k6 · ${salida.k6.vus} VU · ${salida.k6.reqs} requests · errores ${(salida.k6.errores * 100).toFixed(2)} %</h2>
<div class="kpi"><div><b>${f(crud.med)} ms</b>mediana CRUD</div><div><b>${f(crud.avg)} ms</b>promedio CRUD</div><div><b style="color:#b3261e">${f(crud['p(95)'])} ms</b>p95 CRUD (umbral &lt; 300 ms)</div><div><b>${badge(crud['p(95)'] < 300)}</b>NFR-PERF-1</div></div>
<p class="note">Lectura: GET /clientes, GET /contratos y POST /autenticacion/login incluyen <code>await delay(4000)</code> en routes/ (latencia artificial fija de 4 s). Los endpoints sin ese delay responden en &lt; 30 ms.
RF-5.4: /contratos/estados solo calcula 'por_vencer' y 'vencido' (LIMIT 3 por estado); no existe estado 'activo' ni el campo estado en GET /contratos/:id.</p>`,
  });

  fs.writeFileSync(path.join(LOGS, '03-04-resumen.json'), JSON.stringify({ filas, ...salida }, null, 2));
  console.log(JSON.stringify(salida));
})().catch((e) => { console.error(e); process.exit(1); });
