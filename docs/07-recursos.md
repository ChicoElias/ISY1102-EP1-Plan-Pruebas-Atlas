# 7. Recursos necesarios

## 7.1 Recursos humanos

| Rol | Cantidad | Responsabilidades |
|---|---|---|
| QA Lead | 1 | Planificación, priorización, seguimiento de criterios de salida e informe final |
| Analista QA funcional | 2 | Diseño y ejecución de casos funcionales, API, regresión y UAT |
| Ingeniero de automatización | 1 | Scripts Playwright, Jest, Newman y k6; integración con CI |
| Analista de seguridad | 1 | SAST, DAST, pentest autorizado y revisión de cifrado |
| Especialista UX/accesibilidad | 1 | Pruebas con adultos mayores, SUS y auditoría WCAG |
| Desarrolladores backend y frontend | 2 | Corrección de defectos y soporte de pruebas unitarias |
| DevOps | 1 | Ambientes, TLS, respaldos y monitoreo |
| Product Owner (CreaLab) | 1 | Resolución de ambigüedades y aprobación de UAT |
| Asesor legal (apoyo) | 1 | Validación de criterios de protección de datos |
| Usuarios representativos | 5 | Adultos mayores para pruebas de usabilidad (criterio 3.1.1) |

## 7.2 Recursos técnicos

- **Software:** Node.js 20 LTS, React 19.1.1, Express 4.19.2, PostgreSQL 16, pg 8.12.0, jsonwebtoken 9.0.2 y las herramientas de la sección 6.
- **Navegadores:** Chrome, Firefox, Safari y Edge en sus dos últimas versiones estables.
- **Dispositivos:** notebook Windows 11 y macOS; smartphone Android e iPhone; tablet Android y iPad.
- **Resoluciones de referencia:** 360 px, 768 px, 1366 px y 1920 px.
- **Red:** perfiles de conexión 4G y 3G simulados para NFR-PERF-2.

## 7.3 Entornos de prueba

| Entorno | Uso | Características |
|---|---|---|
| Desarrollo (DEV) | Pruebas unitarias y de componentes | Local o contenedores Docker; datos sintéticos |
| Integración continua (CI) | Regresión automatizada, SAST y SCA | GitHub Actions en cada push y pull request |
| QA / Staging | Pruebas de sistema, API, seguridad, rendimiento y usabilidad | Réplica de producción con TLS, storage interno y BD cifrada; datos ficticios o anonimizados |
| Preproducción | UAT y prueba final de carga | Configuración idéntica a producción |

Los datos personales reales no se usan en ningún ambiente de prueba. Esta decisión responde al principio de minimización de la Ley 21.719 y evita que un ambiente con menos controles se convierta en una fuente de filtración.
