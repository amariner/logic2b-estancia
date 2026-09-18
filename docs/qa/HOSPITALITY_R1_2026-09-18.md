# R1 · Entrada comercial por pregunta y siguiente decisión

Fecha: 2026-09-18. Base: `8b77857717864080255e545f0d1671bb8f3033ad`, rama `main`. La sesión de cierre recibió el incremento R1 en el árbol local sin consolidar, junto con este informe incompleto; se contrastó y conservó. El remoto no había divergido al comprobarlo. Incremento local; no hay despliegue, proveedores activados ni solicitudes reales enviadas en QA.

## Problema y entrega

La oferta podía leerse como gestión operacional inmediata desde el precio de Básico. «Elegir este plan» abría en realidad un diagnóstico; el recorrido mezclaba tres marcas bajo «una estancia» y la solución rural no abría la solicitud que explicaba. Además, dos listas distintas de procedencias podían descartar el contexto de paneles.

Se conserva el catálogo, las once familias de contenido, los tres planes y el tour de cinco etapas. El hero ES/EN distingue evaluación (seis preguntas y recomendación en pantalla, sin registro) de exploración (solicitud ficticia concreta). El titular estable sustituye las promesas rotatorias. El contacto directo sigue disponible en el shell; el diagnóstico no es obligatorio.

Home y solución rural muestran una web y la solicitud Terrava con pregunta, evidencia y límite visibles. Se reutilizan `WebsitePreview`, `PanelPreview` y el catálogo; no se añade iframe ni dependencia. Las tarjetas conservan precios/condiciones, muestran sus límites y abren planning o ingresos de acuerdo con su ilustración. Básico abre Nivora sin gestor.

El tour identifica tres casos independientes y permite elegir por dónde empezar. La etapa actual y el número de etapas vistas se muestran por separado. Solo se ofrece completar después de visitar las cinco etapas, con acción explícita. Cada etapa permite evaluar su necesidad sin acabar el tour; el diálogo de home también ofrece esa salida. Con JavaScript desactivado, las cinco etapas y enlaces siguen disponibles.

## Refinamiento solicitado de recorrido, temas y popups

La revisión pública de [Camp](https://camp.logic2b.com/) el 18/09 incluyó home, popup de tema L’Olivar, popup de panel y arranque/primera etapa de su recorrido. Se adoptan proporción amplia de preview, acción cercana y explicación progresiva, con identidad y contenido propios. No se copian sus imágenes, promesas operacionales, precios, textos ni recorrido temporizado.

- Hero más breve: «Una web con carácter. Una gestión a tu medida.» y dos acciones. Explorar abre la solicitud directamente dentro del popup; el href al recorrido queda disponible sin JavaScript o con clic modificado. Los tres accesos adicionales quedan en un desplegable. Contactar sigue accesible desde el shell sin evaluación obligatoria.
- La miniatura de cada tema en el hero abre su preview y devuelve el foco al cerrar. La web o el panel ocupa la mayor parte del diálogo, con selector escritorio/móvil, un CTA y detalle nativo desplegable. El límite ficticio permanece visible fuera del iframe. El panel dice «Evaluar este panel» y lleva su necesidad concreta; el diseño conserva la solicitud contextual.
- El recorrido usa lenguaje cotidiano, preguntas concretas y detalle progresivo. Se distingue posición de etapa de número de etapas vistas. Entrar por Solicitudes no acredita haber visto la web. Completar exige las cinco, navegar después sigue posible y se conserva solo progreso local cerrado. Los valores antiguos de sesión se migran sin inventar etapas vistas.
- Las flechas del flujo están junto a las tarjetas que desplazan, también en móvil. Las dos pruebas centrales de web y solicitud tienen preguntas y textos más breves.
- Doce temas reutilizan titulares y secciones existentes en tres composiciones (urbana dividida, rural sobre paisaje y hotel enmarcado), con paletas y encuadres propios. Una nueva [fotografía Nivora de OpenAI](../assets/NIVORA_OPENAI_2026-09-18.md) se integra en la demo y sus previews, con WebP y AVIF responsive. Se preservan los originales. No se generó vídeo: esta entrega se entiende mediante las vistas interactivas.

La comprobación manual detectó que Escape dentro de un iframe no cerraba su popup. El puente nuevo solo comunica una constante de cierre al padre del mismo origen URL; el padre comprueba la identidad exacta del iframe abierto. No envía datos ni cambia permisos. Respeta Escape consumido por búsquedas/diálogos interiores. El tiempo de carga está acotado, la ayuda desaparece al cargar y cerrar reinicia tamaño, detalles e iframe.

## Contratos y fronteras

- Una lista compartida de procedencias cerradas cubre planes, webs, paneles, recorrido y solución rural, con rutas ES/EN. No se propagan parámetros libres ni URL externa.
- `need` usa cuatro valores cerrados: solicitudes, planning, limpieza y métricas. El diagnóstico precarga exactamente la capacidad seleccionada; el usuario puede editarla. Los enlaces anteriores sin `need` conservan compatibilidad.
- Las etapas deciden su par plan/web/gestor canónico; hints arbitrarios de plan/web no alteran la entrada del tour. Segmento solo contextualiza, nunca recomienda por tamaño.
- El contexto llega al único formulario comercial mediante el mecanismo de sesión ya existente; no se añade almacenamiento de PII. Los tests interceptan capacidades y envío.
- Demos locales, precios orientativos, consentimiento analítico, sandbox/CSP y ausencia de proveedores se mantienen. No se atribuye mejora medida de conversión.

## Consejo multidisciplinar

Encuadre previo: propietario/gestor de alojamiento que necesita reconocer el alcance adecuado y comprobarlo antes de entregar datos. Hipótesis: preguntas y resultados explícitos mejoran comprensión y pertinencia del contacto. La hipótesis necesita validación humana; los clics no la prueban.

| Perfil | Necesidad previa | Revisión posterior |
|---|---|---|
| Marketing | Destinatario, promesa y resultado de cada CTA concretos. | Corregido: evaluación frente a exploración; sin promesa de operación inmediata ni uplift. |
| Producto | Evidencia por capacidad y planes canónicos. | Corregido: web/solicitud/planning/ingresos concretos; Básico sin dashboard. |
| UX | Entrar por intención y conservar contexto editable. | Corregido: etapa/segmento/procedencia/capacidad hasta diagnóstico y formulario, sin exigir catálogo ni tour completo. |
| UI | Lectura, jerarquía y reflow en ES/EN. | Corregido: titular estable, pruebas visuales reutilizadas y límites junto al CTA; QA indicada abajo. |
| SEO | Mantener intención e indexación, no multiplicar páginas. | Correcto: rutas/metadatos/canonical/hreflang existentes, una H1, ejemplos ficticios; no nuevas páginas vacías. |
| Frontend | Fuente común para contexto, sin nuevo subsistema. | Corregido: lista de fuentes y mapa de necesidades compartidos, previews existentes, sin dependencias nuevas. |
| Full stack | Captación única, campos cerrados y sin efectos en demos. | Correcto: no cambia API, proveedor, permisos ni persistencia; payload verificado con mock. |
| QA/accesibilidad/rendimiento/confianza | Teclado, 320 px, texto ampliado, aislamiento y progreso veraz. | Corregido: foco, reflow y progreso comprobados; 28/28 en cierre focal y 233 casos únicos acreditados; pruebas humanas pendientes. |

Revisión independiente previa y posterior: detectó la divergencia de listas de procedencia, necesidad sustituida por reservas/automatización y progreso engañoso al saltar al último paso. Las tres se corrigieron; la última revisión no encontró bloqueantes conocidos tras corregir el reflow de la FAQ. La descripción de Gestión deja de llamar «solo lectura» al conjunto que ya incluye cambios locales; no cambia la capacidad real. La revisión posterior del popup detectó pérdida de intención al evaluar Solicitudes e Ingresos: se corrigió con `need=enquiries/planning/cleaning/metrics` cuando corresponde y una etiqueta que anticipa la evaluación.

## Evidencia de verificación

`pnpm check` sobre el build integrado: correcto; 7/7 tareas de lint (6 desde caché), 21/21 de typecheck/test/build (15 desde caché) y 33 pruebas de scripts ejecutadas. Contratos acreditados: site 31, Worker 95, dominio 20, dashboard 7, web 2 y scripts 33: **188 pruebas**. No se afirma ejecución forzada de tareas cacheadas. Astro: 117 archivos sin errores, avisos ni hints; build de 100 páginas comerciales y 10 demos.

Regresión completa Chromium: **227/233 correctas**; seis fallos investigados (cuatro selectores de catálogo, visibilidad del contacto flotante y overflow EN con texto ampliado). Tras las correcciones, nuevo `pnpm check` correcto y cierre sobre el build final: **28/28 correctas** —dos de accesibilidad (98 rutas a 320 px y familias con texto al 200 %), dos Camp, una de contacto flotante, catorce R1, siete de previews y dos que recorren los doce temas móviles en ES/EN—. Se verifican en conjunto los **233 casos únicos**; no se afirma 233/233 en una única ejecución final.

Logs: `/tmp/estancia-r1-closure-e2e.log` (regresión), `/tmp/estancia-r1-verified-check.log` y `/tmp/estancia-r1-verified-e2e.log` (cierre). Capturas completas en `/tmp/estancia-r1-closure-results/` y `/tmp/estancia-r1-verified-results/`; selección persistente debajo. `git diff --check` y enlaces locales del informe correctos. SHA del producto consolidado en el [checkpoint](../../plans/PROJECT_CONTINUATION.md).

QA visual realizada en navegador local y capturas del Worker: home, temas, paneles, recorrido y planes ES/EN; 320/390/1440 px y recorrido también a 1280 × 720. Teclado, Escape interior/exterior, retorno de foco, texto al 200 % y visibilidad del foco por hit-test. Evidencia persistente: [recorrido de escritorio](./assets/r1-2026-09-18/recorrido-escritorio.png), [foco a 320 px](./assets/r1-2026-09-18/recorrido-foco-320.png), [panel móvil](./assets/r1-2026-09-18/panel-movil.png) y [Nivora de escritorio](./assets/r1-2026-09-18/nivora-escritorio.png). No hay nueva medición Lighthouse ni prueba en dispositivo físico.

Durante QA se corrigieron dos fallos de producto: el footer sticky del recorrido ocultaba el foco de Evaluar en 1280 × 720; ahora el contenido se desplaza en su área y los controles no lo cubren. En el panel de muestra móvil, una regla posterior restituía dos columnas tras ocultar la barra lateral y comprimía Solicitudes a 42 px; se conserva una sola columna a ese tamaño. La regresión específica comprueba foco visible real mediante hit-test, teclado, 320 × 568, 390 × 844 y texto al 200 %.

La regresión amplia encontró además un desbordamiento real en home EN a 320 px y texto al 200 %: «Frequently» imponía un ancho mínimo al título FAQ y ensanchaba la página a 368 px; otras palabras largas en las preguntas conservaban 327 px al corregir solo el título. Se permite partir palabras tanto en título como en preguntas cuando sea necesario, sin ocultar contenido: ancho final 320 px. La prueba espera dos frames después de ampliar texto para medir el layout final; antes podía leer 320 px prematuramente y dar un falso positivo. Se conserva el límite exacto del viewport.

Cuatro fallos de selectores antiguos contaban los nuevos accesos de temas del hero como controles del catálogo o intentaban pulsar el carrusel en movimiento. Las pruebas del catálogo se acotan a su sección; las nuevas pruebas del hero conservan cobertura independiente. Otro caso esperaba el contacto flotante visible cuando aún quedaban 88 px de un bloque protegido por el margen del ancla: se comprueba que ese bloque haya salido de pantalla antes de exigir el botón. Se mantienen los controles de foco, tamaño táctil, sandbox/CSP y ausencia de efectos externos.

El primer intento amplio agotó los 240 segundos del único test que agrupaba 98 rutas de accesibilidad; no acreditó su finalización. Se reorganizó únicamente ese test en diez grupos de hasta diez rutas, con las mismas 98 rutas, etiquetas WCAG y reglas de contraste; cada URL se informa como paso. No se eliminó ninguna aserción. La ejecución se interrumpió antes de concluir, al preparar además el build con las correcciones de foco y assets.

Se usa `PLAYWRIGHT_PORT=8794` y `PLAYWRIGHT_INSPECTOR_PORT=9244` porque 8790 estaba ocupado por otro proyecto local. El puerto configurable evita probar accidentalmente una aplicación ajena. Los preloads y metadatos de Nivora derivan de la nueva imagen y se preservan las variantes anteriores.

## Validación de comprensión pendiente · cinco personas

No se han reclutado participantes ni celebrado sesiones. Se preparan cinco sesiones moderadas con personas responsables de alojamientos independientes (cubrir rural, apartamentos y hotel; la muestra no acredita representatividad ni conversión).

Sin explicar el producto antes de la tarea, mostrar home/plan o entrada rural y pedir:

1. Explicar para quién es el proyecto, qué problema permite abordar y qué queda fuera del alcance visible.
2. Elegir una pregunta propia y llegar a la evidencia correspondiente; distinguir la web y el gestor y reconocer por qué Básico no tiene dashboard.
3. Explicar si se puede reservar, enviar una respuesta, cobrar o sincronizar de verdad en el ejemplo.
4. Predecir qué sucede al pulsar evaluación, completarla con datos de muestra y comprobar si el contexto coincide; el contacto es opcional y no se envía.
5. Explicar precio mensual, implantación, IVA/exclusiones y qué decisión falta antes de contratar.

Registrar por participante anónimo P1–P5: segmento/rol, ruta inicial, tarea, respuesta literal consentida sin datos identificables, ayuda requerida, confusión y corrección propuesta. No inventar respuestas. Cualquier confusión sobre operación real exige revisar el copy antes de afirmar comprensión validada. Una sesión fallida no se compensa con un contador de clics. No se contacta a personas desde este incremento.

## Deuda y próximo trabajo

Comprensión humana (5 sesiones), dispositivos físicos, lectores de pantalla humanos y zoom nativo siguen pendientes; ampliación de texto al 200 % no equivale a zoom nativo. Quince entrevistas y cinco propuestas para disposición a pagar/margen, activación de analítica y validación de proveedores permanecen externas.

R2: revisar el formulario único con contacto esencial y contexto adicional progresivo; reutilizar datos del diagnóstico sin repetirlos, mantener edición/descarte y teléfono opcional. Cualquier cambio de obligatoriedad requiere esquema/tipos/plantilla de email coherentes y pruebas de error/timeout/429/idempotencia/recibo, sin rellenar datos ausentes ni enviar correos de QA. No esperar a personas/proveedores para preparar y verificar ese trabajo local.

La revisión del código concreta la primera entrega R2: conservar nombre, empresa y email visibles; mostrar una sola vez tipo, plan, propiedades, unidades y plazo tras diagnóstico, con edición en el mismo formulario. En entrada directa siguen visibles los datos de alojamiento obligatorios. Separar retirar el diagnóstico de revisar valores precargados, conservar el contacto escrito y abrir cualquier grupo con validación fallida. Reorganizar primero sin cambiar obligatoriedad ni API; no añadir un asistente de varios pasos.
