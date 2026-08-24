# Logic Estancia

Producto demo-first para alojamientos turísticos: web comercial, diagnóstico, reservas y operación desde una unidad hasta un hotel.

## Desarrollo

```bash
pnpm install
pnpm check
pnpm dev
```

El Worker local compone el sitio comercial, las tres webs ficticias y los gestores. El producto falla cerrado en modo demo: si `DEMO_MODE` falta o no vale literalmente `false`, no se permiten operaciones de producto. La única excepción posible es la captación comercial propia: requiere `COMMERCIAL_LEADS_ENABLED=true` y una configuración completa de Resend. La configuración local recomendada mantiene ambas cosas desactivadas y no necesita secretos para arrancar o recorrer las superficies visuales.

Las demos usan fixtures y estado temporal o restaurable en el navegador. No envían información a servicios externos. El sitio comercial recomienda Básico, Gestión o Inteligente por capacidades y ofrece el resultado antes de solicitar datos de contacto.

`pnpm dev` reconstruye primero la landing y las demos desde sus fuentes y después sirve una composición local en el Worker. Es una vista integrada por snapshot: reinicia el comando después de editar una superficie Astro para recomponerla.

## Producción

La publicación es manual. El workflow `Deploy production` acepta una confirmación `DEPLOY` sobre `main` o un tag único `deploy-production-*` que apunte exactamente al `HEAD` remoto de `main`; mantiene la exclusión mutua del entorno productivo y vuelve a ejecutar `pnpm check` antes de Wrangler. La alternativa local requiere `wrangler login`.

Publicar un artefacto no activa operaciones. El modo real de producto solo puede intentarse en un despliegue aislado con `DEMO_MODE=false`, `REAL_OPERATIONS_ENABLED=true` y el proveedor correspondiente habilitado explícitamente. La captación comercial puede habilitarse por separado, incluso mientras el producto sigue en demo, con `COMMERCIAL_LEADS_ENABLED=true`, `EMAIL_PROVIDER_MODE=resend`, `LEADS_RESEND_API_KEY`, `LEADS_FROM_EMAIL`, `LEADS_INTERNAL_RECIPIENT` y `LEADS_REPLY_TO`. El destinatario interno validado para producción es `marinerandreu+logic@gmail.com`.

El único formulario comercial está en la landing principal y puede llamar a `/api/leads`; solo envía con la allowlist comercial explícita y Resend completo. Si falta una puerta, falla cerrado antes de leer el cuerpo, persistir o invocar proveedor. Las landings por tipo de estancia y el diagnóstico enlazan a ese formulario, pero no envían por sí mismos; las demos Nivora, Terrava y Aurem nunca son elegibles para Resend. HubSpot permanece intencionadamente fuera de alcance. La configuración de captación crea el Durable Object que mantiene el rate limit y la idempotencia.

Para desarrollo local, copia `apps/worker/.dev.vars.example` a `apps/worker/.dev.vars`. El ejemplo ya es seguro y no contiene credenciales. `.dev.vars` está excluido de Git; no guardes secretos reales en archivos versionados.

```bash
pnpm deploy
```

El despliegue ejecuta siempre el build completo del workspace antes de invocar Wrangler; no reutiliza carpetas `dist` de una ejecución anterior.

El smoke de Resend es seco por defecto y requiere autorización explícita para enviar dos correos inequívocamente marcados como prueba. El procedimiento seguro, la repetición idempotente y la comprobación manual en Resend están en [`docs/COMMERCIAL_PLAYBOOK.md`](docs/COMMERCIAL_PLAYBOOK.md#smoke-reproducible-de-resend).

Las integraciones, reservas, pagos, canales, mensajería, SES.Hospedajes e IA de Nivora, Terrava, Aurem y sus dashboards son demostraciones locales, nunca ejecuciones externas. Sus formularios de producto no existen: la única captación permitida es la de la landing principal descrita arriba.

El contrato técnico completo, la matriz de efectos, los estados de capacidades, las pruebas de aislamiento y el procedimiento de activación/rollback están en [`docs/DEMO_MODE.md`](docs/DEMO_MODE.md).

La cadencia comercial, la taxonomía de GA4 y el guion de entrevistas están documentados en [`docs/COMMERCIAL_PLAYBOOK.md`](docs/COMMERCIAL_PLAYBOOK.md). HubSpot no forma parte del contrato ni del código ejecutable del Worker.

## Continuidad del desarrollo

La orden `/goal continua con el desarrollo de este proyecto` reanuda el trabajo desde el último punto verificado. Las reglas persistentes están en [`AGENTS.md`](AGENTS.md) y el estado, las prioridades y el registro de continuaciones se mantienen en [`plans/PROJECT_CONTINUATION.md`](plans/PROJECT_CONTINUATION.md). Ambos deben actualizarse cuando cambien el objetivo o el siguiente punto de desarrollo.

Cada incremento pasa además por el [`consejo multidisciplinar`](docs/MULTIDISCIPLINARY_REVIEW.md): estrategia de marketing, diseño de producto, UX, UI y dirección visual, SEO, arquitectura frontend, ingeniería full stack y controles transversales de QA, accesibilidad, rendimiento y confianza comercial.

La baseline WCAG 2.2 AA automatizada, sus hallazgos y los recorridos manuales todavía pendientes se mantienen en [`docs/ACCESSIBILITY_AUDIT.md`](docs/ACCESSIBILITY_AUDIT.md).

Las métricas Lighthouse móvil, sus umbrales reproducibles y la matriz de canonical, `hreflang`, sitemap y JSON-LD se mantienen en [`docs/PERFORMANCE_SEO_AUDIT.md`](docs/PERFORMANCE_SEO_AUDIT.md).
