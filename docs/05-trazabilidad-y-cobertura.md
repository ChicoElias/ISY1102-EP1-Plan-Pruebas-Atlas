# 5. Cobertura y coherencia

## 5.1 Cobertura de requerimientos

La ERS contiene 42 requerimientos entre funcionales, reglas de negocio y no funcionales. Todos quedan trazados a una prueba: 27 (64 %) cuentan con un caso detallado en el capítulo 4 y los 15 restantes se cubren con una suite automatizada o una actividad planificada, que se documentará como caso en la iteración 2. El detalle requerimiento por requerimiento está en el Anexo A y en el archivo CSV del repositorio.

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

Tabla 7. Cobertura de requerimientos por grupo.

La proporción es menor en los requerimientos funcionales porque el diseño priorizó el riesgo: los escenarios P1 de la sección 3.1 (acceso entre empresas, permisos del editor e inyección) tienen caso propio, mientras que flujos como el registro o la gestión de usuarios se cubren con la suite end-to-end, que no requiere un caso manual separado.

## 5.2 Coherencia del plan

Los objetivos declarados en 1.3 tienen respaldo en casos concretos: los permisos del editor se verifican en CP-02, el aislamiento entre empresas en CP-03, la protección de datos en CP-01 y CP-06, el rendimiento en CP-07, la experiencia del adulto mayor en CP-08 y la compatibilidad en CP-09.

Respecto de OWASP Top 10, quedan cubiertas con caso propio las categorías A01 (control de acceso), A02 (fallas criptográficas), A03 (inyección) y A07 (autenticación). A06 (componentes vulnerables) se controla con el análisis de dependencias del pipeline y A09 (registro y monitoreo) con la revisión de logs y de auditoría planificada.

## 5.3 Brechas para la iteración 2

- Documentar como casos la revocación de sesión (RF-1.2), el enlace compartido de documentos (RF-5.5), el cifrado en reposo (NFR-SEG-3) y la restauración de respaldos (NFR-SEG-7).
- Confirmar con CreaLab los supuestos de la sección 2.4: tamaño máximo de archivo, umbral de vencimiento y puntaje SUS mínimo.
- Proponer requerimientos de consentimiento, derechos del titular y notificación de brechas, exigibles bajo la Ley 21.719 y ausentes en la ERS.
