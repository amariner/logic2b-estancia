# Publicación de R0–R2 · 18 de septiembre de 2026

El usuario autorizó expresamente integrar, subir a GitHub y desplegar en producción. Los cambios ya estaban en `main`; se añadió una corrección de reflow antes de publicar.

- Revisión publicada: `d4811d1b21a574e1b7c37353ef840b1368f89fb9`.
- Tag: `deploy-production-20260918-d4811d1`.
- Sitio: https://estancia.logic2b.com/.
- Worker: `logic-estancia`.
- Versión activa: `eabff2cf-959e-42df-8023-484ec3d980a7`.
- Versión previa registrada: `79b4cedc-c3bf-4121-9c3f-5d9e4b48c73a`.

## Corrección previa

Quality detectó tres fallos de texto al 200 % en temas y recorrido. La medición local podía producir un falso positivo al ejecutarse antes de actualizarse las medidas `rem`. Se reprodujo el desbordamiento real: 425 px en la ficha de Linde a 390 px y 396 px en el recorrido a 320 px.

Dos reglas CSS permiten partir los títulos largos cuando no caben. El helper E2E espera que una sonda `1rem` duplique efectivamente su ancho, las fuentes estén listas y el layout se actualice. R0/R1/R2 lo comparten; no se han relajado límites geométricos ni aserciones.

- `pnpm check`: correcto, también en los workflows remotos de Quality y despliegue.
- **38/38 E2E R0/R1/R2**, Chromium 151 de Playwright, build integrado, ES/EN y 320/390/1440 px; incluye reflow, teclado, Axe, contexto, descarte, errores y recuperación del formulario.
- Capturas revisadas: [tema al 200 %](assets/production-2026-09-18/theme-es-390-text200.png) y [recorrido al 200 %](assets/production-2026-09-18/journey-es-390-text200.png).
- Logs locales: `/tmp/estancia-production-check.log`, `/tmp/estancia-production-e2e.log`.

## Despliegue

[Deploy production 35365626985](https://github.com/amariner/logic2b-estancia/actions/runs/35365626985) validó el tag y pasó `pnpm check`, pero Wrangler rechazó continuar porque GitHub no tenía `CLOUDFLARE_API_TOKEN`. No publicó una versión parcial.

Se verificó la sesión OAuth existente, el Worker y la versión previa; se usó la alternativa local documentada (`pnpm deploy`). Resultado: exit 0, 129 assets subidos y 91 reutilizados, Worker y dominio publicados. Log: `/tmp/estancia-production-deploy.log`. No se cambiaron secretos, proveedores, bindings o migraciones ni se transfirieron credenciales a GitHub.

## Smoke público

Verificación independiente a las **16:01:34 UTC / 18:01:34 CEST**: **8/8**.

| Ruta | HTTP | Evidencia |
|---|---:|---|
| `/` | 200 | Formulario progresivo, previews y recorrido presentes |
| `/en/` | 200 | Misma entrega en inglés |
| `/api/capabilities` | 200 | Manifiesto exactamente igual al baseline |
| `/demos/nivora/` | 200 | Demo aislada y noindex |
| `/demos/terrava/gestion/` | 200 | Demo aislada y noindex |
| `/demos/aurem/gestion/` | 200 | Demo aislada y noindex |
| `/webs/boscara/?embed=theme` | 200 | Preview aislada y noindex |
| GET `/api/leads` | 405 | JSON, `Allow: POST`, `no-store` |

Las demos y la preview conservan `connect-src 'none'`, `form-action 'none'`, `frame-ancestors 'self'` y `SAMEORIGIN`. El manifiesto mantiene modo demo, captación comercial/email activos, analítica/pagos/webhooks/almacenamiento externo deshabilitados y jobs desactivados. No se enviaron solicitudes comerciales reales ni correos de QA.

Home ES/EN, ficha Linde y recorrido coinciden byte a byte con el HTML local verificado. Los **12 assets JS/CSS** enlazados en esas páginas también coinciden por SHA-256. Registro: `/tmp/estancia-production-assets-smoke.json`.

## Pendiente

La publicación está completada. El despliegue desde GitHub requiere aportar su token de Cloudflare; la alternativa local sigue disponible. La [suite Quality completa de esta revisión](https://github.com/amariner/logic2b-estancia/actions/runs/35365607591) continúa ejecutándose al registrar este informe; no se afirma un resultado global verde. Recogerlo antes de R3. La validación humana de comprensión, conversión y precios permanece pendiente.
