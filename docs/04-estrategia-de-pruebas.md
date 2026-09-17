# 4. Estrategia de pruebas

## 4.1 Enfoque

Se adopta un **enfoque mixto basado en riesgo**. Las pruebas repetitivas y de regresión (unitarias, API, control de acceso, rendimiento y análisis de seguridad automatizado) se automatizan e integran al pipeline de integración continua. Las pruebas que requieren criterio humano (usabilidad, accesibilidad con lector de pantalla, exploratorias y de penetración manual) se ejecutan de forma manual.

La estrategia sigue el principio de *shift-left*: la seguridad y la calidad se verifican desde el inicio del desarrollo y no solo al final, lo que es coherente con la exigencia de seguridad por diseño de la Ley 21.663 y con la responsabilidad proactiva de la Ley 21.719.

## 4.2 Niveles y etapas del proceso

El proceso se basa en ISO/IEC/IEEE 29119 y se organiza en cinco etapas:

| Etapa | Actividades | Entregable |
|---|---|---|
| 1. Planificación | Análisis de la ERS, identificación de riesgos, definición de alcance, criterios y recursos | Plan de pruebas (este documento) |
| 2. Diseño | Redacción de casos de prueba, datos de prueba y matriz de trazabilidad | Casos de prueba y matriz |
| 3. Preparación del entorno | Configuración de ambiente QA, datos anonimizados, herramientas y pipeline CI | Ambiente QA operativo |
| 4. Ejecución | Pruebas unitarias → integración/API → sistema → no funcionales → seguridad → UAT | Registro de ejecución y defectos |
| 5. Cierre | Evaluación de criterios de salida, informe final y lecciones aprendidas | Informe de resultados |

## 4.3 Priorización basada en riesgo

La prioridad se calcula como probabilidad por impacto, considerando la criticidad legal del dato involucrado.

| Prioridad | Riesgo | Requerimientos | Justificación |
|---|---|---|---|
| P1 – Crítica | Acceso a datos de otra empresa o escritura con rol editor | RF-3.2, NFR-SEG-4, RB-2, RB-4 | Exposición de datos personales y bancarios; incumplimiento legal |
| P1 – Crítica | Suplantación de sesión o token no revocado | RF-1.1, RF-1.2, NFR-SEG-9 | Compromete todo el sistema |
| P1 – Crítica | Inyección SQL, XSS o CSRF | NFR-SEG-5 | Pérdida de integridad y confidencialidad |
| P1 – Crítica | Enlace compartido de documento accesible sin control | RF-5.5 | Fuga de contratos |
| P2 – Alta | Falta de registro de auditoría | RF-6.1, NFR-SEG-6 | Sin trazabilidad no se demuestra cumplimiento |
| P2 – Alta | Cálculo incorrecto del estado del contrato | RF-5.4 | Decisiones de negocio erróneas |
| P2 – Alta | Incumplimiento de umbrales de rendimiento | NFR-PERF-1 a 3 | Afecta la operación diaria |
| P3 – Media | Barreras de usabilidad y accesibilidad | NFR-USAB, 3.1.1 | Exclusión de adultos mayores |
| P3 – Media | Diferencias entre navegadores | NFR-COMPAT | Experiencia inconsistente |

## 4.4 Criterios de entrada

- ERS v1.1 aprobada y dudas de la sección 2.4 resueltas o asumidas formalmente.
- Build desplegado en ambiente QA con TLS habilitado y migraciones aplicadas.
- Pruebas unitarias del sprint aprobadas en el pipeline.
- Datos de prueba ficticios o anonimizados cargados (nunca datos reales de clientes).
- Herramientas configuradas y accesos entregados al equipo de QA.
- Autorización escrita para ejecutar pruebas de penetración.

## 4.5 Criterios de salida

- 100 % de los casos P1 ejecutados y aprobados.
- ≥ 95 % de los casos P2 y P3 aprobados, sin defectos abiertos de severidad crítica o alta.
- 0 vulnerabilidades críticas o altas abiertas (OWASP ZAP, SAST, SCA y pentest).
- Umbrales de NFR-PERF cumplidos en la prueba de carga.
- SUS ≥ 70 y sin bloqueos mayores en pruebas con adultos mayores.
- Matriz de trazabilidad con cobertura del 100 % de los requerimientos esenciales.
- Informe de resultados aprobado por QA Lead y Product Owner.

## 4.6 Criterios de suspensión y reanudación

Las pruebas se suspenden si el ambiente QA no está disponible, si un defecto bloqueante impide ejecutar más del 30 % de los casos planificados o si se detecta una vulnerabilidad crítica que exponga datos. Se reanudan cuando el defecto se corrige y se verifica con una prueba de confirmación, seguida de la regresión del módulo afectado.

## 4.7 Gestión de defectos

Cada defecto se registra en Jira con severidad (crítica, alta, media, baja), pasos de reproducción, evidencia y requerimiento asociado. El ciclo es: nuevo → asignado → en corrección → listo para verificar → cerrado o reabierto. Los defectos de seguridad se manejan con visibilidad restringida.
