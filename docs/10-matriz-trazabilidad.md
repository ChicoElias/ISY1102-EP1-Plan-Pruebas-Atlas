# 10. Matriz de trazabilidad

La matriz vincula cada requerimiento de la ERS con los casos que lo verifican, el tipo de prueba y la norma o estándar relacionado. Los requerimientos que todavía no tienen caso detallado se cubren con la suite indicada y quedan anotados para la iteración 2.

## 10.1 Requerimientos funcionales y reglas de negocio

| Requerimiento | Descripción breve | Casos de prueba | Tipo de prueba | Control normativo / estándar |
|---|---|---|---|---|
| RF-1.1 | Autenticación con usuario y contraseña | CP-01 | Funcional, API | OWASP A07; ISO/IEC 27001 A.8.5 |
| RF-1.2 | Cierre de sesión y revocación de tokens | CP-02 | Seguridad | OWASP A07; ASVS V3 |
| RF-2.1 | Registro rápido de usuario | CP-03 | Funcional E2E | Ley 21.719 (licitud y finalidad) |
| RF-2.2 | Creación de empresa | CP-03 | Funcional E2E | ISO/IEC 25010 (adecuación funcional) |
| RF-2.3 | Primer usuario como administrador | CP-03 | Funcional E2E | Principio de mínimo privilegio |
| RF-3.1 | Invitar o crear usuarios y asignar rol | Suite regresión API (iteración 2: CP-14) | Funcional, API | ISO/IEC 27001 A.5.18 |
| RF-3.2 | Editor solo visualiza | CP-04 | Seguridad (autorización) | OWASP A01; Ley 19.628 |
| RF-3.3 | Modificar o eliminar usuarios | Suite regresión API (iteración 2: CP-15) | Funcional | ISO/IEC 27001 A.5.18 |
| RF-4.1 | Crear clientes | CP-06 | Funcional | ISO/IEC 25010 |
| RF-4.2 | Editar, eliminar y listar con filtros | CP-06 | Funcional | Ley 21.719 (supresión, trazabilidad) |
| RF-4.3 | Validación de campos | CP-06, CP-10 | Funcional, seguridad | OWASP A03 |
| RF-5.1 | Crear contratos por cliente | CP-07 | Funcional | ISO/IEC 25010 |
| RF-5.2 | Adjuntar documento en formatos permitidos | CP-08 | Integración | OWASP A04 (diseño inseguro) |
| RF-5.3 | Storage interno referenciado en BD | CP-08 | Integración | ISO/IEC 27001 A.8.10 |
| RF-5.4 | Estado del contrato por fechas | CP-07 | Funcional, unitaria | ISO/IEC 25010 (corrección) |
| RF-5.5 | Enlace para compartir documento | CP-09 | Seguridad | OWASP A01; Ley 19.628 |
| RF-6.1 | Auditoría de acciones críticas | CP-01, CP-04, CP-05, CP-06, CP-08, CP-09 | Funcional, seguridad | OWASP A09; Ley 21.719 (responsabilidad proactiva) |
| RB-1 | Correo principal único | CP-03 | Regla de negocio | Integridad de datos |
| RB-2 | Acceso solo a usuarios de la empresa | CP-05 | Seguridad | Ley 19.628; Ley 21.719; OWASP A01 |
| RB-3 | Contrato asociado a un solo cliente | CP-07 | Regla de negocio | Integridad referencial |
| RB-4 | Editor con permisos de lectura | CP-04 | Seguridad | OWASP A01 |
| RB-5 | Administrador con acceso completo | CP-03, CP-06, CP-08 | Funcional | Mínimo privilegio |

## 10.2 Requerimientos no funcionales

| Requerimiento | Descripción breve | Casos de prueba | Tipo de prueba | Control normativo / estándar |
|---|---|---|---|---|
| NFR-SEG-1 | TLS obligatorio | CP-01 (precondición), verificación SSL Labs | Seguridad criptográfica | OWASP A02; ISO/IEC 27001 A.8.24 |
| NFR-SEG-2 | Hash bcrypt | CP-01 | Seguridad | OWASP A02 |
| NFR-SEG-3 | Cifrado de datos sensibles en reposo | Revisión de BD en QA (iteración 2: CP-16) | Seguridad | Ley 19.628; ISO/IEC 27001 A.8.24 |
| NFR-SEG-4 | Control de acceso por rol en backend | CP-04, CP-05, CP-09 | Seguridad | OWASP A01 |
| NFR-SEG-5 | Protección CSRF, XSS, SQLi | CP-08, CP-10 | Seguridad (DAST, pentest) | OWASP A03; ASVS V5 |
| NFR-SEG-6 | Gestión de logs segura | CP-08 y revisión de logs | Seguridad | OWASP A09; ISO/IEC 27001 A.8.15 |
| NFR-SEG-7 | Respaldo y recuperación | Prueba de restauración en QA (iteración 2: CP-17) | Confiabilidad | ISO/IEC 27001 A.8.13; Ley 21.663 |
| NFR-SEG-8 | Cumplimiento de protección de datos | CP-05, CP-09 | Cumplimiento | Ley 19.628; Ley 21.719 |
| NFR-SEG-9 | Sesión mediante JWT | CP-01, CP-02 | Seguridad | OWASP A07 |
| NFR-PERF-1 | CRUD < 300 ms | CP-01, CP-11 | Rendimiento | ISO/IEC 25010 (eficiencia) |
| NFR-PERF-2 | Página principal < 2 s en móvil | CP-11 | Rendimiento | ISO/IEC 25010 |
| NFR-PERF-3 | 200 usuarios concurrentes | CP-11 | Carga | ISO/IEC 25010 |
| NFR-USAB-1 | Tipografía, contraste y controles grandes | CP-12 | Usabilidad, accesibilidad | WCAG 2.1 AA |
| NFR-USAB-2 | Flujos claros de registro | CP-03, CP-12 | Usabilidad | ISO/IEC 25010 (usabilidad) |
| NFR-USAB-3 | Ayuda contextual y errores amigables | CP-06, CP-12 | Usabilidad | WCAG 3.3 (asistencia en la entrada) |
| NFR-USAB-4 | Flujo cliente → contratos | CP-12 | Usabilidad | ISO/IEC 25010 |
| NFR-DIS-1 | Disponibilidad 99,5 % | CP-11 y monitoreo | Confiabilidad | ISO/IEC 25010 (disponibilidad) |
| NFR-DIS-2 | Mantenimiento y migración segura | Prueba de migración (iteración 2) | Mantenibilidad | ISO/IEC 27001 A.8.32 |
| NFR-COMPAT-1 | Navegadores modernos | CP-13 | Compatibilidad | ISO/IEC 25010 |
| NFR-COMPAT-2 | Responsivo móvil y tablet | CP-13 | Compatibilidad | ISO/IEC 25010 (portabilidad) |
| 3.1.1 | Accesibilidad de interfaz | CP-12 | Accesibilidad | WCAG 2.1 AA |
| 3.1.2 | API REST validada con Swagger | CP-01, CP-02, CP-04, CP-10 | API | OpenAPI; OWASP API Security Top 10 |
