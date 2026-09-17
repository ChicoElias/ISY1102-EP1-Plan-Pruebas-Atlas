# 11. Análisis de cobertura y coherencia del plan

## 11.1 Cobertura cuantitativa

| Grupo de requerimientos | Total en ERS | Con caso de prueba detallado | Cubiertos por suite o actividad planificada | Cobertura total |
|---|---|---|---|---|
| Funcionales (RF) | 17 | 15 | 2 (RF-3.1, RF-3.3) | 100 % |
| Reglas de negocio (RB) | 5 | 5 | 0 | 100 % |
| Seguridad (NFR-SEG) | 9 | 7 | 2 (NFR-SEG-3, NFR-SEG-7) | 100 % |
| Rendimiento (NFR-PERF) | 3 | 3 | 0 | 100 % |
| Usabilidad (NFR-USAB) | 4 | 4 | 0 | 100 % |
| Disponibilidad (NFR-DIS) | 2 | 1 | 1 (NFR-DIS-2) | 100 % |
| Compatibilidad (NFR-COMPAT) | 2 | 2 | 0 | 100 % |
| **Total** | **42** | **37 (88 %)** | **5 (12 %)** | **100 %** |

Todos los requerimientos de la ERS quedan trazados. El 88 % cuenta con un caso de prueba documentado en esta iteración y el resto se cubre mediante suites de regresión o actividades específicas que se detallarán como casos en la iteración 2.

## 11.2 Distribución por tipo de prueba

| Tipo | Casos | Porcentaje |
|---|---|---|
| Funcional (unitaria, integración, sistema, API) | CP-01, CP-03, CP-06, CP-07, CP-08 | 38 % |
| Seguridad | CP-02, CP-04, CP-05, CP-09, CP-10 | 38 % |
| No funcional (rendimiento, usabilidad, accesibilidad, compatibilidad) | CP-11, CP-12, CP-13 | 23 % |

El peso de las pruebas de seguridad es deliberado: los cinco riesgos P1 identificados en la sección 4.3 tienen al menos un caso asociado, y todos ellos involucran datos personales o bancarios.

## 11.3 Coherencia con los objetivos y estándares

- **Con los objetivos del proyecto:** cada objetivo del plan (sección 1.3) tiene casos asociados. El aislamiento entre empresas se verifica en CP-04 y CP-05; la protección de datos en CP-02, CP-09 y CP-10; el rendimiento en CP-11 y la experiencia de adultos mayores en CP-12.
- **Con ISO/IEC 25010:** las ocho características de calidad tienen al menos un criterio y una forma de medición (sección 2.1). Mantenibilidad y portabilidad tienen menor profundidad porque la ERS no define métricas explícitas para ellas.
- **Con OWASP Top 10:** se cubren A01, A02, A03, A05, A06, A07 y A09. A08 (integridad de software y datos) y A10 (SSRF) quedan cubiertas solo por el análisis automatizado, ya que la ERS no describe funciones que descarguen recursos externos.
- **Con el marco legal chileno:** las evidencias de CP-05, CP-09 y los registros de auditoría permiten demostrar medidas de seguridad y control de acceso, que es lo que exige la responsabilidad proactiva de la Ley 21.719. El uso exclusivo de datos ficticios en ambientes de prueba aplica el principio de minimización.

## 11.4 Brechas identificadas y acciones

| Brecha | Impacto | Acción propuesta |
|---|---|---|
| La ERS no define tamaño máximo de archivo ni umbral de "vence" | Criterios de aceptación ambiguos en CP-07 y CP-08 | Validar supuestos (10 MB y 30 días) con el Product Owner |
| Fuente de 12 px en la ERS | Riesgo de incumplir NFR-USAB-1 y WCAG para adultos mayores | Proponer cambio a 16 px antes del diseño final |
| Contradicción entre RF-4.1 y RB-4 sobre quién crea clientes | Posibles defectos de autorización | Aclaración formal; CP-04 prueba la interpretación restrictiva |
| Sin requerimientos de consentimiento, derechos del titular ni reporte de brechas | Riesgo de incumplimiento de la Ley 21.719 | Recomendar nuevos requerimientos y casos para la iteración 2 |
| Sin métrica para disponibilidad en ambiente de prueba | NFR-DIS-1 solo verificable en operación | Monitoreo con alertas desde preproducción |
| Casos pendientes de detalle (RF-3.1, RF-3.3, NFR-SEG-3, NFR-SEG-7, NFR-DIS-2) | Cobertura documental parcial | Redactar CP-14 a CP-18 en la iteración 2 |

## 11.5 Conclusión

El plan es coherente con la naturaleza de Atlas: un sistema multiempresa que trata datos personales y bancarios de terceros. La estrategia mixta basada en riesgo concentra el esfuerzo en el control de acceso y la protección de datos, sin descuidar el rendimiento y la usabilidad para adultos mayores que la ERS declara como prioritarios. La trazabilidad completa entre requerimientos, casos y controles normativos permite, además de detectar defectos, reunir evidencia de cumplimiento frente a la Ley 19.628, la Ley 21.719 y los estándares ISO/IEC y OWASP. Las brechas detectadas en la propia ERS se documentan como insumo para la siguiente iteración del caso semestral.
