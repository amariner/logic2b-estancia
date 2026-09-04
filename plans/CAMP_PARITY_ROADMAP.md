# Logic2B Estancias · Roadmap de paridad con Logic2B Campings

Última revisión de la referencia: 2026-09-04

Estado de ejecución: **paridad estructural del home cerrada en 11/11 bloques, más el shell global de header y footer**. P0, P1, P2, P3 y P4 están cerrados; el recorrido horizontal contiene 7 momentos, el explorador 5 tabs, y existen 12/12 direcciones web, 6/6 fichas de panel y 5/5 guías por rol navegables y enlazadas contextualmente. P5 permanece en su techo local seguro con cero proveedores validados; P6 tiene cerrado su alcance local y mantiene GTM, línea base y experimentos como actividades externas. El SHA de producto verificado es `77887492c9e2a16e6fabccedde8a04ddfaf6cbbe`: `pnpm check` pasa completo, la matriz Playwright pasa 124/124 y `camp-parity` 7/7. El QA local cubre desktop, 1024 px, 320–430 px, texto al 200 %, movimiento reducido, foco, axe WCAG 2.2 AA y revisión visual de hero, carruseles, popups, contacto, cierre, footer y acompañamiento/recursos. Solo restan comprobaciones humanas externas con lector de pantalla, alto contraste y comprensión; no se declara Lighthouse ni despliegue productivo.

Referencia: [camp.logic2b.com](https://camp.logic2b.com/)

Alcance: arquitectura comercial, profundidad de producto, evidencia navegable y recorrido de conversión.

Fuera de alcance: copiar identidad visual, textos, datos, precios o dashboards específicos de campings.

## Decisión estratégica

Logic2B Estancias debe conservar la **paridad estructural y de producto alta ya alcanzada** con Logic2B Campings: la misma lógica de negocio `web → captación/reserva → gestión → operación avanzada`, demostrada con una portada de densidad y orden equivalentes y un ecosistema público comparable de webs, planes, paneles, guías y entrada comercial.

La paridad no significa una copia literal. Estancias conservará su dirección cálida, editorial y orientada a hospitalidad; Camp seguirá siendo la referencia de arquitectura, jerarquía y profundidad. Los dashboards se diseñarán alrededor de estancias, huéspedes, habitaciones/unidades, preparación, incidencias y revenue, no alrededor de parcelas o recepción de camping.

## Qué revela la auditoría

Camp no se limita a describir un servicio. Su home permite comprobar, en este orden, qué se compra, cómo fluye, qué áreas contiene, cómo crece, qué aspecto puede tener, cómo se trabaja dentro y cómo se implanta. Además, cada promesa importante enlaza a una prueba navegable o a una ficha específica.

La auditoría inicial del 2026-09-02 detectó que Estancias presentaba sus activos como secciones independientes. El contraste de cierre del 2026-09-04 confirma que esa brecha ya no está vigente: la portada enlaza la secuencia completa, ofrece continuidad visual mediante el flujo horizontal de 7 momentos, incorpora un explorador de 5 áreas y conecta portfolio, paneles, guías, planes y captación sin duplicar el formulario real.

## Contrato de paridad

### Debe ser equivalente

- Escalera comercial: web gestionada, gestión de solicitudes/reservas y operación avanzada.
- Portada construida como demostración progresiva del producto, no solo como discurso comercial.
- Tres planes crecientes, siempre llamados **Básico, Gestión e Inteligente**.
- Prueba visible de la web y del gestor desde hero, planes, portfolio y cierre.
- Galería de direcciones web, galería de superficies del gestor, guías por responsabilidad y recorrido de entrada.
- Enlaces profundos y contexto conservado entre plan, demo, panel, diagnóstico y formulario comercial.
- Implantación humana, mantenimiento y soporte como parte explícita de la propuesta.

### Debe adaptarse a Estancias

- Las verticales son casas rurales, apartamentos turísticos y hoteles.
- Nivora demuestra Básico sin dashboard; Terrava demuestra Gestión; Aurem demuestra Inteligente.
- El producto se explica mediante solicitudes, estancias, planning, huéspedes, preparación, limpieza, mantenimiento, equipos, canales, revenue y copiloto supervisado.
- El estilo sigue siendo el actual de Estancias: sereno, editorial, cálido y con fotografía de hospitalidad. No se adopta el verde, la tipografía ni la composición gráfica exacta de Camp.
- La selección por tipo de alojamiento deja de competir como bloque principal independiente y pasa a funcionar como filtro o puerta contextual dentro del portfolio, del explorador y de las rutas de solución.

### No debe heredarse de Camp por ahora

- Precios públicos, descuentos, permanencias o cifras de onboarding antes de 15 entrevistas cualificadas y 5 propuestas reales.
- Logotipos o afirmaciones de integración sin contrato, proveedor, pruebas y alcance validados.
- Formularios comerciales repetidos en distintas páginas. Estancias mantiene una única instancia real en la portada.
- Reservas, pagos, mensajes, sincronizaciones, inventario, analítica o IA presentados como activos cuando solo existe una demo local.
- Métricas, clientes, testimonios, resultados o disponibilidad inventados.

## Anatomía implementada del home

La portada sigue el mismo arco informativo que Camp. Esta secuencia implementada —11 bloques de contenido, más header y footer— es el contrato de información; la composición visual y los recursos siguen siendo propios de Estancias.

| Orden | Bloque de referencia | Adaptación para Estancias | Evidencia o salida |
| --- | --- | --- | --- |
| 0 | Header de producto | `Webs`, `Gestor`, `Planes`, contacto y `Ver recorrido`; las verticales pasan a navegación secundaria/contextual | Portfolio, paneles, planes y recorrido |
| 1 | Hero + portfolio inmediato | Promesa de web, reservas y operación; mosaico vivo con Nivora, Terrava y Aurem; CTA a la única captación y accesos a web/gestor | Demo Básico, demo Gestión, panel Inteligente |
| 2 | Franja de ecosistema | Categorías de conexión y operación, con estado explícito; sin logotipos no validados | Fichas de capacidad y límites |
| 3 | Flujo completo | Siete momentos: descubrimiento, web, solicitud, planificación, preparación, estancia y lectura operativa | Recorrido horizontal accesible y enlaces profundos |
| 4 | Explorador de producto | Cinco áreas: Web, Solicitudes, Planning, Huéspedes y Operación | Tabs/accordion con captura funcional y demo exacta |
| 5 | Conecta sin rehacer | Arquitectura por proyecto: canales, pagos, mensajería, datos e IA supervisada; cada grupo muestra `visible`, `activable` o `pendiente` | Contrato central de capacidades; cero proveedor invocado |
| 6 | Planes dentro del home | Básico, Gestión e Inteligente con preview web, preview interior cuando corresponda, límites y CTA contextual; sin precio público | Plan → demo → diagnóstico/contacto |
| 7 | Portfolio de webs | Objetivo de 12 direcciones navegables: 4 rurales, 4 apartamentos y 4 hoteles, repartidas entre los tres planes sin alterar los tres casos canónicos | Índice `/webs/` y ficha por concepto |
| 8 | Galería de paneles | Seis superficies propias: solicitudes, planning, huéspedes/llegadas, preparación, operación/revenue y copiloto supervisado | Índice `/paneles/`, ficha y deep link a demo |
| 9 | Implantación + guías | Alcance guiado y cinco lecturas: propiedad/dirección, recepción/reservas, operaciones, marketing/revenue y técnica/privacidad | Índice `/docs/` y guías por rol |
| 10 | FAQ | Objeciones de compra y activación, separando demo, alcance e integración real | Schema FAQ coherente con texto visible |
| 11 | Cierre demostrativo | CTA de demostración con mockups web + móvil + gestor; abre o conduce a la única instancia comercial | Contexto de origen allowlisted y sin PII |
| 12 | Footer de ecosistema | Producto, explora, guías, contacto y legal con rutas equivalentes a la nueva arquitectura | Navegación completa ES/EN |

## Arquitectura pública implementada

| Necesidad | Ruta objetivo | Estado actual | Decisión |
| --- | --- | --- | --- |
| Portada | `/` y `/en/` | Paridad 11/11 + shell global | Conservar el contrato de bloques y sus salidas verificables |
| Portfolio web | `/webs/` y fichas | 12/12 direcciones ES/EN | Cerrado: filtros, fichas y casos canónicos conectados |
| Gestor | `/paneles/` y fichas | 6/6 fichas ES/EN | Cerrado: escaparate comercial separado con evidencia exacta de Estancias |
| Planes | `/planes/` y `/en/plans/` | Tres tarjetas ricas y contextualizadas | Cerrado sin publicar precios ni alterar el mapeo de demos |
| Guías | `/docs/` y fichas por rol | 5/5 guías ES/EN | Cerrado como centro de aprendizaje por responsabilidad |
| Recorrido | `/recorrido/` y `/en/journey/` | Flujo home de 7 momentos y ruta/modal de 5 pasos | Conservar la diferencia semántica: progresión visual frente a tour guiado medible |
| Empezar | Diagnóstico y contacto único | Diagnóstico sin PII + una sola captación real | No duplicar formularios; transferir solo contexto allowlisted |
| Soluciones | Rurales, apartamentos y hoteles | Publicadas y enlazadas contextualmente | Conservar como SEO/segmento conectado a portfolio, paneles y planes |

No se creará una segunda captación en `/empezar/`, `/planes/`, `/webs/`, `/paneles/`, soluciones, docs o demos. Esas superficies transfieren únicamente contexto cerrado a `/#contacto`.

## Correspondencia de producto

| Escalón de negocio | Logic2B Estancias | Prueba canónica | Límite público |
| --- | --- | --- | --- |
| Web y presencia directa | Básico | Nivora | Sin dashboard, inventario, reserva, pago ni solicitud demo real |
| Continuidad de solicitudes y reservas | Gestión | Terrava | Workspace local de solo lectura; sin confirmación, envío, cobro o sincronización |
| Coordinación y anticipación operativa | Inteligente | Aurem | Datos ficticios, acciones externas bloqueadas, IA sin modelo/proveedor y revisión humana obligatoria |

El tamaño solo dimensiona implantación y soporte. Las capacidades siguen decidiendo el plan.

## Roadmap priorizado

### P0 · Espina dorsal de paridad en el home

Objetivo: que un visitante entienda y pueda probar en la portada la misma secuencia de negocio que en Camp usando los activos actuales.

Entregables:

1. Rehacer navegación ES/EN con accesos directos a Webs, Gestor, Planes y recorrido, conservando contacto y rutas de solución en segundo nivel.
2. Convertir el hero en una puerta a producto: mosaico de los tres casos canónicos, CTA comercial único y tres pruebas inmediatas.
3. Sustituir la sucesión actual de bloques conceptuales por el flujo de siete momentos y el explorador de cinco áreas.
4. Incorporar la franja de capacidades/conexiones con estados honestos procedentes de `CAPABILITIES`.
5. Reordenar el resto de la portada según la anatomía objetivo sin perder el formulario, diagnóstico, FAQ, consentimiento, schema ni analítica existente.

Criterios de cierre:

- Los 11 bloques de contenido, el header y el footer existen con los activos verificables actuales; no hay placeholders ni CTAs hacia superficies vacías. La profundidad posterior de P2–P4 también está cerrada en 12/12 webs, 6/6 paneles y 5/5 guías.
- Nivora, Terrava y Aurem conservan su mapeo de plan y sus límites.
- ES/EN, teclado, 320 px, 200 % de texto, movimiento reducido y ausencia de overflow forman la puerta de QA y constan ejecutados; lector de pantalla, alto contraste y comprensión siguen siendo controles humanos externos.
- Solo existe un `[data-lead]` y solo la portada puede llamar a `/api/leads`.
- La puerta automatizada registrada para el cierre es `pnpm check`, 124/124 E2E, `camp-parity` 7/7 y `diff-check`; incluye 24/24 unitarias de site y 80/80 de Worker.

Estado de cierre al 2026-09-04: **P0 cerrado**. El shell global conserva header y footer, y el contenido sigue el orden 11/11 verificado: hero, franja de ecosistema, flujo de 7 momentos, explorador de 5 tabs, banda de capacidades, planes, portfolio de webs, escaparate de paneles, implantación/guías, FAQ y cierre demostrativo. Las tres galerías horizontales de recorrido, temas y paneles, los diálogos y la devolución de foco forman parte del contrato interactivo. El tour guiado de 5 pasos se mantiene diferenciado del flujo visual de 7 momentos. Solo existe un formulario comercial real; el recorrido, los temas, los paneles, las demos y los dashboards no crean captaciones ni escrituras externas. Nivora conserva Básico sin dashboard, Terrava demuestra Gestión y Aurem demuestra Inteligente. La evidencia final es `pnpm check`, 124/124 E2E, `camp-parity` 7/7, `diff-check`, axe, reflow, texto al 200 %, movimiento reducido, foco y QA visual local; únicamente quedan controles humanos externos.

### P1 · Planes y handoff comercial equivalentes

Objetivo: que cada plan combine exterior, interior, límite y siguiente paso como en Camp, sin precio público.

Entregables:

1. Tarjetas ricas de Básico, Gestión e Inteligente en home y `/planes/`.
2. Preview de web para los tres; preview de dashboard únicamente para Gestión e Inteligente.
3. CTAs `Ver web demo`, `Ver gestor demo` cuando exista y `Evaluar este plan`.
4. Contexto allowlisted `plan`, `web`, `panel`, `segment` y `sourcePath` a diagnóstico/contacto sin PII.
5. Comparador de capacidades resumido en la portada y completo en planes.

### P2 · Portfolio web con profundidad comparable

Objetivo: pasar de tres casos aislados a un catálogo que demuestre capacidad de dirección visual y adaptación sectorial.

Entregables:

1. `/webs/` ES/EN con filtros accesibles por casa rural, apartamentos, hotel y plan.
2. Mantener Nivora, Terrava y Aurem como casos canónicos y primera colección.
3. Añadir nueve conceptos navegables en tres incrementos, hasta 12: 4 rurales, 4 apartamentos y 4 hoteles.
4. Ficha por concepto con intención visual, problema de negocio, plan, páginas visibles, límites y CTA contextual.
5. Registro de datos único para home, índice, fichas, sitemap, hreflang y demos.

Un concepto solo cuenta como demo cuando su ruta es navegable, responsive, localizada según alcance y no contiene acciones falsas. Antes de eso se etiqueta como `en preparación`, no como disponible.

Estado al 2026-09-03: P2 está cerrado con cuatro colecciones completas. Nivora, Terrava y Aurem continúan como casos canónicos; Linde Casa, Cobalto Stays, Oria Hotel, Boscara Finca, Velares Apartamentos, Nocta Hotel, Riscoa Casas, Solerna Apartamentos y Cendra Hotel completan nueve conceptos originales con rutas ES/EN, assets propios, límites, SEO, pruebas y QA. Hay cuatro direcciones por vertical, cuatro por plan y cada vertical cubre Básico, Gestión e Inteligente. Profundidad verificada: **12/12**.

### P3 · Escaparate de paneles propio de Estancias

Objetivo: igualar la prueba comercial del gestor sin copiar el dashboard de Camp.

Entregables:

1. `/paneles/` ES/EN con seis fichas: Solicitudes, Planning, Huéspedes y llegadas, Preparación, Operación/revenue y Copiloto supervisado.
2. Cada ficha consume el contrato de capacidades y enlaza a la vista real de Terrava o Aurem.
3. Capturas/composiciones consistentes con el estado real: `demo local`, `activable por proyecto` o `pendiente`.
4. Navegación de vuelta a plan, vertical, demo y contacto conservando solo contexto cerrado.
5. Fichas indexables comerciales; las superficies de demo continúan `noindex`.

Estado al 2026-09-04: **P3 cerrado en 6/6**. Solicitudes, Planning y Huéspedes y llegadas enlazan a evidencia exacta de Terrava; Preparación, Operación e ingresos y Copiloto supervisado enlazan a Aurem. Todas las fichas cuentan con composición coherente con su fixture local, contenido ES/EN, contrato y límite por capacidad, metadata, canonical, `hreflang`, sitemap, pruebas y QA. Operación e ingresos separa métricas explicables visibles de la previsión de demanda y precio `en ruta`; Copiloto separa el borrador supervisado de la superficie independiente y también inerte de automatizaciones.

### P4 · Guías, implantación y confianza de compra

Objetivo: hacer visible que el producto se implanta y se opera con responsabilidades claras.

Entregables:

1. Cinco guías por rol: propiedad/dirección, reservas/recepción, operaciones, marketing/revenue y técnica/privacidad.
2. Bloque de implantación que explique entradas, decisiones, pruebas, publicación, soporte y trabajo fuera de alcance.
3. Enlaces contextuales desde home, planes, soluciones, webs y paneles.
4. Revisión jurídica española antes de convertir textos de privacidad, pagos, registro de viajeros o contratos en afirmaciones operativas.

Estado al 2026-09-04: **P4 cerrado, 5/5 guías publicadas y enlazadas**. El índice canónico existente `/docs/` y `/en/docs/` sustituye la propuesta duplicada `/guias/`: conserva la ruta ya enlazada desde footer, sitemap y analítica, y coincide con la arquitectura pública de referencia. Un registro único mantiene los cinco roles y sus estados. Todas las fichas disponen de contenido ES/EN, responsabilidad, relevo humano, capacidades, evidencia exacta, validaciones, límites, metadata, canonical, `hreflang`, sitemap, pruebas y QA. Técnica/privacidad enlaza roles, canales, automatizaciones inertes y copiloto supervisado de Aurem, mantiene canales como activables por proyecto y no afirma producción, asesoría o certificación. El índice explica entradas, decisiones, pruebas, publicación supervisada, soporte y fuera de alcance. Un contrato adicional de 13 contextos distribuye enlaces HTML rastreables entre home, planes, soluciones, webs y paneles, cubre 28 superficies por idioma y mantiene las guías separadas de la evidencia operativa y de la captación.

### P5 · Conectividad demostrable y madurez real

Objetivo: acercar la línea de producto a la de Camp solo cuando exista evidencia técnica y comercial.

Orden de trabajo:

1. Cerrar visualmente las capacidades hoy pendientes: solicitudes por email en demo, editor web supervisado y automatizaciones inertes.
2. Definir contratos, permisos, fallos, auditoría y reversión por integración priorizada.
3. Validar proveedores uno a uno antes de mostrar marca o estado `activo`.
4. Mantener pagos, canales, mensajería, PMS y registro de viajeros fuera de demos ejecutables hasta autorización y pruebas específicas.
5. Tratar forecasting como pendiente mientras no exista modelo, datos y validación; los cálculos actuales de revenue no son previsión.

Estado al 2026-09-04: **P5 en curso, con el primer bloque visual cerrado 3/3 y el segundo bloque de preparación cerrado en cinco contratos más un registro canónico y una puerta común**. `email-enquiries` dispone de evidencia ES/EN exacta en Nivora: tres solicitudes ficticias actualizan una vista previa solo en memoria, sin campos personales, formulario, destinatario real, email, inventario, reserva, almacenamiento o escritura; el expediente de entrega conserva 0/13 condiciones validadas. `website-editor` dispone de evidencia ES/EN exacta en Terrava: Recepción prepara o descarta un titular ficticio y solo Dirección puede aprobar la vista local; el expediente de publicación permanece en 0/12 y no existe CMS, repositorio, despliegue, proveedor, persistencia o escritura HTTP. `automation` dispone de evidencia ES/EN exacta en Aurem mediante `?vista=automations`: tres reglas ficticias muestran disparador, condición, resultado y revisión humana local, pero nunca se activan ni ejecutan. Canales dispone de cuatro categorías genéricas, cero conexiones y doce condiciones por categoría, todas sin validar; las marcas anteriores se retiraron hasta validar proveedor y contrato. La portada reúne Canales 0/12 por categoría, publicación web 0/12, email 0/13, pagos 0/15 y datos/PMS 0/16 en un registro que muestra **cero proveedores validados y cero activaciones**. La puerta exige contrato, responsables, permisos, referencia opaca, pruebas aisladas, recuperación, auditoría, aceptación, kill switch y reversión; completar esas diez evidencias solo permite una revisión separada y nunca activa por sí mismo una conexión. Automatizaciones permanece separada del Copiloto en `?vista=automation` y no inicia jobs, colas, cron, webhooks, mensajes, proveedores, persistencia o escritura HTTP. Básico conserva cero dashboard. El tercer punto de P5 —validar proveedores uno a uno— queda bloqueado hasta recibir una decisión de proveedor, evidencias, credenciales seguras y autorización específica; ninguna conexión está activa.

### P6 · Medición y optimización

Objetivo: mejorar conversión con datos reales una vez completado el primer arco de paridad.

Entregables:

1. Añadir eventos canónicos para `web_view`, `panel_view`, `tour_start`, `tour_complete` y handoffs, siempre sin PII y tras consentimiento.
2. Configurar GTM para Estancias sin modificar Camp y abrir una línea base posterior a la nueva home.
3. Medir descubrimiento → evidencia → diagnóstico → lead → agenda con periodos fechados; no mezclar la home anterior con la nueva.
4. Ejecutar un solo experimento principal cada vez y no declarar ganador sin evidencia suficiente.

Estado al 2026-09-04: **P6 tiene cerrado su alcance local de instrumentación y preparación de activación**. Las doce direcciones web y las seis fichas de panel disponen de rutas comerciales ES/EN allowlisted que emiten una sola vista por carga únicamente tras consentimiento explícito y runtime analítico `live`; sus acciones reales hacia demo exacta, diagnóstico contextual o el formulario único de contacto emiten handoffs con destino cerrado sin retrasar la navegación. `/recorrido/` y `/en/journey/` añaden una ruta indexable de cinco pasos que reutiliza Nivora, Solicitudes, Planning, Preparación y Operación e ingresos: solo los botones inequívocos de inicio y final emiten `tour_start` y `tour_complete`, una vez por carga, nunca por scroll, tiempo o navegación implícita. El contrato e informe `2.4.0` separan 15 eventos de proveedor con forma exacta y 5 eventos locales de demo; `plan_select` y `cta_click` ya no admiten payloads sin forma. El expediente `pnpm gtm:dossier` deriva de ese contrato etiquetas, activadores, variables, hostname exacto, consentimiento, puertas de runtime, verificación y rollback, y conserva sin rellenar responsable, aprobador, referencia GA4 y fecha de corte. Falla ante divergencias y no usa red, escribe, autoriza, activa o despliega. Las demos y las variantes explícitas `?embed=theme` usan iframe `sandbox="allow-scripts"`, CSP `connect-src 'none'`, `form-action 'none'`, `frame-ancestors 'self'`, `SAMEORIGIN` y `noindex`; no leen consentimiento, no consultan capacidades y no cargan GTM. Las rutas `/webs/:slug/` canónicas siguen no embebibles con `DENY` y conservan la CSP analítica, verificada por los 19/19 E2E de analítica dentro de la matriz completa. Aplicar el expediente, configurar el contenedor compartido, activar el runtime, abrir una línea base fechada y experimentar continúan bloqueados como actividades externas.

## Definición de paridad conseguida

El cierre local del 2026-09-04 satisface los siguientes criterios:

- La portada contiene la secuencia completa de 11 bloques, más header y footer, y cada promesa crítica enlaza a una prueba o límite.
- Existen tres planes coherentes, 12 webs navegables, seis fichas de panel y cinco guías por rol.
- Un visitante puede recorrer `web → plan → demo → panel → diagnóstico → contacto` sin perder contexto y sin encontrar callejones sin salida.
- Toda superficie ES tiene una decisión explícita de localización EN, canonical, hreflang, sitemap y estado de indexación.
- La única captación real sigue siendo la de la portada; demos y dashboards hacen cero escrituras externas.
- La auditoría multidisciplinar antes y después del incremento no detecta una brecha local material de estructura, verdad comercial, seguridad, SEO o arquitectura; el QA local automatizado y visual queda cerrado, y solo restan controles humanos externos.

## Revisión multidisciplinar del cierre

Antes de implementar, Estrategia de marketing pidió conservar un arco comercial comprobable; Producto y UX exigieron continuidad entre promesa y evidencia; UI fijó la equivalencia estructural sin copiar identidad; SEO preservó rutas ES/EN y superficies rastreables; Frontend y Full stack limitaron la nueva interacción a componentes y contratos existentes; QA, accesibilidad, rendimiento y confianza comercial bloquearon cualquier formulario duplicado, acción externa en demos o promesa no demostrable.

Después de implementar, Marketing, Producto, UX, UI, SEO y Arquitectura/Ingeniería quedan **correctos** respecto a la paridad 11/11 + shell, el recorrido de 7 momentos, el explorador de 5 tabs y la profundidad 12/12 webs, 6/6 paneles y 5/5 guías. Seguridad y confianza comercial quedan **correctas**: una sola captación real, contexto cerrado sin PII, previews aislados y demos locales sin escrituras externas. QA, accesibilidad, rendimiento y confianza quedan **correctos en el alcance local disponible** con `pnpm check`, 124/124 E2E, `camp-parity` 7/7, axe, 320 px, texto al 200 %, movimiento reducido, foco y QA visual desktop/móvil. VoiceOver/otro lector, alto contraste y comprensión quedan como revisión humana externa, no como nueva fase funcional.

## Métricas de avance del roadmap

- **Paridad estructural del home:** 11/11 bloques de contenido, con shell global de header y footer verificado aparte.
- **Paridad de evidencia:** deep links y handoffs cubiertos por el contrato focal; no se declara un total numérico adicional en este cierre.
- **Profundidad web:** 12/12 demos navegables verificadas.
- **Profundidad de gestor:** 6/6 fichas con demo verificable.
- **Cobertura de guías:** 5/5 guías revisadas y enlazadas.
- **Integridad comercial:** CTAs válidos / CTAs totales; objetivo 100 %.
- **Veracidad:** afirmaciones sin estado o límite / afirmaciones de capacidad; objetivo 0.

## Riesgos y controles

- **Imitar Camp demasiado literalmente:** bloquear cualquier copia de identidad, texto o dashboard; revisar dirección visual en cada incremento.
- **Inflar el catálogo con páginas vacías:** solo contar rutas navegables con contenido y QA; usar `en preparación` fuera del contador.
- **Prometer integraciones por asociación visual:** no usar logos hasta validar contrato y proveedor; mostrar categorías y estados.
- **Duplicar la captación al copiar la arquitectura:** cualquier CTA mueve o abre la instancia única de portada o pasa por diagnóstico sin PII.
- **Hacer el home demasiado pesado:** carga diferida bajo el fold, imágenes responsive, movimiento reducible y presupuestos de LCP/CLS/JS.
- **Romper SEO al cambiar navegación:** mantener soluciones verticales, enlaces internos, canonicals, hreflang y sitemap.
- **Confundir demo con producto activo:** conservar `demo local`, límites por capacidad, `noindex` y bloqueos HTTP en profundidad.

## Siguiente incremento exacto

No queda un nuevo incremento funcional local abierto. El siguiente punto exacto es una revisión humana externa con VoiceOver/otro lector, alto contraste y comprensión; después, conservar el cierre y esperar las dependencias ya documentadas: decisión y evidencias de proveedor para P5, aplicación autorizada del expediente GTM, línea base fechada, revisión jurídica, validación del buzón real y el umbral de 15 entrevistas cualificadas y 5 propuestas reales. No desplegar, modificar Camp, configurar servicios externos ni publicar precios sin la autorización correspondiente.
