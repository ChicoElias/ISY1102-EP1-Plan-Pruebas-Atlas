# 5. Matriz de trazabilidad y cobertura

## 5.1 Matriz de trazabilidad

La matriz relaciona cada requerimiento de la ERS con el caso de prueba que lo verifica, el tipo de prueba y la norma o estándar asociado. Cuando todavía no hay un caso detallado, se indica la suite o actividad que lo cubre; esos casos se van a redactar en la iteración 2. La misma matriz está en formato CSV en la carpeta anexos del repositorio.

| Requerimiento | Descripción | Caso o actividad | Tipo de prueba | Norma o estándar |
|---|---|---|---|---|
| RF-1.1 | Autenticación con usuario y contraseña | CP-01 | Funcional | OWASP A07 |
| RF-1.2 | Cierre de sesión y revocación de tokens | Suite de API (sesión) | Seguridad | OWASP A07 |
| RF-2.1 | Registro de usuario | Suite end-to-end | Funcional | Ley 21.719 |
| RF-2.2 | Creación de empresa | Suite end-to-end | Funcional | ISO/IEC 25010 |
| RF-2.3 | Primer usuario como administrador | Suite end-to-end | Funcional | ISO/IEC 27001 |
| RF-3.1 | Invitar o crear usuarios con rol | Suite de API | Funcional | ISO/IEC 27001 |
| RF-3.2 | Editor solo visualiza | CP-02 | Seguridad | OWASP A01 |
| RF-3.3 | Modificar o eliminar usuarios | Suite de API | Funcional | ISO/IEC 27001 |
| RF-4.1 | Crear clientes | CP-04 | Funcional | ISO/IEC 25010 |
| RF-4.2 | Editar, eliminar y listar clientes | CP-04 | Funcional | Ley 19.628 |
| RF-4.3 | Validación de campos | CP-04, CP-06 | Funcional y seguridad | OWASP A03 |
| RF-5.1 | Crear contratos por cliente | CP-05 | Funcional | ISO/IEC 25010 |
| RF-5.2 | Adjuntar documentos | Suite de integración | Integración | OWASP A04 |
| RF-5.3 | Documentos en storage interno | Suite de integración | Integración | ISO/IEC 27001 |
| RF-5.4 | Estado del contrato por fechas | CP-05 | Funcional | ISO/IEC 25010 |
| RF-5.5 | Enlace para compartir documento | Prueba de seguridad planificada | Seguridad | OWASP A01, Ley 19.628 |
| RF-6.1 | Auditoría de acciones críticas | Suite de integración | Funcional | OWASP A09, Ley 21.719 |
| RB-1 | Correo principal único | Suite end-to-end | Regla de negocio | Integridad de datos |
| RB-2 | Acceso solo a usuarios de la empresa | CP-03 | Seguridad | Ley 19.628, OWASP A01 |
| RB-3 | Contrato asociado a un cliente | CP-05 | Regla de negocio | Integridad de datos |
| RB-4 | Editor solo lectura | CP-02 | Seguridad | OWASP A01 |
| RB-5 | Administrador con acceso completo | CP-04 | Funcional | Mínimo privilegio |
| NFR-SEG-1 | TLS obligatorio | CP-01 | Seguridad | OWASP A02 |
| NFR-SEG-2 | Contraseñas con bcrypt | CP-01 | Seguridad | OWASP A02 |
| NFR-SEG-3 | Cifrado de datos sensibles en reposo | Revisión de base de datos en QA | Seguridad | Ley 19.628, ISO/IEC 27001 |
| NFR-SEG-4 | Control de acceso por rol en backend | CP-02, CP-03 | Seguridad | OWASP A01 |
| NFR-SEG-5 | Protección contra CSRF, XSS y SQLi | CP-06 | Seguridad | OWASP A03 |
| NFR-SEG-6 | Gestión segura de logs | Revisión de logs | Seguridad | OWASP A09 |
| NFR-SEG-7 | Respaldo y recuperación | Prueba de restauración | Confiabilidad | ISO/IEC 27001 |
| NFR-SEG-8 | Cumplimiento de protección de datos | CP-03 | Cumplimiento | Ley 19.628, Ley 21.719 |
| NFR-SEG-9 | Sesión con JWT | CP-01 | Seguridad | OWASP A07 |
| NFR-PERF-1 | CRUD bajo 300 ms | CP-07 | Rendimiento | ISO/IEC 25010 |
| NFR-PERF-2 | Página principal bajo 2 s en móvil | CP-07 | Rendimiento | ISO/IEC 25010 |
| NFR-PERF-3 | 200 usuarios concurrentes | CP-07 | Rendimiento | ISO/IEC 25010 |
| NFR-USAB-1 | Tipografía, contraste y controles grandes | CP-08 | Usabilidad | WCAG 2.1 AA |
| NFR-USAB-2 | Flujos claros de registro | CP-08 | Usabilidad | ISO/IEC 25010 |
| NFR-USAB-3 | Ayuda y errores amigables | CP-04, CP-08 | Usabilidad | WCAG 2.1 AA |
| NFR-USAB-4 | Flujo cliente → contratos | CP-08 | Usabilidad | ISO/IEC 25010 |
| NFR-DIS-1 | Disponibilidad de 99,5 % | CP-07 y monitoreo | Confiabilidad | ISO/IEC 25010 |
| NFR-DIS-2 | Mantenimiento y migración segura | Prueba de migración | Mantenibilidad | ISO/IEC 27001 |
| NFR-COMPAT-1 | Navegadores modernos | CP-09 | Compatibilidad | ISO/IEC 25010 |
| NFR-COMPAT-2 | Responsivo en móvil y tablet | CP-09 | Compatibilidad | ISO/IEC 25010 |

Tabla 7. Matriz de trazabilidad entre requerimientos, casos y normas.

## 5.2 Cobertura

La ERS tiene 42 requerimientos entre funcionales, reglas de negocio y no funcionales. Todos quedan trazados a una prueba. De ellos, 27 (64 %) tienen un caso detallado en este informe y los 15 restantes están cubiertos por una suite o actividad planificada.

| Grupo | Total | Con caso detallado | Con actividad planificada |
|---|---|---|---|
| Funcionales (RF) | 17 | 7 | 10 |
| Reglas de negocio (RB) | 5 | 4 | 1 |
| Seguridad (NFR-SEG) | 9 | 6 | 3 |
| Rendimiento (NFR-PERF) | 3 | 3 | 0 |
| Usabilidad (NFR-USAB) | 4 | 4 | 0 |
| Disponibilidad (NFR-DIS) | 2 | 1 | 1 |
| Compatibilidad (NFR-COMPAT) | 2 | 2 | 0 |
| **Total** | **42** | **27** | **15** |

Tabla 8. Cobertura de requerimientos por grupo.

El porcentaje de casos detallados es menor en los requerimientos funcionales porque priorizamos lo que tiene más riesgo. Los riesgos P1 de la sección 3.1 (acceso entre empresas, permisos del editor e inyección) sí tienen caso propio. En cambio, flujos como el registro o la gestión de usuarios se cubren con la suite end-to-end, que no requiere un caso manual por separado.

## 5.3 Coherencia y brechas

Al revisar el plan completo vemos que es coherente con los objetivos de la sección 1.3: los permisos del editor se prueban en CP-02, el aislamiento entre empresas en CP-03, la protección de datos en CP-01 y CP-06, el rendimiento en CP-07, la experiencia de adultos mayores en CP-08 y el funcionamiento en distintos navegadores en CP-09. De OWASP Top 10 quedan cubiertas con casos A01, A02, A03 y A07. A06 (componentes vulnerables) se controla con npm audit en el pipeline y A09 (registro y monitoreo) con la revisión de logs y auditoría planificada.

Las brechas que quedan para la siguiente iteración son:

- redactar los casos de sesión (RF-1.2), enlaces compartidos (RF-5.5), cifrado en reposo (NFR-SEG-3) y respaldo (NFR-SEG-7);
- validar con CreaLab los supuestos de la sección 2.4 (tamaño de archivo, umbral de 30 días y SUS ≥ 70);
- proponer requerimientos de consentimiento, derechos de los titulares y aviso de brechas, que la Ley 21.719 exige y la ERS no incluye.
