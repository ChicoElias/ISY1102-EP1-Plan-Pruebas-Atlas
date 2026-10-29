// ============================================================
//  ATLAS · API REST (réplica de laboratorio ISY1102)
//  Contrato conforme a la coleccion Postman del Grupo 15 y la ERS v1.1.
//  Node 20 + Express + PostgreSQL + JWT (bcrypt) sobre HTTPS.
//
//  Comportamiento de seguridad del caso:
//   - CP-01/02/04: seguro (JWT corto+refresh, TLS, bcrypt, RBAC, validacion).
//   - CP-03: IDOR plantado (sin control de acceso por empresa en lectura/edicion).
//   - CP-06: Stored XSS plantado (sin saneamiento ni CSP); SQLi parametrizado; CSRF por Origin.
// ============================================================
const fs = require('fs');
const https = require('https');
const crypto = require('crypto');
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const PORT = process.env.PORT || 8443;
const JWT_SECRET = process.env.JWT_SECRET || 'atlas-lab-secret-no-produccion';
const JWT_TTL = 900; // 15 minutos (NFR-SEG-9 / ASVS)
const ORIGENES_PERMITIDOS = [
  `https://localhost:${PORT}`, 'https://localhost', 'https://qa.atlas.local',
];

const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'atlas',
  password: process.env.DB_PASSWORD || 'atlas_lab_pw',
  database: process.env.DB_NAME || 'atlas',
});

const app = express();
app.disable('x-powered-by');
app.use(express.json());

// ---------- Semilla de usuarios (hash bcrypt) ----------
async function seedUsuarios() {
  const usuarios = [
    { empresa_id: 101, usuario: 'admin.pyme01',  pass: process.env.ADMIN_PASS  || 'Atlas.Admin2026',  rol: 'admin'  },
    { empresa_id: 101, usuario: 'editor.pyme01', pass: process.env.EDITOR_PASS || 'Atlas.Editor2026', rol: 'editor' },
    { empresa_id: 102, usuario: 'admin.pyme02',  pass: 'Atlas.AdminB2026', rol: 'admin' },
  ];
  for (const u of usuarios) {
    const hash = await bcrypt.hash(u.pass, 10);
    await pool.query(
      `INSERT INTO usuarios (empresa_id, usuario, password_hash, rol)
       VALUES ($1,$2,$3,$4) ON CONFLICT (usuario) DO UPDATE SET password_hash=EXCLUDED.password_hash`,
      [u.empresa_id, u.usuario, hash, u.rol]
    );
  }
}

// ---------- Mapeo de cliente a camelCase ----------
function mapCliente(r) {
  return {
    id: r.id, empresaId: r.empresa_id, razonSocial: r.razon_social,
    rut: r.rut, telefono: r.telefono, descripcion: r.descripcion,
    cuentaBancaria: r.cuenta_bancaria, creadoEn: r.creado_en,
  };
}

// ---------- CSRF: rechaza peticiones de escritura desde otro origen ----------
function antiCsrf(req, res, next) {
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    const origin = req.headers['origin'];
    if (origin && !ORIGENES_PERMITIDOS.includes(origin)) {
      return res.status(403).json({ error: 'Origen no permitido' });
    }
  }
  next();
}
app.use(antiCsrf);

// ---------- Autenticacion JWT ----------
function autenticar(req, res, next) {
  const h = req.headers['authorization'] || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Token ausente' });
  try { req.auth = jwt.verify(token, JWT_SECRET); next(); }
  catch (e) { return res.status(401).json({ error: 'Token invalido o expirado' }); }
}
function soloAdmin(req, res, next) {
  if (req.auth.rol !== 'admin') return res.status(403).json({ error: 'Rol no autorizado para esta operacion' });
  next();
}

// ---------- Validaciones (CP-04) ----------
const RE_RUT = /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/;
const RE_TEL = /^\+?[\d\s]{6,}$/;

// ============================================================
//  AUTENTICACION — CP-01
// ============================================================
app.post('/api/auth/login', async (req, res) => {
  const { usuario, password } = req.body || {};
  if (!usuario || !password) return res.status(400).json({ error: 'usuario y password son obligatorios' });
  // Consulta parametrizada: inmune a SQLi (CP-06)
  const { rows } = await pool.query('SELECT * FROM usuarios WHERE usuario = $1', [usuario]);
  const u = rows[0];
  if (!u || !(await bcrypt.compare(password, u.password_hash))) {
    return res.status(401).json({ error: 'Credenciales invalidas' });
  }
  const token = jwt.sign(
    { sub: u.id, usuario: u.usuario, rol: u.rol, empresa_id: u.empresa_id },
    JWT_SECRET, { expiresIn: JWT_TTL }
  );
  const refreshToken = crypto.randomBytes(32).toString('hex');
  return res.status(200).json({
    token, refreshToken,
    usuario: { id: u.id, usuario: u.usuario, rol: u.rol, empresa_id: u.empresa_id },
  });
});

// ============================================================
//  CLIENTES
// ============================================================
// Listado filtrable — consulta parametrizada (CP-06 SQLi) y acotada a la empresa del token
app.get('/api/clientes', autenticar, async (req, res) => {
  const nombre = req.query.nombre;
  let q = 'SELECT * FROM clientes WHERE empresa_id = $1', p = [req.auth.empresa_id];
  if (nombre !== undefined) { q += ' AND razon_social ILIKE $2'; p.push('%' + nombre + '%'); }
  q += ' ORDER BY id';
  const { rows } = await pool.query(q, p);
  return res.status(200).json({ data: rows.map(mapCliente) });
});

// Detalle por id — *** IDOR (CP-03): no valida que el cliente sea de la empresa del token ***
app.get('/api/clientes/:id', autenticar, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM clientes WHERE id = $1', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
  return res.status(200).json(mapCliente(rows[0]));
});

// Creacion — admin; valida RUT y telefono (CP-04); almacena descripcion SIN sanear (CP-06 XSS)
app.post('/api/clientes', autenticar, soloAdmin, async (req, res) => {
  const { razonSocial, rut, telefono, descripcion, cuentaBancaria } = req.body || {};
  if (!razonSocial) return res.status(422).json({ error: 'razonSocial es obligatorio' });
  if (rut !== undefined && !RE_RUT.test(rut)) return res.status(422).json({ error: 'RUT invalido' });
  if (telefono !== undefined && !RE_TEL.test(telefono)) return res.status(422).json({ error: 'Telefono invalido' });
  const { rows } = await pool.query(
    `INSERT INTO clientes (empresa_id, razon_social, rut, telefono, descripcion, cuenta_bancaria)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [req.auth.empresa_id, razonSocial, rut || null, telefono || null, descripcion || null, cuentaBancaria || null]
  );
  return res.status(201).json(mapCliente(rows[0]));
});

// Edicion — editor NO (CP-02); admin si
app.put('/api/clientes/:id', autenticar, soloAdmin, async (req, res) => {
  const campos = ['razonSocial', 'rut', 'telefono', 'descripcion', 'cuentaBancaria'];
  const map = { razonSocial: 'razon_social', rut: 'rut', telefono: 'telefono', descripcion: 'descripcion', cuentaBancaria: 'cuenta_bancaria' };
  const sets = [], vals = []; let i = 1;
  for (const c of campos) if (req.body[c] !== undefined) { sets.push(`${map[c]}=$${i++}`); vals.push(req.body[c]); }
  if (sets.length === 0) return res.status(400).json({ error: 'Sin campos a actualizar' });
  vals.push(req.params.id);
  const { rows } = await pool.query(`UPDATE clientes SET ${sets.join(',')} WHERE id=$${i} RETURNING *`, vals);
  if (rows.length === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
  return res.status(200).json(mapCliente(rows[0]));
});

// Eliminacion — editor NO (CP-02)
app.delete('/api/clientes/:id', autenticar, soloAdmin, async (req, res) => {
  await pool.query('DELETE FROM clientes WHERE id=$1', [req.params.id]);
  return res.status(204).end();
});

// Clientes de una empresa — *** IDOR (CP-03): no compara la empresa del token ***
app.get('/api/empresas/:id/clients', autenticar, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM clientes WHERE empresa_id = $1 ORDER BY id', [req.params.id]);
  return res.status(200).json({ data: rows.map(mapCliente) });
});

// ============================================================
//  CONTRATOS
// ============================================================
// Creacion — editor NO (CP-02)
app.post('/api/contratos', autenticar, soloAdmin, async (req, res) => {
  const { clienteId, fechaInicio, fechaTermino } = req.body || {};
  if (!clienteId) return res.status(422).json({ error: 'clienteId es obligatorio' });
  const { rows } = await pool.query(
    `INSERT INTO contratos (empresa_id, cliente_id, fecha_inicio, fecha_termino)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [req.auth.empresa_id, clienteId, fechaInicio || null, fechaTermino || null]
  );
  return res.status(201).json(rows[0]);
});

// Edicion — editor NO (CP-02); admin *** IDOR (CP-03): edita contratos de cualquier empresa ***
app.put('/api/contratos/:id', autenticar, soloAdmin, async (req, res) => {
  const { fechaInicio, fechaTermino, estado } = req.body || {};
  const sets = [], vals = []; let i = 1;
  if (fechaInicio !== undefined) { sets.push(`fecha_inicio=$${i++}`); vals.push(fechaInicio); }
  if (fechaTermino !== undefined) { sets.push(`fecha_termino=$${i++}`); vals.push(fechaTermino); }
  if (estado !== undefined) { sets.push(`estado=$${i++}`); vals.push(estado); }
  if (sets.length === 0) return res.status(400).json({ error: 'Sin campos a actualizar' });
  vals.push(req.params.id);
  const { rows } = await pool.query(`UPDATE contratos SET ${sets.join(',')} WHERE id=$${i} RETURNING *`, vals);
  if (rows.length === 0) return res.status(404).json({ error: 'Contrato no encontrado' });
  return res.status(200).json(rows[0]);
});

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

// ---------- Arranque HTTPS ----------
async function start() {
  for (let i = 0; i < 30; i++) {
    try { await pool.query('SELECT 1'); break; }
    catch (e) { await new Promise(r => setTimeout(r, 1000)); }
  }
  await seedUsuarios();
  const opts = {
    key: fs.readFileSync(process.env.TLS_KEY || '/app/certs/server.key'),
    cert: fs.readFileSync(process.env.TLS_CERT || '/app/certs/server.crt'),
  };
  https.createServer(opts, app).listen(PORT, () => console.log(`[ATLAS] API HTTPS en puerto ${PORT}`));
}
start();
