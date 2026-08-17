# Logic Estancia · Checkpoint de continuidad

Última actualización: 2026-08-17

Último incremento de producto verificado: `025c543fa51be5760873509f4da5b5b4f7454524`

Rama: `main`

Estado general: base comercial y demostrativa implementada; embudo protegido con coordinación persistente e idempotencia integral; configuración y validación reales pendientes.

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
- GA4/GTM condicionado al consentimiento y contrato de eventos sin PII.
- `DemoState v2`, migración desde v1, recuperación ante corrupción y reset local.
- Cinco flujos profundos: solicitud a reserva, operación de estancia, llegada en riesgo, mantenimiento y edición web.
- Demos canónicas Nivora, Terrava y Aurem con límites explícitos y CTA contextual.
- Dos recursos SEO iniciales y playbook comercial.
- QA visual realizado; `pnpm check` con 28 tareas correctas y `pnpm e2e` con 21 pruebas correctas.

## Siguiente cola priorizada

### P0 · Resiliencia real del embudo

- Extraer destinatarios y URL de agenda a configuración de entorno, con validación segura y fallback visible.
- Añadir una herramienta de smoke test de integraciones que use un lead marcado como prueba y no exponga secretos.

Siguiente punto exacto: extraer remitente, destinatario interno, dirección de respuesta y URL de agenda a configuración validada, manteniendo un fallback visible y seguro cuando falte algún valor.

Bloqueos del siguiente punto: ninguno para la implementación. Los valores definitivos y su verificación en producción siguen dependiendo de acceso humano autorizado.

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
- Incorporar una URL real de agenda.
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

- `pnpm check`: 28 tareas correctas; Worker con 16 pruebas unitarias correctas.
- `pnpm e2e`: 21 pruebas Chromium correctas.
- `wrangler deploy --dry-run`: binding y migración de `LeadCoordinator` reconocidos.
- Smoke local con `workerd`: cinco solicitudes alcanzan validación y la sexta devuelve 429 con `retryAfter: 60`.
- `git diff --check`, búsqueda de secretos y comprobación de planes antiguos en superficies públicas: correctos.
- QA visual: no aplica; no cambiaron superficies públicas ni estilos.

## Revisión multidisciplinar del checkpoint actual

- Marketing estratégico: correcto — los reintentos ya no multiplican negocios y la degradación preserva al menos un canal verificable.
- Diseño de producto: correcto — el cambio endurece el embudo sin alterar planes, diagnóstico ni límites de demostración.
- UX: correcto — el recorrido público no cambia y los fallos de coordinación se comunican como entrega no completada, sin falso éxito.
- UI/dirección visual: no aplica — no hubo cambios visuales ni nuevos estados renderizados.
- SEO: no aplica — no cambiaron rutas, metadatos, indexación ni contenido público.
- Arquitectura frontend: corregido — se eliminó el estado por isolate y se encapsuló la coordinación detrás de un contrato testeable.
- Full stack: corregido — referencia persistente, concurrencia coalescida, rate limit durable y deduplicación de HubSpot cubren reintentos y respuestas perdidas.
- QA/accesibilidad/rendimiento/confianza: correcto — puerta completa, E2E, dry-run y smoke local en verde; no se persiste el payload del lead en el coordinador ni se exponen secretos.

Deuda aceptada: crear y verificar la propiedad única de HubSpot, ejecutar el smoke contra proveedores reales y desplegar siguen siendo actividades externas no realizadas. WCAG y Lighthouse completos permanecen en P1.

## Registro de continuaciones

- 2026-08-17 — Se implantó la experiencia comercial de tres planes y las cinco demostraciones. Commit `6f08b24`. Próximo punto: P0, resiliencia real del embudo.
- 2026-08-17 — Se incorporó el consejo multidisciplinar obligatorio para revisar y encauzar cada continuación desde marketing, producto, UX, UI, SEO, arquitectura frontend y full stack.
- 2026-08-17 — Se sustituyó el rate limit en memoria por Durable Objects y se hizo idempotente el lead completo, incluida la creación de negocios en HubSpot. Commit `025c543`. Próximo punto: configuración segura de remitentes, destinatarios y agenda.
