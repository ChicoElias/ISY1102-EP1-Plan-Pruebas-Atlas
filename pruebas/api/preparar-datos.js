// Prepara los datos de prueba sobre el ambiente Docker oficial de Atlas (Caso A)
// y genera el environment local de Newman (ignorado por git: *.local.json).
//
//  - Lee las credenciales semilla (admin / editor) desde dump-atlas.sql del SUT.
//  - Crea o reinicia el usuario dedicado qa_lockout (RF-1.3) con contraseña aleatoria,
//    para no bloquear nunca la cuenta administradora principal.
//  - Genera la contraseña del usuario de la empresa B (RB-2).
//  - Genera el PDF de prueba para RF-5.2.
//
// Uso: node pruebas/api/preparar-datos.js   (desde la raíz del repo QA)
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const RAIZ = path.resolve(__dirname, '..', '..');
const SUT = process.env.SUT_DIR || path.resolve(RAIZ, '..', 'CodigoFuenteETA');
const CONTENEDOR_DB = process.env.DB_CONTAINER || 'atlas-postgres';
const BASE_URL = process.env.BASE_URL || 'http://localhost:4450';

function semilla(usuario) {
  const dump = fs.readFileSync(path.join(SUT, 'BACKEND', 'sql', 'dump-atlas.sql'), 'utf8');
  const re = new RegExp(`INSERT INTO public\\.usuarios .*VALUES \\(\\d+, '${usuario}', '([^']*)'`);
  const m = dump.match(re);
  if (!m) throw new Error(`No se encontró el usuario semilla ${usuario} en dump-atlas.sql`);
  return m[1];
}

// contraseña robusta: 16 caracteres con mayúscula, minúscula, número y símbolo
function contrasenaFuerte() {
  const base = crypto.randomBytes(12).toString('base64').replace(/[^A-Za-z0-9]/g, '');
  return `Qa${base.slice(0, 10)}7#x`;
}

function psql(sql) {
  return execFileSync('docker', ['exec', CONTENEDOR_DB, 'psql', '-U', 'postgres', '-d', 'atlas', '-t', '-A', '-c', sql], {
    encoding: 'utf8',
  }).trim();
}

const lockoutPass = contrasenaFuerte();
// El SUT guarda contraseñas tal como llegan (ver hallazgo NFR-SEG-2), por eso se inserta igual que la API.
psql(`INSERT INTO usuarios (nombre_usuario, contrasena_hash, correo)
      VALUES ('qa_lockout', '${lockoutPass}', 'qa_lockout@atlas.test')
      ON CONFLICT (nombre_usuario) DO UPDATE SET contrasena_hash = EXCLUDED.contrasena_hash`);
const lockoutId = psql(`SELECT id FROM usuarios WHERE nombre_usuario = 'qa_lockout'`);
psql(`INSERT INTO empresa_usuarios (empresa_id, usuario_id, rol_id)
      SELECT 1, ${lockoutId}, 2 WHERE NOT EXISTS (SELECT 1 FROM empresa_usuarios WHERE usuario_id = ${lockoutId})`);

// PDF mínimo válido para la carga de contratos
const pdf = path.join(__dirname, 'fixtures', 'contrato-prueba.pdf');
if (!fs.existsSync(pdf)) {
  fs.mkdirSync(path.dirname(pdf), { recursive: true });
  fs.writeFileSync(pdf, `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj
4 0 obj<</Length 58>>stream
BT /F1 18 Tf 72 760 Td (Contrato de prueba QA Atlas) Tj ET
endstream endobj
5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj
trailer<</Root 1 0 R>>
%%EOF
`);
}

const env = {
  name: 'Atlas Docker (local)',
  values: [
    ['baseUrl', BASE_URL],
    ['adminUser', 'admin'],
    ['adminPass', semilla('admin'), 'secret'],
    ['editorUser', 'editor'],
    ['editorPass', semilla('editor'), 'secret'],
    ['lockoutUser', 'qa_lockout'],
    ['lockoutPass', lockoutPass, 'secret'],
    ['empresaBPass', contrasenaFuerte(), 'secret'],
  ].map(([key, value, type]) => ({ key, value, type: type || 'default', enabled: true })),
};
const destino = path.join(__dirname, 'atlas-docker.postman_environment.local.json');
fs.writeFileSync(destino, JSON.stringify(env, null, 2));
console.log(`qa_lockout listo (id ${lockoutId}). Environment escrito en ${path.relative(RAIZ, destino)}`);
