<p align="center">
  <img src="assets/duoc.png" alt="Duoc UC" width="260">
</p>

<h1 align="center">Atlas: verificación de seguridad y calidad</h1>

<p align="center">
  Suite QA del <b>Grupo 15</b> (ISY1102, Duoc UC) para <b>Atlas</b>, la plataforma de CreaLab SpA con la que las pymes gestionan clientes, contratos y documentos.
</p>

## Propósito

Verificar el código oficial de Atlas (Caso A, Docker) contra la ERS: requerimientos funcionales (RF), reglas de negocio (RB) y no funcionales (NFR) de seguridad, rendimiento, accesibilidad y compatibilidad. El marco de referencia es la Ley 19.628 / 21.719 de datos personales, OWASP Top 10 y WCAG 2.1 AA.

## Stack probado

| Capa | Tecnología | Puerto host |
|---|---|---|
| Frontend | React 19 · MUI 7 · Tailwind · Vite 7 · nginx | `3350` |
| Backend | Node 18 · Express 4 · JWT · multer · Swagger (`/docs`) | `4450` |
| Base de datos | PostgreSQL 15 | `15432` |

## Flujo QA

```mermaid
flowchart LR
  A[Docker<br/>docker-compose up] --> B[SAST<br/>npm audit + ESLint]
  B --> C[API / DAST<br/>Newman + k6]
  C --> D[Playwright<br/>axe-core 375px · 1440px]
  D --> E[PostgreSQL<br/>psql en contenedor]
  E --> F[Matriz + reporte]
```

## Estructura

```
pruebas/
  api/           colección Postman (48 requests, IDs de requerimiento en cada aserción) + preparar-datos.js
  e2e/           capturas de despliegue, auditoría de accesibilidad, flujo principal (CP-09)
  rendimiento/   carga_atlas.js (k6, perfil configurable por variables)
  sast/          sast-atlas.js: npm audit backend/frontend + ESLint
  reportes/      renderizado de evidencias (HTML → PNG con marca de tiempo)
  usabilidad/    guion de sesión SUS
anexos/          matriz de trazabilidad (estado, captura, incidente) y planilla de casos
laboratorio/     ambiente QA local usado en EP3
docs/            informes EP1 / EP3 y defensa EP4
```

## Comandos rápidos

```bash
# 1. SUT oficial (carpeta hermana)
cd ../CodigoFuenteETA && docker-compose up -d --build

# 2. Suite
cd ../ISY1102-EP1-Plan-Pruebas-Atlas
npm install && npx playwright install chromium
npm run preparar           # qa_lockout + environment local (*.local.json, fuera de git)
npm run test:api:docker    # RF / RB / NFR-SEG vía Newman
npm run test:sast
npm run test:a11y          # NFR-USAB-1, NFR-COMPAT-2
npm run evidencias         # CAP-02, CAP-04..CAP-07

# carga sin k6 local, desde la red de Docker
docker run --rm -i --network atlas-network -e BASE_URL=http://atlas-backend:4000 \
  -e ATLAS_USER=admin -e ATLAS_PASS=... -e VUS=10 -e SUBIDA=15s -e MESETA=45s -e BAJADA=5s \
  grafana/k6 run - < pruebas/rendimiento/carga_atlas.js
```

Las evidencias se escriben en `../evidencias-release/` (`capturas/`, `logs/`, `html/` y `REPORTE_VERIFICACION_ATLAS_V2.md`).

## Cobertura y hallazgos (release v2, 2026-11-26)

22 requerimientos ejecutados: **7 PASS · 15 FAIL**. El detalle está en [`anexos/matriz-trazabilidad.csv`](anexos/matriz-trazabilidad.csv).

| Requerimiento | Estado | Severidad | Hallazgo |
|---|---|---|---|
| RF-3.2 · RB-4 · NFR-SEG-4 | FAIL | Crítico | El backend no aplica roles: el editor crea, edita y elimina |
| RB-2 | FAIL | Crítico | IDOR: contratos, PDF y usuarios de otra empresa accesibles por id |
| NFR-SEG-2 | FAIL | Crítico | Contraseñas en texto plano (0/9 con bcrypt) |
| RF-1.3 | FAIL | Grave | Sin bloqueo tras 5 intentos fallidos |
| R-2.4 | FAIL | Grave | Acepta contraseñas de 4 caracteres |
| SAST-1 | FAIL | Grave | 1 critical y 22 high entre backend y frontend; base Node 18 EOL |
| NFR-PERF-1 | FAIL | Grave | p95 CRUD de 4004 ms por `delay(4000)` en login y listados |
| NFR-SEG-5 · RF-4.3 | FAIL | Moderado | SQLi neutralizada; `<script>` se persiste sin sanitizar |
| RF-5.4 | FAIL | Moderado | No existe el estado `activo` |
| RF-6.1 | FAIL | Moderado | Los logins fallidos no se auditan |
| NFR-USAB-1 | FAIL | Moderado | Texto de 10.5px, contraste, botones sin nombre, objetivos < 44px |
| NFR-COMPAT-2 | FAIL | Moderado | En 375px el contenido queda en 135px (drawer permanente) |
| RF-1.1 · RF-2.1 · RF-2.2 · RF-4.1 · RF-5.1 · RF-5.2 · RF-5.3 | PASS | — | Login JWT, registro, alta de cliente y contrato, PDF en 52 ms y recuperable |

## Evolución del trabajo

- **EP1: plan.** Definimos criterios, estrategia y los 9 casos (CP-01 a CP-09), con la matriz de trazabilidad, la colección Postman, el flujo Playwright, el script k6 y el guion SUS. Todo apuntaba a un ambiente QA que todavía no existía.
- **EP3: ejecución en laboratorio.** Sin ambiente QA disponible, armamos `laboratorio/` a partir de la ERS y ejecutamos ahí los casos (4 pase, 2 fallo). El IDOR y el XSS almacenado ya aparecieron en esa etapa.
- **EP4: defensa.** Presentamos los hallazgos y la lectura ético-normativa.
- **Release v2: código oficial.** Con el SUT oficial en Docker, alineamos la suite al contrato real (`openapi.json` y `routes/`) y agregamos un usuario dedicado para el bloqueo, la auditoría con axe-core, SAST sobre el SUT y evidencias con marca de tiempo. El código oficial no implementa varios controles que el laboratorio sí modelaba desde la ERS (roles en backend, hash de contraseñas, bloqueo), por eso aquí fallan casos que antes pasaban.

## Grupo

**Grupo 15**: Elías Delgado Manríquez y Rolando Aldana · **Docente**: Johnnathan René Cubillos Flores
