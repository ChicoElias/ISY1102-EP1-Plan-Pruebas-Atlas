// CP-07 - Carga con 200 usuarios concurrentes (NFR-PERF-1, NFR-PERF-3, NFR-DIS-1)
// Mezcla de 60 % lecturas y 40 % escrituras, como dice el caso en el informe.
//
// Uso:
//   k6 run -e BASE_URL=https://qa.atlas.example -e ATLAS_USER=admin.pyme01 -e ATLAS_PASS=... carga_atlas.js
//
// La carga de la página principal en red móvil (NFR-PERF-2) no se mide acá,
// esa parte se hace aparte con Lighthouse.

import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'https://qa.atlas.example';

export const options = {
  stages: [
    { duration: '5m', target: 200 },  // subida de 0 a 200 usuarios
    { duration: '20m', target: 200 }, // se mantienen 200 usuarios
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    'http_req_duration{tipo:crud}': ['p(95)<300'], // CRUD simple bajo 300 ms
    http_req_failed: ['rate<0.01'],                // menos de 1 % de errores
  },
};

// cada usuario virtual hace login y reutiliza su token. Como el JWT dura 15 minutos
// y la prueba dura 26, se vuelve a iniciar sesion a los 13 minutos para no llenar
// el reporte de 401. (las variables a nivel de modulo en k6 son propias de cada VU)
const RENOVAR_MS = 13 * 60 * 1000;
let token = null;
let loginAt = 0;

function login() {
  const res = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    usuario: __ENV.ATLAS_USER,
    password: __ENV.ATLAS_PASS,
  }), { headers: { 'Content-Type': 'application/json' }, tags: { tipo: 'login' } });

  check(res, { 'login 200': (r) => r.status === 200 });
  return res.status === 200 ? res.json('token') : null;
}

export default function () {
  if (!token || Date.now() - loginAt > RENOVAR_MS) {
    token = login();
    loginAt = Date.now();
    if (!token) return;
  }

  const params = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    tags: { tipo: 'crud' },
  };

  if (Math.random() < 0.6) {
    // lecturas: listado paginado de clientes y de contratos
    const clientes = http.get(`${BASE_URL}/api/clientes?page=1&size=20`, params);
    check(clientes, { 'listado de clientes 200': (r) => r.status === 200 });

    const contratos = http.get(`${BASE_URL}/api/contratos?page=1&size=20`, params);
    check(contratos, { 'listado de contratos 200': (r) => r.status === 200 });
  } else {
    // escrituras: crear un cliente de prueba y editarlo
    const rut = rutAleatorio();
    const nuevo = http.post(`${BASE_URL}/api/clientes`, JSON.stringify({
      razonSocial: `Cliente carga ${__VU}-${__ITER}`,
      rut: rut,
      telefono: '+56 9 8765 4321',
    }), params);
    check(nuevo, { 'cliente creado 201': (r) => r.status === 201 });

    if (nuevo.status === 201) {
      const editado = http.put(`${BASE_URL}/api/clientes/${nuevo.json('id')}`,
        JSON.stringify({ telefono: '+56 9 1234 5678' }), params);
      check(editado, { 'cliente editado 200': (r) => r.status === 200 });
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
