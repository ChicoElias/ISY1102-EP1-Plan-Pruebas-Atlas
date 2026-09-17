# 3. Tipos de prueba y su justificación

Las pruebas se clasifican en funcionales, que verifican qué hace el sistema, y no funcionales, que verifican cómo lo hace. Las pruebas de seguridad se tratan como una categoría propia por el tipo de datos que maneja Atlas y por su peso en el cumplimiento legal.

## 3.1 Pruebas funcionales

| Tipo | Propósito | Aplicación en Atlas | Requerimientos |
|---|---|---|---|
| Unitarias | Verificar la lógica aislada de funciones y servicios | Cálculo de estado del contrato, validación de RUT y formatos, política de contraseñas, generación de tokens | RF-4.3, RF-5.4, RF-1.1 |
| Integración | Comprobar que frontend, API, base de datos y storage funcionan en conjunto | Creación de contrato con documento: API, tabla de contratos, storage interno y registro de auditoría | RF-5.1, RF-5.2, RF-5.3, RF-6.1 |
| Sistema (end-to-end) | Validar flujos completos desde la interfaz | Registro, creación de empresa, invitación de usuario, alta de cliente y contrato | RF-2, RF-3, RF-4, RF-5 |
| API / contrato | Verificar endpoints, códigos HTTP, esquemas JSON y validaciones server-side | Colección Swagger/Postman con pruebas de endpoints críticos, como exige la sección 3.1.2 | 3.1.2, NFR-SEG-5 |
| Reglas de negocio | Confirmar que las restricciones del dominio se respetan | Un contrato asociado a un único cliente, editor de solo lectura, aislamiento entre empresas | RB-1 a RB-5 |
| Regresión | Asegurar que un cambio no rompa funciones ya aprobadas | Suite automatizada en cada integración a la rama principal | Todos |
| Aceptación (UAT) | Confirmar con el cliente que el sistema cumple sus necesidades | Sesiones con usuarios de pymes sobre los flujos esenciales | Criterios de aceptación de cada RF |

## 3.2 Pruebas no funcionales

| Tipo | Propósito | Aplicación en Atlas | Requerimientos |
|---|---|---|---|
| Rendimiento – carga | Medir tiempos de respuesta bajo la carga esperada | 200 usuarios concurrentes realizando listados y CRUD | NFR-PERF-1, NFR-PERF-3 |
| Rendimiento – estrés y picos | Identificar el punto de quiebre y la recuperación | Incremento progresivo hasta degradación | NFR-PERF-3, NFR-DIS-1 |
| Rendimiento frontend | Medir tiempo de carga percibido en móvil | Lighthouse con perfil de red móvil | NFR-PERF-2 |
| Transferencia de archivos | Validar subida y descarga dentro del umbral | Documentos de 1, 5 y 10 MB | Criterio RF-5 (≤ 10 s) |
| Usabilidad | Evaluar facilidad de uso y comprensión de flujos | Pruebas moderadas con 5 adultos mayores y cuestionario SUS | NFR-USAB-1 a 4, 3.1.1 |
| Accesibilidad | Verificar conformidad WCAG 2.1 AA | Contraste, ARIA, teclado, lector de pantalla, objetivos táctiles | 3.1.1, NFR-USAB-1 |
| Compatibilidad | Asegurar funcionamiento en navegadores y dispositivos definidos | Chrome, Firefox, Safari y Edge (2 últimas versiones); móvil, tablet y escritorio | NFR-COMPAT-1, NFR-COMPAT-2 |
| Confiabilidad y recuperación | Verificar respaldos, restauración y tolerancia a fallos | Restauración de respaldo en ambiente QA y medición de tiempo de recuperación | NFR-SEG-7, NFR-DIS-2 |

## 3.3 Pruebas de seguridad

| Tipo | Propósito | Aplicación en Atlas | Requerimientos |
|---|---|---|---|
| Análisis estático (SAST) | Detectar vulnerabilidades en el código fuente | Revisión automática del código React y Express en cada commit | NFR-SEG-5 |
| Análisis de dependencias (SCA) | Detectar librerías con vulnerabilidades o licencias incompatibles | npm audit y Dependabot/Snyk sobre el stack declarado | Sección 4, Ley 17.336 |
| Análisis dinámico (DAST) | Detectar vulnerabilidades en la aplicación en ejecución | Escaneo de la API y SPA en QA | NFR-SEG-5 |
| Pruebas de control de acceso | Verificar autorización por rol y por empresa | Intentos de escritura con editor y acceso a recursos de otra empresa (IDOR) | NFR-SEG-4, RB-2, RB-4 |
| Pruebas de autenticación y sesión | Validar login, fuerza bruta, expiración y revocación de tokens | Reutilización de JWT tras logout, tokens alterados, política de contraseñas | RF-1, NFR-SEG-2, NFR-SEG-9 |
| Pruebas criptográficas | Verificar TLS y cifrado en reposo | Configuración TLS, redirección HTTP→HTTPS, campos bancarios cifrados en BD | NFR-SEG-1, NFR-SEG-3 |
| Pruebas de penetración | Simular un atacante con autorización formal | Checklist OWASP ASVS nivel 2 antes de producción | Criterio 3.3.1 |
| Pruebas de auditoría y logs | Confirmar que los eventos críticos quedan registrados sin datos sensibles | Revisión de registros tras cada acción crítica | RF-6.1, NFR-SEG-6 |

## 3.4 Justificación de la selección

La combinación responde al perfil de riesgo del producto. Atlas es transaccional y multiempresa, por lo que un error de autorización tiene impacto directo sobre datos de terceros; por eso las pruebas de control de acceso tienen prioridad alta y se automatizan. El público adulto mayor justifica pruebas de usabilidad con usuarios reales, que ninguna herramienta automática reemplaza. Los umbrales numéricos de NFR-PERF solo pueden demostrarse con pruebas de carga medibles, y la obligación legal de proteger datos personales exige evidencias de cifrado, trazabilidad y ausencia de vulnerabilidades críticas.
