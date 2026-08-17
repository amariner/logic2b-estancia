# Logic Estancia

Producto demo-first para alojamientos turísticos: web comercial, diagnóstico, reservas y operación desde una unidad hasta un hotel.

## Desarrollo

```bash
pnpm install
pnpm check
pnpm dev
```

El Worker local compone el sitio comercial, las tres webs ficticias y los gestores. Las demos guardan sus cambios exclusivamente en el navegador. En Terrava y Aurem, los datos introducidos en la web demo continúan en el gestor local para completar el recorrido sin enviar información a servicios externos. El sitio comercial recomienda Básico, Gestión o Inteligente por capacidades y ofrece el resultado antes de solicitar datos de contacto.

## Producción

La publicación es manual. Requiere `wrangler login` y configurar en el Worker `logic-estancia` `LEADS_RESEND_API_KEY`, `LEADS_FROM_EMAIL`, `LEADS_INTERNAL_RECIPIENT` y `LEADS_REPLY_TO`. El destinatario interno de producción es `marinerandreu+logic@gmail.com`. Solo el formulario comercial de la landing llama a `/api/leads`; el diagnóstico enlaza a ese formulario y las demos nunca lo invocan. El Worker no activa el canal de email con configuración parcial. HubSpot permanece intencionadamente fuera de alcance. La configuración versionada crea el Durable Object que mantiene el rate limit y la idempotencia durante el despliegue.

Para desarrollo local, copia `apps/worker/.dev.vars.example` a `apps/worker/.dev.vars` y sustituye únicamente los valores locales. `.dev.vars` está excluido de Git; no guardes credenciales reales en archivos versionados.

```bash
pnpm deploy
```

Las integraciones, formularios, reservas, pagos, canales, mensajería, SES.Hospedajes e IA visibles en Nivora, Terrava, Aurem y sus dashboards son demostraciones locales, nunca ejecuciones externas.

La cadencia comercial, la taxonomía de GA4 y el guion de entrevistas están documentados en [`docs/COMMERCIAL_PLAYBOOK.md`](docs/COMMERCIAL_PLAYBOOK.md). La referencia histórica de HubSpot permanece diferida y no describe una integración activa.

## Continuidad del desarrollo

La orden `/goal continua con el desarrollo de este proyecto` reanuda el trabajo desde el último punto verificado. Las reglas persistentes están en [`AGENTS.md`](AGENTS.md) y el estado, las prioridades y el registro de continuaciones se mantienen en [`plans/PROJECT_CONTINUATION.md`](plans/PROJECT_CONTINUATION.md). Ambos deben actualizarse cuando cambien el objetivo o el siguiente punto de desarrollo.

Cada incremento pasa además por el [`consejo multidisciplinar`](docs/MULTIDISCIPLINARY_REVIEW.md): estrategia de marketing, diseño de producto, UX, UI y dirección visual, SEO, arquitectura frontend, ingeniería full stack y controles transversales de QA, accesibilidad, rendimiento y confianza comercial.
