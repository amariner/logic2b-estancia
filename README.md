# Logic Estancia

Producto demo-first para alojamientos turísticos: web, reserva directa y operación desde una unidad hasta un hotel.

## Desarrollo

```bash
pnpm install
pnpm check
pnpm dev
```

El Worker local compone el sitio comercial, las tres webs ficticias y los gestores. Las demos guardan sus cambios exclusivamente en el navegador.

## Producción

La publicación es manual. Requiere `wrangler login` y el secreto `LEADS_RESEND_API_KEY` en el Worker `logic-estancia-demo`.

```bash
pnpm deploy
```

Las integraciones, pagos, canales, mensajería, SES.Hospedajes e IA visibles son demostraciones o estados preparados, nunca ejecuciones externas.
