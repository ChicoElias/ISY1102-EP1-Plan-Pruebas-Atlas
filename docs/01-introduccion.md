# 1. Introducción

## 1.1 Contexto del software

Atlas es una plataforma web desarrollada por CreaLab SpA para la gestión de clientes, contratos y documentos asociados, orientada a pequeñas y medianas empresas en Chile. Según la Especificación de Requerimientos de Software (ERS v1.1, Forma A), el sistema permite a usuarios registrados crear una empresa, administrar usuarios internos con roles diferenciados (administrador y editor), gestionar clientes con datos personales y bancarios, registrar contratos con documentos adjuntos y mantener un registro de auditoría de las acciones críticas.

La solución corresponde a una aplicación multicapa: un frontend SPA construido en React 19 con Material UI y Tailwind, una API REST en Node.js con Express 4 y una base de datos PostgreSQL. La autenticación se basa en JWT de corta vigencia con refresh token, las contraseñas se almacenan con bcrypt y todas las comunicaciones deben viajar sobre TLS. La ERS exige además que el sistema sea accesible desde computadores, tablets y móviles, con especial atención a la usabilidad para adultos mayores.

## 1.2 Clasificación del producto

Para orientar el plan se clasificó Atlas según los tres ejes de la asignatura:

| Eje | Clasificación | Fundamento en la ERS |
|---|---|---|
| Calidad | Sistema de información empresarial transaccional (CRUD) de criticidad media-alta | Operaciones CRUD sobre clientes y contratos, umbrales de rendimiento (NFR-PERF) y disponibilidad 99,5 % (NFR-DIS-1) |
| Seguridad | Sistema multiusuario y multiempresa que trata datos personales y financieros | Datos bancarios de clientes (sección 2.2), control de acceso por rol (NFR-SEG-4), cifrado en reposo (NFR-SEG-3) |
| Cumplimiento normativo | Responsable de tratamiento de datos personales bajo la legislación chilena | NFR-SEG-8, RF-6 (auditoría), RB-2 (acceso restringido por empresa) |

Esta clasificación explica por qué el foco del plan no está solo en que las funciones "operen", sino en que lo hagan resguardando la confidencialidad entre empresas, la integridad de los contratos y la trazabilidad exigida por la normativa de protección de datos.

## 1.3 Propósito del plan de pruebas

El propósito de este plan es definir de manera sistemática cómo se verificará que Atlas cumple con sus requerimientos funcionales, no funcionales y reglas de negocio, y cómo esa verificación se relaciona con los estándares de calidad y el marco legal aplicable. En concreto, se busca asegurar que:

- Las funcionalidades esenciales (autenticación, registro, gestión de usuarios, clientes, contratos y auditoría) se comporten según lo especificado.
- Un usuario de una empresa no pueda acceder a datos de otra empresa y que el rol editor no pueda escribir información (RB-2, RB-4).
- Los datos personales y bancarios estén protegidos en tránsito y en reposo, y que cada acción crítica quede registrada.
- El sistema responda dentro de los umbrales definidos y sea utilizable por adultos mayores en distintos dispositivos y navegadores.
- Existan evidencias verificables que respalden el cumplimiento de la Ley 19.628, la Ley 21.719 y buenas prácticas reconocidas (ISO/IEC 25010, OWASP, WCAG).

## 1.4 Alcance

**Dentro del alcance:** módulos de autenticación y sesión (RF-1), registro y creación de empresa (RF-2), gestión de usuarios y roles (RF-3), gestión de clientes (RF-4), contratos y documentos (RF-5), auditoría (RF-6), API REST y requisitos no funcionales NFR-SEG, NFR-PERF, NFR-USAB, NFR-DIS y NFR-COMPAT, además de las reglas de negocio RB-1 a RB-5.

**Fuera del alcance de esta iteración:** pruebas sobre la infraestructura física del proveedor de hosting, el servicio de correo externo más allá de su integración, y auditorías legales formales, que corresponden a un asesor jurídico. Estos puntos se registran como riesgos y dependencias.

## 1.5 Estructura del informe

El documento se organiza en: criterios de calidad, seguridad y cumplimiento normativo (sección 2); tipos de prueba y su justificación (sección 3); estrategia de pruebas (sección 4); criterios de aceptación y herramientas (secciones 5 y 6); recursos y cronograma (secciones 7 y 8); diseño de casos de prueba (sección 9); matriz de trazabilidad entre requerimientos, pruebas y controles normativos (sección 10); y análisis de cobertura y coherencia del plan (sección 11).
