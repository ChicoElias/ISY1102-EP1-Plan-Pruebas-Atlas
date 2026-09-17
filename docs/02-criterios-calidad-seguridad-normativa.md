# 2. Criterios de calidad, seguridad y cumplimiento normativo

En Atlas, calidad, seguridad y cumplimiento legal están conectados. Por ejemplo, una falla en el control de acceso es un problema de calidad (el sistema no hace lo especificado), de seguridad (se pierde la confidencialidad) y legal (no se resguardan los datos personales). Por eso cada criterio de esta sección está ligado a un requerimiento de la ERS y a una referencia normativa.

## 2.1 Criterios de calidad (ISO/IEC 25010)

| Característica ISO/IEC 25010 | Criterio aplicado a Atlas | Requerimiento ERS | Métrica o evidencia |
|---|---|---|---|
| Adecuación funcional | Las operaciones CRUD, el cálculo de estado de contratos y la asignación de roles producen resultados correctos y completos | RF-1 a RF-6 | 100 % de casos funcionales de prioridad alta aprobados |
| Eficiencia de desempeño | Respuesta de operaciones CRUD simples bajo carga normal y carga de página principal en móvil | NFR-PERF-1, NFR-PERF-2, NFR-PERF-3 | p95 < 300 ms; carga < 2 s; 200 usuarios concurrentes |
| Usabilidad | Interfaces legibles, controles grandes, flujos claros y mensajes de error comprensibles para adultos mayores | NFR-USAB-1 a 4, 3.1.1 | SUS ≥ 70 con 5 usuarios mayores; 0 bloqueos mayores |
| Confiabilidad | Disponibilidad mensual, respaldo y recuperación ante fallos | NFR-DIS-1, NFR-SEG-7 | Uptime ≥ 99,5 %; restauración de respaldo verificada |
| Seguridad | Confidencialidad, integridad, no repudio y autenticidad | NFR-SEG-1 a 9, RF-6 | 0 hallazgos críticos o altos en pentest |
| Compatibilidad | Funcionamiento en las dos últimas versiones de Chrome, Firefox, Safari y Edge | NFR-COMPAT-1 | Matriz de navegadores sin defectos bloqueantes |
| Mantenibilidad | Código modular y pruebas automatizables en CI; migraciones seguras | NFR-DIS-2 | Cobertura unitaria backend ≥ 70 %; migraciones reversibles |
| Portabilidad | Adaptación a distintos tamaños de pantalla | NFR-COMPAT-2 | Vistas validadas en 360 px, 768 px y 1366 px |

## 2.2 Criterios de seguridad

Tomamos como base la tríada confidencialidad, integridad y disponibilidad, y contrastamos cada criterio con OWASP Top 10 (2021) y OWASP ASVS 4.0 nivel 2, que es el nivel recomendado para aplicaciones con datos personales y financieros.

| Ámbito | Criterio | Requerimiento ERS | Referencia |
|---|---|---|---|
| Protección de datos | TLS 1.2 o superior en todas las comunicaciones; cifrado de datos bancarios en reposo | NFR-SEG-1, NFR-SEG-3 | OWASP A02 – Fallas criptográficas; ISO/IEC 27001 A.8.24 |
| Autenticación | Contraseñas con bcrypt, política de 12 caracteres con complejidad, JWT de corta vigencia y revocación al cerrar sesión | RF-1.1, RF-1.2, NFR-SEG-2, NFR-SEG-9, 2.4 | OWASP A07 – Fallas de identificación y autenticación |
| Control de acceso | Autorización validada en backend por rol y por pertenencia a empresa (aislamiento multiempresa) | RF-3.2, NFR-SEG-4, RB-2, RB-4, RB-5 | OWASP A01 – Pérdida de control de acceso |
| Validación de entradas | Validación y saneamiento server-side; protección contra SQL Injection, XSS y CSRF; restricción de tipo y tamaño de archivos | RF-4.3, RF-5.2, NFR-SEG-5, 3.1.2 | OWASP A03 – Inyección |
| Manejo de errores | Mensajes genéricos al usuario, sin trazas de pila ni detalles de base de datos | NFR-USAB-3, NFR-SEG-6 | OWASP A05 – Configuración de seguridad incorrecta |
| Integridad y trazabilidad | Registro de auditoría inalterable de acciones críticas, con usuario, fecha, acción y recurso | RF-6.1, NFR-SEG-6 | OWASP A09 – Fallas de registro y monitoreo |
| Enlaces compartidos | Enlaces de documento con token no predecible, expiración y posibilidad de revocación | RF-5.5 | OWASP A01; principio de mínimo privilegio |
| Dependencias | Librerías sin vulnerabilidades conocidas críticas | Sección 4 (stack) | OWASP A06 – Componentes vulnerables |

## 2.3 Cumplimiento normativo

| Norma | Alcance en Atlas | Implicancia para las pruebas |
|---|---|---|
| Ley 19.628 sobre Protección de la Vida Privada | Atlas almacena nombres, contactos, RUT y datos bancarios de clientes de las pymes | Verificar que el acceso esté restringido a usuarios autorizados y que la información se utilice solo para su finalidad |
| Ley 21.719 (modifica la Ley 19.628 y crea la Agencia de Protección de Datos Personales; vigencia prevista para diciembre de 2026) | Introduce principios de licitud, finalidad, proporcionalidad, seguridad y responsabilidad proactiva, junto con deberes de reporte de brechas | Probar eliminación lógica y trazabilidad, minimización de datos en respuestas de la API y existencia de registros que demuestren medidas de seguridad |
| Ley 21.663, Ley Marco de Ciberseguridad | Atlas no es, en principio, un operador de importancia vital, pero sus clientes pueden serlo; se toma como referencia de seguridad por diseño y gestión de incidentes | Pruebas de seguridad antes de cada liberación y verificación del procedimiento de respuesta ante incidentes |
| Ley 21.459 sobre Delitos Informáticos | Tipifica el acceso ilícito a sistemas | Refuerza la necesidad de impedir y registrar accesos no autorizados; las pruebas de penetración se ejecutan solo con autorización formal |
| Ley 17.336 de Propiedad Intelectual | Uso de librerías de terceros (React, Express, MUI, etc.) | Revisión de licencias de dependencias (MIT u otras compatibles) |
| ISO/IEC 25010 | Modelo de calidad de producto | Define las características evaluadas en 2.1 |
| ISO/IEC 27001:2022 | Gestión de seguridad de la información | Controles de cifrado, registro, respaldo y control de acceso |
| ISO/IEC/IEEE 29119 | Proceso y documentación de pruebas | Estructura del plan, casos de prueba e informes |
| WCAG 2.1 nivel AA | Accesibilidad web | Contraste, etiquetas ARIA, navegación por teclado y tamaño de objetivos táctiles |

## 2.4 Observación crítica sobre la ERS

Al revisar la ERS encontramos puntos que conviene aclarar con el cliente antes de ejecutar las pruebas, ya que afectan los criterios de aceptación:

- La ERS fija un tamaño de fuente de 12 px, lo que resulta insuficiente para el público adulto mayor declarado en el alcance. Se recomienda un mínimo de 16 px para texto base, en línea con NFR-USAB-1 y las pautas WCAG.
- El rol editor aparece definido como "sólo visualización", pero RF-4.1 indica que "los usuarios" pueden crear clientes. Se asume que prevalecen RF-3.2 y RB-4, es decir, que solo el administrador escribe datos.
- RF-5.2 menciona formatos DOC y PPT, pero no define tamaño máximo de archivo ni validación del contenido real (tipo MIME). Se propone un límite de 10 MB y validación por firma de archivo.
- RF-5.4 habla del estado "vence" sin definir el umbral. Se asume "por vencer" cuando faltan 30 días o menos para la fecha de término.
- NFR-USAB exige un "score de usabilidad mínimo aceptable" sin cifra. Se propone SUS ≥ 70.
- RB-1 condiciona la unicidad del correo a una política no definida. Se prueba el comportamiento por defecto (correo único) y se deja parametrizable.
