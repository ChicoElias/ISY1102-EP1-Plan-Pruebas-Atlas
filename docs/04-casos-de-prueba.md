# 4. Diseño de casos de prueba

Diseñamos nueve casos que cubren los distintos tipos de requerimientos de la ERS: tres funcionales, tres de seguridad y tres no funcionales. Se priorizaron los riesgos P1 de la sección 3.1 y los requerimientos con umbrales medibles. Los demás requerimientos quedan cubiertos por las suites y actividades indicadas en la matriz del capítulo 5.

### CP-01 – Inicio de sesión con credenciales válidas

| ID | NOMBRE | REQUERIMIENTO |
|---|---|---|
| CP-01 | Inicio de sesión con credenciales válidas | RF-1.1, NFR-SEG-1, NFR-SEG-2, NFR-SEG-9 |

| DESCRIPCIÓN |
|---|
| Verificar que un usuario registrado pueda ingresar con su nombre de usuario y contraseña, y que el sistema entregue un token de sesión válido por una conexión segura. |
| **PRECONDICIONES** |
| Usuario activo asociado a una empresa. Ambiente QA con certificado TLS. |
| **PASOS** |
| 1. Abrir la página de login con http:// y revisar que redirija a https://.<br>2. Ingresar usuario y contraseña válidos y presionar "Ingresar".<br>3. Revisar la respuesta de POST /api/auth/login.<br>4. Revisar en la base de datos cómo está guardada la contraseña. |
| **RESULTADO ESPERADO** |
| Respuesta HTTP 200 con un JWT y un refresh token. El usuario llega al dashboard de su empresa. La respuesta no incluye datos sensibles. |
| **CRITERIO DE ACEPTACIÓN** |
| La conexión es HTTPS. El JWT tiene expiración de 15 minutos o menos. La respuesta tarda menos de 300 ms. La contraseña está guardada como hash bcrypt (prefijo $2b$). |
| **DATOS DE PRUEBA** |
| Usuario: admin.pyme01 / Contraseña: Atlas#Prueba2026 |
| **TIPO DE PRUEBA** |
| Funcional (sistema y API) |

### CP-02 – Rol editor sin permisos de escritura

| ID | NOMBRE | REQUERIMIENTO |
|---|---|---|
| CP-02 | Rol editor sin permisos de escritura | RF-3.2, RB-4, NFR-SEG-4 |

| DESCRIPCIÓN |
|---|
| Comprobar que un usuario con rol editor solo pueda ver información, incluso si intenta crear, modificar o eliminar llamando directamente a la API. |
| **PRECONDICIONES** |
| Usuario editor en la empresa A. Existen al menos un cliente y un contrato. |
| **PASOS** |
| 1. Iniciar sesión como editor.<br>2. Revisar que la interfaz no muestre botones de crear, editar ni eliminar.<br>3. Con el token del editor, enviar POST /api/contratos.<br>4. Enviar PUT y DELETE sobre un cliente existente. |
| **RESULTADO ESPERADO** |
| Las peticiones de los pasos 3 y 4 responden HTTP 403 y no cambian nada en la base de datos. |
| **CRITERIO DE ACEPTACIÓN** |
| Ninguna operación de escritura funciona con el rol editor. El bloqueo ocurre en el backend y no depende solo de ocultar botones. |
| **DATOS DE PRUEBA** |
| Usuario: editor.pyme01. JSON de contrato válido para el POST. |
| **TIPO DE PRUEBA** |
| Seguridad (control de acceso) |

### CP-03 – Aislamiento de datos entre empresas

| ID | NOMBRE | REQUERIMIENTO |
|---|---|---|
| CP-03 | Aislamiento de datos entre empresas | RB-2, NFR-SEG-4, NFR-SEG-8 |

| DESCRIPCIÓN |
|---|
| Confirmar que un administrador de una empresa no pueda ver ni modificar datos de otra empresa cambiando el identificador en la URL o en la petición. |
| **PRECONDICIONES** |
| Empresas A y B con clientes cargados. El administrador solo pertenece a la empresa A. |
| **PASOS** |
| 1. Iniciar sesión como administrador de A.<br>2. Enviar GET /api/empresas/102/clients (empresa B).<br>3. Enviar GET sobre un cliente de B.<br>4. Enviar PUT sobre un contrato de B. |
| **RESULTADO ESPERADO** |
| Todas las peticiones responden 403 o 404 y no se muestra ningún dato de la empresa B. |
| **CRITERIO DE ACEPTACIÓN** |
| No se expone ningún dato personal o bancario de B, tanto con IDs correlativos como aleatorios. La evidencia se guarda como respaldo de cumplimiento de la Ley 19.628. |
| **DATOS DE PRUEBA** |
| ID empresa A = 101, ID empresa B = 102, ID cliente de B = 5530 |
| **TIPO DE PRUEBA** |
| Seguridad (control de acceso) y cumplimiento normativo |

### CP-04 – Creación, validación y eliminación lógica de un cliente

| ID | NOMBRE | REQUERIMIENTO |
|---|---|---|
| CP-04 | Creación, validación y eliminación lógica de un cliente | RF-4.1, RF-4.2, RF-4.3, RB-5, NFR-USAB-3 |

| DESCRIPCIÓN |
|---|
| Validar que el administrador pueda crear, listar y eliminar clientes, que los campos se validen y que la eliminación sea lógica y con confirmación. |
| **PRECONDICIONES** |
| Sesión iniciada como administrador. |
| **PASOS** |
| 1. Crear un cliente con datos válidos.<br>2. Intentar crear otro con RUT inválido y teléfono con letras.<br>3. Buscar el cliente creado usando el filtro por nombre.<br>4. Eliminarlo y cancelar en la confirmación.<br>5. Eliminarlo de nuevo y confirmar.<br>6. Revisar el registro en la base de datos. |
| **RESULTADO ESPERADO** |
| El cliente válido se guarda y aparece en el listado. Los datos inválidos muestran un mensaje claro en cada campo. Al cancelar no se elimina; al confirmar desaparece del listado pero sigue en la base de datos marcado como eliminado. |
| **CRITERIO DE ACEPTACIÓN** |
| La API también rechaza los datos inválidos (HTTP 422). La paginación y el filtro funcionan. La eliminación no borra físicamente el registro. |
| **DATOS DE PRUEBA** |
| Válido: Comercial Ñuñoa Ltda., RUT 76.123.456-0, +56 9 8765 4321. Inválido: RUT 12.345.678-X, teléfono 98ab76. |
| **TIPO DE PRUEBA** |
| Funcional (sistema) |

### CP-05 – Cálculo del estado de un contrato

| ID | NOMBRE | REQUERIMIENTO |
|---|---|---|
| CP-05 | Cálculo del estado de un contrato | RF-5.1, RF-5.4, RB-3 |

| DESCRIPCIÓN |
|---|
| Verificar que el estado del contrato (activo, por vencer o expirado) se calcule bien a partir de sus fechas, incluyendo los casos límite. |
| **PRECONDICIONES** |
| Cliente creado. Umbral de "por vencer" de 30 días (supuesto de la sección 2.4). Fecha del sistema fijada en 16/09/2026. |
| **PASOS** |
| 1. Crear los contratos A, B, C y D con las fechas indicadas.<br>2. Revisar el estado en el listado y en el detalle.<br>3. Intentar asociar un contrato a un segundo cliente. |
| **RESULTADO ESPERADO** |
| A queda activo, B por vencer y C expirado. D se rechaza por fechas incoherentes. El paso 3 no se permite. |
| **CRITERIO DE ACEPTACIÓN** |
| Todas las combinaciones muestran el estado correcto, incluidos los límites. Un contrato pertenece a un solo cliente. |
| **DATOS DE PRUEBA** |
| A: 01/01/2026 al 31/12/2026. B: 01/01/2026 al 16/10/2026. C: 01/01/2026 al 15/09/2026. D: inicio 01/06/2026 y término 01/05/2026. |
| **TIPO DE PRUEBA** |
| Funcional (unitaria y sistema, valores límite) |

### CP-06 – Protección contra inyección SQL, XSS y CSRF

| ID | NOMBRE | REQUERIMIENTO |
|---|---|---|
| CP-06 | Protección contra inyección SQL, XSS y CSRF | NFR-SEG-5, RF-4.3 |

| DESCRIPCIÓN |
|---|
| Comprobar que los formularios y endpoints rechacen o neutralicen entradas maliciosas comunes. |
| **PRECONDICIONES** |
| Autorización escrita para el pentest. Ambiente QA aislado con OWASP ZAP y Burp Suite configurados. |
| **PASOS** |
| 1. Ingresar una carga de inyección SQL en el login y en el filtro de clientes.<br>2. Guardar un cliente con un script en la descripción y abrir su detalle.<br>3. Enviar una petición de modificación desde otro origen sin token CSRF.<br>4. Ejecutar un escaneo activo con OWASP ZAP. |
| **RESULTADO ESPERADO** |
| No se obtiene acceso ni se alteran datos. El script se muestra como texto y no se ejecuta. La petición externa es rechazada. Los errores no muestran información técnica. |
| **CRITERIO DE ACEPTACIÓN** |
| OWASP ZAP no reporta vulnerabilidades críticas ni altas. Las consultas son parametrizadas. Existen cabeceras CSP y CORS restrictivas. |
| **DATOS DE PRUEBA** |
| ' OR '1'='1' -- ; <script>alert('xss')</script> ; <img src=x onerror=alert(1)> |
| **TIPO DE PRUEBA** |
| Seguridad (escaneo dinámico y pentest manual) |

### CP-07 – Carga con 200 usuarios concurrentes

| ID | NOMBRE | REQUERIMIENTO |
|---|---|---|
| CP-07 | Carga con 200 usuarios concurrentes | NFR-PERF-1, NFR-PERF-2, NFR-PERF-3, NFR-DIS-1 |

| DESCRIPCIÓN |
|---|
| Medir tiempos de respuesta y tasa de error con la concurrencia que define la ERS. |
| **PRECONDICIONES** |
| Preproducción equivalente a producción, con 20.000 clientes y 50.000 contratos ficticios. Script de k6 revisado. |
| **PASOS** |
| 1. Subir de 0 a 200 usuarios virtuales en 5 minutos.<br>2. Mantener 200 usuarios por 20 minutos haciendo login, listados, creación y edición de clientes.<br>3. Medir la página principal con Lighthouse en perfil móvil.<br>4. Registrar CPU, memoria y conexiones a la base de datos. |
| **RESULTADO ESPERADO** |
| Las operaciones CRUD simples responden con p95 bajo 300 ms, la página principal carga en menos de 2 s y el servicio no se cae. |
| **CRITERIO DE ACEPTACIÓN** |
| Tasa de error menor a 1 %. Los umbrales se cumplen en tres ejecuciones seguidas. Se adjuntan los reportes de k6 y Lighthouse. |
| **DATOS DE PRUEBA** |
| Script carga_atlas.js con 60 % lecturas y 40 % escrituras. |
| **TIPO DE PRUEBA** |
| No funcional (rendimiento) |

### CP-08 – Usabilidad y accesibilidad con adultos mayores

| ID | NOMBRE | REQUERIMIENTO |
|---|---|---|
| CP-08 | Usabilidad y accesibilidad con adultos mayores | NFR-USAB-1, NFR-USAB-2, NFR-USAB-3, NFR-USAB-4 |

| DESCRIPCIÓN |
|---|
| Evaluar si personas mayores completan tareas habituales sin ayuda y si las pantallas principales cumplen WCAG 2.1 AA. |
| **PRECONDICIONES** |
| 5 participantes de 60 años o más con consentimiento firmado. Datos ficticios. axe DevTools y NVDA instalados. |
| **PASOS** |
| 1. Pedir a cada participante buscar un cliente y abrir sus contratos.<br>2. Pedir crear un cliente cometiendo un error y luego corregirlo.<br>3. Anotar tiempo, errores y veces que pide ayuda.<br>4. Aplicar el cuestionario SUS.<br>5. Revisar las pantallas con axe y recorrerlas solo con teclado y NVDA. |
| **RESULTADO ESPERADO** |
| Los participantes completan las tareas sin bloqueos, entienden los mensajes de error y siguen el flujo cliente → contratos. |
| **CRITERIO DE ACEPTACIÓN** |
| Al menos 80 % de las tareas completadas sin ayuda. SUS de 70 o más. Contraste mínimo 4,5:1 y controles táctiles de 44 × 44 px o más. Sin errores críticos en axe. |
| **DATOS DE PRUEBA** |
| Guion de 3 tareas y cuestionario SUS de 10 preguntas. |
| **TIPO DE PRUEBA** |
| No funcional (usabilidad y accesibilidad) |

### CP-09 – Compatibilidad entre navegadores y dispositivos

| ID | NOMBRE | REQUERIMIENTO |
|---|---|---|
| CP-09 | Compatibilidad entre navegadores y dispositivos | NFR-COMPAT-1, NFR-COMPAT-2 |

| DESCRIPCIÓN |
|---|
| Verificar que los flujos principales funcionen igual en los navegadores que exige la ERS y que la interfaz se adapte a escritorio, tablet y celular. |
| **PRECONDICIONES** |
| Ambiente QA desplegado con datos ficticios. Suite de Playwright configurada para Chromium, Firefox y WebKit, y cuenta de BrowserStack disponible. |
| **PASOS** |
| 1. Ejecutar con Playwright el flujo de login, creación de cliente, creación de contrato y consulta de auditoría en Chromium, Firefox y WebKit.<br>2. Repetir el flujo en BrowserStack sobre Chrome y Edge en Windows, Safari en macOS y Safari en iOS.<br>3. Revisar en cada navegador que tablas, formularios y botones no se corten ni se superpongan.<br>4. Repetir el recorrido en pantallas de 1920, 768 y 375 px de ancho.<br>5. En celular, comprobar el tamaño de los controles y que no haga falta desplazarse en horizontal. |
| **RESULTADO ESPERADO** |
| Los flujos se completan en todos los navegadores y tamaños de pantalla, y la interfaz se reordena sin elementos cortados o inaccesibles. |
| **CRITERIO DE ACEPTACIÓN** |
| Sin defectos bloqueantes ni críticos en la matriz de navegadores. Las diferencias entre navegadores son solo visuales (bordes o sombras). En móvil los controles miden al menos 44 × 44 px y no se necesita desplazamiento horizontal. |
| **DATOS DE PRUEBA** |
| Mismos datos de CP-04 y CP-05. Matriz: Chrome, Firefox, Safari y Edge en sus dos últimas versiones; iPhone, Galaxy, iPad y notebook 1080p. |
| **TIPO DE PRUEBA** |
| No funcional (compatibilidad) |
