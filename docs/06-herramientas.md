# 6. Herramientas utilizadas

| Herramienta | Tipo de prueba | Uso en Atlas | Fundamento |
|---|---|---|---|
| Jest + Supertest | Unitarias e integración de API | Pruebas de servicios y endpoints Express | Estándar en el ecosistema Node.js; se integra al pipeline CI |
| React Testing Library | Unitarias de componentes | Formularios de login, registro y clientes | Prueba componentes como los usa el usuario, favoreciendo accesibilidad |
| Swagger (OpenAPI) + Postman/Newman | Pruebas de API y contrato | Colección de endpoints críticos con aserciones | Exigido en el criterio de la sección 3.1.2 de la ERS |
| Playwright | End-to-end y compatibilidad | Flujos completos en Chromium, Firefox y WebKit (Safari) | Cubre los navegadores de NFR-COMPAT-1 y emulación móvil |
| BrowserStack | Compatibilidad en dispositivos reales | Safari iOS, tablets Android y Edge | Complementa la emulación con dispositivos físicos |
| k6 (o Apache JMeter) | Carga, estrés y picos | 200 usuarios concurrentes y medición de p95 | Umbrales configurables que validan NFR-PERF automáticamente |
| Google Lighthouse | Rendimiento frontend y accesibilidad | Tiempo de carga en móvil y auditoría básica | Mide directamente NFR-PERF-2 |
| axe DevTools / WAVE | Accesibilidad | Contraste, ARIA y estructura semántica | Verificación automatizada frente a WCAG 2.1 AA |
| NVDA | Accesibilidad manual | Navegación con lector de pantalla | Detecta barreras que las herramientas automáticas no capturan |
| System Usability Scale (SUS) | Usabilidad | Cuestionario tras sesiones con adultos mayores | Entrega el puntaje cuantitativo que exige NFR-USAB |
| OWASP ZAP | DAST | Escaneo de la API y la SPA en QA | Herramienta abierta alineada con OWASP Top 10 |
| Burp Suite Community | Pentest manual | Manipulación de JWT, IDOR, CSRF y enlaces compartidos | Permite probar control de acceso con precisión |
| SonarQube / Semgrep | SAST y calidad de código | Vulnerabilidades y deuda técnica en cada commit | Seguridad desde el desarrollo (shift-left) |
| npm audit + Dependabot | SCA | Vulnerabilidades y licencias de dependencias | Controla OWASP A06 y la Ley 17.336 |
| SSL Labs / testssl.sh | Pruebas criptográficas | Versión y configuración de TLS | Evidencia objetiva de NFR-SEG-1 |
| GitHub Actions | Integración continua | Ejecución automática de suites en cada push | Regresión constante y trazabilidad de ejecuciones |
| Jira + Xray | Gestión de pruebas y defectos | Casos, ejecuciones, defectos y trazabilidad | Centraliza la evidencia de cumplimiento |
