# Logic Estancia · Checkpoint de continuidad

Última actualización: 2026-08-17

Último incremento de producto verificado: `106a617`

Rama: `main`

Estado general: base comercial y demostrativa implementada; consentimiento y legales equiparados al patrón de Camp; primer candidato creado en Cloudflare; publicación por dominio, secretos reales y smoke contra proveedores pendientes.

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
- Worker `logic-estancia-demo` creado en Cloudflare con assets, ruta declarada y `LeadCoordinator`; candidato `106a617` desplegado como versión `92c45ea5-7f53-4702-b10b-d4b8f9446053`, todavía inaccesible por ausencia de DNS.

## Siguiente cola priorizada

### P0 · Resiliencia real del embudo

- Añadir una herramienta de smoke test de integraciones que use un lead marcado como prueba y no exponga secretos.

Siguiente punto exacto de desarrollo: añadir una herramienta de smoke test de integraciones que envíe un lead inequívocamente marcado como prueba, admita apuntar a un Worker autorizado, verifique referencia/outcome sin imprimir PII ni secretos y documente la comprobación manual en Resend y HubSpot.

Bloqueos del siguiente punto: ninguno para implementar y probar localmente la herramienta. Su ejecución contra proveedores o producción depende de credenciales, valores definitivos y autorización humana.

Siguiente punto exacto de activación: crear o validar el DNS proxied de `estancia.logic2b.com`, configurar en el Worker `LEADS_RESEND_API_KEY`, `LEADS_FROM_EMAIL`, `LEADS_INTERNAL_RECIPIENT`, `LEADS_REPLY_TO`, `LEADS_MEETING_URL` y, cuando esté preparado, `HUBSPOT_ACCESS_TOKEN`; después ejecutar smoke y QA posdespliegue antes de considerar público el embudo.

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

- Configurar el pipeline, propiedades —incluida `logic_estancia_submission_id` como valor único— y token privado de HubSpot.
- Configurar Resend y las etiquetas definitivas de GTM/GA4.
- Configurar y verificar `LEADS_FROM_EMAIL`, `LEADS_INTERNAL_RECIPIENT`, `LEADS_REPLY_TO` y una URL real `LEADS_MEETING_URL` en Cloudflare.
- Crear o validar el registro DNS proxied de `estancia.logic2b.com`; la ruta del Worker existe, pero el hostname no resuelve a 2026-08-17.
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
- Primer deploy: Worker `logic-estancia-demo`, ruta `estancia.logic2b.com/*`, versión `92c45ea5-7f53-4702-b10b-d4b8f9446053`; `wrangler deployments list` confirma 100 % en esa versión.
- `wrangler secret list`: vacío. `dig` y `curl`: el hostname no resuelve; no se ejecutó smoke remoto ni se declara publicación completada.
- `git diff --check`, búsqueda de secretos, remoto sin divergencia y ausencia de planes antiguos en superficies públicas: correctos.

## Revisión multidisciplinar del checkpoint actual

- Marketing estratégico: corregido — la elección de cookies ya no reduce confianza con un binario opaco; el candidato no se declara público mientras el embudo carece de entrega real.
- Diseño de producto: correcto — consentimiento, legales y demos comparten un contrato coherente sin alterar Básico, Gestión o Inteligente.
- UX: corregido — aceptar, rechazar, configurar, volver y revocar funcionan en ES/EN; la categoría esencial explica el estado local de las demos.
- UI/dirección visual: corregido — el patrón de Camp se adapta a serif editorial, neutros y terracota; escritorio y 375 px no presentan overflow.
- SEO: corregido — las seis rutas legales conservan canonical/hreflang y ahora tienen descripciones específicas y contenido sustantivo.
- Arquitectura frontend: corregido — clave y versión son fuente compartida, se migra la elección antigua y las demos leen el mismo contrato.
- Full stack: corregido — GTM no existe antes de aceptar, la revocación elimina cookies accesibles y recarga; el Worker/DO y la ruta se desplegaron sin introducir secretos.
- QA/accesibilidad/rendimiento/confianza: correcto — 28 tareas, 20 unitarias, 24 E2E, dry-run, deploy y QA visual en verde; el toggle funciona con teclado y los bloqueos DNS/credenciales son explícitos.

Deuda aceptada: los textos legales están adaptados desde Camp pero requieren revisión jurídica española; DNS, secretos reales, propiedad única de HubSpot y smoke contra proveedores siguen pendientes. El Worker existe, pero el producto no se considera publicado hasta cerrar esas puertas. La herramienta de smoke queda como siguiente P0; WCAG y Lighthouse completos permanecen en P1.

## Registro de continuaciones

- 2026-08-17 — Se implantó la experiencia comercial de tres planes y las cinco demostraciones. Commit `6f08b24`. Próximo punto: P0, resiliencia real del embudo.
- 2026-08-17 — Se incorporó el consejo multidisciplinar obligatorio para revisar y encauzar cada continuación desde marketing, producto, UX, UI, SEO, arquitectura frontend y full stack.
- 2026-08-17 — Se sustituyó el rate limit en memoria por Durable Objects y se hizo idempotente el lead completo, incluida la creación de negocios en HubSpot. Commit `025c543`. Próximo punto: configuración segura de remitentes, destinatarios y agenda.
- 2026-08-17 — Se extrajo y validó la configuración completa de Resend y agenda, con fallo cerrado, degradación observable, fallback visible ES/EN y cobertura responsive. Commit `678aa59`. Próximo punto: herramienta segura de smoke test de integraciones.
- 2026-08-17 — Se importó el patrón completo de consentimiento y legales de Camp, adaptado a Estancia, con 24 E2E y QA responsive. Commit `106a617`. Se creó el primer Worker Cloudflare, versión `92c45ea5-7f53-4702-b10b-d4b8f9446053`; DNS, secretos y smoke siguen bloqueando la publicación.
