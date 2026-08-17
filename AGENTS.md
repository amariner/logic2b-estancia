# Logic Estancia · Instrucciones persistentes

Estas instrucciones se aplican a todo el repositorio.

## Activador de continuidad

Cuando el usuario escriba `/goal continua con el desarrollo de este proyecto`, o una formulación inequívocamente equivalente:

1. Trátalo como una petición explícita para reanudar el objetivo de llevar Logic Estancia a su máximo potencial comercial y de producto, respetando el roadmap y sus límites de demostración.
2. Lee primero `plans/PROJECT_CONTINUATION.md`, este archivo, el estado de Git y los últimos commits. No repitas trabajo marcado como completado.
3. Contrasta el checkpoint con el código y las pruebas. Si se ha quedado obsoleto, corrígelo antes de elegir la siguiente tarea.
4. Continúa por el primer elemento pendiente, desbloqueado y de mayor impacto de la cola priorizada. Favorece conversión comercial, fiabilidad del embudo, claridad de la demostración, accesibilidad y evidencia medible.
5. Implementa un incremento coherente y terminado: código, contenido relacionado, pruebas proporcionadas al riesgo y QA visual cuando corresponda.
6. Ejecuta como mínimo `pnpm check` y las pruebas E2E relevantes. Antes de entregar, actualiza el checkpoint con lo completado, el siguiente punto exacto, bloqueos, fecha, pruebas y SHA.
7. La instrucción constituye autorización permanente para crear cambios del proyecto y, cuando el incremento esté verificado y el remoto no haya divergido, hacer commit y push a `origin/main`. No autoriza despliegues de producción, compras, publicación de precios no validados, creación de datos reales en CRM ni otras acciones externas irreversibles.
8. Si una tarea depende de credenciales, una decisión comercial o actividad humana, documenta el bloqueo y avanza con el siguiente elemento seguro que aporte valor.

## Principios invariables

- Solo existen los planes Básico, Gestión e Inteligente. Los valores antiguos se aceptan únicamente en bordes de compatibilidad.
- Nivora demuestra Básico sin dashboard; Terrava demuestra Gestión; Aurem demuestra Inteligente.
- Las demos son locales, ficticias, transparentes y no ejecutan reservas, pagos, comunicaciones ni sincronizaciones reales.
- La recomendación se basa en capacidades; el tamaño solo añade contexto de implantación.
- No se envía PII a GA4 y la analítica solo se activa tras consentimiento explícito.
- No se publican precios hasta completar 15 entrevistas cualificadas y 5 propuestas reales.
- No se inventan clientes, testimonios, integraciones, resultados comerciales ni funcionalidades operacionales.

## Fuente de verdad de continuidad

`plans/PROJECT_CONTINUATION.md` es el checkpoint operativo. Debe quedar actualizado al final de cada sesión de desarrollo para que la siguiente orden `/goal continua con el desarrollo de este proyecto` pueda continuar exactamente desde ahí.
