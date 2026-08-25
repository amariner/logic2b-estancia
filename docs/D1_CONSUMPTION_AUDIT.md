# Auditoría de consumo D1 · `estancia.logic2b.com`

Fecha de auditoría: 2026-08-25. Alcance: únicamente el repositorio Logic Estancia y el Worker remoto `logic-estancia`. No se consultaron tablas ni se modificaron datos de otras aplicaciones de la cuenta.

## Resultado ejecutivo

Logic Estancia no usa Cloudflare D1. La versión remota activa no tiene binding D1 ni service bindings y Cloudflare devuelve cero Cron Triggers. En consecuencia, el consumo D1 atribuible a `estancia.logic2b.com` es **0 filas leídas y 0 filas escritas por ejecución y por día**.

El único almacenamiento servidor es el Durable Object SQLite `LeadCoordinator`, dedicado al rate limit e idempotencia del formulario comercial real. No contiene reservas y no es una base D1. Las webs y paneles de Nivora, Terrava y Aurem usan fixtures estáticos y estado local del navegador.

Cloudflare documenta para D1 en Workers Free 5.000.000 filas leídas y 100.000 escritas al día, con reinicio a las 00:00 UTC. Las consultas que escanean una tabla sin índice cuentan todas las filas examinadas. Fuentes: [D1 Pricing](https://developers.cloudflare.com/d1/platform/pricing/) y [Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/).

## Inventario completo

| Recurso o flujo | Frecuencia | Lecturas D1 | Escrituras D1 | Datos afectados |
| --- | ---: | ---: | ---: | --- |
| Bases D1 enlazadas a `logic-estancia` | 0 | 0 | 0 | Ninguno |
| Cron Triggers remotos | 0/día | 0 | 0 | Ninguno |
| Handler `scheduled` anterior | Sin trigger; 0 ejecuciones/día | 0 | 0 | Era un no-op |
| `GET /api/capabilities` | Una vez al cargar una página comercial | 0 | 0 | Manifiesto calculado en memoria |
| `POST /api/leads` bloqueado o inválido | Bajo demanda | 0 | 0 | Ninguno |
| `POST /api/leads` comercial válido | Bajo demanda | 0 | 0 | Coordinación transitoria en Durable Object y entrega por Resend |
| Assets, landings y dashboards demo | Por visita | 0 | 0 | Fixtures estáticos y estado local |
| Seeds, reseeds y resets servidor | No existen | 0 | 0 | Ninguno |
| Polling de D1 | No existe | 0 | 0 | El temporizador visible tras un 429 solo actualiza una cuenta atrás y no reenvía |
| Endpoints de pagos, jobs, webhooks y automatizaciones | No existen; responden 404 | 0 | 0 | Ninguno |

La cuenta de Cloudflare contiene bases D1 de otros productos, pero ninguna se llama Estancia ni está enlazada a este Worker. Se dejaron fuera de esta auditoría.

## Separación y preservación de datos

- **Reservas reales:** Logic Estancia no ofrece un endpoint de reserva ni almacena reservas reales. Ningún cambio de esta auditoría crea, transforma o elimina una reserva.
- **Contactos reales:** solo entran por el formulario comercial de la portada. Se entregan mediante Resend; D1 no interviene. El rate limit, la referencia idempotente y el resultado transitorio permanecen en `LeadCoordinator` y no se sustituyen por fixtures.
- **Reservas demo:** son fixtures ficticios incluidos en los bundles de frontend. No tienen seed remoto, sincronización, reset servidor ni regeneración periódica.
- **Catálogo, actividades y contenido:** son código y contenido estático versionado. No existe sincronización automática.

## Consultas e índices

No hay SQL, migraciones, lecturas completas, consultas sin índice, escrituras repetidas o polling contra D1. Añadir índices sería imposible e innecesario porque no existe esquema D1. La coordinación comercial usa la API key/value de un Durable Object SQLite; Cloudflare la factura como almacenamiento de Durable Objects, no como consultas D1. Como referencia conservadora de código, un primer lead comercial válido realiza hasta dos peticiones al Durable Object, cuatro lecturas key/value y siete escrituras contando alarmas; un replay ya entregado realiza hasta dos lecturas y dos escrituras. Esto no cambia el presupuesto D1 de cero.

## Fusibles y pruebas de presupuesto

El contrato local fija explícitamente `d1_databases: []` y `triggers.crons: []`, y el Worker deja de exportar un handler `scheduled`. La prueba `d1-budget.test.ts` falla si:

- aparece un binding D1, cron, service binding, cola, workflow o pipeline;
- aparece acceso ejecutable a `D1Database`, `prepare()` o una migración SQL;
- el presupuesto deja de ser cero consultas, cero filas leídas o cero filas escritas;
- se elimina del contrato la protección de reservas reales o contactos comerciales.

No existe un lote al que aplicar un límite parcial: el fusible más seguro es impedir por completo jobs y D1. El formulario comercial conserva además sus fusibles propios: cinco solicitudes por minuto e IP, idempotencia durante 24 horas y fallo cerrado si falta coordinación o configuración.

## Antes y después

| Métrica diaria de Estancia | Antes | % límite gratuito | Después local | % límite gratuito |
| --- | ---: | ---: | ---: | ---: |
| Filas D1 leídas | 0 | 0 % de 5.000.000 | 0 | 0 % |
| Filas D1 escritas | 0 | 0 % de 100.000 | 0 | 0 % |
| Consultas D1 | 0 | — | 0 | — |
| Cron Triggers | 0 | — | 0 | — |
| Handlers capaces de recibir cron | 1 inerte | — | 0 | — |

La optimización no reduce una cifra ya nula; reduce el riesgo de regresión. Aunque alguien cree por error un cron en el panel, la próxima publicación controlada con `triggers.crons: []` declara que Estancia debe seguir sin ellos.

## Evidencia remota y límites de la auditoría

- Versión activa observada: 21, publicada el 2026-08-24; bindings remotos: assets, variables/secretos de captación y `LeadCoordinator`. No aparece D1.
- Consulta read-only de schedules: lista vacía.
- Métricas D1 de los últimos días: no aplican a Estancia porque no existe una base enlazada capaz de recibir consultas. El valor atribuible es 0/0 sin ejecutar consultas sobre bases de otros proyectos.
- No se desplegó código, no se cambiaron crons remotos y no se escribió, borró ni reemplazó ningún dato de producción.

## Publicación segura

Tras superar las pruebas locales, se puede publicar conjuntamente el manifest con presupuesto cero, la retirada del handler `scheduled`, las pruebas y esta documentación. El despliegue requiere autorización explícita: Wrangler aplicaría la lista vacía de crons como fuente de verdad. Permanecerán preservados el formulario comercial, sus contactos entregados, el Durable Object de coordinación, todos los fixtures demo y todo el contenido frontend.

## Revisión multidisciplinar

- **Marketing estratégico — correcto:** el inventario no presenta las reservas ficticias como operaciones reales y preserva el único canal comercial auténtico.
- **Diseño de producto — correcto:** demo, captación comercial y capacidades operativas siguen separadas.
- **UX — correcto:** no cambia ningún recorrido; el temporizador de rate limit continúa siendo solo una cuenta atrás local.
- **UI y dirección visual — no aplica:** no hay cambios de interfaz ni contenido visible de producto.
- **SEO — no aplica:** no cambian rutas, metadatos o indexación.
- **Arquitectura frontend — correcto:** reservas, catálogo y contenido permanecen como fixtures estáticos sin polling ni sincronización.
- **Ingeniería full stack — corregido:** se elimina la superficie `scheduled` innecesaria y el manifest declara explícitamente presupuesto D1/cron cero.
- **QA, accesibilidad, rendimiento y confianza — correcto:** `pnpm check`, 78/78 pruebas del Worker, dry-run de Wrangler y 8/8 E2E de aislamiento pasan; no hubo acceso de escritura remoto ni cambios visuales.
