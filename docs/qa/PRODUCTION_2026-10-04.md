# Publicación de R3/R4 · 4 de octubre de 2026

## Autorización y revisión

El usuario pidió expresamente integrar, subir a GitHub y desplegar en producción, incluidas las migraciones necesarias. Esta autorización posterior es específica para la publicación y amplía el permiso de continuidad de `AGENTS.md`; no activa operaciones reales en las demos.

- Revisión candidata: `e5997514a2af86fdab46483a8ae2e258d77b7e51`, integrada en `origin/main` y comprobada en remoto.
- Tag: `deploy-production-20261004-e599751`, publicado y apuntando a esa revisión.
- Workflow: [Deploy production 37162199441](https://github.com/amariner/logic2b-estancia/actions/runs/37162199441).
- Destino: Worker `logic-estancia`, dominio `https://estancia.logic2b.com/`.
- Estado de publicación: **bloqueado por credencial de Cloudflare no disponible para el workflow. No se ha publicado una nueva versión**.

El diff respecto a la última revisión de producción documentada, `d4811d1b21a574e1b7c37353ef840b1368f89fb9`, no cambia Worker, configuración Wrangler, workflow de despliegue ni migraciones. No hay migración nueva: se conserva `LeadCoordinator` v1, D1 y crons vacíos. No se purga ni reinicia el namespace; no se modifican secretos ni proveedores. Se mantienen `DEMO_MODE=true`, `REAL_OPERATIONS_ENABLED=false`, analítica desactivada y la única excepción comercial existente.

## Corrección antes de publicar

La consulta de [Quality R3 37159965979](https://github.com/amariner/logic2b-estancia/actions/runs/37159965979) cerró una deuda del checkpoint: terminó con fallo, 268 casos correctos, uno fallido y uno que pasó en reintento. La matriz de teclado ES390 no abría la estancia después de cerrar y enfocar su fila; ES320 necesitó reintento.

Una reproducción controlada retuvo el frame de restauración del foco, enfocó la fila y liberó el frame. Antes de la corrección el callback robaba el foco hacia la región y Enter no abría la ficha. Ahora el cierre por botón y Escape comparten una restauración que respeta otro control conectado si el usuario ya lo ha enfocado. Se mantiene la recuperación normal cuando el elemento anterior desaparece. [Comparación antes/después](assets/production-2026-10-04/focus-comparison.json).

La matriz existente comprueba la recuperación observable del foco antes de continuar. Una nueva regresión determinista reproduce además la intercalación original y exige conservar el foco de la fila y abrir la ficha con Enter, sin depender de sleeps ni de la velocidad del runner.

- `pnpm check`: **257 contratos**, lint 7/7 y typecheck/test/build 21/21; seis y doce tareas cacheadas, respectivamente.
- E2E Terrava: **21/21** ES/EN, incluidos teclado, recuperación, aislamiento, texto al 200 % y Axe en 320/390/1440 px.
- Regresión determinista añadida: **1/1**. Son 22 casos del núcleo Terrava, no 22 casos adicionales a la suite histórica de R4.
- ESLint y `git diff --check` correctos. No se enviaron correos ni solicitudes comerciales reales.
- Logs: `/tmp/estancia-production-20261004-check.log`, `/tmp/estancia-production-20261004-e2e.log`, `/tmp/estancia-production-20261004-race.log`.

## Preparación y despliegue

El entorno actual no contiene una sesión de Cloudflare: `wrangler whoami` devolvió no autenticado. La sesión OAuth documentada en septiembre pertenecía a otro entorno y no se ha supuesto reutilizable. El proxy de este entorno devuelve `CONNECT 403` al acceder al dominio público. No se ha intentado eludirlo.

Se usó la vía documentada de GitHub por tag. La primera solicitud de push fue rechazada por revisión automática al interpretar la limitación de continuidad de `AGENTS.md` como una prohibición absoluta. Se aportó la autorización posterior expresa del usuario, el procedimiento del README, la coincidencia de tag/main, las pruebas y la ausencia de cambios de datos. La revisión aceptó el mismo comando; no se recurrió a una vía indirecta. El tag se publicó y el workflow validó que apunta al `main` actual.

El workflow validó tag/main, instaló dependencias, pasó `pnpm check` y el build. Wrangler terminó el 04/10/2026 a las 01:35 CEST, antes de publicar, con el error: `In a non-interactive environment, it is necessary to set a CLOUDFLARE_API_TOKEN environment variable for wrangler to work.` No hubo nueva versión ni migración. [Resultado del intento](assets/production-2026-10-04/deploy-status.json).

El workflow serializa producción, ejecuta `pnpm check` y reconstruye antes de Wrangler. No depende de la conclusión de Quality ni ejecuta por sí mismo E2E; por eso se resolvió y verificó localmente el fallo conocido antes de activarlo.

Quality del candidato: [37162133289](https://github.com/amariner/logic2b-estancia/actions/runs/37162133289), todavía `in_progress` en la consulta de las 01:37 CEST. La ejecución de la revisión anterior `4c92a74`, [37161627620](https://github.com/amariner/logic2b-estancia/actions/runs/37161627620), también continuaba. Los resultados locales y el check del despliegue no se presentan como aprobación de la suite remota completa.

## Verificación pública y continuidad

Se preparó un smoke de solo GET para ocho rutas y 22 dependencias JS/CSS: home ES/EN, manifiesto, tres demos, preview y método del endpoint comercial. Valida límites, noindex, CSP, capacidades y hashes frente al build local. El [inventario local](assets/production-2026-10-04/local-smoke.json) pasa sin solicitudes de red; no equivale a un smoke público. Script de esta sesión: `/tmp/estancia-production-smoke-20261004.mjs`.

Pendiente: hacer disponible `CLOUDFLARE_API_TOKEN` para el job del entorno `production` y comprobar `CLOUDFLARE_ACCOUNT_ID` en los secretos de GitHub; después completar publicación y smoke público. Se solicitó esa configuración por el canal seguro de secretos, sin pedir ni exponer valores en el chat. Si `main` sigue exactamente en `e599751`, puede repetirse el workflow del tag; si avanza por documentación u otros cambios, crear otro tag único sobre su HEAD verificado, respetando la guarda existente. El permiso de publicación ya está concedido; no se requiere volver a pedirlo. La versión `eabff2cf-959e-42df-8023-484ec3d980a7` es la última registrada en el informe del 18/09; no se ha podido confirmar como versión efectiva actual desde este entorno. Si fuera necesario revertir, se debe comprobar la versión previa en Cloudflare y restaurar el código conservando namespace y datos.

La prioridad de producto después de la publicación sigue siendo R5; no se implementa en esta entrega. Comprensión humana, dispositivo físico, lector de pantalla y validación comercial mantienen su deuda independiente.

La comprobación pública desde este entorno requiere permitir `estancia.logic2b.com` en su política de red: el intento de GET previo recibió `CONNECT 403`. No se usó una conexión directa, una cuenta temporal ni otro alojamiento para eludir el bloqueo o sustituir producción.
