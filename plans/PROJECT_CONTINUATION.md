# Logic Estancia · Checkpoint de continuidad

Última actualización: 2026-08-17

Último incremento de infraestructura verificado: consultar `git rev-parse HEAD`

Rama: `main`

Estado general: base comercial y demostrativa implementada; consentimiento y legales equiparados al patrón de Camp; producción consolidada en el Worker `logic-estancia`, sin HubSpot, con dominio personalizado, HTTPS y Resend verificado mediante smoke idempotente. El Worker anterior `logic-estancia-demo` está retirado. Queda rotar la clave de Resend porque su primera carga en el Worker nuevo creó una versión borrador `plain_text`, aunque nunca recibió tráfico ni se imprimió durante la migración.

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
- Fuente única de capacidades, categorías y madurez.
- Portada, planes, soluciones para gestores y hoteles y diagnóstico de seis pasos en ES/EN.
- Resultado del diagnóstico antes de solicitar datos personales y precarga desde soluciones, planes y demos.
- Captación mediante Resend y HubSpot con tolerancia a fallos parciales, consentimiento separado y parámetros controlados.
- Rate limit persistente en Cloudflare Durable Objects, con cinco solicitudes por minuto e IP y fallo cerrado si la coordinación no está disponible.
- Idempotencia integral durante 24 horas: referencia durable, concurrencia coalescida, claves estables de Resend y deduplicación de negocios mediante `logic_estancia_submission_id`.
- Recuperación manual de canales degradados documentada sin exponer secretos ni crear negocios inseguros como fallback.
- Remitente, destinatario interno, reply-to y agenda extraídos a entorno, validados sin registrar valores; email falla cerrado si queda incompleto y la agenda insegura nunca llega al enlace público.
- Fallback ES/EN visible tras la entrega cuando no hay agenda válida, con cobertura E2E y QA visual responsive del diagnóstico.
- GA4/GTM condicionado al consentimiento y contrato de eventos sin PII.
- Consentimiento versionado y bilingüe con aceptar, rechazar, preferencias, migración desde la elección anterior y revocación con limpieza de cookies analíticas accesibles.
- Aviso legal, privacidad y cookies ES/EN ampliados con titular, alcance ficticio de las demos, proveedores, derechos, tabla de almacenamiento y control para cambiar la elección; adaptación todavía pendiente de validación jurídica profesional.
- `DemoState v2`, migración desde v1, recuperación ante corrupción y reset local.
- Cinco flujos profundos: solicitud a reserva, operación de estancia, llegada en riesgo, mantenimiento y edición web.
- Demos canónicas Nivora, Terrava y Aurem con límites explícitos y CTA contextual.
- Dos recursos SEO iniciales y playbook comercial.
- QA visual realizado; `pnpm check` con 28 tareas correctas y `pnpm e2e` con 24 pruebas correctas.
- Worker `logic-estancia` publicado en `https://estancia.logic2b.com`, sin variables ni token de HubSpot, con assets, `LeadCoordinator`, cuatro secretos de correo cifrados y `workers.dev` desactivado. La versión activa es `e70fd292-1943-431b-a4ea-55d5fb7f0aef`; `logic-estancia-demo` fue eliminado después de verificar el corte.

## Siguiente cola priorizada

### P0 · Resiliencia real del embudo

- Añadir una herramienta de smoke test de integraciones que use un lead marcado como prueba y no exponga secretos.

Siguiente punto exacto de desarrollo: añadir una herramienta de smoke test de integraciones que envíe un lead inequívocamente marcado como prueba, admita apuntar a un Worker autorizado, verifique referencia/outcome sin imprimir PII ni secretos y documente la comprobación manual en Resend y HubSpot.

Bloqueos del siguiente punto: ninguno para implementar y probar localmente la herramienta. Su ejecución contra proveedores o producción depende de credenciales, valores definitivos y autorización humana.

Siguiente punto exacto de activación: revocar la clave de Resend que pasó por el borrador `plain_text`, crear otra y sustituir el secreto existente `LEADS_RESEND_API_KEY` directamente como `secret_text`; después confirmar humanamente en Resend o en el buzón interno que los mensajes del smoke con referencia `64fd398c-cc9f-44d0-8edf-21723aac3e18` están visibles. `LEADS_MEETING_URL` sigue siendo opcional. HubSpot queda expresamente fuera de alcance hasta nueva decisión.

### P1 · Accesibilidad, SEO técnico y rendimiento

- Ejecutar y documentar una auditoría WCAG 2.2 AA completa de las rutas principales.
- Automatizar comprobaciones adicionales de foco, reduced motion, contraste y landmarks.
- Medir Lighthouse móvil y corregir regresiones hasta superar 90 en accesibilidad y SEO.
- Revisar datos estructurados, canonical y `hreflang` con URLs finales de producción.

### P2 · Profundidad comercial de las demos

- Mejorar pantallas navegables de revenue, canales, informes e IA supervisada sin simular conexiones reales.
- Completar la guía narrativa de tres minutos, sus hitos contextuales y la recuperación entre sesiones.
- Reforzar el mapa de capacidades con evidencia enlazada desde cada flujo.

### P3 · Contenido y conversión

- Crear los siguientes contenidos españoles de alta intención a partir de objeciones reales.
- Preparar plantillas versionadas de resumen de diagnóstico, seguimiento y propuesta.
- Instrumentar un informe reproducible del funnel usando solo eventos y parámetros permitidos.
- Ejecutar un solo experimento principal de conversión cada vez y registrar hipótesis, variante y resultado.

## Actividades externas pendientes

Estas actividades no se deben declarar completadas sin evidencia humana o acceso autorizado:

- Confirmar humanamente la recepción del smoke de Resend; la API respondió `202 delivered` en el Worker y en el dominio con la misma referencia idempotente.
- Rotar la clave actual de Resend para invalidar el valor conservado en una versión borrador histórica como `plain_text`; actualizar el secreto existente, sin crear una variable de texto.
- Configurar una URL real `LEADS_MEETING_URL` solo si se decide ofrecer agenda directa.
- HubSpot está desactivado por decisión de producto; no configurar token, pipeline ni propiedades hasta que se autorice expresamente esa integración.
- Configurar las etiquetas definitivas de GTM/GA4.
- Revisar textos legales específicamente para España.
- Realizar 15 entrevistas cualificadas y presentar 5 propuestas reales antes de publicar precios.
- Conseguir 3 proyectos firmados al mes 6 y 8 al mes 12.
- Desplegar y ejecutar smoke tests contra producción.

## Puerta mínima de calidad

```bash
pnpm check
pnpm e2e
```

Además: `git diff --check`, ausencia de secretos, ausencia de planes antiguos en superficies públicas, demos con `noindex`, estado local no enviado al servidor, revisión multidisciplinar registrada y SHA remoto coincidente después del push.

## Evidencia del último incremento

- `pnpm check`: 28 tareas correctas; Worker con 20 pruebas unitarias correctas.
- `pnpm e2e`: 24 pruebas Chromium correctas, incluidos consentimiento completo ES/EN, revocación, legales, agenda válida, fallback sin agenda y diagnóstico en 320, 375, 430 y 1366 px.
- QA visual en navegador local: preferencias a 1280 × 720 y 375 × 812 correctas, sin overflow; toggle accesible por teclado y puntero, botones de 44 px y `prefers-reduced-motion` respetado.
- `wrangler deploy --dry-run`: 118 assets, `LeadCoordinator` y variables versionadas reconocidos.
- Producción consolidada en `logic-estancia`, versión `e70fd292-1943-431b-a4ea-55d5fb7f0aef`, con trigger exclusivo `estancia.logic2b.com (custom domain)`. El Worker `logic-estancia-demo` fue eliminado tras un dry-run y la verificación del corte.
- `LEADS_FROM_EMAIL`, `LEADS_INTERNAL_RECIPIENT`, `LEADS_REPLY_TO` y `LEADS_RESEND_API_KEY` figuran como `secret_text`; `LEADS_TRANSPORT` es la única variable de canal. No existen bindings `HUBSPOT_*`.
- DNS-over-HTTPS de Cloudflare: registros A `188.114.97.5` y `188.114.96.5` y registros AAAA publicados. El resolver local conservaba temporalmente un NXDOMAIN anterior, por lo que las comprobaciones de origen se fijaron contra la IP publicada.
- Smoke HTTP posdespliegue: `/`, `/cookies/` y `/demos/terrava/` responden `200` por HTTPS; un `POST /api/leads` vacío responde `400` sin crear ningún contacto. El certificado, HTTP/2 y la respuesta desde Cloudflare quedan verificados.
- QA visual en producción: portada y banner correctos; el panel de preferencias expone esencial siempre activo, toggle de analítica, rechazo total y guardado.
- Smoke de Resend: `202 delivered` con referencia `64fd398c-cc9f-44d0-8edf-21723aac3e18`; la repetición por el dominio devolvió la misma referencia, demostrando idempotencia y que el hostname alcanzaba el Worker nuevo sin duplicar el envío.
- La primera carga de la clave en `logic-estancia` se realizó desde el dashboard como `plain_text` en un borrador no desplegado. Se convirtió por tubería directa a `secret_text` sin imprimir el valor, pero la rotación sigue pendiente para invalidar el historial.
- Verificación final: `/`, `/cookies/` y `/demos/terrava/` responden `200`; el hostname temporal `workers.dev` responde `404`.
- `git diff --check`, búsqueda de secretos, remoto sin divergencia y ausencia de planes antiguos en superficies públicas: correctos.

## Revisión multidisciplinar del checkpoint actual

- Marketing estratégico: correcto — el Worker productivo deja de presentarse como demo y Resend queda validado sin activar HubSpot ni prometer agenda.
- Diseño de producto: correcto — consentimiento, legales y demos comparten un contrato coherente sin alterar Básico, Gestión o Inteligente.
- UX: corregido — aceptar, rechazar, configurar, volver y revocar funcionan en ES/EN; la categoría esencial explica el estado local de las demos.
- UI/dirección visual: corregido — el patrón de Camp se adapta a serif editorial, neutros y terracota; escritorio y 375 px no presentan overflow.
- SEO: corregido — las seis rutas legales conservan canonical/hreflang y ahora tienen descripciones específicas y contenido sustantivo.
- Arquitectura frontend: corregido — clave y versión son fuente compartida, se migra la elección antigua y las demos leen el mismo contrato.
- Full stack: corregido — `logic-estancia` sirve el dominio con cuatro secretos cifrados, Resend operativo y ausencia total de bindings HubSpot; el Worker anterior está retirado.
- QA/accesibilidad/rendimiento/confianza: correcto — 28 tareas, 20 unitarias y 24 E2E en verde; rutas públicas `200`, smoke `202 delivered`, idempotencia verificada y superficie temporal cerrada.

Deuda aceptada: los textos legales están adaptados desde Camp pero requieren revisión jurídica española; faltan la rotación de la clave que pasó por el borrador `plain_text` y la confirmación humana de recepción del smoke. La agenda real es opcional y HubSpot está deliberadamente fuera de alcance. La herramienta reproducible de smoke queda como siguiente P0; WCAG y Lighthouse completos permanecen en P1.

## Registro de continuaciones

- 2026-08-17 — Se implantó la experiencia comercial de tres planes y las cinco demostraciones. Commit `6f08b24`. Próximo punto: P0, resiliencia real del embudo.
- 2026-08-17 — Se incorporó el consejo multidisciplinar obligatorio para revisar y encauzar cada continuación desde marketing, producto, UX, UI, SEO, arquitectura frontend y full stack.
- 2026-08-17 — Se sustituyó el rate limit en memoria por Durable Objects y se hizo idempotente el lead completo, incluida la creación de negocios en HubSpot. Commit `025c543`. Próximo punto: configuración segura de remitentes, destinatarios y agenda.
- 2026-08-17 — Se extrajo y validó la configuración completa de Resend y agenda, con fallo cerrado, degradación observable, fallback visible ES/EN y cobertura responsive. Commit `678aa59`. Próximo punto: herramienta segura de smoke test de integraciones.
- 2026-08-17 — Se importó el patrón completo de consentimiento y legales de Camp, adaptado a Estancia, con 24 E2E y QA responsive. Commit `106a617`. Se creó el primer Worker Cloudflare, versión `92c45ea5-7f53-4702-b10b-d4b8f9446053`; DNS, secretos y smoke siguen bloqueando la publicación.
- 2026-08-17 — Se sustituyó la ruta por un dominio personalizado gestionado por Cloudflare y se publicó `https://estancia.logic2b.com`. Commit `841391c`. DNS, HTTPS, rutas, banner y rechazo del payload inválido verificados; tres variables de correo compatibles copiadas desde Camp. La clave de Resend, agenda real y smoke contra proveedores siguen bloqueando la operatividad del formulario.
- 2026-08-17 — Se preparó la migración de `logic-estancia-demo` a `logic-estancia`: nuevo Worker creado sin HubSpot, preview y producción simultáneamente sanos y tres secretos de correo trasladados. Pendiente añadir Resend al Worker nuevo, mover el dominio y ejecutar el smoke antes de retirar el Worker anterior.
- 2026-08-17 — Se completó el corte a `logic-estancia`: clave convertida a secreto, cuatro bindings cifrados consolidados, Resend validado con `202 delivered` e idempotencia por dominio, `workers.dev` desactivado y `logic-estancia-demo` eliminado. HubSpot permanece fuera de alcance; queda rotar la clave para invalidar el borrador histórico `plain_text`.
