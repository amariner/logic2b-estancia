# Logic Estancia

Producto demo-first para alojamientos turísticos: web, reserva directa y operación desde una unidad hasta un hotel.

## Desarrollo

```bash
pnpm install
pnpm check
pnpm dev
```

El Worker local compone el sitio comercial, las tres webs ficticias y los gestores. Las demos guardan sus cambios exclusivamente en el navegador. En Terrava y Aurem, los datos introducidos en la web demo continúan en el gestor local para completar el recorrido sin enviar información a servicios externos. El sitio comercial incluye un configurador orientativo que recomienda el nivel mínimo según propiedades, unidades y procesos, y traspasa ese alcance al formulario de contacto.

## Producción

La publicación es manual. Requiere `wrangler login` y el secreto `LEADS_RESEND_API_KEY` en el Worker `logic-estancia-demo`.

```bash
pnpm deploy
```

Las integraciones, pagos, canales, mensajería, SES.Hospedajes e IA visibles son demostraciones o estados preparados, nunca ejecuciones externas.
