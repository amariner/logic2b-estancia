# Logic Estancia · Instrucciones persistentes

Estas instrucciones se aplican a todo el repositorio.

## Activador de continuidad

Cuando el usuario escriba `/goal continua con el desarrollo de este proyecto`, o una formulación inequívocamente equivalente:

1. Trátalo como una petición explícita para reanudar el objetivo de llevar Logic Estancia a su máximo potencial comercial y de producto, respetando el roadmap y sus límites de demostración.
2. Lee primero `plans/PROJECT_CONTINUATION.md`, este archivo, el estado de Git y los últimos commits. No repitas trabajo marcado como completado.
3. Contrasta el checkpoint con el código y las pruebas. Si se ha quedado obsoleto, corrígelo antes de elegir la siguiente tarea.
4. Aplica el consejo multidisciplinar definido en `docs/MULTIDISCIPLINARY_REVIEW.md`. Cada perfil debe revisar el estado y ayudar a encauzar la prioridad, aunque no todos tengan cambios que solicitar.
5. Continúa por el primer elemento pendiente, desbloqueado y de mayor impacto de la cola priorizada. Favorece conversión comercial, fiabilidad del embudo, claridad de la demostración, accesibilidad y evidencia medible.
6. Implementa un incremento coherente y terminado: código, contenido relacionado, pruebas proporcionadas al riesgo y QA visual cuando corresponda.
7. Repite la revisión multidisciplinar sobre el resultado y registra en el checkpoint los hallazgos relevantes, las correcciones realizadas y cualquier deuda aceptada.
8. Ejecuta como mínimo `pnpm check` y las pruebas E2E relevantes. Antes de entregar, actualiza el checkpoint con lo completado, el siguiente punto exacto, bloqueos, fecha, pruebas y SHA.
9. La instrucción constituye autorización permanente para crear cambios del proyecto y, cuando el incremento esté verificado y el remoto no haya divergido, hacer commit y push a `origin/main`. No autoriza despliegues de producción, compras, publicación de precios no validados, creación de datos reales en CRM ni otras acciones externas irreversibles.
10. Si una tarea depende de credenciales, una decisión comercial o actividad humana, documenta el bloqueo y avanza con el siguiente elemento seguro que aporte valor.

## Consejo multidisciplinar obligatorio

Todo incremento debe revisarse desde estos perfiles, actuando como perspectivas complementarias y no como silos:

- Estrategia de marketing.
- Diseño de producto.
- UX.
- UI y dirección visual.
- SEO.
- Arquitectura frontend.
- Ingeniería full stack.
- QA, accesibilidad, rendimiento y confianza comercial como controles transversales.

Antes de implementar se identifica qué necesita cada perfil. Después se registra `correcto`, `corregido`, `no aplica` o `pendiente`, con una razón breve. Un problema de veracidad, seguridad, privacidad, accesibilidad crítica o pérdida de datos bloquea el cierre del incremento.

## Principios invariables

- Solo existen los planes Básico, Gestión e Inteligente. Los valores antiguos se aceptan únicamente en bordes de compatibilidad.
- Nivora demuestra Básico sin dashboard; Terrava demuestra Gestión; Aurem demuestra Inteligente.
- Las demos son locales, ficticias, transparentes y no ejecutan reservas, pagos, comunicaciones ni sincronizaciones reales.
- El único formulario que envía solicitudes reales es el formulario comercial de la landing; su destinatario interno de producción es `marinerandreu+logic@gmail.com`.
- Los formularios y controles de Nivora, Terrava, Aurem y sus dashboards solo modifican estado local ficticio. Nunca se conectan a email, CRM, inventario, reservas, pagos, mensajería ni proveedores externos.
- HubSpot permanece fuera de alcance y no debe configurarse ni invocarse hasta una autorización futura explícita.
- La recomendación se basa en capacidades; el tamaño solo añade contexto de implantación.
- No se envía PII a GA4 y la analítica solo se activa tras consentimiento explícito.
- No se publican precios hasta completar 15 entrevistas cualificadas y 5 propuestas reales.
- No se inventan clientes, testimonios, integraciones, resultados comerciales ni funcionalidades operacionales.

## Fuente de verdad de continuidad

`plans/PROJECT_CONTINUATION.md` es el checkpoint operativo. Debe quedar actualizado al final de cada sesión de desarrollo para que la siguiente orden `/goal continua con el desarrollo de este proyecto` pueda continuar exactamente desde ahí. El método y los criterios del consejo se mantienen en `docs/MULTIDISCIPLINARY_REVIEW.md`.
