# 5. Criterios de aceptación transversales

Estos criterios aplican a todos los casos, además del criterio propio de cada uno. Un caso queda **aprobado** solo si obtiene el resultado esperado y no incumple ninguno de los puntos siguientes.

## 5.1 Criterios funcionales

- El sistema ejecuta la operación completa y persiste los datos correctamente en PostgreSQL.
- Las validaciones se aplican en backend, aunque existan en frontend; una petición directa a la API con datos inválidos debe ser rechazada con HTTP 400 o 422.
- Las eliminaciones son lógicas y solicitan confirmación previa al usuario (criterio RF-4).
- Toda operación crítica genera un registro de auditoría con usuario, empresa, acción, recurso, fecha y hora (RF-6.1).

## 5.2 Criterios de seguridad

- Un recurso no autorizado responde HTTP 401 (sin autenticación) o 403 (sin permiso), sin revelar si el recurso existe.
- Ninguna respuesta de la API ni mensaje de error expone contraseñas, hashes, tokens, trazas de pila o consultas SQL.
- Los datos bancarios se almacenan cifrados y no se escriben en logs en texto plano.
- Toda comunicación se realiza por HTTPS; las peticiones HTTP se redirigen o rechazan.

## 5.3 Criterios no funcionales

- Operaciones CRUD simples con percentil 95 inferior a 300 ms bajo carga normal (NFR-PERF-1).
- Página principal cargada en menos de 2 segundos en perfil de red móvil (NFR-PERF-2).
- Tasa de error inferior al 1 % con 200 usuarios concurrentes (NFR-PERF-3).
- Subida y descarga de documentos en 10 segundos o menos (criterio RF-5).
- Sin incumplimientos WCAG 2.1 AA de nivel crítico; contraste mínimo 4,5:1 en texto normal.

## 5.4 Criterios de reglas de negocio

- Solo usuarios vinculados en `empresa_usuarios` ven o editan datos de su empresa (RB-2).
- El rol editor no puede crear, editar ni eliminar (RB-4); el administrador tiene acceso completo (RB-5).
- Un contrato pertenece a un único cliente (RB-3).
- El correo principal no se repite entre empresas mientras la política esté activa (RB-1).

## 5.5 Severidad de defectos

| Severidad | Definición | Efecto sobre la aceptación |
|---|---|---|
| Crítica | Pérdida o exposición de datos, caída del sistema, vulneración de seguridad | Bloquea la liberación |
| Alta | Función esencial no disponible sin alternativa | Bloquea la liberación |
| Media | Función afectada con alternativa disponible | Se acepta con plan de corrección |
| Baja | Defecto visual o de redacción | Se acepta y se agenda |
