// CP-07 - Carga sobre la API de Atlas (NFR-PERF-1, NFR-PERF-3, NFR-DIS-1)
// Mezcla de 60 % lecturas y 40 % escrituras, como dice el caso en el informe.
// Alineado al contrato real (openapi.json): /autenticacion/login, /clientes, /contratos.
//
// Perfil completo del plan (200 VU, 26 min):
//   k6 run -e BASE_URL=http://localhost:4450 -e ATLAS_USER=admin -e ATLAS_PASS=... carga_atlas.js
// Perfil de humo para release (sin k6 local, en la red de Docker):
//   docker run --rm -i --network atlas-network -e BASE_URL=http://atlas-backend:4000 \
//     -e ATLAS_USER=admin -e ATLAS_PASS=... -e VUS=10 -e SUBIDA=15s -e MESETA=45s -e BAJADA=5s \
//     grafana/k6 run - < pruebas/rendimiento/carga_atlas.js
//
// La carga de la página principal en red móvil (NFR-PERF-2) se mide aparte con Lighthouse.

import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4450';
const VUS = Number(__ENV.VUS || 200);

export const options = {
  stages: [
    { duration: __ENV.SUBIDA || '5m', target: VUS },  // subida de 0 a VUS usuarios
    { duration: __ENV.MESETA || '20m', target: VUS }, // se mantienen VUS usuarios
    { duration: __ENV.BAJADA || '1m', target: 0 },
  ],
  thresholds: {
    'http_req_duration{tipo:crud}': ['p(95)<300'], // CRUD simple bajo 300 ms
    http_req_failed: ['rate<0.01'],                // menos de 1 % de errores
  },
  summaryTrendStats: ['avg', 'min', 'med', 'p(90)', 'p(95)', 'max'],
};

// El JWT de Atlas dura 2 h, así que cada VU inicia sesión una sola vez.
let token = null;

function login() {
  const res = http.post(`${BASE_URL}/autenticacion/login`, JSON.stringify({
    nombre_usuario: __ENV.ATLAS_USER,
    password: __ENV.ATLAS_PASS,
  }), { headers: { 'Content-Type': 'application/json' }, tags: { tipo: 'login' } });

  check(res, { 'login 200': (r) => r.status === 200 });
  return res.status === 200 ? res.json('token') : null;
}

export default function () {
  if (!token) {
    token = login();
    if (!token) return;
  }

  const params = (nombre) => ({
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    tags: { tipo: 'crud', name: nombre },
  });

  if (Math.random() < 0.6) {
    // lecturas: listado de clientes y de contratos de la empresa del token
    const clientes = http.get(`${BASE_URL}/clientes`, params('GET /clientes'));
    check(clientes, { 'listado de clientes 200': (r) => r.status === 200 });

    const contratos = http.get(`${BASE_URL}/contratos`, params('GET /contratos'));
    check(contratos, { 'listado de contratos 200': (r) => r.status === 200 });
  } else {
    // escrituras: crear un cliente de prueba, editarlo y eliminarlo (no deja basura)
    const rut = rutAleatorio();
    const correo = `carga_${__VU}_${__ITER}_${Date.now()}@atlas.test`;
    const nuevo = http.post(`${BASE_URL}/clientes`, JSON.stringify({
      nombre: `Cliente carga ${__VU}-${__ITER}`,
      correo,
      rut,
      telefono: '+56 9 8765 4321',
    }), params('POST /clientes'));
    check(nuevo, { 'cliente creado 201': (r) => r.status === 201 });

    if (nuevo.status === 201) {
      const id = nuevo.json('id');
      const editado = http.put(`${BASE_URL}/clientes/${id}`,
        JSON.stringify({ nombre: `Cliente carga ${__VU}-${__ITER}`, correo, rut, telefono: '+56 9 1234 5678' }), params('PUT /clientes/:id'));
      check(editado, { 'cliente editado 200': (r) => r.status === 200 });
      const borrado = http.del(`${BASE_URL}/clientes/${id}`, null, params('DELETE /clientes/:id'));
      check(borrado, { 'cliente eliminado 200': (r) => r.status === 200 });
    }
  }

  sleep(1);
}

// genera un RUT con digito verificador valido (modulo 11) para no chocar con la validacion
function rutAleatorio() {
  const cuerpo = Math.floor(10000000 + Math.random() * 15000000);
  let suma = 0;
  let mult = 2;
  for (const d of String(cuerpo).split('').reverse()) {
    suma += Number(d) * mult;
    mult = mult === 7 ? 2 : mult + 1;
  }
  const resto = 11 - (suma % 11);
  const dv = resto === 11 ? '0' : resto === 10 ? 'K' : String(resto);
  return `${cuerpo}-${dv}`;
}
