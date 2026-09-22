# Guion de la sesión de usabilidad (CP-08)

Sesiones individuales con 5 participantes de 60 años o más, con consentimiento firmado y datos ficticios en el ambiente QA. Cada sesión dura unos 30 minutos. Uno de nosotros guía y el otro anota; no ayudamos al participante salvo que lo pida.

## Antes de empezar

- Explicar que se evalúa el sistema y no a la persona, y que puede pensar en voz alta.
- Dejar Atlas abierto en la pantalla de inicio de sesión con el usuario de prueba.
- Tener a mano la planilla de observación (abajo) y un cronómetro.

## Tareas

1. **Buscar un cliente y ver sus contratos.** "Busque al cliente Comercial Ñuñoa y revise qué contratos tiene y en qué estado están."
2. **Crear un cliente (con un error a propósito).** "Registre un cliente nuevo con estos datos." Se le entrega una tarjeta con el RUT mal escrito (12.345.678-X). Se observa si entiende el mensaje de error y si logra corregirlo con el RUT correcto (76.123.456-0).
3. **Revisar un contrato por vencer.** "Encuentre los contratos que están por vencer este mes."

## Planilla de observación

| Participante | Tarea | Tiempo (min) | Errores | Pidió ayuda | ¿La completó sola/o? | Comentarios |
|---|---|---|---|---|---|---|
| P1 | 1 | | | | | |
| P1 | 2 | | | | | |
| P1 | 3 | | | | | |

Meta del caso: al menos 80 % de las tareas completadas sin ayuda (12 de las 15 tareas en total).

## Cuestionario SUS

Al terminar las tareas, el participante marca de 1 (muy en desacuerdo) a 5 (muy de acuerdo):

1. Creo que me gustaría usar este sistema con frecuencia.
2. Encontré el sistema innecesariamente complejo.
3. Pensé que el sistema era fácil de usar.
4. Creo que necesitaría ayuda de una persona con conocimientos técnicos para usar este sistema.
5. Las funciones del sistema estaban bien integradas.
6. Pensé que había demasiada inconsistencia en el sistema.
7. Imagino que la mayoría de las personas aprendería a usar este sistema rápidamente.
8. Encontré el sistema muy difícil de usar.
9. Me sentí seguro/a usando el sistema.
10. Necesité aprender muchas cosas antes de poder usar el sistema.

**Cálculo:** en las preguntas impares se resta 1 al valor marcado; en las pares se resta el valor marcado a 5. Se suman los 10 resultados y el total se multiplica por 2,5, lo que da un puntaje de 0 a 100. El criterio de aceptación del caso es un SUS promedio de 70 o más (supuesto 5 de la sección 2.4 del informe).

## Revisión de accesibilidad (después de las sesiones, sin participantes)

- Pasar axe DevTools en login, listado de clientes, ficha de cliente y contratos. No debe haber errores críticos.
- Recorrer esas pantallas solo con teclado (Tab, Enter, Esc) y con NVDA leyendo en voz alta.
- Revisar contraste mínimo 4,5:1 y texto base de 16 px (supuesto 1 de la sección 2.4).
