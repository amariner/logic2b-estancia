# Logic Estancia · Checkpoint de continuidad

Última actualización: 2026-08-18

Último incremento de infraestructura verificado: consultar `git rev-parse HEAD`

Rama: `main`

Estado general: base comercial y demostrativa implementada; la portada ES/EN abre tres recorridos prospectables y diferenciados para casas rurales, apartamentos turísticos y hoteles, unidos a planes, diagnóstico, evidencia y conversación comercial. Cada vertical explica ahora su operación mediante un workflow visual propio de cinco etapas, con entradas, salidas, bifurcación, decisión humana y límite de integración. Todo el recorrido presenta Logic Estancia como un servicio gestionado: el equipo de Logic2B entiende la operación, configura lo acordado y acompaña la puesta en marcha, con el soporte base y los extras delimitados. Consentimiento, legales y contacto flotante de WhatsApp siguen el lenguaje visual de Camp. El código verificado del Worker `logic-estancia` ya no contiene contrato ni rama ejecutable de HubSpot y solo confirma una entrega cuando llega el mensaje interno de Resend; el resumen al visitante es secundario y un intento fallido conserva la referencia para reintento idempotente. Producción continúa en la versión `2c2df127-2af5-4d54-906b-6c16ccf2fbb6`, sin variables ni token de HubSpot, hasta un despliegue autorizado de este incremento. La landing comercial es el único punto que envía solicitudes reales y las dirige a `marinerandreu+logic@gmail.com`; después de una entrega muestra un recibo accesible con referencia, agenda opcional validada o fallback explícito. El diagnóstico conserva temporalmente en la pestaña solo contexto estructurado no identificativo, lo hace revisable y descartable en ese formulario único y lo elimina al enviar. Demos y dashboards permanecen estrictamente locales y ficticios.

El smoke operativo de Resend ya es reproducible mediante una CLI segura: permanece offline por defecto, exige autorización explícita y un buzón controlado para ejecutar, marca todo el payload como prueba técnica, verifica entrega/repetición y solo imprime una respuesta saneada. Su ejecución real sigue siendo una actividad humana autorizada y no forma parte de las pruebas automáticas.

Para no saturar Higgsfield, cualquier imagen raster nueva que llegue a ser necesaria se generará con la suscripción integrada de OpenAI, mediante una llamada por recurso, pausa entre generaciones e inspección individual. El incremento actual no necesitó imágenes nuevas: reutiliza el sistema visual existente y no consumió ningún generador.

El SHA actual de continuidad se obtiene siempre con `git rev-parse HEAD`; no se fija aquí para evitar que el propio commit de actualización deje el dato obsoleto.

## Cómo reanudar

Al recibir `/goal continua con el desarrollo de este proyecto`:

1. Leer `AGENTS.md` y este checkpoint completo.
2. Ejecutar `git status --short --branch`, revisar los últimos commits y preservar cualquier cambio del usuario.
3. Validar que el checkpoint sigue coincidiendo con el código.
4. Realizar la revisión previa del consejo definido en `docs/MULTIDISCIPLINARY_REVIEW.md`.
5. Seleccionar el primer elemento desbloqueado de la cola priorizada.
6. Implementar, repetir la revisión multidisciplinar, probar, documentar, actualizar este archivo y subir el incremento verificado según `AGENTS.md`.

## Entregado

- Dominio consolidado en Básico, Gestión e Inteligente, con normalización de valores antiguos en el borde.
- Fuente única de capacidades, categorías, madurez y evidencia localizada, con destino exacto, prueba observable y límite explícito por capacidad.
- Portada, planes, soluciones para gestores y hoteles y diagnóstico de seis pasos en ES/EN, unidos por la secuencia problema → punto de partida → evidencia → conversación comercial.
- Propuesta de servicio humano gestionado transversal en portada, landings verticales y planes: Logic2B adapta y configura lo acordado, prueba los casos importantes y mantiene soporte base tras la puesta en marcha; migraciones, integraciones, mejoras y soporte extendido conservan alcance separado.
- Contacto flotante de WhatsApp ES/EN alineado con Camp: icono reconocible, CTA breve, geometría responsive, aparición progresiva y retirada automática ante consentimiento o pie de página para no tapar contenido.
- Workflows operativos detallados ES/EN para casas rurales, apartamentos y hoteles: cinco etapas específicas, entradas y salidas, bifurcación, control humano, resultado y límites reales, renderizados de forma nativa y responsive sin imágenes ni JavaScript adicional.
- Resultado del diagnóstico antes de solicitar datos personales y precarga desde soluciones, planes y demos.
- Captación comercial exclusivamente mediante Resend desde el formulario de la landing, con consentimiento separado y parámetros controlados; HubSpot está desactivado y fuera de alcance.
- Cierre post-entrega del formulario comercial ES/EN con plazo visible, política de privacidad enlazada, referencia saneada, foco accesible y agenda opcional limitada a HTTPS sin credenciales; si no existe agenda, la solicitud queda confirmada sin ofrecer un enlace falso.
- Semántica de entrega reforzada: el correo interno es obligatorio para devolver éxito, el resumen al visitante puede degradarse sin perder el lead y un `202` no reconocido nunca abre el recibo; las consultas directas ya no reciben una recomendación Básico inventada.
- Rate limit persistente en Cloudflare Durable Objects, con cinco solicitudes por minuto e IP y fallo cerrado si la coordinación no está disponible.
- Idempotencia integral de Resend durante 24 horas: referencia durable, concurrencia coalescida y claves estables separadas para mensaje interno y resumen al visitante.
- Recuperación manual de entregas degradadas documentada sin exponer secretos.
- Remitente, destinatario interno, reply-to y agenda extraídos a entorno, validados sin registrar valores; email falla cerrado si queda incompleto y la agenda insegura nunca llega al enlace público.
- Fallback ES/EN visible tras la entrega cuando no hay agenda válida, con cobertura E2E y QA visual responsive del diagnóstico.
- GA4/GTM condicionado al consentimiento y contrato de eventos sin PII.
- Consentimiento versionado y bilingüe con aceptar, rechazar, preferencias, migración desde la elección anterior y revocación con limpieza de cookies analíticas accesibles.
- Aviso legal, privacidad y cookies ES/EN ampliados con titular, alcance ficticio de las demos, proveedores, derechos, tabla de almacenamiento y control para cambiar la elección; adaptación todavía pendiente de validación jurídica profesional.
- `DemoState v2`, migración desde v1, recuperación ante corrupción y reset local.
- Siete flujos profundos: solicitud a reserva, operación de estancia, llegada en riesgo, mantenimiento, edición web, revisión de canales y revisión de IA supervisada.
- Demos canónicas Nivora, Terrava y Aurem con límites explícitos y CTA contextual.
- Diagnóstico sin captación duplicada: conserva sus respuestas en el navegador y conduce al único formulario comercial de la landing.
- Traspaso ES/EN del diagnóstico al formulario único mediante contexto `sessionStorage` validado y efímero: precarga tipo, plan y escala, permite revisar o descartar todas las respuestas adicionales y las adjunta solo con el envío comercial; no guarda PII y se limpia al enviar, descartar, caducar o cerrar la pestaña.
- Formularios, dashboards y acciones de las demos limitados a interacción visual/local; no envían correo, ni escriben en CRM, inventario, reservas, pagos, mensajes o proveedores externos.
- Límite de formularios demo reforzado en profundidad: Nivora, Terrava y Aurem explican que no usan Resend; sus seis variantes ES/EN realizan cero escrituras HTTP; las páginas llevan `form-action 'none'` y `/api/leads` rechaza ruta o referer de demo con `403` antes de rate limit o proveedores.
- Dos recursos SEO iniciales y playbook comercial.
- Kit comercial español `1.0.0` con plantillas versionadas de resumen de diagnóstico, seguimiento y propuesta, manifiesto, revisión humana obligatoria y CLI offline que recibe JSON por `stdin` sin escribir documentos ni hacer peticiones.
- Informe reproducible del embudo digital `1.0.0` sobre recuentos agregados consentidos, con contrato único de contenedor/eventos/parámetros, tasas direccionales, desgloses, advertencias de calidad y rechazo de identificadores o dimensiones libres. Estancia comparte explícitamente con Camp el contenedor `GTM-TVDWZ9LC`.
- QA visual responsive realizado; `pnpm check` con 7 tareas de lint, 21 tareas de typecheck/test/build y 14 pruebas operativas correctas, y `pnpm e2e` con 64 pruebas correctas, incluidas la semántica negativa de entrega, las comprobaciones dinámicas del traspaso de diagnóstico y 4 de SEO técnico.
- Worker `logic-estancia` publicado en `https://estancia.logic2b.com`, sin variables ni token de HubSpot, con assets, `LeadCoordinator`, cuatro secretos de correo cifrados y `workers.dev` desactivado. La versión activa es `2c2df127-2af5-4d54-906b-6c16ccf2fbb6`; `logic-estancia-demo` fue eliminado después de verificar el corte.
- CLI `pnpm smoke:resend` con modo seco predeterminado, autorización explícita, origen validado, payload no comercial estable, comprobación opcional de referencia idempotente y salida allowlisted sin PII ni secretos.
- Baseline automatizada WCAG 2.2 AA sobre las 30 rutas públicas, sin violaciones axe después de corregir contraste y objetivos táctiles; landmarks, foco visible, movimiento reducido, reflow a 320 px, texto al 200 %, foco contextual y estados dinámicos cubiertos por E2E, con las limitaciones humanas documentadas.
- Auditoría Lighthouse móvil reproducible: 99–100 en rendimiento, 100 en accesibilidad/buenas prácticas/SEO para rutas indexables; la demo mantiene `noindex` y queda exceptuada del umbral SEO por diseño.
- Matriz SEO sobre las 22 URLs indexables: canonical propio, diez parejas `hreflang`, JSON-LD y sitemap verificados; los dos recursos monolingües no anuncian traducciones inexistentes.
- Vista de ingresos Aurem ES/EN con escenario local explicable de 28 días, KPI seleccionables, fórmulas, libro semanal y enlaces a planning/reservas ficticios; ninguna cifra procede de PMS, canales, contabilidad o pagos.
- Matriz de Canales Aurem ES/EN con cero conexiones/publicaciones, cobertura por capacidad, inspección local, revisión persistente por rol y requisitos explícitos de una integración real; se eliminaron falsas horas de sincronización.
- Copiloto supervisado de Aurem ES/EN convertido en un flujo honesto de edición: fixture y fuentes visibles, borrador versionado local, revisión humana limitada por rol, trazabilidad completa y envío permanentemente deshabilitado sin modelo o proveedor.
- Guía narrativa de Aurem ES/EN ampliada a siete hitos de tres minutos: llegada en riesgo, coordinación, control, ingresos, canales, IA supervisada y encaje. Cada hito muestra evidencia y límites propios, conserva y valida el progreso local, recupera la vista contextual al volver y termina en un diagnóstico precargado sin enviar datos.
- Mapa comercial de 14 capacidades reforzado en soluciones y planes ES/EN: cada elemento muestra plan mínimo, madurez, prueba verificable, límite y enlace profundo a la sección o vista ficticia exacta de Nivora, Terrava o Aurem. La tabla móvil acerca evidencia a la capacidad y explica su scroll propio.
- Hero comercial ES/EN rehecho como composición editorial a dos columnas: propuesta contenida, sin tarjetas flotantes, y acceso visual directo a casas rurales, apartamentos y hoteles. Cada negocio dispone de landing propia, argumento específico, FAQ, evidencia ficticia, límites y diagnóstico precargado; las rutas antiguas de gestores conservan canonical de compatibilidad hacia apartamentos.
- SEO comercial reforzado con títulos y descripciones únicos en doce superficies, `Service`/`OfferCatalog` coherente con el contenido visible, social cards grandes, política completa de snippets, enlaces internos y precarga de fuentes; Lighthouse móvil local deja las tres landings en 100/100/100/100 y la portada en 96/100/100/100, con CLS 0.

## Siguiente cola priorizada

### P0 · Resiliencia real del embudo

- Completado: herramienta reproducible y segura de smoke de Resend, con dry-run, autorización humana explícita, datos de prueba, verificación de referencia/outcome y procedimiento manual documentado.
- Completado: el único formulario real consume de nuevo la referencia y la agenda opcional devueltas por el Worker. El recibo ES/EN evita reenvíos accidentales, anuncia el resultado, valida la URL y conserva un fallback honesto cuando no hay agenda.
- Completado y verificado localmente: Resend interno pasa a ser la entrega obligatoria; un acuse aislado al visitante devuelve fallo reintentable, un acuse fallido con lead interno entregado se marca como degradado y el navegador exige un outcome de entrega real. HubSpot deja de ser una rama ejecutable y un valor heredado no puede generar llamadas CRM. Falta un despliegue de producción autorizado.

Siguiente punto exacto de activación: confirmar humanamente en el buzón interno que el mensaje del último smoke con referencia `e27e5bf3-a462-4db6-9f49-80d8486fe23c` está visible. Después, obtener autorización explícita para desplegar este incremento y repetir el smoke con un buzón controlado para verificar la nueva semántica en producción. `LEADS_MEETING_URL` sigue siendo opcional. HubSpot queda expresamente fuera de alcance hasta nueva decisión.

### P1 · Accesibilidad, SEO técnico y rendimiento

- Completado el alcance local reproducible: baseline automatizada WCAG 2.2 AA sobre 30 rutas, QA visual documentado, reflow a 320 px, texto al 200 %, foco contextual, estados dinámicos y movimiento reducido.
- Completado: comprobaciones automatizadas de axe, landmarks, foco visible, reduced motion, contraste, tamaño táctil, anuncios semánticos y recuperación de foco.
- Completado: Lighthouse móvil reproducible por encima de 90 en accesibilidad y SEO de rutas indexables, con `noindex` de demos protegido como política.
- Completado: datos estructurados, canonical, `hreflang` y sitemap contrastados con las 22 URLs finales indexables.

P1 no conserva desarrollo local pendiente. Sus validaciones humanas externas permanecen registradas como deuda y no se declaran completadas.

Bloqueos humanos de P1: recorridos completos con VoiceOver y otro lector representativo, modos de alto contraste, validación de comprensión, contraste Lighthouse contra producción y revisión jurídica. No bloquean el siguiente incremento local seguro.

### P2 · Profundidad comercial de las demos

- Completado: pantalla navegable de revenue de Aurem, con ingresos, ocupación, ADR y RevPAR matemáticamente consistentes, límites visibles y evidencia contextual enlazada.
- Completado: Canales Aurem con matriz local de cobertura/estado, requisitos de conexión real, permisos y revisión supervisada que nunca publica inventario ni tarifas.
- Completado: copiloto de IA supervisada de Aurem con fixture y fuentes explícitos, edición/versionado local, revisión por rol, trazabilidad y envío bloqueado por diseño.
- Completado: guía narrativa de tres minutos de Aurem con siete hitos contextuales, progreso recuperable entre sesiones, evidencia explícita de ingresos/canales/IA supervisada y salida clara al diagnóstico Inteligente precargado.
- Completado: mapa de las 14 capacidades con plan mínimo, madurez, prueba y límite localizados, enlazado a la sección o vista ficticia exacta de Nivora, Terrava o Aurem desde soluciones y planes.

P2 no conserva desarrollo local pendiente. La continuidad pasa a P3.

### P3 · Contenido y conversión

- Bloqueado: crear los siguientes contenidos españoles de alta intención exige objeciones obtenidas de entrevistas o conversaciones reales; no se inventarán.
- Completado por instrucción comercial explícita: nueva línea base narrativa ES/EN de portada, soluciones, planes y diagnóstico. No se presenta como experimento ni como variante ganadora; elimina jerga interna, métricas ficticias ambiguas y una promesa de SLA no demostrada, manteniendo límites y precios sin publicar.
- Completado: kit español `1.0.0` de resumen de diagnóstico, seguimiento y propuesta. Las tres plantillas separan hechos, evidencia ficticia, preguntas y alcance; impiden planes antiguos, no publican precios y conservan un único siguiente paso.
- Completado: informe reproducible `1.0.0` del embudo digital mediante `pnpm funnel:report`, limitado a recuentos agregados de la allowlist consentida y sin atribución usuario a usuario.
- Completado: contrato analítico único compartido por landing, demos e informe; el configurador de alcance ya no escribe directamente en `dataLayer` y el E2E demuestra que PII, parámetros y eventos desconocidos se descartan.
- Completado: continuidad del diagnóstico al único formulario real. El contexto no identificativo permanece como máximo dos horas en la pestaña, se valida contra allowlists, se muestra antes de enviarse, puede descartarse y nunca crea una segunda captación.
- Pendiente: ejecutar un único experimento principal de conversión y registrar hipótesis, variante y resultado. No se elige ni se declara un experimento sin línea base real.

P3 no conserva otro desarrollo local seguro y respaldado por evidencia. Siguiente punto exacto de activación: configurar humanamente dentro del contenedor compartido `GTM-TVDWZ9LC` las etiquetas y activadores de Estancia sin alterar los de Camp, obtener un primer periodo comparable de recuentos agregados consentidos posterior a esta nueva línea base, ejecutar `pnpm funnel:report` y seleccionar una única hipótesis principal. Los datos anteriores y posteriores no se mezclarán sin segmentar por fecha; no se declarará un resultado sin observación real.

## Actividades externas pendientes

Estas actividades no se deben declarar completadas sin evidencia humana o acceso autorizado:

- Confirmar humanamente la recepción del smoke de Resend; la API respondió `202 delivered` en el Worker y en el dominio con la misma referencia idempotente.
- Autorizar y ejecutar el despliegue del incremento verificado de entrega obligatoria interna; después repetir el smoke idempotente y confirmar ambos mensajes. Este checkpoint no autoriza por sí solo el despliegue.
- Configurar una URL real `LEADS_MEETING_URL` solo si se decide ofrecer agenda directa.
- HubSpot está fuera del contrato y del código ejecutable por decisión de producto; no configurar token, pipeline ni propiedades. Reintroducir un CRM exige una futura autorización explícita y una nueva revisión de privacidad, retención, idempotencia y pruebas.
- Configurar las etiquetas y activadores definitivos de Estancia dentro de `GTM-TVDWZ9LC`, el mismo contenedor de Camp, sin modificar el comportamiento de Camp. El identificador ya está confirmado y centralizado en código; la configuración del contenedor sigue siendo una actividad humana externa.
- Exportar después un periodo agregado y consentido con el contrato analítico `1.0.0`; no incluir identificadores ni dimensiones libres. Este dato desbloquea la elección del primer experimento.
- Revisar textos legales específicamente para España.
- Realizar 15 entrevistas cualificadas y presentar 5 propuestas reales antes de publicar precios.
- Conseguir 3 proyectos firmados al mes 6 y 8 al mes 12.
- Ejecutar la nueva CLI de smoke contra producción solo con autorización humana y un buzón de visitante controlado; verificar después ambos mensajes y sus claves idempotentes en Resend.

## Puerta mínima de calidad

```bash
pnpm check
pnpm e2e
```

Además: `git diff --check`, ausencia de secretos, ausencia de planes antiguos en superficies públicas, demos con `noindex`, estado local no enviado al servidor, revisión multidisciplinar registrada y SHA remoto coincidente después del push.

## Evidencia del último incremento

- Alcance: Worker de leads, contrato del recibo en la landing, pruebas unitarias/E2E, playbook, README y este checkpoint. No se añadieron dependencias, imágenes, endpoints, proveedores, PII, eventos analíticos ni despliegues.
- Conversión y resiliencia: el mensaje completo a `LEADS_INTERNAL_RECIPIENT` es condición necesaria para `202`; si solo llega el resumen al visitante se devuelve `502`, el Durable Object conserva la misma referencia y permite reintentar. Si llega el lead interno pero falla el resumen, el resultado es `202 delivered_degraded` y no se pierde la captación.
- Veracidad: el navegador solo muestra el recibo para `delivered` o `delivered_degraded`. El correo de una consulta directa confirma la solicitud y el alojamiento, pero no asigna Básico ni muestra capacidades inexistentes; una recomendación solo se nombra cuando el payload incluye un plan real.
- Seguridad y privacidad: se eliminaron bindings, tipos, peticiones y sincronización de HubSpot. Una prueba introduce deliberadamente un valor heredado y demuestra que las únicas dos llamadas salen hacia Resend. Rate limit, idempotencia, destinatario, consentimiento, demos y contrato analítico no cambian.
- `pnpm check`: 7 tareas de lint, 21 tareas de typecheck/test/build y 14 pruebas operativas correctas; 33/33 pruebas del Worker, incluidas entrega parcial, reintento con referencia estable, las dos variantes del acuse y ausencia de CRM.
- `pnpm e2e`: 64/64 pruebas Chromium correctas. La prueba nueva fuerza un `202 demo`, comprueba que no aparece un recibo falso, mantiene el formulario reintentable y conserva el mensaje de error accesible.
- QA visual: no aplica una nueva captura porque no cambiaron DOM visible, estilos ni geometría; los estados de éxito/error, foco, reflow, axe y responsive se recorrieron en la suite completa sin regresiones.

## Revisión multidisciplinar del checkpoint actual

- Marketing estratégico: corregido — una consulta directa recibe un acuse fiel y no una recomendación Básico que nunca obtuvo; una entrega interna fallida ya no infla conversiones ni confianza.
- Diseño de producto: corregido — la captación real tiene un único destino obligatorio y el resumen al visitante recupera su papel secundario; no se introduce otro canal operativo.
- UX: corregido — un `202` ajeno a `delivered`/`delivered_degraded` conserva el formulario, muestra el error existente y permite reintentar en vez de cerrar falsamente la tarea.
- UI/dirección visual: no aplica — no cambian componentes visibles, estilos ni geometría; los estados ya diseñados de recibo y error se reutilizan sin regresiones responsive.
- SEO: correcto — no cambian contenido indexable, metadata, headings, canonical, `hreflang`, sitemap ni datos estructurados; las cuatro pruebas SEO permanecen verdes.
- Arquitectura frontend: corregido — la landing valida el outcome del contrato, no solo el código HTTP; el cambio añade 0,02 kB al bundle inline y no incorpora dependencias.
- Full stack: corregido — el Worker falla cerrado si el mensaje interno no llega, permite reintento idempotente con la misma referencia y elimina por completo el camino ejecutable de HubSpot.
- QA/accesibilidad/rendimiento/confianza: corregido — 33 unitarias del Worker y 64/64 E2E cubren fallos parciales, ausencia de CRM, las dos variantes del acuse, estado reintentable, accesibilidad y regresión completa; no quedan bloqueantes conocidos.

Deuda aceptada: faltan recorridos humanos con VoiceOver y otro lector, modos de alto contraste y validación de comprensión. El nuevo contrato de entrega y Lighthouse deben comprobarse en producción tras un despliegue autorizado. También queda confirmar el smoke anterior; los textos legales requieren revisión jurídica española; la agenda es opcional y HubSpot continúa fuera de alcance. Las etiquetas/activadores de Estancia dentro del GTM compartido y un periodo agregado posterior a esta nueva línea base bloquean la selección del primer experimento; no se ha inventado variante ni resultado.

## Registro de continuaciones

- 2026-08-17 — Se implantó la experiencia comercial de tres planes y las cinco demostraciones. Commit `6f08b24`. Próximo punto: P0, resiliencia real del embudo.
- 2026-08-17 — Se incorporó el consejo multidisciplinar obligatorio para revisar y encauzar cada continuación desde marketing, producto, UX, UI, SEO, arquitectura frontend y full stack.
- 2026-08-17 — Se sustituyó el rate limit en memoria por Durable Objects y se hizo idempotente el lead completo, incluida la creación de negocios en HubSpot. Commit `025c543`. Próximo punto: configuración segura de remitentes, destinatarios y agenda.
- 2026-08-17 — Se extrajo y validó la configuración completa de Resend y agenda, con fallo cerrado, degradación observable, fallback visible ES/EN y cobertura responsive. Commit `678aa59`. Próximo punto: herramienta segura de smoke test de integraciones.
- 2026-08-17 — Se importó el patrón completo de consentimiento y legales de Camp, adaptado a Estancia, con 24 E2E y QA responsive. Commit `106a617`. Se creó el primer Worker Cloudflare, versión `92c45ea5-7f53-4702-b10b-d4b8f9446053`; DNS, secretos y smoke siguen bloqueando la publicación.
- 2026-08-17 — Se sustituyó la ruta por un dominio personalizado gestionado por Cloudflare y se publicó `https://estancia.logic2b.com`. Commit `841391c`. DNS, HTTPS, rutas, banner y rechazo del payload inválido verificados; tres variables de correo compatibles copiadas desde Camp. La clave de Resend, agenda real y smoke contra proveedores siguen bloqueando la operatividad del formulario.
- 2026-08-17 — Se preparó la migración de `logic-estancia-demo` a `logic-estancia`: nuevo Worker creado sin HubSpot, preview y producción simultáneamente sanos y tres secretos de correo trasladados. Pendiente añadir Resend al Worker nuevo, mover el dominio y ejecutar el smoke antes de retirar el Worker anterior.
- 2026-08-17 — Se completó el corte a `logic-estancia`: clave convertida a secreto, cuatro bindings cifrados consolidados, Resend validado con `202 delivered` e idempotencia por dominio, `workers.dev` desactivado y `logic-estancia-demo` eliminado. HubSpot permanece fuera de alcance; queda rotar la clave para invalidar el borrador histórico `plain_text`.
- 2026-08-17 — Se fijó la landing como único formulario productivo, con entrega exclusiva a `marinerandreu+logic@gmail.com`; diagnóstico, demos y dashboards quedaron explícitamente locales. Se regeneró la clave de Resend, se eliminó HubSpot de los legales y se desplegó la versión `2c2df127-2af5-4d54-906b-6c16ccf2fbb6`, validada con 24 E2E y smoke idempotente `202 delivered`.
- 2026-08-17 — Se añadió la CLI segura y reproducible de smoke de Resend, offline por defecto, con autorización explícita, payload inequívocamente técnico, verificación idempotente y salida sin PII. Validada con 9 pruebas específicas, 28 tareas de `pnpm check`, 29 pruebas del Worker y 24 E2E. Próximo punto: auditoría WCAG 2.2 AA automatizada sobre rutas principales.
- 2026-08-17 — Se automatizó la baseline WCAG 2.2 AA de las 30 rutas públicas y se corrigieron contraste sistémico y objetivos táctiles; se añadieron controles de landmarks, foco y movimiento reducido, documentación de límites y alineación de tipos Cloudflare. Verificado con 28 tareas, 32 E2E, axe limpio, peers limpios y QA visual responsive. Próximo punto: Lighthouse móvil y revisión técnica SEO final.
- 2026-08-17 — Se añadió Lighthouse móvil reproducible y la matriz SEO de las 20 URLs indexables. Portada logra 100 en las cuatro categorías; planes/diagnóstico 99 de rendimiento y 100 restantes. Se corrigieron `hreflang` y selector inexistentes en recursos ES-only. Verificado con 28 tareas de paquetes más lint raíz, 35 E2E y QA visual. Próximo punto: reflow/zoom, foco dinámico y validación asistiva manual.
- 2026-08-17 — Se completó el alcance WCAG reproducible local con reflow de 30 rutas a 320 px, texto al 200 %, foco contextual y estados dinámicos en diagnóstico, cookies, demos y gestor. Verificado con 14 pruebas específicas, 41 E2E y QA visual a 320 px. Próximo punto: pantalla local y ficticia de revenue para Aurem; lectores de pantalla y alto contraste quedan como validación humana.
- 2026-08-17 — Se profundizó Aurem con una vista ES/EN de revenue íntegramente local: KPI coherentes, fórmulas, libro semanal y navegación a evidencia ficticia. Axe corrigió contraste de etiquetas de gráfica; QA escritorio/320 px y 43 E2E quedan en verde. Próximo punto: matriz de Canales local y supervisada, sin publicar inventario ni tarifas.
- 2026-08-17 — Se convirtió Canales Aurem en una matriz ES/EN honesta y supervisada: cero conexiones/publicaciones, cobertura por capacidad, revisión local persistente por rol y requisitos de integración real. Se eliminaron horas de sincronización ficticias; verificado con 45 E2E, 8 unitarias y QA escritorio/320 px. Próximo punto: copiloto IA editable y trazable, con envío siempre bloqueado.
- 2026-08-17 — Se convirtió el copiloto de Aurem en un flujo IA supervisado ES/EN: fixture y fuentes visibles, edición/versionado local, revisión por rol, trazabilidad y envío permanentemente bloqueado. Verificado con 47 E2E, 10 unitarias y QA escritorio/320 px. Próximo punto: guía narrativa de tres minutos con hitos contextuales y recuperación entre sesiones.
- 2026-08-18 — Se completó la guía narrativa de Aurem ES/EN con siete hitos, evidencia y límites contextuales, recuperación exacta entre sesiones y salida al diagnóstico precargado. Verificado con 50 E2E, 12 unitarias, axe/foco y QA visual 1280/320 px. No requirió generar imágenes. Próximo punto: mapa de capacidades con evidencia enlazada desde cada flujo.
- 2026-08-18 — Se reforzó el mapa ES/EN de 14 capacidades con plan mínimo, madurez, prueba, límite y enlaces profundos a Nivora, Terrava y Aurem desde soluciones y planes. Se corrigieron la ambigüedad de Nivora y el acceso móvil a evidencia. Verificado con 52 E2E, `pnpm check` y QA visual 1366/320 px. No requirió generar imágenes. Próximo punto desbloqueado: plantillas versionadas de resumen, seguimiento y propuesta.
- 2026-08-18 — Se completaron el kit comercial español `1.0.0` y el informe reproducible del embudo `1.0.0`, ambos offline, versionados y cubiertos por 13 pruebas. La analítica usa ahora un contrato único y un E2E prueba el descarte de PII. Verificado con `pnpm check` y 53 E2E; no hubo cambios visuales. Próxima activación: etiquetas definitivas y línea base agregada real antes de elegir un único experimento.
- 2026-08-18 — Se confirmó y centralizó `GTM-TVDWZ9LC`, el mismo contenedor usado por Camp, para landing y demos de Estancia. La carga sigue condicionada al consentimiento y el E2E verifica la URL exacta en ambas superficies. Pendiente configurar humanamente etiquetas/activadores propios de Estancia dentro del contenedor compartido sin afectar Camp.
- 2026-08-18 — Se blindó la separación de Resend: solo la landing comercial puede entregar leads. Los seis formularios demo ES/EN permanecen locales, muestran su límite, reciben `form-action 'none'` y cualquier intento demo contra `/api/leads` se bloquea con `403` antes de proveedores. Verificado con 31 unitarias del Worker, `pnpm check`, 54 E2E y dry-run de 118 assets.
- 2026-08-18 — Se reconstruyó la línea base comercial ES/EN alrededor de margen, tiempo, venta directa y coordinación: portada, segmentos, planes, diagnóstico, FAQs, contacto, navegación y metadata SEO forman un único recorrido. Se retiraron métricas hero ambiguas y un SLA no respaldado; se corrigieron solapamiento, contraste y CLS mediante QA/axe/preload. Verificado con `pnpm check`, 55 E2E y Lighthouse móvil 100/100/100/100 en portada, planes y diagnóstico. Próxima activación: recoger un periodo agregado posterior a esta línea base antes de elegir un único experimento.
- 2026-08-18 — Se rehízo el hero como composición editorial con elección visual de negocio y se abrieron landings prospectables ES/EN para casas rurales, apartamentos y hoteles. Menú, pie, home, diagnóstico, analítica, sitemap y SEO técnico comparten los tres segmentos; aliases antiguos conservan canonical de compatibilidad. Verificado con `pnpm check`, 56 E2E, axe/reflow y Lighthouse móvil 100/100/100/100 en las tres landings. El dev permanece local; no se desplegó producción.
- 2026-08-18 — Se hizo transversal la propuesta de servicio humano gestionado: Logic2B entiende la operación, configura lo acordado y acompaña tras la puesta en marcha, con soporte base y extras delimitados. Portada, planes, landings ES/EN, FAQ y contacto comparten el mensaje. Verificado con `pnpm check`, 57 E2E, QA visual 1280/320 px y Lighthouse móvil; no se desplegó producción.
- 2026-08-18 — Se sustituyeron los bloques narrativos de las landings por workflows operativos ES/EN específicos para casas rurales, apartamentos y hoteles. Cada gráfico representa cinco etapas, entradas, salidas, bifurcación, decisión humana, resultado y límites; el copy y las capacidades se compactaron. Verificado con `pnpm check`, 59 E2E, axe/reflow, QA 1280/320 px y Lighthouse 100/100/100/100 en las tres verticales. No se desplegó producción.
- 2026-08-18 — Se alineó el contacto flotante de WhatsApp ES/EN con el patrón visual de Camp: icono, CTA breve, geometría responsive, foco accesible y retirada automática ante consentimiento o pie de página. Verificado con `pnpm check`, 60 E2E, axe, reflow y QA visual 1280/320 px. No se añadió sonido ni se desplegó producción.
- 2026-08-18 — Se cerró el único formulario real con recibo ES/EN, referencia, agenda HTTPS opcional y fallback honesto, corrigiendo el desfase introducido al retirar la captación duplicada del diagnóstico. Se enlazó privacidad, se retiró el honeypot de la interacción accesible y se fijó el checkbox móvil. Verificado con `pnpm check`, 61 E2E, axe y QA 1280/320 px. No se desplegó producción.
- 2026-08-18 — Se restauró la continuidad del diagnóstico al formulario único mediante contexto de sesión validado, efímero, sin PII, revisable y descartable. La precarga conserva tipo, plan y escala; el payload recupera las respuestas estructuradas ya admitidas por el Worker y se limpia al enviar. El QA corrigió el solapamiento móvil de WhatsApp en contacto. Verificado con `pnpm check`, 63 E2E, axe dinámico y QA 1280/320 px. No se desplegó producción.
- 2026-08-18 — Se corrigió la semántica de entrega del embudo: el correo interno es obligatorio, el acuse al visitante es secundario, los fallos parciales conservan referencia reintentable y el navegador no acepta un `202` sin outcome real. Se retiró la rama ejecutable de HubSpot y el acuse directo dejó de inventar Básico. Verificado con `pnpm check`, 33 unitarias del Worker y 64/64 E2E. No se desplegó producción.
