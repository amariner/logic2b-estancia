# Logic Estancia · Checkpoint de continuidad

Última actualización: 2026-08-18

Último incremento de infraestructura verificado: consultar `git rev-parse HEAD`

Rama: `main`

Estado general: base comercial y demostrativa implementada; la narrativa ES/EN de portada, soluciones, planes y diagnóstico ya parte de problemas reconocibles del cliente y conduce desde pérdida de margen/contexto hasta recomendación, evidencia y conversación comercial. Consentimiento y legales siguen equiparados al patrón de Camp; producción está consolidada en el Worker `logic-estancia`, sin HubSpot, con dominio personalizado, HTTPS y Resend verificado mediante smoke idempotente. La landing comercial es el único punto que envía solicitudes reales y las dirige a `marinerandreu+logic@gmail.com`; diagnóstico, demos y dashboards permanecen estrictamente locales y ficticios.

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
- Resultado del diagnóstico antes de solicitar datos personales y precarga desde soluciones, planes y demos.
- Captación comercial exclusivamente mediante Resend desde el formulario de la landing, con consentimiento separado y parámetros controlados; HubSpot está desactivado y fuera de alcance.
- Rate limit persistente en Cloudflare Durable Objects, con cinco solicitudes por minuto e IP y fallo cerrado si la coordinación no está disponible.
- Idempotencia integral durante 24 horas: referencia durable, concurrencia coalescida, claves estables de Resend y deduplicación de negocios mediante `logic_estancia_submission_id`.
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
- Formularios, dashboards y acciones de las demos limitados a interacción visual/local; no envían correo, ni escriben en CRM, inventario, reservas, pagos, mensajes o proveedores externos.
- Límite de formularios demo reforzado en profundidad: Nivora, Terrava y Aurem explican que no usan Resend; sus seis variantes ES/EN realizan cero escrituras HTTP; las páginas llevan `form-action 'none'` y `/api/leads` rechaza ruta o referer de demo con `403` antes de rate limit o proveedores.
- Dos recursos SEO iniciales y playbook comercial.
- Kit comercial español `1.0.0` con plantillas versionadas de resumen de diagnóstico, seguimiento y propuesta, manifiesto, revisión humana obligatoria y CLI offline que recibe JSON por `stdin` sin escribir documentos ni hacer peticiones.
- Informe reproducible del embudo digital `1.0.0` sobre recuentos agregados consentidos, con contrato único de contenedor/eventos/parámetros, tasas direccionales, desgloses, advertencias de calidad y rechazo de identificadores o dimensiones libres. Estancia comparte explícitamente con Camp el contenedor `GTM-TVDWZ9LC`.
- QA visual responsive realizado; `pnpm check` con 7 tareas de lint, 21 tareas de typecheck/test/build y 14 pruebas operativas correctas, y `pnpm e2e` con 55 pruebas correctas, incluidas 15 de accesibilidad y 4 de SEO técnico.
- Worker `logic-estancia` publicado en `https://estancia.logic2b.com`, sin variables ni token de HubSpot, con assets, `LeadCoordinator`, cuatro secretos de correo cifrados y `workers.dev` desactivado. La versión activa es `2c2df127-2af5-4d54-906b-6c16ccf2fbb6`; `logic-estancia-demo` fue eliminado después de verificar el corte.
- CLI `pnpm smoke:resend` con modo seco predeterminado, autorización explícita, origen validado, payload no comercial estable, comprobación opcional de referencia idempotente y salida allowlisted sin PII ni secretos.
- Baseline automatizada WCAG 2.2 AA sobre las 30 rutas públicas, sin violaciones axe después de corregir contraste y objetivos táctiles; landmarks, foco visible, movimiento reducido, reflow a 320 px, texto al 200 %, foco contextual y estados dinámicos cubiertos por E2E, con las limitaciones humanas documentadas.
- Auditoría Lighthouse móvil reproducible: 99–100 en rendimiento, 100 en accesibilidad/buenas prácticas/SEO para rutas indexables; la demo mantiene `noindex` y queda exceptuada del umbral SEO por diseño.
- Matriz SEO sobre las 20 URLs indexables: canonical propio, nueve parejas `hreflang`, JSON-LD y sitemap verificados; los dos recursos monolingües ya no anuncian traducciones inexistentes.
- Vista de ingresos Aurem ES/EN con escenario local explicable de 28 días, KPI seleccionables, fórmulas, libro semanal y enlaces a planning/reservas ficticios; ninguna cifra procede de PMS, canales, contabilidad o pagos.
- Matriz de Canales Aurem ES/EN con cero conexiones/publicaciones, cobertura por capacidad, inspección local, revisión persistente por rol y requisitos explícitos de una integración real; se eliminaron falsas horas de sincronización.
- Copiloto supervisado de Aurem ES/EN convertido en un flujo honesto de edición: fixture y fuentes visibles, borrador versionado local, revisión humana limitada por rol, trazabilidad completa y envío permanentemente deshabilitado sin modelo o proveedor.
- Guía narrativa de Aurem ES/EN ampliada a siete hitos de tres minutos: llegada en riesgo, coordinación, control, ingresos, canales, IA supervisada y encaje. Cada hito muestra evidencia y límites propios, conserva y valida el progreso local, recupera la vista contextual al volver y termina en un diagnóstico precargado sin enviar datos.
- Mapa comercial de 14 capacidades reforzado en soluciones y planes ES/EN: cada elemento muestra plan mínimo, madurez, prueba verificable, límite y enlace profundo a la sección o vista ficticia exacta de Nivora, Terrava o Aurem. La tabla móvil acerca evidencia a la capacidad y explica su scroll propio.
- Nueva línea base comercial ES/EN centrada en margen, tiempo, venta directa y coordinación: hero sin métricas ambiguas, segmentación explícita para gestores/hoteles, planes orientados al cuello de botella, FAQs de alta intención, formulario con expectativas honestas y navegación interna directa a ambos segmentos.
- SEO comercial reforzado con títulos y descripciones únicos en diez superficies, `Service`/`OfferCatalog` coherente con el contenido visible, social cards grandes, política completa de snippets, enlaces internos y precarga de fuentes; Lighthouse móvil local queda en 100/100/100/100 para portada, planes y diagnóstico, con CLS 0.

## Siguiente cola priorizada

### P0 · Resiliencia real del embudo

- Completado: herramienta reproducible y segura de smoke de Resend, con dry-run, autorización humana explícita, datos de prueba, verificación de referencia/outcome y procedimiento manual documentado.

Siguiente punto exacto de activación: confirmar humanamente en el buzón interno que el mensaje del último smoke con referencia `e27e5bf3-a462-4db6-9f49-80d8486fe23c` está visible. `LEADS_MEETING_URL` sigue siendo opcional. HubSpot queda expresamente fuera de alcance hasta nueva decisión.

### P1 · Accesibilidad, SEO técnico y rendimiento

- Completado el alcance local reproducible: baseline automatizada WCAG 2.2 AA sobre 30 rutas, QA visual documentado, reflow a 320 px, texto al 200 %, foco contextual, estados dinámicos y movimiento reducido.
- Completado: comprobaciones automatizadas de axe, landmarks, foco visible, reduced motion, contraste, tamaño táctil, anuncios semánticos y recuperación de foco.
- Completado: Lighthouse móvil reproducible por encima de 90 en accesibilidad y SEO de rutas indexables, con `noindex` de demos protegido como política.
- Completado: datos estructurados, canonical, `hreflang` y sitemap contrastados con las 20 URLs finales indexables.

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
- Pendiente: ejecutar un único experimento principal de conversión y registrar hipótesis, variante y resultado. No se elige ni se declara un experimento sin línea base real.

P3 no conserva otro desarrollo local seguro y respaldado por evidencia. Siguiente punto exacto de activación: configurar humanamente dentro del contenedor compartido `GTM-TVDWZ9LC` las etiquetas y activadores de Estancia sin alterar los de Camp, obtener un primer periodo comparable de recuentos agregados consentidos posterior a esta nueva línea base, ejecutar `pnpm funnel:report` y seleccionar una única hipótesis principal. Los datos anteriores y posteriores no se mezclarán sin segmentar por fecha; no se declarará un resultado sin observación real.

## Actividades externas pendientes

Estas actividades no se deben declarar completadas sin evidencia humana o acceso autorizado:

- Confirmar humanamente la recepción del smoke de Resend; la API respondió `202 delivered` en el Worker y en el dominio con la misma referencia idempotente.
- Configurar una URL real `LEADS_MEETING_URL` solo si se decide ofrecer agenda directa.
- HubSpot está desactivado por decisión de producto; no configurar token, pipeline ni propiedades hasta que se autorice expresamente esa integración.
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

- Alcance: 19 archivos de producto/pruebas más este checkpoint; 231 inserciones y 147 eliminaciones antes de documentar. No se añadieron dependencias, imágenes, integraciones ni campos de datos.
- Narrativa: portada, soluciones para gestores/hoteles, planes y diagnóstico ES/EN parten de pérdida de margen, tiempo y contexto; los módulos aparecen después como evidencia. El CTA principal converge en una recomendación local antes de cualquier captación.
- Confianza: las métricas operativas sin contexto del hero se sustituyeron por un recorrido cualitativo; las demos se etiquetan como casos ficticios; se retiró una promesa de respuesta en un día sin SLA verificable. Precios, testimonios e integraciones continúan sin inventarse.
- UX/UI: navegación principal y pie enlazan directamente ambos segmentos; jerarquía hero → tensión → segmento → recorrido → evidencia → plan → diagnóstico → implantación → objeciones → contacto. QA visual local correcto a 1366 × 900 y 320 × 860; las tarjetas decorativas se retiraron en móvil al detectar solapamiento.
- Formulario: sigue siendo el único punto de entrega real y mantiene exactamente el contrato de datos/consentimiento existente. Solo cambian la expectativa, las ayudas y la etiqueta del botón; diagnóstico, demos y dashboards continúan sin escrituras externas.
- SEO: diez superficies comerciales prueban títulos/descripciones únicos y de longitud útil, headings específicos y enlaces internos; portada añade JSON-LD `Service`/`OfferCatalog`, `og:image`, Twitter card grande y política de snippets. Canonical, `hreflang`, sitemap y `noindex` de demos permanecen correctos.
- Rendimiento: la primera auditoría detectó CLS 0,245 por carga de fuentes en el nuevo hero; se corrigió con preload de los cuatro recursos existentes. `pnpm audit:lighthouse` final: portada, planes y diagnóstico 100/100/100/100 con CLS 0; Terrava 100/100/100/58, donde 58 SEO es el `noindex` deliberado.
- Accesibilidad: axe detectó contraste insuficiente del eyebrow sobre la nueva banda oscura y se corrigió. La repetición específica dejó 15/15 pruebas WCAG correctas, incluido reflow a 320 px, texto al 200 %, foco y movimiento reducido.
- `pnpm check`: 7 tareas de lint, 21 tareas de typecheck/test/build y 14 pruebas operativas correctas; Worker con 31 unitarias.
- `pnpm e2e`: 55/55 pruebas Chromium correctas; 36 funcionales, 15 de accesibilidad y 4 de SEO técnico.
- Seguridad y privacidad: sin cambios de Worker/API, sin PII nueva, sin HubSpot, sin precios y sin escrituras desde demos. El remoto seguía sin divergencia (`0 0`) después de `git fetch origin main`.

## Revisión multidisciplinar del checkpoint actual

- Marketing estratégico: corregido — la propuesta parte de margen, tiempo y contexto; cada CTA expresa un siguiente paso concreto. La nueva redacción es una línea base autorizada, no un experimento ni un resultado declarado.
- Diseño de producto: corregido — Básico, Gestión e Inteligente se presentan como puntos de partida por necesidad, conservan capacidades/límites y no convierten tamaño, IA o complejidad en reclamo vacío.
- UX: corregido — la arquitectura conduce de reconocimiento a evidencia y recomendación; gestores y hoteles tienen acceso directo; el diagnóstico mantiene resultado antes de datos y el formulario explica qué respuesta cabe esperar.
- UI/dirección visual: corregido — el hero gana jerarquía editorial, la banda de tensión marca ritmo y las superficies conservan el sistema visual. Se corrigieron solapamiento móvil y contraste sin añadir ruido ni recursos nuevos.
- SEO: corregido — intención, titles, descriptions, headings, FAQs, enlaces internos, social metadata y datos `Service` son específicos y verificables. Las 20 URLs, `hreflang`, canonical, sitemap y exclusión de demos siguen protegidos.
- Arquitectura frontend: correcto — el contenido compartido sigue tipado y bilingüe; no se duplicó lógica de planes/capacidades ni se añadieron dependencias. Las fuentes se precargan desde los mismos recursos emitidos por Vite.
- Full stack: no aplica — no cambió el contrato, endpoint, rate limit, idempotencia, correo o secretos. La regresión confirma que solo la landing llama a `/api/leads` y las demos siguen bloqueadas.
- QA/accesibilidad/rendimiento/confianza: corregido — 55 E2E, axe, reflow y Lighthouse 100 detectaron y cerraron contraste, solapamiento y CLS; no quedan bloqueantes conocidos ni promesas comerciales sin respaldo.

Deuda aceptada: faltan recorridos humanos con VoiceOver y otro lector, modos de alto contraste y validación de comprensión. Lighthouse debe repetirse en producción tras un despliegue autorizado. También queda confirmar el smoke anterior; los textos legales requieren revisión jurídica española; la agenda es opcional y HubSpot continúa fuera de alcance. Las etiquetas/activadores de Estancia dentro del GTM compartido y un periodo agregado posterior a esta nueva línea base bloquean la selección del primer experimento; no se ha inventado variante ni resultado.

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
