# 2. Criterios de calidad

Cada criterio de este capítulo se amarra a un requerimiento de la ERS y a una norma, de modo que después pueda verificarse con una prueba concreta.

## 2.1 Calidad del producto

Tomamos como referencia el modelo de calidad de producto ISO/IEC 25010 y nos concentramos en las características para las que la ERS define un umbral verificable.

| Característica | Criterio aplicado a Atlas | Requerimiento | Métrica |
|---|---|---|---|
| Adecuación funcional | CRUD, estados de contrato y roles operan correctamente | RF-1 a RF-6 | Casos funcionales aprobados |
| Eficiencia de desempeño | Respuesta acotada bajo carga normal | NFR-PERF-1 a 3 | p95 < 300 ms, carga < 2 s, 200 usuarios |
| Usabilidad | Pantallas legibles y flujos claros para adultos mayores | NFR-USAB-1 a 4 | SUS ≥ 70, sin bloqueos |
| Confiabilidad | Disponibilidad y recuperación ante fallos | NFR-DIS-1, NFR-SEG-7 | Uptime ≥ 99,5 %, respaldo restaurable |
| Compatibilidad | Operación en los navegadores exigidos | NFR-COMPAT-1 y 2 | Matriz de navegadores sin defectos bloqueantes |
| Mantenibilidad | Cambios y migraciones sin romper lo existente | NFR-DIS-2 | Regresión automatizada por integración |

Tabla 2. Criterios de calidad del producto según ISO/IEC 25010.

La seguridad, que también integra el modelo, se desarrolla en 2.2 por su peso en este proyecto. La portabilidad se aborda con menor profundidad porque la ERS no fija métricas más allá del diseño responsivo.

## 2.2 Seguridad

Los criterios se apoyan en OWASP Top 10 (2021) y en el nivel 2 del Application Security Verification Standard (ASVS) de OWASP, recomendado para aplicaciones que tratan datos personales.

- **Protección de datos:** TLS en todas las comunicaciones y cifrado de los datos bancarios en reposo (NFR-SEG-1, NFR-SEG-3).
- **Control de acceso:** la autorización se resuelve en el backend según rol y empresa del usuario, no ocultando controles en la interfaz (NFR-SEG-4, RB-2, RB-4).
- **Autenticación y sesión:** contraseñas con bcrypt, política de 12 caracteres con complejidad y JWT de corta vigencia que se invalida al cerrar sesión (RF-1, NFR-SEG-2, NFR-SEG-9).
- **Validación de entradas:** saneamiento contra inyección SQL (SQLi), Cross-Site Scripting (XSS) y Cross-Site Request Forgery (CSRF), con consultas parametrizadas (NFR-SEG-5).
- **Trazabilidad:** registro de auditoría de las acciones críticas, sin datos sensibles en los registros (RF-6.1, NFR-SEG-6).
- **Manejo de errores:** mensajes comprensibles para el usuario, sin trazas de pila ni detalles de la base de datos (NFR-USAB-3).

## 2.3 Normativas

| Norma | Aplicación a Atlas |
|---|---|
| Ley 19.628, protección de la vida privada | El sistema almacena nombres, contactos, Rol Único Tributario (RUT) y datos bancarios de clientes |
| Ley 21.719, protección de datos personales (vigencia prevista para diciembre de 2026) | Exige seguridad, proporcionalidad y responsabilidad proactiva: hay que poder demostrar las medidas adoptadas |
| Ley 21.663, marco de ciberseguridad | Referencia de seguridad desde el diseño y de gestión de incidentes |
| Ley 21.459, delitos informáticos | Obliga a impedir y registrar accesos no autorizados; el pentest se ejecuta solo con autorización escrita |
| Ley 17.336, propiedad intelectual | Revisión de licencias de las librerías de terceros del proyecto |
| ISO/IEC 25010, ISO/IEC 27001:2022, ISO/IEC/IEEE 29119 | Modelo de calidad, controles de seguridad de la información y proceso de pruebas |
| WCAG 2.1 nivel AA | Accesibilidad web, exigible por el perfil de usuario adulto mayor |

Tabla 3. Normas y estándares aplicables al proyecto.

## 2.4 Observaciones a la ERS

La lectura de la ERS dejó puntos ambiguos que afectan los criterios de aceptación y que conviene resolver con CreaLab. Mientras tanto, se trabajan como supuestos declarados:

1. La ERS fija una tipografía de 12 px, insuficiente para el público adulto mayor declarado en el alcance. Se propone un mínimo de 16 px para el texto base.
2. RF-4.1 indica que "los usuarios" crean clientes, mientras que RB-4 restringe al editor a solo lectura. Se asume que prevalece RB-4.
3. RF-5.2 no define tamaño máximo de archivo. Se asume 10 MB y validación del tipo real del archivo.
4. RF-5.4 menciona el estado "vence" sin umbral. Se asume 30 días antes de la fecha de término.
5. NFR-USAB exige un "score de usabilidad mínimo aceptable" sin cifra. Se adopta System Usability Scale (SUS) ≥ 70.
6. No existen requerimientos de consentimiento, derechos del titular ni notificación de brechas, exigibles bajo la Ley 21.719.
