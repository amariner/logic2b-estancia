# Revisión UI/UX · 7 de septiembre de 2026

> Registro histórico. El contraste del 14/09 y la regresión R0 del 18/09 detectaron discrepancias posteriores de límites visibles, rutas y pruebas. La evidencia vigente y las correcciones se registran en [R0](./HOSPITALITY_R0_2026-09-18.md) y el checkpoint; este informe no certifica por sí solo el árbol posterior.

## Alcance y referencia

Petición explícita de igualar el menú de Camp en escritorio/móvil y pulir la interfaz comercial: recorrido, explorador, conexiones, planes, carruseles, popups, cierre y catálogo web. Se contrastó `camp.logic2b.com` en navegador y su componente local de navegación. Camp no se modificó.

Base: `b84f4c071958f4d4f79618724fb3b4194d830456`, rama `main`. Cambios locales sin commit, push ni despliegue de esta revisión. La publicación autorizada anterior no constituye autorización para publicar este incremento.

## Resultado

- Header compartido: cápsula flotante, Webs/Gestor/Precios, Contactar y Ver recorrido; desplegable móvil compacto con cinco accesos. Retirado el selector de idioma superior, conservadas las rutas traducidas y el acceso del footer.
- Siete momentos del recorrido con iconos semánticos, jerarquía y contraste revisados.
- Cinco pestañas del explorador con iconos, títulos orientados al beneficio y gráficos contenidos. Navegación por teclado, scroll local de tabs y retirada del contacto flotante sobre esta zona.
- Composición de web con navegador, navegación, hero, contenido y fotografías de detalle; reutilizada en producto, planes y cierre.
- Conexiones ilustradas con Booking.com, Airbnb, Google Calendar, Stripe, PayPal, WhatsApp, Resend y Google Maps. Las marcas son referencias a evaluar, no integraciones ni colaboraciones confirmadas. El aviso es visible; no cambia el estado de validación P5.
- Gráficos diferenciados para Básico, Gestión e Inteligente. Planning con métricas, calendario, leyenda y navegación; valores de ingresos sin saltos internos. Precios y condiciones autorizados sin cambios.
- Carruseles con controles consistentes, estados deshabilitados, foco visible y objetivos táctiles adecuados.
- Popups de doce temas y seis paneles con shell común, vista móvil/escritorio, apertura independiente, solicitud y detalle. Los gestores se pueden explorar dentro del iframe.
- Catálogo web reducido a preview, nombre, tipo/plan y acceso al detalle. Búsqueda y filtros conservan el contenido semántico aunque ya no se repita en cada tarjeta.
- Banner de cierre con web, planning y móvil detallados. Textos comerciales más directos en home, webs y paneles ES/EN.

## Hallazgos y correcciones

1. Dos etiquetas del recorrido no alcanzaban contraste suficiente: color y fondo corregidos, Axe posterior correcto.
2. Los gestores React quedaban en blanco dentro del sandbox porque módulos y fuentes públicas no admitían el origen opaco. El Worker permite CORS sin credenciales únicamente para GET/HEAD exitosos de `/_astro/*.js` y `/_astro/*.woff2` con MIME esperado. Siete pruebas unitarias cubren permisos y exclusiones. No se habilita CORS para APIs, HTML, errores o escrituras.
3. Se conserva `sandbox="allow-scripts"` sin `allow-same-origin`, CSP `connect-src 'none'`, `form-action 'none'`, SAMEORIGIN y noindex. Las pruebas comprueban contenido montado, búsqueda interactiva, denegación de acceso al documento padre y ausencia de escrituras.
4. Los enlaces comerciales internos de una demo embebida podían navegar a páginas no embebibles. Se retiran solo en contexto embebido; las acciones comerciales quedan en el diálogo exterior. La demo independiente conserva sus accesos.
5. Escape consume el cierre de la búsqueda interna antes de cerrar el diálogo exterior.
6. Las expectativas antiguas de tarjetas extensas y previews estáticos se actualizaron a los nuevos flujos, comprobando destinos, filtros, foco, carga real y contexto del plan. No se retiraron las barreras de operación ficticia.
7. Axe intentaba precargar hojas CSS mediante XHR dentro de iframes que prohíben conexiones. En esta prueba se desactiva únicamente esa precarga opcional; se auditan DOM y estilos computados sin relajar la política.
8. La prueba rápida de Chromium pulsaba antes de que el iframe completara el reflow tras cambiar de dispositivo. Se sincroniza con la vista React solicitada, fuentes y dos frames de render, sin pausas arbitrarias ni retirar aserciones. Tres repeticiones ES/EN resultan correctas (6/6).

## Revisión multidisciplinar

Antes: marketing pidió claridad y veracidad de las marcas; producto, conservar los tres niveles; UX, reducir redundancias y mejorar navegación/modal; UI, alinear header y dar detalle a los gráficos; SEO, mantener arquitectura ES/EN; frontend, compartir piezas; full stack, conservar aislamiento y captación única; QA, comprobar móvil, teclado, contraste y regresiones.

- Marketing estratégico: **corregido** — menos texto repetido, CTA claros y logos explícitamente no validados.
- Diseño de producto: **correcto** — Nivora/Básico sin panel, Terrava/Gestión y Aurem/Inteligente intactos. No se añaden operaciones reales.
- UX: **corregido** — menú compacto, filtros, diálogos navegables, contexto del plan y recuperación de foco; controles comerciales exteriores en previews.
- UI/dirección visual: **corregido** — iconos, mockups web, planning, composiciones de planes/cierre y adaptación a cuatro anchos.
- SEO: **correcto** — rutas, canonical, hreflang, sitemap y distinción de indexación comercial/demo conservados.
- Arquitectura frontend: **corregido** — iconografía y shell de previews reutilizables, un ciclo de vida común, recursos locales y ninguna dependencia nueva del proyecto.
- Full stack: **corregido** — CORS acotado a recursos públicos permite el sandbox opaco; API, proveedores, CRM y credenciales no cambian.
- QA/accesibilidad/rendimiento/confianza: **corregido** — controles de reflow, teclado, contraste, carga, aislamiento y regresión; imágenes AVIF existentes y carga diferida. No se atribuye una nueva puntuación Lighthouse.

## Verificación y evidencia

- `pnpm check`: correcto; 7 tareas de lint y 21 de typecheck/test/build. 173 pruebas: site 24, Worker 87, dominio 20, dashboard 7, web 2 y scripts 33. Build de 76 páginas comerciales y 10 demos; Astro sin errores ni warnings.
- Suite general Chromium: 182 casos correctos; el caso restante se interrumpió al guardar una captura con `ENOSPC`. No fue un fallo de una aserción de producto. Cierre focal final: **7/7 correcto**, incluido el caso interrumpido. Se verificaron los 183 casos únicos entre la pasada general y el cierre; no se afirma 183/183 en una única ejecución.
- Nueva suite `tests/e2e/ui-refinement.spec.ts`: cuatro anchos (320/390/768/1440), cinco tabs, menú, popups ES/EN, dispositivos, carga, búsqueda, retorno de foco, aislamiento y cero escrituras. Pasada focal previa: 7/7.
- Matriz WebKit: **39/39 correcta**, con 32 casos de temas y 7 de interfaz compartida. El motor de pruebas se instaló solo en `/tmp/estancia-refinement-browsers`; no cambia el lockfile. La descarga temporal se retira tras el QA para recuperar espacio.
- QA visual: Camp y Estancias en navegador; menú móvil/escritorio, producto, conexiones, planes, catálogo filtrado, popup de tema, gestor embebido y cierre. Capturas de componentes a 390/1440 px en `/tmp/estancia-refinement-captures/` y las repeticiones verificadas.
- Logs de cierre: `/tmp/estancia-refinement-check.log`, `/tmp/estancia-refinement-verified-e2e.log`, `/tmp/estancia-refinement-delivery.log`, `/tmp/estancia-refinement-focus.log`, `/tmp/estancia-refinement-webkit-final.log`. Capturas finales: `/tmp/estancia-refinement-delivery/` y `/tmp/estancia-refinement-webkit-final/`. Capturas y logs son temporales; este informe y las pruebas permanecen en el repositorio.
- `git diff --check`: correcto. Desarrollo comprobado y abierto en el navegador local al entregar.

## Límites y siguiente paso

Revisar el resultado con el usuario en `http://127.0.0.1:8790/`. No publicar este árbol sin nueva autorización. Permanecen pendientes dispositivos físicos, lectura humana con tecnologías de asistencia, validación comercial de precios y validación de proveedores. No se declara paridad pixel a pixel universal ni perfección de todos los dispositivos.

Se retiraron únicamente artefactos temporales de intentos de prueba de esta sesión para liberar espacio; se pueden regenerar con las pruebas. No se eliminaron archivos de producto o datos del usuario.
