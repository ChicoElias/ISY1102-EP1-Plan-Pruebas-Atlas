# Plan de pruebas – Sistema de Gestión Atlas

Repositorio de la Evaluación Parcial 1 de **Seguridad y Calidad en el Desarrollo de Software** (Duoc UC, sección 004V).

Trabajamos la Forma A del caso semestral: un plan de pruebas de calidad, seguridad y cumplimiento normativo para Atlas, la plataforma de CreaLab SpA para gestionar clientes y contratos de pymes.

**Integrantes:** Elías Delgado Manríquez y Rolando Aldana<br>
**Docente:** Johnnathan René Cubillos Flores

Informe: [PDF](entregables/EP1_ISY1102_Informe_Plan_de_Pruebas_Atlas.pdf) · [Word](entregables/EP1_ISY1102_Informe_Plan_de_Pruebas_Atlas.docx)

## Stack de Atlas (según la ERS)

| | Tecnología | Versión |
|---|---|---|
| Frontend | ![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB) ![MUI](https://img.shields.io/badge/Material_UI-007FFF?style=flat-square&logo=mui&logoColor=white) ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-0F172A?style=flat-square&logo=tailwindcss&logoColor=38BDF8) | React 19.1.1, MUI 7.3.4, Tailwind 3.4.14 |
| Backend | ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white) ![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white) | Express 4.19.2 |
| Base de datos | ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white) | pg 8.12.0 |
| Sesión | ![JWT](https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white) | jsonwebtoken 9.0.2 + bcrypt |

## Herramientas que proponemos para las pruebas

| Tipo de prueba | Herramientas |
|---|---|
| Unitarias y API | ![Jest](https://img.shields.io/badge/Jest-C21325?style=flat-square&logo=jest&logoColor=white) ![Postman](https://img.shields.io/badge/Postman-FF6C37?style=flat-square&logo=postman&logoColor=white) Supertest, Newman |
| End-to-end y compatibilidad | ![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=flat-square&logo=playwright&logoColor=white) BrowserStack |
| Rendimiento | ![k6](https://img.shields.io/badge/k6-7D64FF?style=flat-square&logo=k6&logoColor=white) ![Lighthouse](https://img.shields.io/badge/Lighthouse-F44B21?style=flat-square&logo=lighthouse&logoColor=white) |
| Accesibilidad | axe DevTools, NVDA |
| Seguridad | ![OWASP ZAP](https://img.shields.io/badge/OWASP_ZAP-000000?style=flat-square&logo=owasp&logoColor=white) ![Burp Suite](https://img.shields.io/badge/Burp_Suite-FF6633?style=flat-square&logo=burpsuite&logoColor=white) SonarQube/Semgrep, npm audit |
| Integración continua | ![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat-square&logo=githubactions&logoColor=white) ![Jira](https://img.shields.io/badge/Jira-0052CC?style=flat-square&logo=jira&logoColor=white) |

## Contenido

- `entregables/` informe en Word y PDF con el formato de la pauta.
- `docs/` los mismos capítulos del informe en Markdown, para leerlos directo en GitHub:
  1. [Introducción](docs/01-introduccion.md)
  2. [Criterios de calidad](docs/02-criterios-de-calidad.md)
  3. [Plan de pruebas](docs/03-plan-de-pruebas.md)
  4. [Casos de prueba](docs/04-casos-de-prueba.md)
  5. [Trazabilidad y cobertura](docs/05-trazabilidad-y-cobertura.md)
  6. [Conclusión y referencias](docs/06-conclusion-y-referencias.md)
- `anexos/` matriz de trazabilidad en CSV.
