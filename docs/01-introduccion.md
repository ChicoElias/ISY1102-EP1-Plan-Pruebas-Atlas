# 1. Introducción

## 1.1 Contexto del software

Atlas es una plataforma web que CreaLab SpA está desarrollando para pymes chilenas. Sirve para registrar clientes, asociarles contratos con sus documentos y administrar qué usuarios de cada empresa pueden ver o modificar esa información. La ERS (versión 1.1) define dos roles internos, administrador y editor, y exige un registro de auditoría para las acciones críticas.

Técnicamente es una SPA en React 19 que consume una API REST hecha en Node.js con Express 4, sobre una base de datos PostgreSQL. La sesión se maneja con JWT de corta duración y refresh token, las contraseñas se guardan con bcrypt y toda la comunicación debe ir por TLS. Además, el sistema tiene que funcionar en computador, tablet y celular, y la ERS pide poner atención especial en usuarios adultos mayores.

## 1.2 Clasificación del producto

Para decidir qué probar primero clasificamos Atlas según los tres ejes vistos en clases:

| Eje | Clasificación | Por qué (según la ERS) |
|---|---|---|
| Calidad | Sistema transaccional de gestión, criticidad media-alta | Operaciones CRUD sobre clientes y contratos, tiempos de respuesta definidos (NFR-PERF) y disponibilidad de 99,5 % (NFR-DIS-1) |
| Seguridad | Sistema multiempresa con datos personales y bancarios | Datos bancarios de clientes (2.2), control de acceso por rol (NFR-SEG-4) y cifrado en reposo (NFR-SEG-3) |
| Cumplimiento | Trata datos personales de terceros bajo ley chilena | NFR-SEG-8, auditoría (RF-6) y acceso restringido por empresa (RB-2) |

En la práctica esto significa que no basta con que los formularios funcionen. Un error que deje a una empresa ver los clientes de otra es, al mismo tiempo, una falla funcional, un problema de seguridad y un incumplimiento de la normativa de datos personales.

## 1.3 Propósito del plan

Con este plan queremos dejar definido cómo se va a comprobar que Atlas cumple lo que promete la ERS antes de salir a producción. Los focos son:

- que las funciones esenciales (login, gestión de usuarios, clientes, contratos y auditoría) respondan como está especificado;
- que ninguna empresa pueda acceder a datos de otra y que el rol editor no pueda escribir;
- que los datos personales y bancarios estén protegidos en tránsito y en reposo;
- que el sistema cumpla los tiempos de respuesta y sea usable para adultos mayores;
- que quede evidencia suficiente para demostrar cumplimiento de la Ley 19.628 y la Ley 21.719.

## 1.4 Alcance

El plan cubre los requerimientos funcionales RF-1 a RF-6, las reglas de negocio RB-1 a RB-5 y los no funcionales de seguridad, rendimiento, usabilidad, disponibilidad y compatibilidad descritos en la sección 3 de la ERS.

Quedan fuera la infraestructura física del proveedor de hosting, el funcionamiento interno del servicio de correo (solo se prueba la integración) y cualquier auditoría legal formal, que le corresponde a un abogado y no al equipo de QA.
