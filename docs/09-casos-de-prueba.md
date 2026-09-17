# 9. Diseño de casos de prueba

Se diseñaron trece casos representativos que cubren requerimientos funcionales, reglas de negocio y requerimientos no funcionales de seguridad, rendimiento, usabilidad, accesibilidad y compatibilidad. Los códigos de requerimiento corresponden a la ERS v1.1 de Atlas.

## CP-01 – Inicio de sesión con credenciales válidas

| Campo | Detalle |
|---|---|
| ID | CP-01 |
| Nombre | Inicio de sesión con credenciales válidas |
| Requerimiento asociado | RF-1.1, NFR-SEG-2, NFR-SEG-9 |
| Tipo de prueba | Funcional – Sistema / API |
| Prioridad | P1 |
| Descripción | Verificar que un usuario registrado se autentique con nombre de usuario y contraseña y reciba un JWT de corta vigencia y un refresh token. |
| Precondiciones | Usuario activo registrado y asociado a una empresa; ambiente QA con TLS. |
| Pasos | 1. Abrir la página de login por HTTPS.<br>2. Ingresar nombre de usuario y contraseña válidos.<br>3. Presionar "Ingresar".<br>4. Inspeccionar la respuesta de POST /api/auth/login. |
| Datos de entrada | usuario: `admin.pyme01` / contraseña: `Atlas#Prueba2026` |
| Resultado esperado | HTTP 200; se entrega un access token JWT con expiración ≤ 15 minutos y un refresh token; el usuario es dirigido al dashboard de su empresa; la respuesta no contiene el hash de la contraseña. |
| Criterios de aceptación | Token válido y firmado; tiempo de respuesta < 300 ms; login registrado en auditoría; la contraseña en BD corresponde a un hash bcrypt (prefijo `$2b$`, costo ≥ 10). |

## CP-02 – Revocación del token al cerrar sesión

| Campo | Detalle |
|---|---|
| ID | CP-02 |
| Nombre | Invalidación de sesión y revocación de token tras logout |
| Requerimiento asociado | RF-1.2, NFR-SEG-9 |
| Tipo de prueba | Seguridad – Autenticación y sesión |
| Prioridad | P1 |
| Descripción | Comprobar que, tras cerrar sesión, ni el access token ni el refresh token puedan reutilizarse. |
| Precondiciones | Sesión iniciada con CP-01; tokens copiados desde la herramienta de pruebas. |
| Pasos | 1. Ejecutar POST /api/auth/logout.<br>2. Repetir GET /api/empresas/:id/clients con el access token anterior.<br>3. Ejecutar POST /api/auth/refresh con el refresh token anterior.<br>4. Enviar un JWT con la firma alterada. |
| Datos de entrada | Tokens obtenidos en CP-01; JWT modificado manualmente en Burp Suite. |
| Resultado esperado | Las peticiones de los pasos 2, 3 y 4 responden HTTP 401; el frontend redirige al login. |
| Criterios de aceptación | Ningún token revocado o manipulado concede acceso; el logout queda auditado; no se exponen detalles del motivo del rechazo. |

## CP-03 – Registro de usuario y creación de empresa

| Campo | Detalle |
|---|---|
| ID | CP-03 |
| Nombre | Registro de usuario nuevo y creación de empresa con rol administrador |
| Requerimiento asociado | RF-2.1, RF-2.2, RF-2.3, RB-1, restricción 2.4 (política de contraseñas) |
| Tipo de prueba | Funcional – Sistema (end-to-end) |
| Prioridad | P2 |
| Descripción | Validar el flujo de registro, la política de contraseñas, la creación de empresa y la asignación automática del rol administrador. |
| Precondiciones | Correo de prueba no registrado; servicio de correo de QA disponible. |
| Pasos | 1. Ingresar a Registro.<br>2. Intentar registrar con contraseña débil.<br>3. Registrar con contraseña válida.<br>4. Confirmar el correo.<br>5. Crear empresa con nombre, dirección, teléfono y correo.<br>6. Revisar el rol asignado en Gestión de Usuarios. |
| Datos de entrada | Contraseña débil: `atlas123`; válida: `Crea#Lab2026pyme`; empresa: "Ferretería Los Andes SpA", correo `contacto@losandes.test` |
| Resultado esperado | El paso 2 muestra un mensaje claro indicando el requisito incumplido; el registro válido crea el usuario y la empresa, y el usuario queda como administrador y es dirigido al dashboard. |
| Criterios de aceptación | Contraseñas con menos de 12 caracteres o sin complejidad son rechazadas en frontend y backend; el primer usuario tiene rol administrador; un segundo registro con el mismo correo principal es rechazado (RB-1). |

## CP-04 – Rol editor sin permisos de escritura

| Campo | Detalle |
|---|---|
| ID | CP-04 |
| Nombre | Restricción de escritura para el rol editor en interfaz y API |
| Requerimiento asociado | RF-3.2, RB-4, NFR-SEG-4 |
| Tipo de prueba | Seguridad – Control de acceso (autorización) |
| Prioridad | P1 |
| Descripción | Verificar que un editor solo pueda visualizar, incluso si intenta operaciones de escritura directamente contra la API. |
| Precondiciones | Usuario con rol editor en la empresa A; al menos un cliente y un contrato existentes. |
| Pasos | 1. Iniciar sesión como editor.<br>2. Verificar que la interfaz no muestre botones de crear, editar ni eliminar.<br>3. Con el token del editor, ejecutar POST /api/contratos.<br>4. Ejecutar PUT y DELETE sobre un cliente existente.<br>5. Intentar POST /api/contratos/:id/documentos. |
| Datos de entrada | Token del usuario `editor.pyme01`; cuerpo JSON de contrato válido. |
| Resultado esperado | Los pasos 3, 4 y 5 responden HTTP 403 y no modifican la base de datos; el intento queda registrado. |
| Criterios de aceptación | 0 operaciones de escritura exitosas con rol editor; los datos permanecen íntegros; la verificación ocurre en backend y no depende de ocultar botones. |

## CP-05 – Aislamiento de datos entre empresas

| Campo | Detalle |
|---|---|
| ID | CP-05 |
| Nombre | Acceso a clientes de otra empresa por manipulación de identificador (IDOR) |
| Requerimiento asociado | RB-2, NFR-SEG-4, NFR-SEG-8 |
| Tipo de prueba | Seguridad – Control de acceso / Cumplimiento normativo |
| Prioridad | P1 |
| Descripción | Confirmar que un administrador de la empresa A no pueda consultar ni modificar datos de la empresa B modificando identificadores en la URL o en el cuerpo de la petición. |
| Precondiciones | Empresas A y B con clientes cargados; usuario administrador solo vinculado a la empresa A. |
| Pasos | 1. Iniciar sesión como administrador de A.<br>2. Ejecutar GET /api/empresas/{idB}/clients.<br>3. Ejecutar GET /api/clientes/{idClienteB}.<br>4. Ejecutar PUT sobre un contrato de B.<br>5. Revisar el registro de auditoría. |
| Datos de entrada | idEmpresaA = 101, idEmpresaB = 102, idClienteB = 5530 |
| Resultado esperado | Todas las peticiones responden HTTP 403 o 404 sin revelar datos de B; se registra el intento de acceso no autorizado. |
| Criterios de aceptación | Ningún dato personal o bancario de B se expone; el comportamiento se repite con IDs secuenciales y aleatorios; evidencia archivada como respaldo de cumplimiento de la Ley 19.628 / 21.719. |

## CP-06 – Creación, validación y eliminación lógica de cliente

| Campo | Detalle |
|---|---|
| ID | CP-06 |
| Nombre | CRUD de cliente con validación de campos y eliminación lógica |
| Requerimiento asociado | RF-4.1, RF-4.2, RF-4.3, NFR-USAB-3 |
| Tipo de prueba | Funcional – Sistema |
| Prioridad | P2 |
| Descripción | Validar la creación de clientes con datos correctos e incorrectos, el listado con paginación y filtros, y la eliminación lógica con confirmación. |
| Precondiciones | Sesión iniciada como administrador. |
| Pasos | 1. Crear un cliente con datos válidos.<br>2. Intentar crear un cliente con RUT inválido y teléfono con letras.<br>3. Listar clientes y filtrar por nombre.<br>4. Eliminar el cliente y cancelar en la confirmación.<br>5. Eliminar nuevamente y confirmar.<br>6. Consultar la base de datos. |
| Datos de entrada | Válido: "Comercial Ñuñoa Ltda.", RUT 76.123.456-0, fono +56 9 8765 4321. Inválido: RUT 12.345.678-X, fono "98ab76" |
| Resultado esperado | El cliente válido se guarda y aparece en el listado; los datos inválidos muestran mensajes claros por campo; la cancelación no elimina; la confirmación oculta el cliente del listado sin borrarlo físicamente. |
| Criterios de aceptación | Validaciones activas también en la API (HTTP 422); registro con marca de eliminación (`deleted_at` o equivalente); acciones auditadas; paginación correcta. |

## CP-07 – Cálculo del estado de un contrato

| Campo | Detalle |
|---|---|
| ID | CP-07 |
| Nombre | Estado activo, por vencer y expirado según fechas |
| Requerimiento asociado | RF-5.1, RF-5.4, RB-3 |
| Tipo de prueba | Funcional – Unitaria y sistema (partición de equivalencia y valores límite) |
| Prioridad | P2 |
| Descripción | Verificar que el estado del contrato se calcule correctamente según su fecha de inicio y término, incluidos los valores límite. |
| Precondiciones | Cliente existente; umbral "por vencer" definido en 30 días (supuesto de la sección 2.4); fecha del sistema controlada. |
| Pasos | 1. Crear contratos con las combinaciones de fechas indicadas.<br>2. Revisar el estado mostrado en la lista y en el detalle.<br>3. Intentar asociar un mismo contrato a dos clientes. |
| Datos de entrada | Fecha de referencia: 16/09/2026. A: 01/01/2026–31/12/2026. B: 01/01/2026–16/10/2026 (30 días). C: 01/01/2026–15/09/2026. D: término anterior al inicio. |
| Resultado esperado | A = activo; B = por vencer; C = expirado; D rechazado por validación; el paso 3 no se permite. |
| Criterios de aceptación | 100 % de combinaciones con el estado correcto, incluidos los límites; no se permiten fechas incoherentes; un contrato tiene un solo cliente. |

## CP-08 – Carga de documento, almacenamiento y auditoría

| Campo | Detalle |
|---|---|
| ID | CP-08 |
| Nombre | Carga de documento en contrato con validación de formato, tiempo y registro |
| Requerimiento asociado | RF-5.2, RF-5.3, RF-6.1, NFR-SEG-5 |
| Tipo de prueba | Integración (frontend–API–storage–BD) y rendimiento |
| Prioridad | P2 |
| Descripción | Validar que se adjunte un documento permitido, se almacene en storage interno referenciado en BD, se rechacen archivos no permitidos y se registre la acción. |
| Precondiciones | Contrato existente sin documento; sesión de administrador. |
| Pasos | 1. Adjuntar un PDF de 5 MB y medir el tiempo.<br>2. Descargar el documento y medir el tiempo.<br>3. Intentar adjuntar un archivo .exe renombrado como .pdf.<br>4. Intentar adjuntar un segundo documento al mismo contrato.<br>5. Revisar la tabla de documentos y el registro de auditoría. |
| Datos de entrada | contrato_servicios.pdf (5 MB); malware_test.pdf (ejecutable renombrado, inofensivo); 2do_anexo.docx |
| Resultado esperado | El PDF se sube y descarga en ≤ 10 s; la BD guarda la ruta del archivo, no el binario; el archivo falso se rechaza por tipo real; el sistema aplica la regla de un documento por contrato; se registran subida y descarga. |
| Criterios de aceptación | Tiempos ≤ 10 s; validación por tipo MIME real; archivo accesible solo por usuarios autorizados; registros de auditoría con usuario, fecha y acción. |

## CP-09 – Enlace compartido de documento

| Campo | Detalle |
|---|---|
| ID | CP-09 |
| Nombre | Seguridad del enlace para compartir documentos |
| Requerimiento asociado | RF-5.5, NFR-SEG-4, NFR-SEG-8 |
| Tipo de prueba | Seguridad – Control de acceso |
| Prioridad | P1 |
| Descripción | Verificar que el enlace generado sea impredecible, tenga vigencia y pueda revocarse. |
| Precondiciones | Contrato con documento; sesión de administrador. |
| Pasos | 1. Generar enlace para compartir.<br>2. Abrirlo en una ventana privada.<br>3. Modificar un carácter del token del enlace.<br>4. Revocar el enlace y volver a abrirlo.<br>5. Esperar la expiración configurada y abrirlo. |
| Datos de entrada | Vigencia configurada de prueba: 5 minutos. |
| Resultado esperado | El enlace válido permite solo la descarga del documento indicado; los pasos 3, 4 y 5 niegan el acceso; cada uso queda auditado. |
| Criterios de aceptación | Token de al menos 128 bits de entropía; sin acceso tras revocar o expirar; el enlace no permite navegar a otros documentos. |

## CP-10 – Protección contra inyección SQL, XSS y CSRF

| Campo | Detalle |
|---|---|
| ID | CP-10 |
| Nombre | Validación y saneamiento de entradas frente a ataques comunes |
| Requerimiento asociado | NFR-SEG-5, RF-4.3, 3.1.2 |
| Tipo de prueba | Seguridad – DAST y pentest manual |
| Prioridad | P1 |
| Descripción | Comprobar que los formularios y endpoints rechacen o neutralicen cargas maliciosas. |
| Precondiciones | Autorización formal de pentest; ambiente QA aislado; OWASP ZAP y Burp Suite configurados. |
| Pasos | 1. Ingresar carga SQLi en el login y en el filtro de clientes.<br>2. Guardar un cliente con script en la descripción y abrir su detalle.<br>3. Enviar una petición de modificación desde un origen externo sin token CSRF.<br>4. Ejecutar escaneo activo con OWASP ZAP. |
| Datos de entrada | `' OR '1'='1' --`; `<script>alert('xss')</script>`; `<img src=x onerror=alert(1)>` |
| Resultado esperado | No hay acceso ni alteración de datos; el script se muestra como texto y no se ejecuta; la petición externa se rechaza; los errores no revelan información técnica. |
| Criterios de aceptación | 0 vulnerabilidades críticas o altas en ZAP; consultas parametrizadas; cabeceras CSP y CORS restrictivas; resultado documentado en checklist OWASP ASVS. |

## CP-11 – Carga con 200 usuarios concurrentes

| Campo | Detalle |
|---|---|
| ID | CP-11 |
| Nombre | Prueba de carga sobre operaciones CRUD y página principal |
| Requerimiento asociado | NFR-PERF-1, NFR-PERF-2, NFR-PERF-3, NFR-DIS-1 |
| Tipo de prueba | No funcional – Rendimiento (carga) |
| Prioridad | P2 |
| Descripción | Medir tiempos de respuesta y tasa de error bajo la concurrencia definida en la ERS. |
| Precondiciones | Ambiente de preproducción equivalente a producción; 20.000 clientes y 50.000 contratos ficticios; script k6 validado. |
| Pasos | 1. Rampa de 0 a 200 usuarios virtuales en 5 minutos.<br>2. Mantener 200 usuarios durante 20 minutos (login, listar, crear y editar clientes).<br>3. Medir la página principal con Lighthouse en perfil móvil.<br>4. Registrar CPU, memoria y conexiones de BD. |
| Datos de entrada | Script `carga_atlas.js`; distribución 60 % lectura / 40 % escritura. |
| Resultado esperado | p95 < 300 ms en CRUD simples; carga de página < 2 s; tasa de error < 1 %; sin caídas del servicio. |
| Criterios de aceptación | Umbrales cumplidos en tres ejecuciones consecutivas; informe de k6 y Lighthouse adjunto como evidencia. |

## CP-12 – Usabilidad y accesibilidad con adultos mayores

| Campo | Detalle |
|---|---|
| ID | CP-12 |
| Nombre | Flujo cliente → contratos evaluado por adultos mayores |
| Requerimiento asociado | NFR-USAB-1, NFR-USAB-2, NFR-USAB-3, NFR-USAB-4, 3.1.1 |
| Tipo de prueba | No funcional – Usabilidad y accesibilidad |
| Prioridad | P3 |
| Descripción | Evaluar si usuarios mayores completan tareas clave sin ayuda y si la interfaz cumple WCAG 2.1 AA. |
| Precondiciones | 5 participantes de 60 años o más con consentimiento informado; datos ficticios; guion de tareas; axe DevTools y NVDA instalados. |
| Pasos | 1. Pedir a cada participante buscar un cliente y abrir sus contratos.<br>2. Pedir crear un cliente con un error intencional y corregirlo.<br>3. Registrar tiempo, errores y solicitudes de ayuda.<br>4. Aplicar cuestionario SUS.<br>5. Auditar las pantallas con axe y navegar solo con teclado y NVDA. |
| Datos de entrada | Guion de 3 tareas; cuestionario SUS de 10 ítems. |
| Resultado esperado | Las tareas se completan sin bloqueos; los mensajes de error se entienden; el flujo es cliente → contratos; los controles son operables por teclado. |
| Criterios de aceptación | ≥ 80 % de tareas completadas sin ayuda; SUS ≥ 70; 0 bloqueos mayores; contraste ≥ 4,5:1; objetivos táctiles ≥ 44 × 44 px; 0 errores críticos en axe. |

## CP-13 – Compatibilidad entre navegadores y dispositivos

| Campo | Detalle |
|---|---|
| ID | CP-13 |
| Nombre | Funcionamiento responsivo en navegadores y dispositivos soportados |
| Requerimiento asociado | NFR-COMPAT-1, NFR-COMPAT-2 |
| Tipo de prueba | No funcional – Compatibilidad |
| Prioridad | P3 |
| Descripción | Verificar que login, gestión de clientes y visualización de documentos funcionen de forma consistente en la matriz definida. |
| Precondiciones | Suite Playwright de flujos esenciales; acceso a BrowserStack. |
| Pasos | 1. Ejecutar la suite en Chrome, Firefox, Edge y WebKit (dos últimas versiones).<br>2. Repetir en iPhone (Safari), tablet Android y iPad.<br>3. Comparar capturas en 360 px, 768 px y 1366 px. |
| Datos de entrada | Matriz de 4 navegadores × 2 versiones × 3 resoluciones. |
| Resultado esperado | Flujos completados en todas las combinaciones; sin elementos superpuestos ni scroll horizontal en móvil. |
| Criterios de aceptación | 100 % de la matriz sin defectos bloqueantes o altos; diferencias visuales menores documentadas. |
