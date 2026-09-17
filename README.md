# Plan de Pruebas – Sistema de Gestión Atlas

**ISY1102 – Seguridad y Calidad en el Desarrollo de Software**<br>
Evaluación Parcial N°1 · Encargo grupal (17 %) · Caso semestral, Forma A

Repositorio del informe semestral, iteración 1: diseño de un plan de pruebas orientado a garantizar la calidad, la seguridad y la conformidad legal de **Atlas**, plataforma web de gestión de clientes y contratos para pymes chilenas (CreaLab SpA; React + Express + PostgreSQL).

---

## Equipo

- Elías Robinson Delgado Manríquez
- _[Nombre Apellido integrante 2]_

**Carrera:** Ingeniería en Informática · **Sección:** _[XXXX]_ · **Docente:** _[Nombre docente]_

---

## Estado de avance

| Apartado solicitado en la pauta | Documento | Estado |
|---|---|---|
| 1. Introducción: contexto, clasificación del producto y propósito | [01-introduccion](docs/01-introduccion.md) | ✅ Completo |
| 2. Criterios de calidad, seguridad y cumplimiento normativo | [02-criterios](docs/02-criterios-calidad-seguridad-normativa.md) | ✅ Completo |
| 3. Tipos de prueba y su justificación | [03-tipos-de-prueba](docs/03-tipos-de-prueba.md) | ✅ Completo |
| 4. Estrategia de pruebas y justificación | [04-estrategia](docs/04-estrategia-de-pruebas.md) | ✅ Completo |
| Criterios de aceptación transversales | [05-criterios-de-aceptacion](docs/05-criterios-de-aceptacion.md) | ✅ Completo |
| Herramientas utilizadas | [06-herramientas](docs/06-herramientas.md) | ✅ Completo |
| 5. Recursos necesarios (humanos, técnicos y de entorno) | [07-recursos](docs/07-recursos.md) | ✅ Completo |
| Cronograma de ejecución | [08-cronograma](docs/08-cronograma.md) | ✅ Completo |
| 6. Diseño de casos de prueba (13 casos, mínimo exigido: 5) | [09-casos-de-prueba](docs/09-casos-de-prueba.md) | ✅ Completo |
| Matriz de trazabilidad requerimiento – prueba – norma | [10-matriz](docs/10-matriz-trazabilidad.md) · [CSV](anexos/matriz-trazabilidad.csv) | ✅ Completo |
| Análisis de cobertura y coherencia | [11-analisis-cobertura](docs/11-analisis-cobertura.md) | ✅ Completo |
| Informe consolidado (Word y PDF, formato de la pauta) | [entregables/](entregables/) | ✅ Completo |
| Revisión final de portada y entrega en AVA | — | ⏳ Pendiente |

---

## Resumen del plan

- **Clasificación del producto:** sistema de información transaccional multiempresa que trata datos personales y bancarios; criticidad media-alta en calidad y alta en seguridad y cumplimiento.
- **Enfoque:** mixto (automatizado + manual) y basado en riesgo, con seguridad desde el inicio del desarrollo (*shift-left*).
- **Marco de referencia:** ISO/IEC 25010, ISO/IEC 27001:2022, ISO/IEC/IEEE 29119, OWASP Top 10 y ASVS, WCAG 2.1 AA, Ley 19.628, Ley 21.719, Ley 21.663, Ley 21.459 y Ley 17.336.
- **Casos de prueba:** 13 (5 funcionales, 5 de seguridad, 3 no funcionales), priorizados P1–P3.
- **Trazabilidad:** 42 requerimientos de la ERS trazados (100 %); 37 con caso detallado (88 %).
- **Herramientas principales:** Jest, Supertest, Postman/Newman, Playwright, k6, Lighthouse, axe, OWASP ZAP, Burp Suite, SonarQube, GitHub Actions y Jira/Xray.

## Relación con la pauta de evaluación

| Indicador | Dónde se evidencia |
|---|---|
| IE1 – Importancia de la calidad, seguridad y cumplimiento legal | Secciones 1.2, 2 y 2.4 |
| IE2 – Clasificación de tipos de prueba y su propósito | Sección 3 |
| IE3 – Pruebas no funcionales con propósito y contexto | Secciones 3.2, CP-11, CP-12, CP-13 |
| IE4 – Elementos del plan y vínculo con requerimientos y normativas | Secciones 1.4, 4, 5, 6, 7, 8 y 10 |
| IE5 – Cobertura, pertinencia y coherencia del plan | Sección 11 |

## Estructura del repositorio

```
.
├── README.md
├── docs/                         Informe por secciones (Markdown)
│   ├── 01-introduccion.md
│   ├── 02-criterios-calidad-seguridad-normativa.md
│   ├── 03-tipos-de-prueba.md
│   ├── 04-estrategia-de-pruebas.md
│   ├── 05-criterios-de-aceptacion.md
│   ├── 06-herramientas.md
│   ├── 07-recursos.md
│   ├── 08-cronograma.md
│   ├── 09-casos-de-prueba.md
│   ├── 10-matriz-trazabilidad.md
│   └── 11-analisis-cobertura.md
├── anexos/
│   └── matriz-trazabilidad.csv   Matriz en formato tabular
└── entregables/
    ├── EP1_ISY1102_Informe_Plan_de_Pruebas_Atlas.docx
    └── EP1_ISY1102_Informe_Plan_de_Pruebas_Atlas.pdf
```

## Documento base

Especificación de Requerimientos de Software *Sistema de Gestión Atlas*, v1.1 (CreaLab SpA, abril de 2026), entregada por el docente como Forma A del caso semestral. El documento original no se publica en este repositorio por tratarse de material del curso.
