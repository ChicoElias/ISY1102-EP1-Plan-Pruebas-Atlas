# Plan de pruebas - Sistema de Gestión Atlas

Evaluación Parcial 1 de **Seguridad y Calidad en el Desarrollo de Software (ISY1102)**, sección 004V, Duoc UC.

Trabajamos la Forma A del caso semestral: el plan de pruebas de Atlas, la plataforma web de CreaLab SpA para que pymes chilenas gestionen clientes, contratos y documentos. El plan abarca calidad del producto, seguridad y cumplimiento normativo, y se basa en la ERS v1.1 del caso.

**Grupo 15:** Elías Delgado Manríquez y Rolando Aldana

**Docente:** Johnnathan René Cubillos Flores

## Estructura

```
├── informe/                  informe del plan de pruebas (Word y PDF)
├── anexos/
│   ├── matriz-trazabilidad.csv   Anexo A: requerimiento → caso → norma
│   └── casos-de-prueba.xlsx      los 9 casos en planilla, con estado de ejecución
├── pruebas/
│   ├── api/                  colección Postman de endpoints críticos (CP-01 a CP-06)
│   ├── e2e/                  Playwright para compatibilidad entre navegadores (CP-09)
│   ├── rendimiento/          script k6 de carga con 200 usuarios (CP-07)
│   └── usabilidad/           guion de la sesión con adultos mayores y cuestionario SUS (CP-08)
├── .github/workflows/        pipeline que corre las suites en GitHub Actions
└── package.json              comandos para ejecutar las pruebas
```

## Dónde está cada parte en el informe

| Contenido | Sección del informe |
|---|---|
| Contexto de Atlas y clasificación según calidad, seguridad y cumplimiento | 1.1 y 1.2 |
| Criterios de calidad (ISO/IEC 25010) y de seguridad (OWASP Top 10, ASVS) | 2.1 y 2.2 |
| Normativa chilena e internacional aplicable | 2.3 |
| Ambigüedades de la ERS y supuestos que asumimos | 2.4 |
| Estrategia, priorización por riesgo, criterios de entrada y salida | 3.1 |
| Tipos de prueba, criterios de aceptación, herramientas, recursos y cronograma | 3.2 a 3.5 |
| Casos de prueba CP-01 a CP-09 | 4 |
| Cobertura de los 42 requerimientos y coherencia del plan | 5 |
| Matriz de trazabilidad completa | Anexo A (también en `anexos/`) |

## Resumen del plan

- 9 casos de prueba: tres funcionales, tres de seguridad y tres no funcionales.
- Los 42 requerimientos de la ERS quedan trazados: 27 con caso detallado y 15 con una suite automatizada o una actividad planificada.
- La prioridad la pone el riesgo de exponer datos de terceros: que una empresa acceda a datos de otra, que el rol editor logre escribir, la sesión que sigue válida y la inyección SQL, XSS o CSRF.
- Normas de referencia: ISO/IEC 25010, ISO/IEC 27001:2022, ISO/IEC/IEEE 29119, OWASP Top 10, ASVS nivel 2, WCAG 2.1 AA y las leyes 19.628, 21.719, 21.663, 21.459 y 17.336.

## Pruebas automatizadas

Atlas todavía no tiene ambiente QA, así que los scripts de `pruebas/` quedan listos para ejecutarse cuando CreaLab lo entregue. Las rutas de la API y los selectores de pantalla siguen lo que definimos en los casos del informe y se ajustan cuando tengamos el sistema real.

Las contraseñas de los usuarios de prueba no están en el repositorio: se pasan como variables de entorno o como secrets en GitHub (`ATLAS_BASE_URL`, `ATLAS_ADMIN_PASS`, `ATLAS_EDITOR_PASS`).

```bash
npm install
npx playwright install

npm run test:api     # colección Postman con Newman
npm run test:e2e     # Playwright en Chromium, Firefox, WebKit, tablet y celular
npm run test:carga   # k6 (requiere tener k6 instalado)
```

La sesión de usabilidad (CP-08) es presencial y se guía con `pruebas/usabilidad/guion-sesion-sus.md`. El escaneo con OWASP ZAP y el pentest manual (CP-06) se hacen solo con autorización escrita de CreaLab, como indica la Ley 21.459.
