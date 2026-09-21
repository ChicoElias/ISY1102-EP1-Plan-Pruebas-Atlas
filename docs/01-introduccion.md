# 1. Introducción

## 1.1 Contexto del software

Atlas es una plataforma web que CreaLab SpA desarrolla para pequeñas y medianas empresas chilenas. Permite registrar clientes, asociarles contratos con sus documentos y controlar qué usuarios de cada empresa pueden ver o modificar esa información. La Especificación de Requerimientos de Software (ERS) en su versión 1.1 define dos roles internos, administrador y editor, y exige un registro de auditoría para las acciones críticas.

La arquitectura es de tres capas: una aplicación de página única (SPA) en React 19 que consume una interfaz de programación de aplicaciones (API) REST construida en Node.js con Express 4, sobre una base de datos PostgreSQL. La sesión se maneja con JSON Web Token (JWT) de corta duración más un token de refresco, las contraseñas se almacenan con bcrypt y todo el tráfico viaja sobre Transport Layer Security (TLS). El sistema debe funcionar en computador, tablet y celular, con atención especial a usuarios adultos mayores.

## 1.2 Clasificación del producto

Clasificamos Atlas según los tres ejes de la asignatura para decidir dónde concentrar el esfuerzo de prueba:

| Eje | Clasificación | Fundamento en la ERS |
|---|---|---|
| Calidad | Sistema transaccional de gestión, criticidad media-alta | Operaciones de alta, consulta, modificación y baja (CRUD) sobre clientes y contratos, tiempos de respuesta definidos (NFR-PERF) y disponibilidad de 99,5 % (NFR-DIS-1) |
| Seguridad | Sistema multiempresa con datos personales y bancarios | Datos bancarios de clientes (2.2), control de acceso por rol (NFR-SEG-4) y cifrado en reposo (NFR-SEG-3) |
| Cumplimiento | Responsable del tratamiento de datos de terceros bajo ley chilena | NFR-SEG-8, auditoría (RF-6) y acceso restringido por empresa (RB-2) |

Tabla 1. Clasificación de Atlas según calidad, seguridad y cumplimiento.

Un defecto de autorización en Atlas no es solo una falla funcional: expone datos personales de terceros e incumple la normativa de protección de datos. Esa condición ordena las prioridades de todo el plan.

## 1.3 Propósito y alcance

El plan define cómo se verificará que Atlas cumple lo especificado antes de pasar a producción. Los objetivos son comprobar que las funciones esenciales respondan según la ERS, que ninguna empresa acceda a datos de otra, que el rol editor no pueda escribir, que los datos personales y bancarios estén protegidos en tránsito y en reposo, que se cumplan los umbrales de rendimiento y usabilidad, y que quede evidencia suficiente para demostrar cumplimiento de la Ley 19.628 y la Ley 21.719.

El alcance cubre los requerimientos funcionales RF-1 a RF-6, las reglas de negocio RB-1 a RB-5 y los requerimientos no funcionales de seguridad, rendimiento, usabilidad, disponibilidad y compatibilidad descritos en la sección 3 de la ERS. Quedan fuera la infraestructura del proveedor de hosting, el funcionamiento interno del servicio de correo, del que solo se prueba la integración, y la auditoría legal formal, que corresponde a un asesor jurídico.
