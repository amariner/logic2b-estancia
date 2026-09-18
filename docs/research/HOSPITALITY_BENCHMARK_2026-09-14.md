# SuperHote, Cloudbeds y Mews → estrategia de paridad de Logic2B Estancias

Fecha de consulta y revisión: **14 de septiembre de 2026**. Base local: `b84f4c071958f4d4f79618724fb3b4194d830456`, rama `main`, con cambios anteriores sin commit. Este informe contrasta fuentes públicas con el árbol de trabajo; no certifica la versión desplegada de Estancias.

**Decisión recomendada:** tomar de SuperHote la claridad sobre el trabajo cotidiano; de Cloudbeds, la organización comercial por problema, tipo de alojamiento y responsabilidad; de Mews, la demostración de producto y la continuidad entre operaciones y experiencia del huésped. Conservar la identidad editorial, la demo abierta y el alcance transparente de Estancias. La paridad de un PMS real requiere una línea de producto y validación separada.

El [nuevo roadmap ejecutable](../../plans/HOSPITALITY_PARITY_ROADMAP.md) sustituye a Camp como cola estratégica. Camp permanece como antecedente de estructura y trabajo ya realizado.

## 1. Lectura y alcance de la investigación

| Documento | Contenido |
|---|---|
| [SuperHote](./SUPERHOTE_2026-09-14.md) | Captación, registro, presupuesto, onboarding, ayuda, procesos, móvil por rol, tiendas, límites de integraciones y ocho patrones aplicables. |
| [Cloudbeds](./CLOUDBEDS_2026-09-14.md) | Arquitectura comercial, cualificación de demo, packaging, módulos, adquisición, implementación, aplicaciones y evidencia pública. |
| [Mews](./MEWS_2026-09-14.md) | Presentación del sistema, producto, planes, demo, guest journey, apps, ecosistema y condiciones de implantación. |
| Este informe | Síntesis comparada, brechas contra código, arquitectura propuesta, prioridades y método para medir valor. |
| [Roadmap](../../plans/HOSPITALITY_PARITY_ROADMAP.md) | Incrementos, dependencias, responsables por perfil, esfuerzo orientativo, pruebas y puertas para operación real. |

Se consultaron páginas comerciales, documentación oficial, fichas de tiendas publicadas por los proveedores y material visual público. La herramienta de búsqueda no estuvo disponible; la lectura se resolvió mediante HTTP público y navegador. Se inspeccionaron visualmente las tres portadas de escritorio, SuperHote precios/registro/apertura de vídeo, Cloudbeds portada/ficha PMS/primeros dos pasos del formulario y Mews precios/formulario/hero móvil de 390 px. Las capturas observadas en la sesión no se incorporan como assets del producto. Los anexos precisan qué pantallas móviles adicionales pudieron verse en material oficial.

No hubo cuentas creadas, leads enviados, consultas a CRM, reservas, pagos ni interacción con datos de huéspedes. No se recorrió una app autenticada, no se vio íntegro el vídeo largo de SuperHote y no se auditó exhaustivamente accesibilidad, rendimiento o funcionamiento offline de los competidores. Las páginas pueden variar por idioma, país, consentimiento, campaña y versión. Las observaciones de escritorio no acreditan calidad móvil universal.

**Cómo leer las conclusiones:** presencia de un elemento = observación; capacidad o cifra publicada = declaración del proveedor; posible efecto sobre compra = hipótesis nuestra; resultado operativo o conversión sin acceso a datos = no verificado. No hay una tasa de conversión ni una cuota de mercado deducible de esta revisión. La valoración estratégica de las secciones siguientes es propuesta propia.

## 2. Qué vende realmente cada uno

| Referente | Enfoque observado | Mecanismo comercial que conviene estudiar | Adaptación a Estancias |
|---|---|---|---|
| SuperHote | Gestión de alquiler de corta duración, automatización y reducción del trabajo del anfitrión. | Jornada reconocible, módulos ilustrados, prueba de producto, acompañamiento y presupuesto. | Narrar problemas concretos: atender una solicitud, comparar una alternativa, preparar una llegada. Cada promesa debe abrir una prueba local. |
| Cloudbeds | Plataforma de hospitalidad orientada a crecimiento, rentabilidad y datos compartidos. | Entradas por operación, distribución, experiencia del huésped y marketing; por negocio y por rol; casos y recursos enlazados. | Reordenar los activos existentes por intención de compra y responsabilidad; demostrar qué decisión permite tomar cada vista. |
| Mews | Sistema que reúne operaciones hoteleras, ingresos, pagos y punto de venta. | Interfaz de producto grande, cuatro familias claras, soluciones por negocio, prueba de clientes y demo consultiva. | Dar más protagonismo al gestor y a un recorrido verificable; separar la complejidad por tarea y progresión. |

Fuentes primarias de posicionamiento: [SuperHote](https://www.superhote.com/), [Cloudbeds](https://www.cloudbeds.com/), [Mews](https://www.mews.com/en). La eficacia comercial de esos patrones es una inferencia, no un resultado medido.

SuperHote es la referencia más cercana para la carga diaria de gestores de alquiler turístico. Cloudbeds y Mews aportan una ambición de sistema hotelero más amplia. **Nuestra hipótesis de entrada** debe seguir siendo alojamientos independientes, con los tres segmentos actuales y cualificación por capacidades. Las entrevistas decidirán dónde concentrar adquisición; este estudio no demuestra que los tres segmentos tengan igual demanda o coste de servicio.

La diferenciación propuesta es **web de marca + recorrido de gestión comprensible + implantación acompañada y acotada**. Pretender cubrir ya la operación de una cadena, todos los canales o la contabilidad hotelera diluiría esa propuesta. Tampoco basta con un catálogo de webs si el comprador viene buscando resolver recepción, disponibilidad o preparación.

## 3. Cómo construyen el camino al lead

| Etapa | SuperHote | Cloudbeds | Mews | Decisión propuesta |
|---|---|---|---|---|
| Descubrimiento | Problema cotidiano y automatización. | Rentabilidad, tipo de negocio, rol y recursos. | Sistema hotelero, módulos y segmentos. | Mensaje que declare destinatario, necesidad y alcance; una entrada contextual por vertical. |
| Exploración | Vídeo público y módulos en la home. | Páginas profundas, muestras visuales y casos. | Muestras del software y navegación de producto. | Recorrido abierto sin PII, con resultado concreto y salida al contexto comercial. |
| Intención | Probar o pedir presupuesto. | Demo personalizada. | Demo o precio adaptado. | CTA primario con entrega entendible; secundario para comprobar la demo. |
| Cualificación | Primer paso de cinco con cuatro campos personales. | Overlay progresivo: negocio, propiedad y contacto; primeros dos pasos comprobados en navegador. | Formulario de contacto y propiedad con campos condicionados. | Reutilizar el diagnóstico y un único formulario; revisar carga inicial sin perder calidad de la solicitud. |
| Reaseguro | Prueba, soporte y preparación del onboarding. | Casos, migración, formación y acompañamiento. | Casos, producto, ecosistema y paquetes de implementación. | Explicar qué recibe el interesado y qué información hace falta para proponer el proyecto. |
| Después de enviar | No observado. | No observado. | No observado. | Mantener recibo/referencia actuales; diferenciar reunión solicitada, celebrada y propuesta. |

Fuentes de las entradas comerciales: [registro SuperHote](https://www.superhote.com/rejoindre), [demo Cloudbeds](https://www.cloudbeds.com/request-a-demo/), [demo Mews](https://www.mews.com/en/demo). No se verificaron sus emails, SLA de respuesta, automatizaciones de seguimiento ni cierres de venta.

**Aprendizaje central:** las webs venden una siguiente acción entendible, no únicamente una colección de prestaciones. En Estancias ya existen diagnóstico, recorrido, recibo e idempotencia. El cambio es hacer más concreta la promesa de cada entrada y reducir repeticiones, conservando esas piezas.

El formulario local actual muestra **diez campos de contexto/contacto más dos consentimientos**, sin contar el honeypot: nombre, empresa, email, teléfono, tipo, plan, plazo, propiedades, unidades y mensaje. Algunos tienen valor inicial o son opcionales. No se puede concluir que sean demasiados sin observación de usuarios, pero es una hipótesis de fricción tangible. El teléfono ya es opcional: conservarlo así salvo necesidad validada. [Implementación del formulario](../../apps/site/src/components/Landing.astro).

Propuesta de diseño: contacto esencial primero; intención y escala recuperadas del diagnóstico cuando existan; contexto adicional bajo una expansión clara, sin pedirlo otra vez. No enviar datos parciales al avanzar ni inventar valores para campos ausentes. Si se cambia qué datos son obligatorios, cambiar también esquema y contrato de entrega con sus pruebas. Las pruebas del competidor no autorizan añadir marketing obligatorio, chat con rastreo ni un segundo formulario.

## 4. Estructura, diseño y contenidos que adaptaría

### Composición comercial

Las observaciones de escritorio muestran tres direcciones diferentes: SuperHote usa énfasis naranja y titulares grandes centrados; Cloudbeds combina fotografía de hotelería, composición editorial y acentos claros; Mews contrapone tipografía contundente, bloques oscuros, CTA rosa y muestras grandes del software. En móvil, el hero de Mews apila promesa y muestra conservando el CTA. Estas son lecturas visuales puntuales de las [portadas enlazadas](#2-qué-vende-realmente-cada-uno), no una especificación para copiar.

Para Estancias proponemos un sistema propio: tono cálido actual, espacios más ordenados por importancia, una acción dominante por bloque y evidencia del gestor legible. Los microtextos de estado deben ser visibles en pantalla y comprensibles sin color. El titular móvil no debe desplazar la prueba útil demasiado abajo; cualquier movimiento necesita pausa y alternativa reducida. El menú no necesita crecer al tamaño del catálogo de un proveedor internacional.

En la sesión de Cloudbeds coincidieron banner promocional, modal de cookies y asistente comercial lateral. La observación sirve como caso de carga visual a evitar, no como defecto universal ni evaluación jurídica. Estancias debe probar que contacto, consentimiento y previews no compiten por el foco o tapan el CTA.

### Arquitectura propuesta, reutilizando lo construido

| Superficie | Trabajo concreto |
|---|---|
| Home | Aclarar promesa, destinatario y próxima acción; adelantar una muestra del gestor junto a la web. Mantener las once familias actuales durante la primera iteración y cambiar su peso, sin volver a contarlas como avance. |
| `/recorrido/` | Convertir los cinco pasos actuales en un resultado por intención: entender presencia web, seguir una solicitud o preparar una llegada. La web básica no desemboca ficticiamente en un panel de Básico. |
| `/paneles/` y fichas | Añadir a cada ficha problema, responsable, entrada, resultado, excepción, límite y prueba exacta. Priorizar profundidad de las seis fichas existentes. |
| `/webs/` y `/temas/` | Resolver el papel de ficha comercial y vista de tema; conservar enlaces e indexación coherentes. Mantener doce direcciones, sin expansión estética por defecto. |
| `/planes/` | Relacionar capacidad, ejemplo, coste orientativo, implantación y exclusiones; conservar Básico/Gestión/Inteligente. |
| Soluciones existentes | Abrir cada vertical con un problema distinto y una evidencia relevante. Reutilizar componentes, evitar páginas con solo cambio de sustantivo. |
| `/docs/` | Conservar las cinco guías; reforzar preparación de implantación, migración y soporte con responsables y entregables. |
| `/recursos/` | Profundizar las dos guías y cubrir decisiones faltantes de compra, con ejemplos originales y enlaces al producto. |

### Contenido que ayuda a decidir

Prioridad editorial propuesta: (1) solicitud frente a reserva confirmada; (2) PMS, channel manager y motor de reservas: qué resuelve cada uno; (3) qué preparar para una migración; (4) costes completos de web, gestión y conexiones; (5) cómo revisar una llegada en riesgo. Cada pieza debe terminar en una evidencia y un siguiente paso, con autor/revisión/fecha. Los títulos son propuestas editoriales: no se han medido volumen de búsqueda, dificultad ni posiciones.

Cloudbeds hace visible una biblioteca organizada de [recursos](https://www.cloudbeds.com/resource-center/) y roles; SuperHote trabaja intención de sustitución en sus [comparaciones](https://www.superhote.com/comparaison/superhote-vs-beds24); Mews reúne [comparativas](https://www.mews.com/en/compare). La adaptación inicial será explicar criterios de elección. Publicar «Estancias vs X» exige comparación mantenida y veraz que deje patente nuestra condición demostrativa; no tiene prioridad sobre explicar el producto propio.

Un caso comercial futuro necesita permiso, situación inicial, alcance implantado, periodo, muestra, métrica y límites de atribución. Hasta entonces, presentar escenarios ficticios y proceso de trabajo propio. No sustituir logos de clientes por marcas de software para simular prueba social.

## 5. Las apps: la paridad se mide por tarea

Hay que separar **web comercial**, **aplicación de personal**, **motor de reservas del huésped**, **portal de estancia** y **ecosistema de integraciones**. Son superficies con usuarios, permisos y errores distintos. Una app descargable no demuestra que todas las funciones del PMS estén disponibles en ella.

| Referente | Evidencia pública de uso/app | Lo que se traslada al diseño de Estancias |
|---|---|---|
| SuperHote | Documentación móvil diferenciada para gestor, propietario y limpieza; calendario, estancia y tareas con contexto. | Inicio y acciones por responsabilidad. Una incidencia debe enlazar a la estancia y a quién puede resolverla. |
| Cloudbeds | Ficha y capturas de la app con actividad del día, búsqueda, housekeeping y notas. Hay otros productos/app separados. | Priorizar llegadas, salidas y excepciones en móvil; no comprimir todo el escritorio. |
| Mews | Operations y Digital Key son aplicaciones distintas; el portal del huésped tiene una vía web. | Separar necesidades del empleado y del viajero. Una llave digital o un kiosco no justifican construir una app nativa general antes de validar uso. |

Evidencia: [guía móvil SuperHote](https://support.superhote.com/fr/article/prise-en-main-de-lapplication-mobile-superhote-v2-16l3h72/), [Cloudbeds en App Store](https://apps.apple.com/us/app/cloudbeds/id1671866717), [Mews Operations](https://apps.apple.com/us/app/mews-operations/id982575297), [Mews Digital Key](https://apps.apple.com/us/app/mews-digital-key/id6478589485). Los anexos documentan fechas, capturas y limitaciones; no hubo uso autenticado ni ensayo de rendimiento.

**Modelo de interacción propuesto:** empezar por «Hoy» y excepciones; calendario con búsqueda y filtros; ficha de estancia estable que agrupe huésped, importes, preparación e historial; acciones con vista previa, resultado y reversión local; vistas reducidas por rol. Todo el escenario debe compartir identificadores y cálculos. Arrastrar una reserva puede ser una mejora posterior, siempre con alternativa de teclado; no es el primer criterio de paridad.

### Brechas contrastadas con el repositorio

| Capacidad | Evidencia local actual | Brecha que merece trabajo |
|---|---|---|
| Presencia y evaluación comercial | Doce direcciones, seis fichas de panel, cinco guías, tres planes, diagnóstico y recorrido. | Claridad, prueba de tarea y decisión; no aumentar el contador de páginas. |
| Solicitudes/planning/huéspedes | Vistas de Terrava con fixtures y alternativas preparadas. | Un recorrido local completo con cambios coherentes y excepciones; no inferir edición por la presencia de tipos antiguos en `state.ts`. |
| Web supervisada/IA/reglas | Borrador web, copiloto editable/revisable y reglas inspeccionables locales ya existen. | Conservarlos; conectar contexto solo donde falte. No rehacer un editor o un copiloto como nueva fase. |
| Preparación y mantenimiento | Vistas Aurem con estados y cronología ilustrativos. | Flujo móvil de tarea → revisión → incidencia → resultado con cambios locales y reinicio. |
| Ingresos | Métricas ficticias y fórmulas explicables. | Relacionar el dato con su origen/estancia; la previsión real sigue pendiente. |
| Experiencia del huésped | Webs de alojamiento y simulaciones actuales. | Portal local coherente con una estancia y disponibilidad/reserva simuladas en Gestión, sujeto a contrato actualizado. |
| Integraciones | Contratos de preparación; cero validaciones operativas. | Visibilidad pública del límite y decisión construir/integrar; no otro mural de logos. |
| Operación de producción | Única excepción comercial de email; demos aisladas. | Separación de clientes, inventario autoritativo, auditoría, recuperación, conectores y operación: no acreditados como PMS real. |

Fuentes locales: [capacidades](../../packages/domain/src/index.ts), [dashboard](../../apps/dashboard/src/DashboardDemo.tsx), [estado](../../apps/dashboard/src/state.ts), [recorrido](../../apps/site/src/commercial-tour.ts), [recursos](../../apps/site/src/resources.ts), [precios](../../apps/site/src/pricing.ts).

## 6. Packaging, costes y validación comercial

Las páginas consultadas de los tres referentes conducen a precio personalizado. Cloudbeds muestra familias de paquetes y Mews escalones más complementos; SuperHote concentra la oferta en una propuesta adaptada. No hay base para afirmar que Estancias sea un porcentaje más barata o para construir una tabla de coste comparable sin presupuestos con igual alcance. [SuperHote precios](https://www.superhote.com/pricing), [Cloudbeds precios](https://www.cloudbeds.com/pricing/), [Mews precios](https://www.mews.com/en/pricing).

Mantener los importes solicitados por el usuario y presentar claramente su carácter orientativo. Cálculo propio a partir de `pricing.ts`, **doce mensualidades más implantación**, sin IVA ni extras:

| Plan | Desde/mes | Implantación desde | Base aritmética del primer año |
|---|---:|---:|---:|
| Básico | 49 € | 490 € | 1.078 € |
| Gestión | 149 € | 990 € | 2.778 € |
| Inteligente | 299 € | 1.990 € | 5.578 € |

No son ofertas finales ni equivalencia funcional con un PMS. Aplican a una marca y hasta cinco unidades, con condiciones del proyecto; conexiones, dominios/unidades adicionales, migraciones y soporte ampliado se presupuestan aparte. Las quince entrevistas y cinco propuestas reales siguen pendientes. Hay que contrastar horas de implantación, soporte, licencias/consumo de terceros y margen antes de confirmar viabilidad.

No añadir un ROI supuesto a las tarifas. Una herramienta futura puede calcular escenarios introducidos por el usuario, exponiendo fórmula y supuestos; no asignar automáticamente un aumento de reservas o ahorro de horas por contratar Estancias.

## 7. Dos embudos y evidencia medible

**Embudo B2B de Estancias:** visita → contacto directo **o** exploración de evidencia/diagnóstico → solicitud entregada → reunión celebrada → propuesta → contratación. Evidencia y diagnóstico son rutas opcionales: una solicitud directa válida no es abandono del diagnóstico. Un clic de agenda no equivale a reunión; un tour completado no equivale a lead; un HTTP aceptado no prueba una venta. Se conserva el contrato analítico y los informes existentes. La agenda y los resultados comerciales requieren registro humano autorizado, no CRM nuevo.

La medición analítica solo representa el tráfico con consentimiento y runtime habilitado. Los cocientes del informe actual comparan recuentos agregados de eventos; no demuestran que las mismas personas hayan pasado por cada etapa ni atribución individual. Definir para cada indicador denominador, periodo, cobertura y rama directa/guiada. El volumen total de solicitudes y su registro comercial no se confunden con la muestra analítica consentida.

**Embudo B2C del alojamiento:** búsqueda → disponibilidad → habitación/tarifa → resumen → confirmación → preparación → estancia → repetición. Hoy solo puede ensayarse con datos ficticios en las demos. Sus resultados no se agregan como reservas, ingresos o conversión real.

| Pregunta | Medición propuesta | Precaución |
|---|---|---|
| ¿Se entiende para quién y para qué sirve? | Sesiones de comprensión con tareas y respuestas registradas. | Muestra cualitativa; no extrapolar porcentajes al mercado. |
| ¿La evidencia ayuda a avanzar? | Eventos consentidos de vista/handoff/recorrido y observación de tareas. | Sin seguimiento de demos ni PII; revisar contrato antes de añadir eventos. |
| ¿El formulario pierde interesados? | Inicio, errores por categoría cerrada y entrega; agregado por periodo y entrada directa/guiada. | Fijar denominador y cobertura; el cociente de eventos no es conversión por persona. No registrar texto, email, teléfono ni identificadores personales. |
| ¿Se atrae demanda adecuada? | Solicitudes cualificadas, reuniones realizadas y propuestas por cohorte. | Definición de cualificación y registro humano previo; no unir PII con GA4. |
| ¿Compensa el servicio? | Coste de implantación y soporte frente al ingreso y coste del proveedor. | Datos reales pendientes; el precio de portada no acredita margen. |

Primero línea base, después un experimento principal. Fijar antes hipótesis, métrica, duración mínima, tamaño de muestra según volumen real y reglas de parada. No declarar ganador por diez clics ni por un cambio de color. Si hay poco tráfico, priorizar pruebas de comprensión y entrevistas. GTM, activación analítica y producción conservan sus puertas existentes.

## 8. Resultado de la revisión local y límites del cierre

`pnpm check` pasó el 14/09/2026: siete tareas de lint y veintiuna de typecheck/test/build resueltas desde caché Turbo, más 33 pruebas de scripts ejecutadas. No equivale a una reconstrucción forzada de cada paquete.

E2E focal `camp-parity.spec.ts` + `demo-mode.spec.ts`: **14/16 correctas**. Los dos fallos reflejan discrepancias del árbol anterior a este informe: falta `[data-technical-details]` en la home y los enlaces de fichas pasan a `/temas/` frente al contrato de `/webs/` de la prueba. Se confirmó en código; no se cambiaron aserciones para obtener un verde. Los nueve casos de `demo-mode` pasaron. Logs: `/tmp/estancia-research-check-2026-09-14.log` y `/tmp/estancia-research-e2e-2026-09-14.log`.

Además, `CapabilityBand.astro` ya no incluye la nota visible ni la puerta de preparación descritas por el checkpoint anterior. Las marcas conservan un `aria-label` de plataformas a evaluar y lenguaje condicional, pero eso no sustituye un límite visible para todo visitante. **Prioridad R0:** reconciliar esa presentación, los destinos comerciales y las pruebas, antes de cerrar un incremento de producto o publicarlo. No se certifica el árbol actual como listo para despliegue.

Esta sesión entrega investigación y planificación. No cambia el producto, no hace commit/push de los cambios anteriores y no despliega. La revisión documental y el roadmap pueden completarse dejando identificada esta puerta pendiente del producto.

### Consejo multidisciplinar

Revisión previa: marketing pidió una propuesta y una conversión concretas; producto, separar comercial/demo/operación; UX, comprobar el camino posterior al CTA; UI, observar pantallas y preservar identidad; SEO, analizar intención sin inventar tráfico; frontend, contrastar contratos y trabajo ya hecho; full stack, mantener las demos aisladas; QA y confianza, distinguir evidencia, inferencia y promesa.

| Perfil | Cierre del documento | Resultado |
|---|---|---|
| Marketing | correcto | Posicionamiento y métricas formulados como hipótesis; no atribuye resultados de terceros. |
| Producto | corregido | Sustituye recuento de pantallas por tareas y niveles de madurez; conserva activos implementados. |
| UX | correcto | Embudos separados, fricción y contexto, estados de recuperación y móvil por rol. |
| UI | correcto | Dirección propuesta apoyada en inspección pública acotada; QA completo del futuro incremento pendiente. |
| SEO | correcto | Reutilización de rutas y plan editorial; demanda y comparación nominal pendientes de validación. |
| Frontend | corregido | Registra discrepancias entre checkpoint, componentes y E2E; R0 bloquea cierre de producto. |
| Full stack | correcto | Define dependencias operativas, minimización y construir/integrar sin activar servicios. |
| QA/accesibilidad/rendimiento/confianza | corregido | Evidencia de pruebas consignada sin ocultar dos fallos; acceso autenticado, controles humanos y medición real pendientes. |

No se adopta una cifra de «paridad total». Cada dominio del roadmap deberá demostrar por separado claridad comercial, tarea local y operación real cuando llegue a autorizarse.
