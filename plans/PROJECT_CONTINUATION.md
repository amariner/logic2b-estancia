# Logic Estancia · Checkpoint de continuidad

Última actualización: 2026-08-17

Último incremento de producto verificado: `6f08b244c4f9b84fc565ff50bf073c4f1ac7fddc`

Rama: `main`

Estado general: base comercial y demostrativa implementada; validación real y endurecimiento de producción pendientes.

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
- GA4/GTM condicionado al consentimiento y contrato de eventos sin PII.
- `DemoState v2`, migración desde v1, recuperación ante corrupción y reset local.
- Cinco flujos profundos: solicitud a reserva, operación de estancia, llegada en riesgo, mantenimiento y edición web.
- Demos canónicas Nivora, Terrava y Aurem con límites explícitos y CTA contextual.
- Dos recursos SEO iniciales y playbook comercial.
- QA visual realizado; `pnpm check` con 28 tareas correctas y `pnpm e2e` con 21 pruebas correctas.

## Siguiente cola priorizada

### P0 · Resiliencia real del embudo

- Sustituir el rate limit en memoria por una estrategia persistente adecuada a Cloudflare.
- Hacer idempotente el lead completo, no solo los envíos individuales de Resend, para impedir negocios duplicados en HubSpot tras reintentos.
- Extraer destinatarios y URL de agenda a configuración de entorno, con validación segura y fallback visible.
- Añadir una herramienta de smoke test de integraciones que use un lead marcado como prueba y no exponga secretos.
- Documentar configuración y recuperación manual cuando un canal quede degradado.

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

- Configurar el pipeline, propiedades y token privado de HubSpot.
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

## Revisión multidisciplinar del checkpoint actual

- Marketing estratégico: correcto — la siguiente prioridad protege el embudo y la respuesta al lead.
- Diseño de producto: correcto — la cola mantiene la arquitectura de tres planes y las demos canónicas.
- UX: pendiente no bloqueante — la próxima auditoría completa está registrada en P1.
- UI/dirección visual: correcto — la QA visual base está completada; cada cambio público requerirá nueva revisión.
- SEO: pendiente no bloqueante — auditoría técnica y siguientes contenidos registrados en P1 y P3.
- Arquitectura frontend: correcto — fuente única de capacidades y contratos compartidos implantados.
- Full stack: pendiente prioritario — persistencia del rate limit e idempotencia completa encabezan P0.
- QA/accesibilidad/rendimiento/confianza: pendiente no bloqueante — pruebas actuales en verde; WCAG y Lighthouse completos siguen en P1.

## Registro de continuaciones

- 2026-08-17 — Se implantó la experiencia comercial de tres planes y las cinco demostraciones. Commit `6f08b24`. Próximo punto: P0, resiliencia real del embudo.
- 2026-08-17 — Se incorporó el consejo multidisciplinar obligatorio para revisar y encauzar cada continuación desde marketing, producto, UX, UI, SEO, arquitectura frontend y full stack.
