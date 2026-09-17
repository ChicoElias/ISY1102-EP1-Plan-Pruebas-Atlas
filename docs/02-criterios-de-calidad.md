# 2. Criterios de calidad

En este capítulo definimos qué estándares debe cumplir Atlas. Cada criterio está amarrado a un requerimiento de la ERS para que después se pueda probar.

## 2.1 Calidad del producto

Usamos como referencia el modelo ISO/IEC 25010. No todas sus características pesan lo mismo en Atlas, así que nos enfocamos en las que la ERS define con algún umbral:

| Característica | Qué esperamos de Atlas | Requerimiento | Cómo se mide |
|---|---|---|---|
| Adecuación funcional | CRUD, estados de contrato y roles funcionan correctamente | RF-1 a RF-6 | Casos funcionales aprobados |
| Eficiencia de desempeño | Respuestas rápidas con carga normal | NFR-PERF-1 a 3 | p95 < 300 ms, carga < 2 s, 200 usuarios |
| Usabilidad | Pantallas legibles y flujos claros para adultos mayores | NFR-USAB-1 a 4 | SUS ≥ 70 y sin bloqueos |
| Confiabilidad | Disponibilidad y recuperación ante fallos | NFR-DIS-1, NFR-SEG-7 | Uptime ≥ 99,5 %, respaldo restaurable |
| Compatibilidad | Funciona en los navegadores indicados | NFR-COMPAT-1 y 2 | Sin defectos bloqueantes en la matriz de navegadores |
| Mantenibilidad | Cambios y migraciones sin romper lo existente | NFR-DIS-2 | Regresión automatizada en cada integración |

## 2.2 Seguridad

Aquí tomamos como base OWASP Top 10 (2021) y el nivel 2 de OWASP ASVS, que es el recomendado para aplicaciones con datos personales. Los criterios que aplican a Atlas son:

- **Protección de datos:** TLS en todas las comunicaciones y cifrado de los datos bancarios en la base de datos (NFR-SEG-1, NFR-SEG-3).
- **Control de acceso:** la autorización se valida en el backend según el rol y la empresa del usuario, no solo ocultando botones en la interfaz (NFR-SEG-4, RB-2, RB-4).
- **Autenticación:** contraseñas con bcrypt y política de 12 caracteres con complejidad; tokens JWT de corta vigencia que se invalidan al cerrar sesión (RF-1, NFR-SEG-2, NFR-SEG-9).
- **Manejo de errores:** mensajes entendibles para el usuario, sin mostrar trazas, consultas SQL ni detalles internos (NFR-USAB-3).
- **Integridad:** validación y saneamiento de entradas contra SQL Injection, XSS y CSRF (NFR-SEG-5), y registro de auditoría de las acciones críticas (RF-6.1, NFR-SEG-6).

## 2.3 Normativas

| Norma | Por qué aplica a Atlas |
|---|---|
| Ley 19.628, protección de la vida privada | Atlas guarda nombres, contactos, RUT y datos bancarios de clientes |
| Ley 21.719, que moderniza la protección de datos (vigencia prevista para diciembre de 2026) | Exige seguridad, proporcionalidad y responsabilidad proactiva: hay que poder demostrar las medidas tomadas |
| Ley 21.663, marco de ciberseguridad | Atlas no es un operador de importancia vital, pero la usamos como guía de seguridad desde el diseño y gestión de incidentes |
| Ley 21.459, delitos informáticos | Refuerza la necesidad de impedir y registrar accesos no autorizados; el pentest solo se hace con autorización escrita |
| Ley 17.336, propiedad intelectual | El proyecto usa librerías de terceros, por lo que hay que revisar sus licencias |
| ISO/IEC 25010, ISO/IEC 27001:2022 e ISO/IEC/IEEE 29119 | Modelo de calidad, controles de seguridad y estructura del proceso de pruebas |
| WCAG 2.1 nivel AA | Accesibilidad web, relevante por el público adulto mayor |

## 2.4 Observaciones a la ERS

Al leer la ERS encontramos algunos puntos ambiguos o incompletos. Los dejamos anotados porque afectan los criterios de aceptación y deberían aclararse con CreaLab:

1. Se pide fuente de 12 px, lo que es poco para adultos mayores. Recomendamos al menos 16 px para el texto base.
2. El rol editor es "solo visualización", pero RF-4.1 dice que "los usuarios" pueden crear clientes. Asumimos que manda RB-4: solo el administrador escribe.
3. RF-5.2 no fija tamaño máximo de archivo. Proponemos 10 MB y validar el tipo real del archivo.
4. RF-5.4 menciona el estado "vence" sin decir desde cuántos días. Asumimos 30 días antes del término.
5. NFR-USAB habla de un "score de usabilidad mínimo aceptable" sin número. Proponemos SUS ≥ 70.
6. No hay requerimientos sobre consentimiento, derechos de los titulares ni aviso de brechas, que la Ley 21.719 sí exige.
