# 3. Plan de pruebas

## 3.1 Estrategia de pruebas

### Enfoque

Adoptamos un enfoque mixto basado en riesgo. Todo lo que se repite en cada cambio (pruebas unitarias, de API, de control de acceso, regresión, carga y análisis estático) se automatiza dentro de la integración continua (CI). Lo que exige criterio humano (usabilidad con adultos mayores, accesibilidad con lector de pantalla, pruebas exploratorias y test de penetración) se ejecuta de forma manual.

El análisis estático de código (SAST) y de dependencias corre desde el primer commit, siguiendo el principio de *shift-left*: la seguridad se verifica durante el desarrollo y no al final, en línea con la seguridad por diseño que plantea la Ley 21.663.

### Etapas

Siguiendo ISO/IEC/IEEE 29119, el proceso se organiza en cinco etapas:

1. **Planificación:** análisis de la ERS, identificación de riesgos, alcance y este plan.
2. **Diseño:** casos de prueba, datos de prueba y matriz de trazabilidad.
3. **Preparación:** ambiente de aseguramiento de calidad (QA), datos ficticios, herramientas y pipeline.
4. **Ejecución:** unitarias → integración y API → sistema → no funcionales → seguridad → aceptación.
5. **Cierre:** evaluación de criterios de salida e informe de resultados.

![Figura 1](img/figura-1-etapas-de-pruebas.png)

Figura 1. Etapas del proceso de pruebas y su realimentación.

### Priorización

La prioridad resulta de cruzar probabilidad e impacto, con mayor peso cuando hay datos personales o bancarios comprometidos.

| Prioridad | Riesgo | Requerimientos |
|---|---|---|
| P1 | Una empresa accede a datos de otra, o un editor logra escribir | RB-2, RB-4, NFR-SEG-4 |
| P1 | Inyección SQL, XSS o CSRF | NFR-SEG-5 |
| P1 | Sesión válida después del cierre o token manipulado | RF-1.2, NFR-SEG-9 |
| P2 | Estado de contrato mal calculado o validaciones que no se aplican | RF-4, RF-5.4 |
| P2 | Incumplimiento de los umbrales de rendimiento | NFR-PERF |
| P3 | Barreras de usabilidad o diferencias entre navegadores | NFR-USAB, NFR-COMPAT |

Tabla 4. Priorización de riesgos y requerimientos asociados.

### Criterios de entrada y de salida

Para iniciar la ejecución se requiere la ERS aprobada con los supuestos de 2.4 confirmados, el build desplegado en QA con TLS, las pruebas unitarias en verde, datos ficticios cargados y autorización escrita para el pentest.

Las pruebas se dan por terminadas cuando el 100 % de los casos P1 está aprobado, no quedan defectos abiertos de severidad crítica o alta, el escaneo dinámico y el pentest no reportan vulnerabilidades críticas ni altas, se cumplen los umbrales de NFR-PERF, el SUS alcanza 70 o más y el Product Owner aprueba el informe de resultados.

La ejecución se suspende si un defecto bloquea más del 30 % de los casos o si aparece una vulnerabilidad que expone datos; se reanuda tras la corrección, con reprueba y regresión del módulo afectado.

## 3.2 Tipos de prueba

**Funcionales.** Verifican que Atlas haga lo que declara la ERS. Incluyen pruebas unitarias sobre lógica aislada (cálculo del estado del contrato, validación de RUT, política de contraseñas), pruebas de sistema que recorren flujos completos desde la interfaz y regresión automatizada en cada cambio. Las reglas de negocio RB-1 a RB-5 se validan en este nivel.

**Integración.** Comprueban que frontend, API, base de datos y almacenamiento operen en conjunto. El caso representativo es la carga de un documento: pasa por la API, se guarda en el storage interno, se referencia en PostgreSQL y genera un registro de auditoría (RF-5.2, RF-5.3, RF-6.1). Aquí se ejecuta también la colección Swagger/Postman de endpoints críticos que exige la sección 3.1.2 de la ERS.

**Seguridad.** Concentran la mayor prioridad. Comprenden SAST y análisis de dependencias, escaneo dinámico de la aplicación (DAST) en QA, pruebas de control de acceso (escritura con rol editor y acceso a recursos de otra empresa mediante manipulación de identificadores, conocida como IDOR), pruebas de sesión y token, verificación de TLS y cifrado en reposo, y pentest manual con checklist ASVS antes de producción.

**Rendimiento.** Demuestran los umbrales de NFR-PERF: menos de 300 ms en operaciones CRUD simples, carga de la página principal bajo 2 s en red móvil y 200 usuarios concurrentes. Se ejecuta una prueba de carga con la concurrencia esperada y una de estrés para identificar el punto de degradación.

**Usabilidad y accesibilidad.** Sesiones con cinco adultos mayores, como indica la ERS, midiendo tareas completadas, errores y puntaje SUS, junto con la revisión de conformidad WCAG 2.1 AA: contraste, etiquetas ARIA, navegación por teclado y tamaño de los controles táctiles.

**Aceptación.** El Product Owner de CreaLab recorre en preproducción los flujos principales con datos ficticios y confirma que el sistema responde a la necesidad del negocio. Es la última actividad antes del cierre.

**Compatibilidad.** Ejecución de los flujos principales en las dos últimas versiones de Chrome, Firefox, Safari y Edge, y en celular, tablet y escritorio (NFR-COMPAT-1 y 2).

## 3.3 Criterios de aceptación

Además del criterio propio de cada caso, la aprobación exige cumplir estas condiciones transversales:

- **Funcionales.** La operación se completa y persiste correctamente; las validaciones existen también en el backend, de modo que una petición directa a la API con datos inválidos responde 400 o 422; las eliminaciones son lógicas y requieren confirmación.
- **No funcionales.** p95 bajo 300 ms en CRUD simples y carga de página bajo 2 s; tasa de error inferior al 1 % con 200 usuarios concurrentes; sin incumplimientos críticos de WCAG 2.1 AA.
- **Seguridad y reglas de negocio.** Un recurso no autorizado responde 401 o 403 sin revelar su existencia; ningún mensaje expone contraseñas, tokens, trazas ni sentencias SQL; solo los usuarios de la empresa acceden a sus datos y el editor no crea, edita ni elimina.

Los defectos se clasifican en crítico, alto, medio y bajo. Los dos primeros bloquean la liberación; los demás se aceptan con fecha de corrección comprometida. Cada defecto se registra en Jira con pasos de reproducción, evidencia y requerimiento afectado, y avanza por los estados nuevo, asignado, en corrección, listo para verificar y cerrado. Los defectos de seguridad se gestionan con visibilidad restringida al equipo mientras no estén resueltos.

## 3.4 Herramientas utilizadas

| Herramienta | Uso en el proyecto |
|---|---|
| Jest y Supertest | Pruebas unitarias y de endpoints en Express |
| React Testing Library | Pruebas de componentes de la interfaz |
| Swagger y Postman/Newman | Colección de endpoints críticos exigida por la ERS, ejecutable en el pipeline |
| Playwright | Flujos end-to-end en Chromium, Firefox y WebKit, con emulación móvil |
| BrowserStack | Verificación en dispositivos reales |
| k6 | Pruebas de carga y estrés con umbrales configurables |
| Lighthouse | Tiempo de carga en red móvil y auditoría inicial de accesibilidad |
| axe DevTools y NVDA | Revisión WCAG automatizada y navegación con lector de pantalla |
| OWASP ZAP y Burp Suite | Escaneo dinámico y pruebas manuales de token, IDOR y CSRF |
| SonarQube, Semgrep y npm audit | Análisis estático y vulnerabilidades en dependencias |
| GitHub Actions | Ejecución automática de las suites en cada integración |
| Jira | Registro y seguimiento de defectos |

Tabla 5. Herramientas seleccionadas y su uso en el proyecto.

## 3.5 Recursos y cronograma

**Equipo.** Un QA Lead que coordina y aprueba los criterios de salida, dos analistas QA para diseño y ejecución, un ingeniero de automatización a cargo de los scripts, un analista de seguridad para SAST, DAST y pentest, un especialista en experiencia de usuario para las sesiones con usuarios, el equipo de desarrollo para la corrección de defectos y el Product Owner de CreaLab para resolver dudas y aprobar. Las pruebas de usabilidad requieren además cinco participantes adultos mayores.

**Recursos técnicos.** Node.js 20 LTS, las versiones del stack declaradas en la ERS y PostgreSQL; Chrome, Firefox, Safari y Edge; equipos Windows y macOS, celulares Android e iPhone, y tablets.

**Ambientes.** Desarrollo para pruebas unitarias, integración continua para la regresión automatizada, QA como réplica de producción para el resto de las pruebas y preproducción para carga final y aceptación. Ningún ambiente utiliza datos reales de clientes.

| Semana | Actividades | Hito |
|---|---|---|
| 1 | Análisis de la ERS, riesgos y aprobación del plan | Plan aprobado |
| 2 | Casos, datos de prueba, ambiente QA y pipeline | Ambiente operativo |
| 3 | Pruebas funcionales, de integración y de API | Casos P1 funcionales aprobados |
| 4 | Rendimiento, compatibilidad y sesiones de usabilidad | Informe de carga y SUS |
| 5 | Pruebas de seguridad y pentest | Sin hallazgos críticos |
| 6 | Reprueba, regresión, aceptación e informe final | Aceptación formal |

Tabla 6. Cronograma referencial de seis semanas.
