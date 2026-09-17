# Plan de Pruebas – Sistema de Gestión Atlas

**ISY1102 – Seguridad y Calidad en el Desarrollo de Software**<br>
Evaluación Parcial N°1 · Encargo grupal (17 %) · Caso semestral, Forma A

En este repositorio está el informe de la primera iteración del caso semestral: un plan de pruebas para **Atlas**, plataforma web de CreaLab SpA para que pymes chilenas gestionen clientes, contratos y documentos. El plan cubre calidad, seguridad y cumplimiento normativo, y cada prueba está trazada a los requerimientos de la ERS.

## Datos del curso

| | |
|---|---|
| **Institución** | Duoc UC – Escuela de Informática y Telecomunicaciones |
| **Asignatura** | ISY1102 – Seguridad y Calidad en el Desarrollo de Software |
| **Sección** | 004V |
| **Docente** | Johnnathan René Cubillos Flores |
| **Integrantes** | Elías Robinson Delgado Manríquez<br>Rolando Aldana |
| **Período** | 2026-2 |

## Sistema bajo prueba

Atlas es una SPA en React que consume una API REST en Express sobre PostgreSQL. Estas son las dependencias principales declaradas en la ERS:

| Capa | Tecnología | Versión |
|---|---|---|
| Frontend | ![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB) ![MUI](https://img.shields.io/badge/Material_UI-007FFF?style=flat-square&logo=mui&logoColor=white) ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-0F172A?style=flat-square&logo=tailwindcss&logoColor=38BDF8) ![Axios](https://img.shields.io/badge/Axios-5A29E4?style=flat-square&logo=axios&logoColor=white) | React 19.1.1 · MUI 7.3.4 · Tailwind 3.4.14 · axios 1.13.1 |
| Backend | ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white) ![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white) | Express 4.19.2 · cors 2.8.5 |
| Base de datos | ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white) | pg 8.12.0 |
| Autenticación | ![JWT](https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white) | jsonwebtoken 9.0.2 · contraseñas con bcrypt |

## Herramientas propuestas para las pruebas

El detalle y la justificación de cada herramienta están en [06-herramientas](docs/06-herramientas.md).

| Tipo de prueba | Herramienta | Uso en Atlas |
|---|---|---|
| Unitarias e integración de API | ![Jest](https://img.shields.io/badge/Jest-C21325?style=flat-square&logo=jest&logoColor=white) Supertest | Servicios y endpoints de Express |
| Componentes | ![Testing Library](https://img.shields.io/badge/Testing_Library-E33332?style=flat-square&logo=testinglibrary&logoColor=white) | Formularios de login, registro y clientes |
| API y contrato | ![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=flat-square&logo=swagger&logoColor=black) ![Postman](https://img.shields.io/badge/Postman-FF6C37?style=flat-square&logo=postman&logoColor=white) | Colección de endpoints críticos con Newman |
| End-to-end y compatibilidad | ![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=flat-square&logo=playwright&logoColor=white) ![BrowserStack](https://img.shields.io/badge/BrowserStack-E66F32?style=flat-square) | Flujos completos en Chrome, Firefox, Safari y Edge |
| Carga y rendimiento | ![k6](https://img.shields.io/badge/k6-7D64FF?style=flat-square&logo=k6&logoColor=white) ![Lighthouse](https://img.shields.io/badge/Lighthouse-F44B21?style=flat-square&logo=lighthouse&logoColor=white) | 200 usuarios concurrentes y carga en móvil |
| Accesibilidad y usabilidad | axe DevTools · NVDA · SUS | WCAG 2.1 AA y pruebas con adultos mayores |
| Seguridad | ![OWASP ZAP](https://img.shields.io/badge/OWASP_ZAP-000000?style=flat-square&logo=owasp&logoColor=white) ![Burp Suite](https://img.shields.io/badge/Burp_Suite-FF6633?style=flat-square&logo=burpsuite&logoColor=white) SonarQube ![Semgrep](https://img.shields.io/badge/Semgrep-2B2B2B?style=flat-square) ![Dependabot](https://img.shields.io/badge/Dependabot-025E8C?style=flat-square&logo=dependabot&logoColor=white) | DAST, pentest, SAST y dependencias |
| Integración continua y gestión | ![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat-square&logo=githubactions&logoColor=white) ![Jira](https://img.shields.io/badge/Jira-0052CC?style=flat-square&logo=jira&logoColor=white) | Ejecución automática y registro de defectos |

Así se ordenan en el flujo de trabajo:

```
push / pull request
      │
      ▼
SAST + dependencias (SonarQube/Semgrep, npm audit)
      │
      ▼
Unitarias y API (Jest, Supertest, Newman)
      │
      ▼
End-to-end (Playwright)  ──►  Ambiente QA
                                  │
                ┌─────────────────┼─────────────────┐
                ▼                 ▼                 ▼
          Carga (k6)       DAST (OWASP ZAP)   Usabilidad y
                                              accesibilidad
```

## Resumen del plan

- Enfoque mixto (automatizado y manual) basado en riesgo, con prioridades P1 a P3.
- 13 casos de prueba: 5 funcionales, 5 de seguridad y 3 no funcionales.
- 42 requerimientos de la ERS trazados; 37 con caso detallado (88 %).
- Referencias: ISO/IEC 25010, ISO/IEC 27001:2022, ISO/IEC/IEEE 29119, OWASP Top 10 y ASVS, WCAG 2.1 AA, Ley 19.628, Ley 21.719, Ley 21.663, Ley 21.459 y Ley 17.336.
- En el análisis de la ERS dejamos anotadas ambigüedades y brechas para la iteración 2.

## Avance

| Apartado de la pauta | Documento | Estado |
|---|---|---|
| 1. Introducción, clasificación del producto y alcance | [01-introduccion](docs/01-introduccion.md) | Completo |
| 2. Criterios de calidad, seguridad y cumplimiento normativo | [02-criterios](docs/02-criterios-calidad-seguridad-normativa.md) | Completo |
| 3. Tipos de prueba y justificación | [03-tipos-de-prueba](docs/03-tipos-de-prueba.md) | Completo |
| 4. Estrategia de pruebas | [04-estrategia](docs/04-estrategia-de-pruebas.md) | Completo |
| Criterios de aceptación | [05-criterios-de-aceptacion](docs/05-criterios-de-aceptacion.md) | Completo |
| Herramientas | [06-herramientas](docs/06-herramientas.md) | Completo |
| 5. Recursos humanos, técnicos y de entorno | [07-recursos](docs/07-recursos.md) | Completo |
| Cronograma | [08-cronograma](docs/08-cronograma.md) | Completo |
| 6. Diseño de casos de prueba | [09-casos-de-prueba](docs/09-casos-de-prueba.md) | Completo |
| Matriz de trazabilidad | [10-matriz](docs/10-matriz-trazabilidad.md) · [CSV](anexos/matriz-trazabilidad.csv) | Completo |
| Análisis de cobertura y coherencia | [11-analisis-cobertura](docs/11-analisis-cobertura.md) | Completo |
| Informe en Word y PDF | [entregables](entregables/) | Completo |

## Relación con la pauta

| Indicador | Dónde está |
|---|---|
| IE1 – Importancia de la calidad, seguridad y cumplimiento legal | Secciones 1.2, 2 y 2.4 |
| IE2 – Tipos de prueba y su propósito | Sección 3 |
| IE3 – Pruebas no funcionales en contexto | Sección 3.2 y casos CP-11, CP-12 y CP-13 |
| IE4 – Elementos del plan y vínculo con requerimientos y normas | Secciones 4 a 8 y 10 |
| IE5 – Cobertura y coherencia del plan | Sección 11 |

## Estructura

```
.
├── README.md
├── docs/
│   ├── 01-introduccion.md                          contexto, clasificación y alcance
│   ├── 02-criterios-calidad-seguridad-normativa.md ISO/IEC 25010, OWASP y leyes
│   ├── 03-tipos-de-prueba.md                       funcionales, no funcionales y seguridad
│   ├── 04-estrategia-de-pruebas.md                 enfoque, etapas, prioridades, entrada/salida
│   ├── 05-criterios-de-aceptacion.md               criterios comunes a todos los casos
│   ├── 06-herramientas.md                          herramientas y su justificación
│   ├── 07-recursos.md                              roles, equipos y ambientes
│   ├── 08-cronograma.md                            planificación de seis semanas
│   ├── 09-casos-de-prueba.md                       CP-01 a CP-13
│   ├── 10-matriz-trazabilidad.md                   requerimiento, caso y norma
│   └── 11-analisis-cobertura.md                    cobertura, brechas y conclusión
├── anexos/
│   └── matriz-trazabilidad.csv
└── entregables/
    ├── EP1_ISY1102_Informe_Plan_de_Pruebas_Atlas.docx
    └── EP1_ISY1102_Informe_Plan_de_Pruebas_Atlas.pdf
```

## Documento base

ERS *Sistema de Gestión Atlas* v1.1 (CreaLab SpA, abril de 2026), entregada por el docente como Forma A del caso semestral. No se incluye en el repositorio por ser material del curso.
