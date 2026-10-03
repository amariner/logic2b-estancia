# Logic2B Estancias · Roadmap de paridad con SuperHote, Cloudbeds y Mews

Versión: **1.6 · 2026-10-04**. Estado: **R0–R2 publicados en producción; R3 y R4 verificados, ambos sin despliegue; R5 siguiente**. Resultado y evidencia de R4: [informe QA](../docs/qa/HOSPITALITY_R4_2026-10-04.md). Evidencia y resultado final de R3: [informe QA](../docs/qa/HOSPITALITY_R3_2026-10-04.md). SHA de producto R2: `2418a521ef03d7369bd148e3c035df45757bbbe1`. Base R1: `95b1c724c4cf16be58e8e7c77e544a224b7c9fc0`. Las cinco sesiones humanas de comprensión siguen pendientes. Base R0: `d10dd5580e626e715e577e609bee1d82cb112db8`. Publicación autorizada el 18/09: revisión `d4811d1b21a574e1b7c37353ef840b1368f89fb9`, con correcciones de reflow; [evidencia](../docs/qa/PRODUCTION_2026-09-18.md). No equivale a conversión comercial validada.

**Publicación solicitada el 04/10:** cambios integrados en GitHub y corrección de foco verificada antes del intento. El workflow pasó check/build pero Wrangler quedó bloqueado por `CLOUDFLARE_API_TOKEN` no disponible; no hubo nueva publicación ni migración. El permiso del usuario ya está concedido. [Resultado y reanudación](../docs/qa/PRODUCTION_2026-10-04.md).

Este es el roadmap estratégico vigente solicitado por el usuario. Sustituye la cola de [paridad Camp](./CAMP_PARITY_ROADMAP.md), que se conserva como histórico. La fuente operativa de continuidad sigue siendo [PROJECT_CONTINUATION.md](./PROJECT_CONTINUATION.md). Investigación: [síntesis y evidencia](../docs/research/HOSPITALITY_BENCHMARK_2026-09-14.md), [SuperHote](../docs/research/SUPERHOTE_2026-09-14.md), [Cloudbeds](../docs/research/CLOUDBEDS_2026-09-14.md), [Mews](../docs/research/MEWS_2026-09-14.md).

## 1. Objetivo y definición de paridad

**Objetivo:** que un alojamiento adecuado para Estancias pueda entender la propuesta, comprobar una tarea representativa, valorar coste y puesta en marcha, y llegar a una conversación cualificada. Desarrollar después capacidad operativa únicamente con validación comercial, arquitectura y autorización específicas.

| Nivel de paridad | Qué demuestra | Cómo se acredita |
|---|---|---|
| Comercial | Propuesta, evidencia, oferta y siguiente paso comprensibles. | Tareas de comprensión, rutas válidas, alcance visible y embudo propio medido cuando se active. |
| Demostrativa | Un usuario completa una tarea local con datos ficticios coherentes, estados y recuperación. | Escenario reproducible, pruebas de dominio/E2E, QA visual y ausencia de efectos externos. |
| Operativa | La tarea funciona con inventario, equipos, datos y proveedores reales. | Contratos, permisos, pruebas aisladas y de reconciliación, piloto autorizado, soporte, auditoría y recuperación. |

No se suman estos niveles en un porcentaje total. Una captura, un fixture, un contrato preparado o un logo no cuenta como función operativa. La paridad se evalúa por tarea, plan, tipo de alojamiento, estado de error y cobertura; no por número de módulos.

## 2. Decisiones que permanecen vigentes

- **Básico / Nivora:** web de marca y demostración de consultas; sin dashboard. **Gestión / Terrava:** continuidad demostrativa de solicitudes, planning y huéspedes. **Inteligente / Aurem:** operación, equipos y revisión supervisada.
- El tamaño aporta contexto de implantación; las capacidades deciden plan. No adoptar los nombres de paquetes de los competidores.
- Demos locales, ficticias y transparentes, sin reservas, cobros, comunicaciones, inventario o sincronización reales. Las nuevas interacciones simuladas vivirán en memoria y se restaurarán al recargar; no requieren cuentas, almacenamiento de PII ni proveedores.
- Solo el formulario comercial único de la landing puede enviar una solicitud real, al destinatario interno de producción `marinerandreu+logic@gmail.com`. No crear otra captación, checkout, CRM ni mensajes externos. HubSpot continúa fuera de alcance.
- Conservar precios orientativos **49/149/299 €/mes + 490/990/1.990 €** de implantación, sin IVA y con las condiciones actuales. Las quince entrevistas cualificadas y cinco propuestas reales siguen pendientes; no se infiere validación de este benchmark.
- GA4/GTM solo tras consentimiento explícito y activación autorizada; nunca PII o texto libre. Las demos mantienen sus restricciones de red y formularios.
- Replicar principios de organización e interacción con diseño y contenido originales. No copiar marca, textos, imágenes, testimonios, estadísticas ni garantías de terceros.
- Esta investigación no autoriza producción, compras, cuentas de proveedores o conexiones. La autorización de commit/push para futuras continuidades se rige por `AGENTS.md`; la investigación del 14/09 no consolidó esos cambios; R0 los preserva y verifica antes de su commit.

## 3. Baseline que no se vuelve a construir

Existen doce direcciones web, seis fichas de panel, cinco guías por rol, tres planes, diagnóstico, tour comercial de cinco pasos, portfolio, previews y rutas ES/EN. Existen contratos de capacidades, preparación de proveedores, informe analítico y expediente offline de GTM. El editor web supervisado, las reglas inspeccionables, el copiloto ficticio editable y las métricas explicables ya están implementados.

Desde R3, Terrava comparte una colección en memoria entre solicitudes, planning, reservas, huéspedes e informes: permite comprobar conflictos y capacidad, confirmar una alternativa ficticia, modificar o cancelar la estancia, deshacer cambios y restablecer el escenario. El filtro de propiedad y los importes se derivan de esa colección; las unidades fuera de servicio bloquean su disponibilidad de muestra. Búsqueda y avisos abren el caso correspondiente. Esta interacción es local y se pierde al recargar; no acredita persistencia ni operación real.

Desde R4, Aurem comparte estado en memoria entre tres casos de llegada, tareas y preparación: la 408 de Elena, la 312 para el recorrido normal y la 205 inicialmente preparada. El flujo permite confirmar salida previa, asignar, aceptar o rechazar, completar checklist y pedir revisión de otro rol; incluye incidencia bloqueante, resolución local, devolución, reasignación, deshacer y reinicio. Resolver una incidencia no prepara la habitación sin completar limpieza y revisión. Dirección, Recepción y Limpieza simulan controles distintos, sin autenticación ni permisos de producción. La implementación y su QA local están verificados; no se ha desplegado. `useDemoState` y los contratos nuevos usan memoria: no acreditan persistencia ni sincronización entre dispositivos. No se reconstruye el núcleo de Terrava ya implementado.

Evidencia de revisión: [dashboard](../apps/dashboard/src/DashboardDemo.tsx), [contrato de estancia](../apps/dashboard/src/stays.ts), [gestor de Terrava](../apps/dashboard/src/StayWorkspace.tsx), [contrato operativo de Aurem](../apps/dashboard/src/operations.ts), [preparación de Aurem](../apps/dashboard/src/OperationsWorkspace.tsx), [informe R4](../docs/qa/HOSPITALITY_R4_2026-10-04.md), [informe R3](../docs/qa/HOSPITALITY_R3_2026-10-04.md), [estado heredado](../apps/dashboard/src/state.ts), [capacidades](../packages/domain/src/index.ts), [recorrido](../apps/site/src/commercial-tour.ts), [precios](../apps/site/src/pricing.ts).

**Corrección del checkpoint anterior:** la home actual no renderiza la nota y puerta técnica de conexiones que figuraban como verificadas. Sus fichas de temas enlazan a `/temas/`, mientras una prueba espera `/webs/`. `pnpm check` pasa, pero E2E focal queda en **14/16**, con esas dos discrepancias. La madurez y aislamiento demostrativo no equivalen a una aprobación global del árbol. R0 precede a todo cierre de producto. **Actualización 18/09:** discrepancias reconciliadas; ver checkpoint e informe QA R0. Este párrafo conserva la observación de partida.

## 4. Matriz de paridad por dominio

Las referencias remiten a los anexos con fuentes primarias. «Documentado» significa declarado por el proveedor, no probado en una cuenta. «Pendiente» en Estancias no significa inexistencia absoluta fuera de los archivos revisados.

| Dominio / tarea | Referencia más útil | Estado contrastado en Estancias | Objetivo siguiente | Fase |
|---|---|---|---|---|
| Entender la oferta y próximo paso | SuperHote: problema cotidiano; Mews: prueba de interfaz | Estructura completa; CTA genérico y muchos accesos | Promesa y acción concreta con evidencia inmediata | R1 |
| Evaluar sin entregar datos | SuperHote vídeo abierto; demos públicas propias | Diagnóstico y tour abierto ya existentes | Progresión por intención y contexto conservado | R1–R3 |
| Solicitar información con contexto | Cloudbeds/Mews: cualificación consultiva | Formulario único, diez campos y recibo | Menor carga inicial, mismo contrato fiable | R2 |
| Comparar alcance/coste | Tres referentes: presupuesto adaptado | Precios y exclusiones ya publicados | Coste total orientativo y decisión por capacidades | R1/R6 |
| Solicitud → estancia | SuperHote: reserva desde varios contextos | Terrava confirma, modifica y cancela estancias ficticias con recuperación en memoria; Aurem conecta sus llegadas con preparación | Conservar identificadores, fechas, unidades e importes al ampliar motor y portal | R3/R4 verificados; R5 siguiente |
| Calendarizar y detectar conflicto | Cloudbeds/Mews: calendario contextual | Planning de Terrava derivado de estancias, con filtro real de propiedad, conflictos y bloqueos de servicio; Aurem comparte estancias y preparación | Reutilizar fechas y unidades en búsqueda y portal ficticios | R3/R4 verificados; R5 siguiente |
| Preparar llegada con equipo | SuperHote tareas; Mews Operations | Tres casos interactivos de Aurem con salida, asignación, aceptación, checklist, revisión separada, incidencia y recuperación en memoria | Conservar estado coherente al ampliar el portal | R4 verificado; sin despliegue |
| Trabajar desde móvil | Apps de los tres proveedores con alcance por tarea | Preparación de Aurem por rol sobre el mismo estado local, con tareas, pendientes e incidencias | Conservar responsive, teclado y foco verificados; dispositivo físico y lector de pantalla humanos pendientes | R4 verificado |
| Reservar desde la web | Motores de los tres proveedores | Simulaciones locales y webs, sin operación | Búsqueda → tarifa → resumen → resultado ficticio coherente | R5 |
| Preparar viaje como huésped | SuperHote Guest Page; Mews portal | Sin portal vinculado acreditado en baseline revisado | Portal ficticio de una estancia, sin PII ni pago | R5 |
| Comprender ingresos | Cloudbeds/Mews: revenue; fórmulas propias | Informes de Terrava derivados de sus estancias y filtro; métricas explicables de Aurem conservadas | Mantener trazabilidad y explicar alcance; sin forecasting | R3 implementado; R6 pendiente |
| Editar web / revisar IA / reglas | Producto de referencia y demo propia | Ya utilizable de forma local y supervisada | Reutilizar; solo ampliar ante tarea validada | Conservación |
| Migrar y pedir ayuda | Onboarding/formación de los tres | Guías y servicio humano ya existentes | Entregables, responsables y criterios de aceptación concretos | R6 |
| Generar confianza propia | Casos, documentación y condiciones | Escenarios ficticios y evidencia técnica | Estudios de caso reales cuando existan y estén autorizados | R6/R7 |
| Medir conversión | Hipótesis derivada de embudos públicos | Contratos/informes preparados; activación pendiente | Línea base fechada y experimento único | R7 |
| Integrar datos/canales/pagos | Ecosistemas documentados | Contratos; cero proveedores operativos validados | Decisión de arquitectura y un piloto por proveedor | O0–O3 |
| Operar como PMS multiempresa | Cloudbeds/Mews | No acreditado; Worker comercial, no PMS transaccional | Aislamiento, inventario, auditoría, recuperación, soporte | O1–O4 |
| Revenue avanzado, POS, grupos, API | Cloudbeds/Mews | Fuera del alcance operativo actual | Solo dominios con demanda y datos validados | O5 |

## 5. Cola de implementación local

El orden combina impacto, riesgo y dependencias. Las estimaciones son **rangos de planificación propios**, no compromisos: jornadas de una persona de ingeniería, con apoyo de diseño/contenido y QA; excluyen entrevistas, esperas y producción. Deben recalibrarse después de R0. No se presenta una fecha de paridad completa con estas plataformas.

| ID | Incremento terminado | Impacto / confianza inicial | Dependencia | Esfuerzo orientativo | Estado |
|---|---|---|---|---:|---|
| R0 | Baseline, límites visibles y rutas coherentes | Crítico / alta: evidencia de código y E2E | Ninguna | 1–3 días | **Publicado · 2026-09-18** |
| R1 | Entrada comercial centrada en prueba y decisión | Alto / media: hipótesis de benchmark | R0 | 4–7 días | **Publicado · 2026-09-18**; comprensión humana pendiente |
| R2 | Solicitud comercial con menos repetición | Alto / media: requiere observar usuarios | R0, contrato de R1 | 3–5 días | Publicado; observación humana pendiente |
| R3 | Estancia y planning ficticios coherentes | Alto / alta sobre brecha técnica; media comercial | R0; R1 para entrada al caso | 7–12 días | **Completado y verificado · 2026-10-04**; [evidencia](../docs/qa/HOSPITALITY_R3_2026-10-04.md); sin despliegue |
| R4 | Preparación y trabajo móvil por rol | Alto / media | R3 | 5–8 días | **Completado y verificado · 2026-10-04**; [evidencia](../docs/qa/HOSPITALITY_R4_2026-10-04.md); sin despliegue |
| R5 | Motor y portal de huésped simulados | Medio-alto / media | R3, R4 para estados de preparación | 6–10 días | **Siguiente incremento**; no implementado |
| R6 | Contenido de decisión e implantación | Alto / media | R1; puede avanzar junto a R3 | 4–7 días | Pendiente |
| R7 | Validación comercial y experimentación | Alto / pendiente de evidencia real | R1/R2; activación externa para GA4 | Continuo | Preparación local disponible; ejecución externa pendiente |

Cada incremento se divide si excede una entrega revisable, pero no se declara completo por haber dibujado una pantalla. R6 no debe esperar al portal si el contenido existente ya permite una comparación útil. Las entrevistas de R7 pueden preparar su material desde el principio; no se contacta a personas sin autorización explícita.

### R0 · Reconciliar la base antes de crecer

**Estado: cerrado el 18/09/2026.** Evidencia y deuda en el [checkpoint](./PROJECT_CONTINUATION.md) y el [informe QA](../docs/qa/HOSPITALITY_R0_2026-09-18.md).

**Problema de partida:** el checkpoint afirmaba evidencia que el árbol no mostraba; había dos fallos E2E anteriores a la investigación.

Entregar: nota visible sobre las marcas de referencia y ausencia de conexiones; destino accesible para alcance/condiciones de activación aprovechando contratos existentes; decisión coherente sobre `/webs/` frente a `/temas/`, enlaces, metadata y pruebas. Revisar el diff local anterior sin sobrescribirlo. No restaurar bloques técnicos extensos en el primer pantallazo por defecto: el detalle puede ser progresivo, el límite comercial debe verse.

Aceptación: ningún logo sugiere integración confirmada; el usuario accede al límite sin lector de pantalla; fichas, previews y contactos mantienen el contexto; `pnpm check`, `camp-parity`, `demo-mode`, `ui-refinement` y SEO relevante correctos. Corregir la discrepancia de producto o contrato según la decisión, sin eliminar aserciones de seguridad ni disfrazar los fallos como flakiness. QA de home/conexiones/tema en ES/EN, 320/390/1440 px, teclado y zoom. Checkpoint coherente con la evidencia final.

Responsables: frontend + QA; marketing y UI validan el límite legible. Riesgo: confianza comercial y pérdida de rutas. Métrica: cero afirmaciones ambiguas conocidas y cero discrepancias de contrato focal pendientes. **No requiere proveedor ni decisión de precios.**

### R1 · Hacer que se entienda y se pueda comprobar

**Estado: cerrado en local el 18/09/2026.** Evidencia técnica y visual en el [informe R1](../docs/qa/HOSPITALITY_R1_2026-09-18.md) y SHA en el [checkpoint](./PROJECT_CONTINUATION.md). Las cinco sesiones de comprensión y la medición de conversión siguen pendientes.

Entregado: revisión de hero, entrada al recorrido, fichas de plan y solución rural ES/EN, reutilizando las familias existentes. «Una web con carácter. Una gestión a tu medida.» introduce evaluación con resultado explícito y exploración directa de una solicitud ficticia. Cada etapa permite evaluar su necesidad; el contacto directo sigue disponible sin diagnóstico obligatorio. Se conserva contexto cerrado hasta el formulario único.

La petición del 18/09 añade popups de tema/panel con mayor preview y detalle progresivo, accesos desde el hero, doce temas diferenciados y recorrido breve con progreso veraz. Camp aporta principios de interacción observados, sin sustituir este roadmap. Una imagen original de OpenAI mejora Nivora; no se añade vídeo ni se adelantan funciones operacionales.

Dar protagonismo a una web y una vista del gestor con una pregunta real. Recuperar el escenario relevante desde segmento/capacidad sin hacer que cada visitante recorra todo el catálogo. Los cinco pasos existentes siguen siendo la base; el propósito del caso y su resultado deben resultar evidentes. Conservar precios, límites y mapeo canónico. No añadir un plazo de llamada o promesa de soporte sin capacidad confirmada.

Aceptación: desde hero y plan se alcanza la evidencia exacta sin callejón sin salida; el CTA conserva contexto allowlisted; Básico no muestra un dashboard; todas las promesas tienen evidencia/límite; ES/EN, foco y reflow correctos. Pruebas: `pnpm check`, E2E de tour, planes, contacto y accesibilidad/SEO afectados. Validación cualitativa propuesta con cinco personas del segmento: pueden explicar destinatario, valor, estado de demo y siguiente paso; cualquier confusión sobre operación real obliga a corregir. Las sesiones humanas quedan pendientes hasta realizarlas.

Responsables: marketing + producto + UX/UI, implementación frontend. Métricas: comprensión, acceso a evidencia y handoff comercial consentido; no prometer aumento de conversión antes de medir.

### R2 · Mejorar el formulario único y su recuperación

**Cierre local 18/09:** presentación progresiva y recuperación implementadas sin cambiar API ni obligatoriedad. Contacto esencial visible; contexto resumido desde los controles actuales; opcionales separados; diagnóstico adicional visible, revisable y descartable sin perder ediciones. Errores abren su grupo; envío/cooldown protegidos frente a concurrencia. Check, 77 casos E2E relevantes y cierre visual focal; ver [informe R2](../docs/qa/HOSPITALITY_R2_2026-09-18.md). La comprensión y el impacto comercial requieren observación humana; no se declara mejora de conversión. SHA de producto: `2418a521ef03d7369bd148e3c035df45757bbbe1`.

Revisar cada campo actual según su uso real en cualificación. Prototipar agrupación de contacto esencial y contexto adicional; mantener precarga del diagnóstico, edición y descarte. Conservar teléfono opcional. Evitar introducir cinco pasos porque otro sitio los usa: decidir entre agrupación progresiva y formulario único breve mediante observación de tareas.

**Primer incremento concreto tras R1:** reorganizar la presentación sin cambiar obligatoriedad ni API. Mantener nombre, empresa/alojamiento y email visibles; tras diagnóstico, mostrar tipo, plan, propiedades, unidades y plazo una sola vez como contexto editable. En entrada directa, tipo y escala siguen visibles mientras sean obligatorios. No duplicar resumen y controles ni pedir otro diagnóstico para contactar. Teléfono y mensaje conservan su carácter opcional; el plan sin elegir debe poder leerse como «Aún no lo sé» sin inventar una recomendación.

La acción de retirar el diagnóstico debe explicar qué contexto deja de adjuntarse y permitir revisar las precargas ya editadas, sin borrar el contacto escrito. Cualquier grupo con un error debe abrirse y recibir foco. Comparar entrada directa, tema y diagnóstico en ES/EN; mantener los datos durante errores y reintentos, sin persistir PII ni enviar borradores. Esta primera entrega reduce repetición visual; la comprensión y el efecto sobre conversión requieren validación separada.

Si se reduce obligatoriedad, actualizar esquema, tipos, plantillas del email y pruebas; no rellenar datos ausentes con valores inventados. Mantener privacidad obligatoria para responder y seguimiento comercial separado/opcional. No transmitir borradores ni respuestas parciales. La captación sigue siendo una sola instancia de la landing, incluso cuando se presenta en diálogo.

Aceptación: rutas directas y contextualizadas, envío válido, errores de validación, indisponibilidad de manifiesto, timeout, doble intento, `429`, reintento idempotente, recibo y agenda opcional. Nada se pierde al recuperar un error durante la visita; el contexto no se filtra por URL/GA4 ni se persiste como PII. No se envían correos reales en QA. `pnpm check`, pruebas Worker y E2E de contacto/analítica relevantes.

Responsables: UX + marketing + full stack + QA. Métricas: inicio→entrega y calidad de solicitud; eventos adicionales solo si el contrato actual no responde la pregunta y tras consentimiento. Las reuniones celebradas se verifican aparte.

### R3 · Un caso de estancia completo en Terrava

**Estado 04/10/2026:** completado y verificado, sin despliegue de producción. Producto `b428cea15672219cafc0a8c245a5a6dc034e3950`: 230 contratos y 270 E2E únicos acreditados entre ejecuciones. La evidencia exacta, revisión del consejo y deuda se registran en el [informe QA R3](../docs/qa/HOSPITALITY_R3_2026-10-04.md) y el [checkpoint](./PROJECT_CONTINUATION.md). El contrato y los criterios siguientes se conservan como referencia de aceptación y regresión.

**Primer núcleo demostrativo:** una solicitud ficticia pide fechas que entran en conflicto; se consulta planning, se compara alternativa, se confirma únicamente en memoria, se abre la estancia y se modifica o cancela con recuperación visible. La cuadrícula se deriva de los mismos datos que el detalle y el resumen.

Contrato mínimo: identificador ficticio, propiedad/unidad, entrada/salida, ocupantes de muestra, origen, estado y desglose en céntimos. Definir intervalos de estancia, noches, restricciones del escenario y qué bloquea una unidad. Cambiar de propiedad filtra realmente los datos. Los importes y fechas coinciden en solicitud, calendario, reserva y huésped. Incluir una habitación/unidad fuera de servicio y dos escenarios sin disponibilidad/alternativa; sin algoritmos de precios ni PMS externo.

Reutilizar shell, navegación, búsqueda y tour. El panel de estancia conserva posición y contexto; los controles permiten teclado, no solo drag-and-drop. El estado termina al recargar. Actualizar `CAPABILITIES`, guías y copy donde hoy describen solo lectura: pasar a interacción ficticia nunca equivale a activación.

Aceptación: cuatro flujos reproducibles —normal, conflicto, modificación y cancelación—, cálculo de noches/importes, filtros reales y reinicio. Cero inconsistencias entre vistas; cero HTTP writes o conexiones externas. Nivora permanece sin panel. Pruebas de dominio sobre conflicto/fechas/cálculo y E2E del caso y aislamiento; `pnpm check`, QA 320/390/1440 px y estados vacíos/error. No probar aritmética copiando la implementación: usar ejemplos con resultado independiente y bordes de mes/entrada-salida coincidente.

Responsables: diseño de producto + frontend/dominio + QA; full stack revisa el límite. Métrica: completar y explicar la tarea, no reservas creadas. La prueba de comprensión es separada del contador de tour.

### R4 · Preparación y móvil de Aurem por responsabilidad

**Estado 04/10/2026:** implementado y verificado en memoria, sin despliegue de producción. Aurem incluye tres casos de preparación, salidas previas, asignación, aceptación o rechazo, checklist, revisión por un rol distinto, devolución, reasignación e incidencia bloqueante con resolución local de Dirección. El estado de llegada se deriva de las tareas; resolver la incidencia no sustituye limpieza y revisión. Deshacer y restablecer permiten recuperar el escenario. Los roles y responsables son simulados, sin autenticación o permisos reales. La evidencia y sus límites se registran en el [informe QA R4](../docs/qa/HOSPITALITY_R4_2026-10-04.md). Producto `13c2de9b515272302f623db7d8d96cd42e1631c7`: 257 contratos y 76 E2E únicos acreditados entre ejecuciones; no una única pasada 76/76. Los criterios siguientes se conservan para aceptación y regresión.

Ampliar el caso de estancia a una llegada en riesgo: salida previa → tarea de limpieza → aceptación → checklist → incidencia → revisión → habitación preparada. El cambio de tarea debe reflejarse en el estado de preparación de la estancia, con causas y responsable ficticio. Proporcionar reversión y reinicio.

Dirección revisa excepciones; Recepción consulta llegadas; Limpieza ve «Mis tareas». Los roles son simulación de experiencia, no permisos de producción. Mantener la navegación de escritorio, pero priorizar hoy/pendiente/incidencia en móvil; controles táctiles amplios, etiquetas, estados sin depender del color y alternativas a gestos. Usar imágenes de incidencia preparadas, no pedir archivos privados ni acceso a cámara.

Aceptación: tarea normal y bloqueo operativo completos, rechazo/reasignación ficticia, revisión distinta de ejecución, sincronía local entre estado de habitación y llegada; al cambiar el viewport en la misma sesión se conserva el contexto. No existe sincronización entre dispositivos. `pnpm check`, E2E de recorrido/roles/aislamiento, Axe y QA visual; prueba con dispositivo físico y lector de pantalla declarada pendiente hasta ejecutarla. No añadir app nativa, notificaciones, offline o PWA instalable como promesas implícitas.

Responsables: UX/UI + frontend + QA; operaciones/producto validan la tarea. Métrica: comprensión de prioridad y siguiente responsable; éxito local sin acción externa.

### R5 · Recorrido del huésped con una estancia ficticia

Dos entregas dependientes del mismo contrato: (a) búsqueda local → disponibilidad de muestra → selección de unidad/tarifa → condiciones/desglose → confirmación simulada; (b) portal de esa estancia con resumen, instrucciones, preparación y extras de ejemplo. Aplicar inicialmente a Terrava/Gestión; Aurem reutiliza la información y añade contexto de preparación. Nivora conserva consulta sin reserva ni dashboard.

Antes de implementar, definir un contenedor local de caso que comparta memoria entre sus vistas de web, portal y gestor dentro del mismo documento aislado. No confiar en que una navegación Astro entre documentos preserve `useState`, ni usar almacenamiento persistente, PII en URL o acceso del shell comercial al iframe para resolverlo. Los enlaces profundos abren el fixture inicial; la navegación interna del caso conserva el estado y recargar lo restaura. Verificar con E2E web → gestor → vuelta → recarga. No ampliar CSP, comunicación con proveedores o privilegios del sandbox para este recorrido.

Mostrar desde el comienzo que es una simulación. Usar identidades de muestra; no solicitar tarjeta, documento, firma, correo real ni código físico de acceso. Los estados «pago pendiente» o «preparado» deben ser rotulados como ficticios; no crear enlaces de cobro. El acceso local no se denomina autenticación segura. Si no hay disponibilidad, explicar el motivo y ofrecer alternativa coherente; preservar fechas al retroceder.

Aceptación: mismo identificador, fechas, unidad e importes en web, resumen y gestor; formulario simulado no contacta ningún endpoint; dos alternativas, cancelación y recarga consistentes. `pnpm check`, pruebas de dominio y E2E de búsqueda/resumen/portal, aislamiento y accesibilidad. La conversión B2C queda excluida de resultados comerciales reales.

Responsables: producto + UX + frontend/dominio + QA. Métrica: completar búsqueda y explicar condiciones sin ayuda; ninguna afirmación de reserva o cobro real.

### R6 · Decisión de compra, implantación y contenido útil

Mejorar las dos guías existentes y producir primero dos piezas nuevas de intención de compra: diferencias entre solicitud/motor/PMS/canales y preparación de migración. Reutilizar las cinco guías por rol y el contrato de implantación; añadir entradas, responsable, entregable y validación, sin inventar SLA. Vincular cada pieza a una prueba y plan pertinente.

Revisar las plantillas comerciales offline existentes: diagnóstico resumido, propuesta y seguimiento. Incluir alcance, costes iniciales/recurrentes, exclusiones, criterio de aceptación y próxima decisión. No enviar mensajes ni crear registros reales. No hacer nuevos comparadores o calculadoras si los recursos existentes resuelven la pregunta; cualquier cálculo hipotético muestra supuestos y no promete uplift.

Aceptación: intención distinta por página, fuentes actuales donde corresponda, autor/revisión, títulos/semántica, canonical/hreflang/sitemap válidos; nada de comparativas nominales o schema de reseñas sin base verificable. ES/EN solo según contenido real, sin páginas traducidas vacías. `pnpm check`, pruebas de plantillas cuando cambie su contrato y E2E SEO/enlaces pertinentes. Casos reales quedan pendientes de actividad y autorización humanas.

Responsables: marketing + SEO + producto; frontend para presentación. Métrica: solicitudes cualificadas y uso de material en propuestas; sin inventar volumen orgánico o posiciones.

### R7 · Validación y experimentos con evidencia propia

Preparar ahora el protocolo y definiciones: qué es entrevista cualificada, lead adecuado, reunión realizada, propuesta real y coste de servicio. Conservar quince entrevistas y cinco propuestas como objetivo de validación, no como tareas completadas. Estratificar por los segmentos actuales y documentar necesidad/capacidad; no recomendar plan solo por número de unidades.

Activar analítica únicamente mediante el expediente y autorización existentes. Abrir línea base con fecha/versiones y comprobar consentimiento/revocación. Usar primero los eventos y el informe ya construidos; añadir solo lo imprescindible. No unir identificadores de GA4 con contactos ni transmitir PII. Mantener separada la evaluación de demos locales.

El diagnóstico y la evidencia son opcionales: analizar entradas comerciales directas y guiadas sin tratar la primera como abandono. Los ratios actuales se calculan sobre recuentos agregados, no conversiones de las mismas personas. Toda métrica debe fijar denominador, periodo y cobertura consentida; no equiparar esa muestra con todas las solicitudes comerciales ni atribuir individualmente una contratación.

Después de la línea base: un experimento principal —por ejemplo CTA concreto o agrupación del formulario— con métrica, periodo, muestra y criterio de parada fijados antes. Volumen insuficiente implica evidencia cualitativa, no vencedor estadístico. Registrar soporte/implantación/coste de proveedores para revisar margen. Activación GTM, entrevistas, reuniones, propuestas enviadas, casos publicados y producción son trabajo externo pendiente.

Responsables: marketing + producto + analítica/QA + responsable comercial humano. Métricas: entrega, cualificación, reunión realizada, propuesta y coste; no usar el clic de agenda como venta.

## 6. Camino a paridad operativa: programa condicionado

Este horizonte hace explícito lo que falta para competir funcionalmente con un PMS. **No está autorizado para ejecución externa ni puede activarse dentro de las demos.** Se puede documentar arquitectura y criterios offline; cuentas, credenciales, datos reales, compras y pilotos necesitan el alcance y autorización correspondientes.

### O0 · Decidir qué construir y qué integrar

| Ruta | Ventaja esperada | Coste/dependencia a validar | Criterio para elegir |
|---|---|---|---|
| Estancias como web/experiencia y operación acompañada sobre un PMS existente | Reduce el alcance del inventario y pagos que habría que operar directamente. | API, licencias, términos, marcas, límites, margen, soporte y dependencia del proveedor. | Necesidades iniciales cubiertas y acuerdo viable; pruebas y contrato por integración. |
| PMS propio para un segmento acotado | Control del dominio y experiencia. | Equipo, concurrencia, migraciones, soporte, seguridad, disponibilidad y acuerdos de canal. | Problema recurrente que el mercado valida y presupuesto para operación sostenida. |
| Capas propias más proveedores especializados | Permite diferenciar algunas tareas y delegar otras. | Fuente de verdad, conciliación, incidentes entre sistemas y coste de coordinación. | Fronteras y responsables claros; no duplicar inventario autoritativo. |

**Recomendación inicial:** estudiar la primera/tercera ruta antes de comprometer un PMS completo. No presupone que SuperHote, Cloudbeds o Mews permitan el modelo comercial de Estancias ni acceso/API bajo condiciones adecuadas. Solicitar propuestas o acuerdos requiere otra acción autorizada; este estudio no nombra un proveedor elegido.

Salida de O0: segmento prioritario, capacidades must-have, fuente de verdad de cada dato, construir/integrar por dominio, costes completos, restricciones de licencia, plan de soporte y estimación de equipo/plazos. Si no existe economía viable o acceso, no pasar a O1. El tamaño de este programa no se estima como un sprint de UI.

### Puertas por dominio

| Fase | Alcance real que habría que entregar | Dependencia y prueba para avanzar |
|---|---|---|
| O1 · Base operativa | Aislamiento entre negocios, autenticación/autorización, datos de propiedades/unidades/tipos, auditoría, observabilidad, copias y recuperación; entorno separado de demos. | O0 aprobado; modelo de amenazas y pruebas de acceso cruzado; restauración ensayada; responsables de servicio y datos. |
| O2 · Inventario y reserva | Disponibilidad autoritativa, reservas/modificaciones/cancelaciones, bloqueos concurrentes/caducidad, planes tarifarios/restricciones, ocupación, importes/monedas y conciliación; importación controlada. | O1; escenarios simultáneos, idempotencia, zona horaria, cancelación y reconciliación; no sobreventa en pruebas controladas ni promesa absoluta de cero fallos. |
| O3a · Distribución | Un proveedor/canal, mapeo propiedad/tipo/tarifa, dirección y campos sincronizados, retrasos, errores, duplicados, eventos fuera de orden y reconciliación. | O2 o fuente de inventario externa validada; contrato, sandbox, permisos mínimos, kill switch y rollback. iCal no cuenta como sincronización completa de precios/reservas. |
| O3b · Pagos y conciliación | Proveedor, cobros/depósitos/cancelaciones/reembolsos, estados asíncronos, webhooks firmados, idempotencia y ledger conciliable. | Fuente de reserva estable; diseño para no manejar tarjetas directamente; revisión de obligaciones y contrato actuales. Pruebas de fallo y recuperación; ninguna activación por el simple hecho de mostrar un checkout. |
| O4 · Equipo y huésped | Tareas reales, mensajes, preferencias/consentimiento, portal protegido por reserva, retención y revisión de accesos; mobile/offline solo según necesidad validada. | O1/O2; permisos y límites de datos por rol; trazabilidad y reintentos. Registro de viajeros, firmas o cerraduras requieren proveedor/revisión específicos. |
| O5 · Ampliación selectiva | Grupos/multipropiedad, informes/exportación/contabilidad, API pública, revenue/forecasting, POS, espacios/servicios, app nativa. | Demanda comercial demostrada y datos suficientes; evaluación independiente por dominio. Forecasting requiere dataset, backtesting, errores y supervisión, no un gráfico ilustrativo. |

No ejecutar O3a/O3b/O4 simultáneamente por apariencia de paridad: el primer piloto debe tener el menor alcance útil y un responsable de incidencias. Las diez evidencias de preparación actuales siguen siendo una base; completarlas habilita una revisión, no una conexión automática.

**Piloto operacional autorizado:** definir propietario del dato, participantes, duración, criterio de éxito, reconciliación diaria, soporte, parada, restauración y aceptación. Usar entornos/datos de prueba antes de un alojamiento real. No declarar paridad operativa de todos los segmentos porque un piloto acotado funcione.

## 7. Secuencia temporal orientativa y límites

- **Inicio:** R0 y preparación de entrevistas; corregir primero la base verificable.
- **Primera ola:** R1/R2, con R6 de contenido de decisión y preparación comercial. El propósito es una propuesta evaluable y una solicitud fiable.
- **Segunda ola:** R3 y R4, revisando cada tarea completa; R6 puede seguir en paralelo con personas distintas.
- **Tercera ola:** R5 solo después del contrato de estancia; evaluar comprensión y evitar expansión de catálogo.
- **Continuo condicionado:** R7 y descubrimiento offline O0. La operación real tiene su propio presupuesto, autorización y calendario posterior.

Con una persona de ingeniería, las estimaciones R0–R6 suman **30–52 jornadas**, antes de esperas y validación humana. Es un horizonte de planificación de varias semanas/meses, no una promesa de tener un PMS equivalente en ese tiempo. Reducir alcance por incremento si las sesiones de usuarios muestran otra prioridad.

## 8. Puerta de cierre, métricas y revisión del consejo

Para cada incremento: encuadre y revisión de todos los perfiles; código/contenido/contratos coherentes; `pnpm check`; E2E relevantes y QA visual cuando cambie UI; teclado, foco, reflow, estados de error y límites de demo; checkpoint con fecha, resultado, deuda y SHA. No cerrar producto con un problema de veracidad, seguridad, privacidad, accesibilidad crítica o pérdida de datos. Los cambios de copy no autorizan alterar sandbox/CSP ni generar comunicaciones.

Una ficha de avance debe incluir: ID, tarea del usuario, plan, ruta, escenario normal, excepción, nivel comercial/demo/operativo, evidencia, pruebas, revisión, responsable y bloqueo. «Pendiente externo» no se convierte en «completado». Una funcionalidad existente no vuelve a sumar avance al reorganizar su presentación.

### Revisión inicial de la investigación · 14/09 · histórica

Los estados siguientes registran la investigación inicial. Los cierres R0–R2, la evidencia local de R3 y el cierre local verificado de R4 documentados en sus informes posteriores prevalecen sobre estos bloqueos históricos.

| Perfil | Revisión previa del roadmap | Resultado de la revisión documental |
|---|---|---|
| Marketing | Buscar resultado comercial y objeción concreta. | **correcto**: CTA, cualificación, coste y validación; cifras de terceros no adoptadas. |
| Producto | Separar planos de madurez y no repetir módulos. | **corregido**: inventario existente y tareas nuevas contrastados con código. |
| UX | Continuidad de caso y errores, móvil por responsabilidad. | **correcto**: R2–R5 definen normal, excepción y recuperación; investigación humana pendiente. |
| UI | Evidencia legible e identidad propia. | **correcto**: patrones públicos adaptados; pantallas nuevas requieren QA en su incremento. |
| SEO | Reutilizar arquitectura y cubrir intención. | **corregido**: R0 contempla `/temas/`/`/webs/`; R6 evita duplicados y claims de tráfico. |
| Frontend | Contrato común y aislamiento. | **correcto**: R3 antes de R4/R5; no dependencias nuevas por defecto. |
| Full stack | Inventario/dinero/datos requieren servicio real. | **correcto**: O0–O5 condicionados; captación comercial no se confunde con PMS. |
| QA/accesibilidad/rendimiento/confianza | Evidencia que coincida con promesa. | **corregido**: 14/16 E2E local y límites de acceso registrados; R0 bloquea cierre de producto. |

La revisión documental queda completada; quedan pendientes implementación, investigación humana y todas las validaciones operativas. Los fallos previos impiden declarar el producto listo, no impiden entregar un roadmap que los identifica y prioriza.

## 9. Siguiente incremento exacto

**R5: motor y portal de huésped simulados sobre una estancia ficticia coherente.** R0, R1 y R2 están cerrados y publicados. R3 y R4 están completados y verificados; ambos permanecen sin despliegue. El resultado de R4 se registra en el [informe QA](../docs/qa/HOSPITALITY_R4_2026-10-04.md) y el [checkpoint](./PROJECT_CONTINUATION.md). Se conserva la [evidencia de R3](../docs/qa/HOSPITALITY_R3_2026-10-04.md). El [Quality previo 35365607591](https://github.com/amariner/logic2b-estancia/actions/runs/35365607591) terminó con `success`; es evidencia histórica y no sustituye la validación actual de R4.

Definir primero el contenedor local de caso que mantenga la misma memoria entre web, portal y gestor dentro del mismo documento aislado. Reutilizar el contrato R3 para búsqueda de disponibilidad de muestra, selección de unidad y tarifa, condiciones y desglose, y confirmación ficticia. Vincular a esa estancia un portal con resumen, instrucciones, preparación y extras de ejemplo; aplicar inicialmente a Terrava/Gestión y reutilizar el contexto de preparación de R4 cuando corresponda a Aurem. No implementar un segundo inventario ni duplicar identificadores, fechas, unidades o importes.

La navegación interna conserva el contexto; los enlaces profundos abren el fixture inicial y recargar restaura el escenario. Probar web → gestor → vuelta → recarga, alternativas, cancelación y ausencia de disponibilidad. No utilizar persistencia, PII en URL, comunicación del shell comercial con el iframe, ampliación de CSP o privilegios del sandbox para compartir el caso. No solicitar tarjeta, documento, firma, correo real ni códigos físicos; ningún formulario simulado contacta endpoints. Nivora permanece sin motor de reservas ni dashboard. Ver los criterios detallados de R5; este incremento está pendiente, no implementado.

No repetir los núcleos R3/R4, hero, temas, recorrido o formulario comercial. Las sesiones humanas de comprensión, pruebas con dispositivo físico y lector de pantalla, entrevistas, propuestas y validación operativa siguen pendientes hasta ejecutarse. La implementación local no acredita reservas reales, cobros, operaciones de equipo ni conversión comercial.
