# Expediente offline de activación y rollback de GTM

Este procedimiento convierte el contrato analítico `2.4.0` en una especificación exacta y revisable para Estancias. La herramienta no abre GTM, no consulta el contenedor, no escribe archivos, no activa el runtime, no despliega y no concede autorización. Aplicar la configuración sigue requiriendo una persona responsable, una aprobación de rollout y acceso externo al contenedor.

## Generar y validar

```bash
pnpm gtm:dossier -- --validate
pnpm gtm:dossier
pnpm gtm:dossier -- --format json
```

La salida se deriva en cada ejecución de `packages/config/src/analytics-contract.json`. La validación falla si falta una forma de evento, aparece un evento extra, cambia un parámetro, el activador pierde el hostname exacto, se mezcla una demo local, falta consentimiento o rollback, se rellena una fecha ficticia o el artefacto aparenta autorizar una acción externa.

## Frontera exacta

- Contenedor compartido: `GTM-TVDWZ9LC`.
- Hostname permitido: `estancia.logic2b.com`.
- Hostname de aislamiento: `camp.logic2b.com`; debe producir cero disparos de etiquetas `Estancias |`.
- Namespace obligatorio para variables, activadores y etiquetas: `Estancias |`.
- Eventos de proveedor: los 15 de `surfaces.site`, todos con forma contractual.
- Eventos locales: los cinco de `surfaces.demo`; no se configuran en GTM.
- Nunca se mapean URL, referencia, título, texto libre, usuario, sesión, nombre, email o teléfono.

`plan_select` exige idioma, plan canónico y origen `homepage_plans` o `plans_grid`. `cta_click` exige idioma y uno de sus orígenes publicados; segmento o `flow=guided` solo aparecen donde el producto los emite. El resto de formas se copia literalmente del contrato. No se amplía una allowlist desde la interfaz de GTM.

## Campos humanos obligatorios

Antes de crear o publicar nada, el responsable debe registrar fuera del repositorio:

| Campo | Regla |
| --- | --- |
| Responsable | Persona que ejecuta y conserva evidencias |
| Aprobador | Persona distinta o control equivalente que autoriza rollout |
| Referencia GA4 | Propiedad/configuración real confirmada; nunca usar un valor de ejemplo |
| Fecha y ventana | Momento planificado y ventana de observación |
| Fecha de corte | Primer día atribuible a la configuración nueva |
| Versión GTM anterior | Versión recuperable para rollback |
| Versión GTM publicada | Se rellena solo después de publicar |

Los periodos anteriores y posteriores a la fecha de corte no se mezclan. Una incidencia crea una ventana excluida explícita; no se corrigen datos para simular continuidad.

## Orden de activación

1. Validar el expediente y completar los campos humanos.
2. Crear únicamente variables, activadores y etiquetas enumerados por la salida. Cada activador combina evento exacto y `Page Hostname equals estancia.logic2b.com`.
3. Exigir en las etiquetas el consentimiento `analytics_storage` concedido, además de la puerta de consentimiento de la aplicación.
4. Previsualizar Estancias con consentimiento denegado, aceptado y revocado; comprobar forma exacta y ausencia de duplicados.
5. Previsualizar Camp y las demos; las etiquetas `Estancias |` deben registrar cero disparos.
6. Comprobar que el manifiesto solo declara analítica `live` con `DEMO_MODE=false`, `REAL_OPERATIONS_ENABLED=true` y `ANALYTICS_PROVIDER_MODE=gtm`.
7. Publicar únicamente con autorización explícita y registrar la versión del contenedor y la fecha de corte.
8. Verificar un evento canónico en DebugView, revocar consentimiento y confirmar que no salen eventos posteriores.

La captación comercial ya aprobada es independiente. Este procedimiento no autoriza otros proveedores, HubSpot, operaciones de reservas, pagos, mensajería ni sincronizaciones.

## Rollback

Ante una regresión en Camp, una fuga de consentimiento, un parámetro inesperado, un duplicado o una discordancia de runtime:

1. Restaurar la versión anterior del contenedor registrada antes del rollout.
2. Si el problema no queda aislado en GTM, cambiar `ANALYTICS_PROVIDER_MODE=disabled` mediante el proceso de configuración autorizado.
3. Verificar cero peticiones de proveedor con consentimiento denegado y revocado.
4. Registrar la ventana de incidencia y excluirla de la línea base.
5. No reactivar hasta repetir validación, preview de Estancias y prueba de cero disparos en Camp.

## Apertura de línea base

La línea base empieza únicamente después de completar la verificación posterior. Se exportan recuentos agregados con el contrato `2.4.0` y se procesan con `pnpm funnel:report`; no se guardan datasets reales en el repositorio. El primer periodo describe el estado observado y no constituye por sí solo una mejora, un experimento ganador ni una atribución individual.
