# Logic Estancia · Checkpoint de continuidad

Última actualización: 2026-08-18

Último incremento de infraestructura verificado: consultar `git rev-parse HEAD`

Rama: `main`

Estado general: base comercial y demostrativa implementada; consentimiento y legales equiparados al patrón de Camp; producción consolidada en el Worker `logic-estancia`, sin HubSpot, con dominio personalizado, HTTPS y Resend verificado mediante smoke idempotente. La landing comercial es el único punto que envía solicitudes reales y las dirige a `marinerandreu+logic@gmail.com`; diagnóstico, demos y dashboards permanecen estrictamente locales y ficticios. El Worker anterior `logic-estancia-demo` está retirado y la clave de Resend ya fue regenerada y guardada cifrada.

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
- Portada, planes, soluciones para gestores y hoteles y diagnóstico de seis pasos en ES/EN.
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
- Dos recursos SEO iniciales y playbook comercial.
- QA visual responsive realizado; `pnpm check` con 7 tareas de lint y 21 tareas de typecheck/test/build correctas, y `pnpm e2e` con 52 pruebas correctas, incluidas 15 de accesibilidad y 3 de SEO técnico.
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

- Crear los siguientes contenidos españoles de alta intención a partir de objeciones reales.
- Preparar plantillas versionadas de resumen de diagnóstico, seguimiento y propuesta.
- Instrumentar un informe reproducible del funnel usando solo eventos y parámetros permitidos.
- Ejecutar un solo experimento principal de conversión cada vez y registrar hipótesis, variante y resultado.

Bloqueo del primer punto: los nuevos contenidos necesitan objeciones obtenidas de entrevistas o conversaciones reales; no se inventarán. Siguiente punto exacto desbloqueado: preparar plantillas versionadas de resumen de diagnóstico, seguimiento y propuesta, sin precios ni afirmaciones no validadas.

## Actividades externas pendientes

Estas actividades no se deben declarar completadas sin evidencia humana o acceso autorizado:

- Confirmar humanamente la recepción del smoke de Resend; la API respondió `202 delivered` en el Worker y en el dominio con la misma referencia idempotente.
- Configurar una URL real `LEADS_MEETING_URL` solo si se decide ofrecer agenda directa.
- HubSpot está desactivado por decisión de producto; no configurar token, pipeline ni propiedades hasta que se autorice expresamente esa integración.
- Configurar las etiquetas definitivas de GTM/GA4.
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

- `pnpm check`: 7 tareas de lint de paquetes, lint de scripts/E2E raíz y 21 tareas de typecheck/test/build correctas; Worker con 29 pruebas unitarias.
- `pnpm e2e`: 52 pruebas Chromium correctas; 34 funcionales, 15 de accesibilidad y 3 de SEO técnico.
- Mapa de capacidades: 14 contratos tipados y bilingües contienen plan mínimo, madurez, demo, superficie/vista, prueba observable y límite. Las unitarias rechazan destinos incoherentes entre web demo y workspace.
- Dos E2E nuevos verifican 6 capacidades para gestores, 12 para hoteles y las 14 en planes, destinos ES/EN, respuestas HTTP correctas, navegación a Canales Aurem y formulario Nivora, y cero `POST`/`PUT`/`PATCH`/`DELETE`.
- QA visual local: tarjetas uniformes a 1366 × 900; una columna legible a 320 × 900; enlaces de evidencia de 28 px; página con `scrollWidth` exacto de 1366/320 px; tabla móvil contenida en 290 px con scroll propio de 875 px, indicación visible y evidencia accesible tras un gesto horizontal. No se generaron imágenes porque el incremento no requería recursos raster.
- Confianza comercial: el límite de Nivora aclara que el plan real entrega consultas por email mientras la demo no envía emails, no bloquea inventario ni confirma reservas; se eliminó una redacción ambigua detectada por E2E.
- `tests/e2e/accessibility.spec.ts`: las 30 rutas públicas y seis estados profundos ES/EN de ingresos/canales/automatización pasan axe con etiquetas WCAG 2.0/2.1/2.2 AA, un único `main`/`h1`, reflow a 320 px y diagnóstico del nodo que desborda; cinco familias toleran texto al 200 %.
- Revenue Aurem: dos E2E recorren ES/EN, seleccionan ADR/RevPAR, verifican fórmulas, tabla semanal y navegación contextual a reservas/planning. El escenario cuadra 96 habitaciones × 28 días, 2.392 noches ocupadas, 89 % de ocupación, ADR €124, €296.608 y RevPAR €110 redondeado.
- Canales Aurem: dos E2E verifican matriz ES/EN, permisos, revisión local persistente, publicación siempre deshabilitada y ausencia de cualquier `POST`/`PUT`/`PATCH`/`DELETE`; `DemoState v2` conserva estados válidos y rechaza `published` mediante 8 unitarias del dashboard.
- IA supervisada Aurem: dos E2E verifican ES/EN, fixture y fuentes, edición/versionado persistente, permiso de revisión, trazabilidad, envío bloqueado y ausencia de cualquier `POST`/`PUT`/`PATCH`/`DELETE`; `DemoState v2` valida borrador, revisión y versión mediante 10 unitarias del dashboard.
- Interacción accesible: el diagnóstico enfoca cada nueva pregunta y el resultado; cookies, pago ficticio, visita guiada y utilidades del gestor reciben y restauran foco; los errores y estados usan regiones semánticas verificadas.
- Reflow corregido: tabla de capacidades contenida en scroll propio, títulos compartidos con corte seguro, recursos apilados en móvil y hero de demos sin anchura intrínseca superior al viewport.
- Primera auditoría corregida: contraste serio de texto secundario en web, demos y dashboards, acentos de Terrava/Aurem y dos enlaces de gestor por debajo de 24 px. Reejecución sin violaciones.
- `pnpm peers check`: sin incidencias después de alinear `@cloudflare/workers-types` con Wrangler.
- `pnpm audit:lighthouse`: portada 100/100/100/100; planes y diagnóstico 99/100/100/100; Terrava 99/100/100/58, con SEO bajo esperado por `noindex`, política comprobada y cero fallos de umbral.
- Regresión SEO: 20 canonical exactos, nueve parejas ES/EN recíprocas y existentes, JSON-LD `Organization`/`WebSite`, sitemap completo sin demos y recursos ES-only sin enlaces alternativos falsos.
- `pnpm smoke:resend -- --run-id release-20260817-a`: modo seco correcto, destino validado y `networkRequest: false`; no se ejecutó ningún envío externo.
- CLI cubierta por 9 pruebas nuevas: bloqueo sin autorización, separador de pnpm, validación de origen/run-id, marcado no comercial, saneado de respuesta, referencia esperada y fallo ante entrega degradada. El Worker suma ahora 29 pruebas correctas.
- QA visual en navegador local: portada a 1366 px y 375 px, Terrava, gestor Aurem, recurso monolingüe a 320 px, Aurem inglés a 320 px y revenue/canales/automatización Aurem en escritorio/320 px sin overflow ni regresiones; el copiloto conserva una secuencia legible de límite, edición, fuentes y trazabilidad en ambos tamaños.
- `wrangler deploy --dry-run`: 118 assets, `LeadCoordinator` y variables versionadas reconocidos.
- Producción consolidada en `logic-estancia`, versión `2c2df127-2af5-4d54-906b-6c16ccf2fbb6`, con trigger exclusivo `estancia.logic2b.com (custom domain)`. El Worker `logic-estancia-demo` fue eliminado tras un dry-run y la verificación del corte.
- `LEADS_FROM_EMAIL`, `LEADS_INTERNAL_RECIPIENT`, `LEADS_REPLY_TO` y `LEADS_RESEND_API_KEY` figuran como `secret_text`; `LEADS_TRANSPORT` es la única variable de canal. No existen bindings `HUBSPOT_*`.
- DNS-over-HTTPS de Cloudflare: registros A `188.114.97.5` y `188.114.96.5` y registros AAAA publicados. El resolver local conservaba temporalmente un NXDOMAIN anterior, por lo que las comprobaciones de origen se fijaron contra la IP publicada.
- Smoke HTTP posdespliegue: `/`, `/cookies/` y `/demos/terrava/` responden `200` por HTTPS; un `POST /api/leads` vacío responde `400` sin crear ningún contacto. El certificado, HTTP/2 y la respuesta desde Cloudflare quedan verificados.
- QA visual en producción: portada y banner correctos; el panel de preferencias expone esencial siempre activo, toggle de analítica, rechazo total y guardado.
- Smoke de Resend al destinatario operativo `marinerandreu+logic@gmail.com`: `202 delivered` con referencia `e27e5bf3-a462-4db6-9f49-80d8486fe23c`; la repetición exacta devolvió la misma referencia sin duplicar el envío.
- La clave `LEADS_RESEND_API_KEY` fue regenerada por el usuario y figura como `secret_text`; el destinatario interno también se guardó como secreto cifrado.
- Auditoría del HTML desplegado: una única referencia a `/api/leads` en la landing, ninguna en diagnóstico o Terrava, CTA del diagnóstico presente y cero menciones a HubSpot en privacidad.
- Verificación final: `/`, `/cookies/` y `/demos/terrava/` responden `200`; el hostname temporal `workers.dev` responde `404`.
- `git diff --check`, búsqueda de secretos, remoto sin divergencia y ausencia de planes antiguos en superficies públicas: correctos.

## Revisión multidisciplinar del checkpoint actual

- Marketing estratégico: corregido — cada promesa comercial abre ahora una prueba concreta y su límite; Nivora distingue la entrega real por email de la demo estrictamente local sin sugerir reservas o inventario conectados.
- Diseño de producto: correcto — las 14 capacidades conservan plan mínimo y madurez, y el mapa conecta Básico/Nivora, Gestión/Terrava e Inteligente/Aurem sin añadir planes ni funciones.
- UX: corregido — los enlaces profundos llevan a la sección o vista exacta; en móvil la evidencia se colocó junto a la capacidad y la tabla anuncia su desplazamiento horizontal.
- UI/dirección visual: correcto — las tarjetas mantienen altura, ritmo y jerarquía a 1366 × 900 y se apilan a 320 × 900; prueba, límite y CTA permanecen legibles sin overflow de página.
- SEO: correcto — las superficies comerciales indexables ganan enlaces internos descriptivos; las demos enlazadas mantienen `noindex` y siguen excluidas del sitemap.
- Arquitectura frontend: corregido — evidencia, destino, prueba y límite forman un contrato discriminado en `@logic-estancia/domain`; un helper único compone rutas localizadas y evita mapas paralelos en planes y soluciones.
- Full stack: correcto — los enlaces solo navegan a assets estáticos y estado local; E2E confirma ausencia de cualquier escritura HTTP y no se añadieron APIs, credenciales o integraciones.
- QA/accesibilidad/rendimiento/confianza: corregido — 52 E2E, 11 unitarias de dominio, axe/reflow existentes y QA responsive en verde; se ampliaron los enlaces a 28 px y se eliminó el copy ambiguo de Nivora.

Deuda aceptada: faltan recorridos humanos con VoiceOver y otro lector, modos de alto contraste y validación de comprensión. Lighthouse debe repetirse en producción tras un despliegue autorizado. También queda ejecutar la CLI de smoke con autorización y confirmar el smoke anterior. Los textos legales requieren revisión jurídica española; la agenda es opcional y HubSpot continúa fuera de alcance.

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
