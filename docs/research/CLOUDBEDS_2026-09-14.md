# Cloudbeds: investigación comercial, de producto y de conversión

Fecha de consulta: **2026-09-14**. Investigación para el roadmap de Logic2B Estancias; no acredita paridad operativa ni autoriza integraciones, datos reales o despliegues.

## Método y fuerza de la evidencia

- **Observado (HTML):** contenido, jerarquía, enlaces, campos y metadatos descargados de páginas oficiales públicas. Se leyeron 26 páginas comerciales ES/EN, además de fichas oficiales de aplicaciones y assets del proveedor. La herramienta de búsqueda web falló por conexión; la lectura pública HTTPS directa sí funcionó.
- **Observado (navegador):** el agente coordinador inspeccionó la portada y los dos primeros pasos de la solicitud de demo. Las observaciones se identifican expresamente y describen esa sesión, no todos los dispositivos o visitantes.
- **Observado (imagen):** se examinaron cuatro capturas de App Store y varios montajes comerciales de producto. Una captura publicada por el proveedor no equivale a ejecutar la aplicación.
- **Afirmación del proveedor:** funciones, resultados, seguridad, rendimiento y disponibilidad anunciados. No se comprobaron con cuenta, reservas o transacciones.
- **Inferencia:** interpretación comercial o recomendación para Estancias. No hay datos de conversión, CAC, leads cualificados, ventas o experimentos de Cloudbeds.
- **No accesible/no comprobado:** producto autenticado, validación completa del formulario, agenda tras identificación, emails posteriores, contratos, SLA efectivo, costes negociados, funcionalidad offline y paridad real iOS/Android/web. No se enviaron formularios ni se crearon cuentas.

Las fechas de modificación recuperadas en las páginas comerciales revisadas llegan hasta agosto de 2026; las fichas móviles revisadas llegan al 9 de septiembre de 2026. No se identificó una fecha futura en esos metadatos. Las imágenes contienen fechas de ejemplo antiguas: no se usan como fecha de lanzamiento ni prueba de interfaz vigente. Los contenidos dinámicos del centro de recursos no se auditaron artículo por artículo.

## Lectura estratégica

**Inferencia:** Cloudbeds vende la coordinación de toda la actividad hotelera y su efecto en ingresos, no únicamente una agenda de reservas. El comprador encuentra una entrada comercial, una explicación por capacidad y otra por tipo de alojamiento o responsabilidad. La oportunidad de Estancias es adoptar esa claridad de problema → flujo → evidencia → siguiente paso, manteniendo su identidad y sus límites. La amplitud operativa de Cloudbeds no puede presentarse como existente en una demostración local.

**Observado:** la navegación agrupa operaciones, distribución, experiencia del huésped y revenue/marketing; añade precios, historias de clientes, recursos y ayuda. La portada ofrece un CTA para hablar con ventas y otro para explorar el producto. Después reúne resultados atribuidos a clientes, argumento de plataforma, extensibilidad, acompañamiento, recursos y preguntas frecuentes. El cierre describe una demo de 30 minutos adaptada al alojamiento y sin compromiso. **Afirmación del proveedor:** las cifras de mejora publicadas son su evidencia comercial, no resultados auditados aquí. [Portada](https://www.cloudbeds.com/).

**Observado:** la página de plataforma enlaza tareas completas —cambiar tarifas, preparar llegadas, cobrar, segmentar huéspedes— y las conecta con una arquitectura de datos común. **Inferencia:** es un argumento útil porque explica por qué los módulos juntos importan; un catálogo aislado de pantallas no lo consigue. No se verificó la implementación de esa arquitectura. [Plataforma](https://www.cloudbeds.com/hospitality-platform/).

## Cómo conduce la web hacia un lead

| Momento | Evidencia observada y lectura comercial |
| --- | --- |
| Descubrimiento | El centro de recursos distingue artículos, guías, ebooks, plantillas, vídeos, podcast y webinars, con un CTA comercial entre bloques. **Inferencia:** cubre visitantes que aún están aprendiendo y crea caminos de regreso al producto; no conocemos el volumen de tráfico o leads que produce. [Recursos](https://www.cloudbeds.com/resource-center/). |
| Comprensión de la categoría | Las páginas de módulo ordenan beneficio, casos de uso, capacidades, evidencia del proveedor, recurso relacionado, preguntas frecuentes y demo. **Inferencia:** responden tanto a búsqueda informativa como a evaluación de compra. [Channel Manager](https://www.cloudbeds.com/channel-manager/), [motor de reservas](https://www.cloudbeds.com/booking-engine/). |
| Reconocimiento de la necesidad | Hay entradas distintas para hoteles, alquiler vacacional, B&B y responsables de recepción. No cambian únicamente el titular: cambian problemas, tareas y preguntas. [Hoteles](https://www.cloudbeds.com/hotel-management-software/), [alquiler vacacional](https://www.cloudbeds.com/vacation-rentals/), [B&B](https://www.cloudbeds.com/bed-breakfasts/), [recepción](https://www.cloudbeds.com/front-desk-managers/). |
| Evaluación económica | La página pública explica paquetes y extras, pero dirige a presupuesto personalizado. **Inferencia:** ventas retiene el diagnóstico y la cotización; el visitante no puede calcular el coste total solo con esa página. [Precios](https://www.cloudbeds.com/pricing/). |
| Reducción del miedo al cambio | Existe una página dedicada a implantación y otra a acompañamiento posterior; formación y ayuda forman parte del recorrido comercial. [Implantación](https://www.cloudbeds.com/what-to-expect/), [Customer Success](https://www.cloudbeds.com/customer-success/). |
| Captación | La solicitud diferencia alojamiento, partner tecnológico, consultor y otros perfiles antes de solicitar contexto y contacto. **Inferencia:** segmenta la conversación, pero también añade esfuerzo antes de probar el producto. [Solicitud de demo](https://www.cloudbeds.com/request-a-demo/). |

### Formulario y fricción

**Observado en navegador por el coordinador:** el CTA del hero abrió un overlay azul a pantalla completa. Paso 1: tipo de negocio; al elegir hotel y avanzar, paso 2 de 3: nombre del alojamiento, condición/tipo de propiedad, número de habitaciones y país. No se rellenaron datos ni se abrió el paso 3.

**Observado en HTML, sin ejecutar las ramas restantes:** están codificados nombre, rol, email, teléfono e idioma; aparecen variantes para camas, anuncios y direcciones de alquiler vacacional, botones de retroceso/avance, textos de campos incompletos, condiciones/privacidad, consentimiento SMS y selección de horario. Partners y consultores tienen mensajes y salidas propias. **Límite:** que esos campos existan en el documento no demuestra cuáles son obligatorios en cada rama ni cómo funcionan la recuperación, el enrutamiento o la agenda. [Formulario oficial](https://www.cloudbeds.com/request-a-demo/).

**Inferencia:** Estancias debería conservar una vía de exploración sin identificación y otra comercial con expectativas claras. La calificación puede recuperar contexto de capacidad, demo y plan mediante valores cerrados, evitando preguntar de nuevo lo ya seleccionado. El tamaño describe implantación; no debe determinar automáticamente Básico/Gestión/Inteligente.

### Diseño observado y cautelas

**Observación puntual del navegador:** portada crema, composición editorial centrada, collage fotográfico, tipografía sobria, CTA oscuro y secundario con contorno. En la primera visita coincidieron una promoción superior de webinar, un modal de cookies y el panel lateral Claudia AI Sales Assistant; tapaban parte del hero hasta cerrarlos. Es una condición de esa sesión, no un fallo universal. **Inferencia:** adoptar jerarquía y contraste; evitar acumular capas que compitan con la comprensión inicial. [Portada observada](https://www.cloudbeds.com/).

**Observado en imágenes oficiales:** las páginas combinan personas en situaciones hoteleras con recortes grandes de interfaz. La fotografía aporta contexto humano; el recorte concentra la explicación en una tarea. Un ejemplo muestra un forecast, selector temporal, ocupación/ingresos, filtros de propiedades y gráfico. Otro expone tarifa anterior y propuesta. Son montajes promocionales, no capturas de una sesión operativa auditada. [Imagen del forecast](https://www.cloudbeds.com/wp-content/uploads/2025/09/img-product-pms-feature-2.webp), [imagen de recomendaciones](https://www.cloudbeds.com/wp-content/uploads/2025/10/img-product-revint-causal.webp).

## Paquetes, condiciones y objeciones económicas

**Observado en la página de precios:** Flex ofrece núcleo PMS/pagos/marketplace; One añade distribución Cloudbeds; Experience incorpora experiencia del huésped y reputación; Enterprise propone alcance personalizado. Se enumeran add-ons de revenue, CRM, marketing digital, web y reputación. No aparecen importes públicos de suscripción en la página inspeccionada. Se anuncian aplicación móvil, reporting, limpieza, grupos, soporte y formación dentro de las capacidades comunes. La tabla presenta distribución opcional en Experience mientras remite al contenido de One: el presupuesto debe aclarar la composición final. [Precios EN](https://www.cloudbeds.com/pricing/).

**Observado:** la versión española conserva los cuatro nombres y el camino a consulta, diferencia soporte premium y consultores certificados. **Afirmación del proveedor:** no añade comisión propia por reservas realizadas mediante su motor o channel manager; eso no elimina costes de OTA, procesamiento u otros servicios. **Inferencia:** comparar cuota, implantación, extras, soporte, distribución y transacciones por separado; no comparar solamente un precio mensual. [Precios ES](https://www.cloudbeds.com/es/pricing/).

**Afirmación del proveedor:** Payments ofrece estructuras blended y cost-plus y advierte que funciones, precio y disponibilidad cambian por localización. No se verificaron tarifas de una propiedad española. **Inferencia:** nunca trasladar un método de pago, país soportado o coste a Estancias por simple semejanza visual. [Pagos](https://www.cloudbeds.com/payments/).

Para Estancias se mantienen únicamente Básico, Gestión e Inteligente y sus precios orientativos ya autorizados. Esta investigación no valida disposición a pagar ni completa las 15 entrevistas cualificadas y 5 propuestas pendientes. Tampoco convierte el presupuesto consultivo del competidor en argumento para ocultar nuestras condiciones.

## Producto y aplicaciones: qué anuncia y qué puede verse

| Superficie | Evidencia pública y límite |
| --- | --- |
| PMS web | **Proveedor:** calendario, check-in/out, reservas, reporting, grupos, perfiles de huésped, notas, búsqueda, permisos y gestión multipropiedad; también inventario de espacios adicionales. **Inferencia:** la unidad de diseño relevante es la tarea del recepcionista, no el número de tarjetas del dashboard. No se ejecutó el PMS. [PMS](https://www.cloudbeds.com/property-management-system/). |
| Distribución | **Proveedor:** inventario y tarifas centralizados, conexiones con canales globales/locales, actualizaciones y ausencia de comisión adicional propia. No se auditó latencia ni recuperación ante conflictos; no debe traducirse a una garantía absoluta de ausencia de sobreventa en Estancias. [Channel Manager](https://www.cloudbeds.com/channel-manager/). |
| Motor de reservas | **Proveedor:** flujo de dos pasos, diseño móvil, integración en el dominio del alojamiento, enlaces hacia habitaciones/tarifas concretas, promociones, extras, reservas de grupo y seguimiento del embudo. No se completó una reserva ni se midió conversión. **Inferencia:** preservar contexto desde oferta hasta selección evita una búsqueda repetida. [Booking Engine](https://www.cloudbeds.com/booking-engine/). |
| Pagos | **Proveedor:** vista común de pagos, conciliación, gestión de disputas, enlaces de cobro, terminales y reglas de captura; algunas capacidades dependen del país. En Estancias solo procede representar estados ficticios hasta tener proveedor y permisos validados. [Payments](https://www.cloudbeds.com/payments/). |
| Experiencia del huésped | **Proveedor:** bandeja unificada, chatbot, portal por enlace, registro/check-in digital, kiosco, notas/equipo, tickets y tareas. Las imágenes sugieren una tarea principal por pantalla; no se comprobó su uso. El montaje de selfie es material comercial, no verificación biométrica auditada. [Guest Experience](https://www.cloudbeds.com/guest-engagement-software/), [montaje de check-in](https://www.cloudbeds.com/wp-content/uploads/2025/09/img-product-gx-personalize.webp). |
| Revenue | **Proveedor:** forecast, comparativa de tarifas, recomendaciones explicadas y límites de precio; la FAQ permite suelo/techo y matiza que pueden transcurrir unos 30 minutos tras cambios para recibir recomendaciones. No se comprobaron calidad predictiva ni beneficio. **Inferencia:** adoptar explicación y supervisión antes de automatización. [Revenue Intelligence](https://www.cloudbeds.com/revenue-intelligence/). |
| IA | **Proveedor:** Signals se presenta como capa dentro de la plataforma, vinculada a datos de operación y mercado, no como una aplicación independiente. La terminología causal y las promesas de precisión requieren evidencia específica; no justifican atribuir inteligencia operacional al copiloto ficticio de Aurem. [Signals](https://www.cloudbeds.com/ai/). |
| Web del alojamiento | **Proveedor:** plantillas adaptadas por diseñadores, CMS con ayuda de IA, multidioma, SEO, conexión al motor y gestión de consentimiento; accesibilidad mediante AudioEye en ciertas regiones/add-on. No se auditó conformidad ni rendimiento. **Inferencia:** el proceso de aportar marca/contenido y revisar la web también debe venderse con claridad. [Websites](https://www.cloudbeds.com/websites/). |
| Extensibilidad | **Observado:** existe marketplace público y acceso a documentación/API desde la navegación. **Límite:** no se validó ninguna integración, disponibilidad regional o contrato. Los logos son evidencia comercial del competidor, nunca autorización para presentarlos como conexión de Estancias. [Marketplace](https://www.cloudbeds.com/integrations/). |

### Aplicación móvil del equipo

**Observado en App Store:** aplicación Cloudbeds publicada por Digital Arbitrage Distribution Inc, versión 2.64.1 con actualización 2026-09-09. La ficha enumera llegadas/salidas/estancias de hoy y mañana, asignación de habitaciones, check-in/out, búsqueda, ocupación, notas, limpieza y asignación de personal. **Límite:** es la descripción del proveedor; no prueba que replique todo el PMS web. [App Store Cloudbeds](https://apps.apple.com/es/app/cloudbeds/id1671866717).

**Observado en sus cuatro capturas:** navegación inferior de cuatro destinos; inicio con hoy/mañana y tres colas operativas; búsqueda que separa reservas y huéspedes; limpieza con filtros, habitación, responsable y estado; notas con autor/fecha y entrada de texto. **Inferencia:** la móvil prioriza decisiones y trabajo inmediato, en lugar de comprimir todo el panel de escritorio. Algunas pantallas contienen datos de ejemplo de 2022, por lo que no certifican el aspecto actual de la versión publicada. [Capturas de la ficha oficial](https://apps.apple.com/es/app/cloudbeds/id1671866717).

**Observado en Google Play:** la descripción sigue usando la palabra beta; la consulta mostró actualización 2026-09-08, 10K+ descargas y 2,2/5 con 88 reseñas en cabecera. Es una fotografía variable de esa ficha/región, no una medición propia ni una valoración de toda la plataforma. No se usa el contenido de reseñas individuales como hecho comprobado. **Inferencia:** una web comercial convincente no sustituye las pruebas de usabilidad y fiabilidad de las tareas móviles. [Google Play Cloudbeds](https://play.google.com/store/apps/details?id=com.cloudbeds&hl=en).

**Observado:** también hay una aplicación distinta denominada Cloudbeds Point of Sale App en ambas tiendas. Sus fichas no bastan para asegurar qué negocios, dispositivos, países o flujos de cobro cubre. No debe confundirse con la app general ni con un POS restauración completo. [App Store POS](https://apps.apple.com/es/app/cloudbeds-point-of-sale-app/id6464432792), [Google Play POS](https://play.google.com/store/apps/details?id=com.cloudbeds.pos&hl=en).

**No comprobado:** offline, notificaciones push, permisos efectivos, accesibilidad nativa, sincronización entre dispositivos, conflictos, auditoría y experiencia de uso completa. El portal del huésped, el PMS del equipo y la aplicación POS tienen propósitos distintos; el roadmap debe mantener esa separación.

## Cómo reduce objeciones de implantación y continuidad

**Observado:** onboarding se explica por etapas: arranque con coach, configuración, puesta en marcha, adopción y soporte. La formación continúa después de la activación. **Inferencia:** el comprador evalúa quién le acompaña y qué tiene que preparar, además de funciones. Para Estancias, el equivalente útil es concretar entregables, responsables, dependencias, aceptación y reversión del contrato de implantación existente. [Onboarding](https://www.cloudbeds.com/what-to-expect/).

**Afirmación del proveedor:** Customer Success incluye onboarding, ayuda multilingüe, recursos y comunidad; la importación de inventario, huéspedes y reservas se identifica como servicio adicional. La página publica métricas de soporte, pero no se comprobó su periodo, muestra o SLA contractual. **Inferencia:** explicar qué incluye el acompañamiento evita prometer migración ilimitada dentro de una cuota base. [Customer Success](https://www.cloudbeds.com/customer-success/).

**Observado:** Cloudbeds University presenta formación por tareas y roles, cursos bajo demanda y certificaciones. **Inferencia:** el contenido de aprendizaje también reduce el riesgo percibido antes de comprar. Estancias puede enlazar sus cinco guías a una acción concreta de la demo y a criterios de aprendizaje, sin inventar academia, titulaciones o volumen de cursos. [University](https://www.cloudbeds.com/cloudbeds-university/).

**Observado:** las calculadoras públicas se organizan alrededor de ADR, RevPAR, GOPPAR, ingresos totales y ocupación y conducen a Revenue Intelligence. No se auditó cada cálculo o formulario. **Inferencia:** una herramienta útil puede atraer demanda y enseñar vocabulario comercial; en Estancias cualquier simulación deberá mostrar fórmula, hipótesis y ausencia de garantía de ingresos. [Herramientas](https://www.cloudbeds.com/tools/).

## Qué no conviene replicar y qué requiere aclaración

1. **Ambigüedad entre métricas y alcances.** La página de plataforma contiene un heading de disponibilidad 99,95 % y una FAQ de 99,99 %. No hay aquí una medición independiente ni un contrato que resuelva la diferencia. [Plataforma](https://www.cloudbeds.com/hospitality-platform/).
2. **Certificaciones sin precisar el objeto.** Security dice PCI DSS nivel 2; Payments anuncia nivel 1. Podrían corresponder a alcances diferentes. No se declara incumplimiento: se requiere documentación aplicable antes de repetir una certificación como garantía contractual. [Security](https://www.cloudbeds.com/security/), [Payments](https://www.cloudbeds.com/payments/).
3. **Números de ecosistema sin definición uniforme.** Aparecen 300+, 400+ y 450+ en páginas de demo, precios y producto, con etiquetas distintas de canales y partners. No se suman ni se interpretan como el mismo universo. Estancias debe distinguir referencias, conectores candidatos, proveedores validados y conexiones activas. [Demo](https://www.cloudbeds.com/request-a-demo/), [Precios](https://www.cloudbeds.com/pricing/), [PMS](https://www.cloudbeds.com/property-management-system/).
4. **Equivalencia móvil implícita.** Una app disponible no acredita todas las funciones del escritorio ni fiabilidad. Los recorridos táctiles deben probarse por tarea. [App móvil](https://apps.apple.com/es/app/cloudbeds/id1671866717).
5. **Promesas de retorno como decoración.** Las cifras de los casos del competidor no son reutilizables para Estancias. La prueba local debe identificarse como ficticia y los resultados reales solo publicarse con consentimiento y trazabilidad.
6. **Fricción acumulada.** No copiar simultáneamente captación modal, chat, anuncios y consentimiento sin comprobar comprensión, foco y móvil. La observación puntual del navegador identifica un riesgo a evaluar, no causalidad sobre conversiones.

El Help Center no pudo investigarse suficientemente con este método: la búsqueda pública devolvió 403 y el endpoint ensayado 404. La ruta `/mobile-app/` redirigió a un vídeo promocional, no a documentación. Esto no demuestra que no exista documentación o que no esté disponible en otros recorridos. No se formuló ninguna conclusión de producto a partir de ese fallo de acceso.

## Ocho patrones adaptables a Estancias

Prioridades propuestas para integrar en el roadmap general, sujetas al contraste con código/checkpoint. No son órdenes de repetir superficies ya completadas.

| Prioridad | Patrón y adaptación | Resultado verificable / riesgo |
| --- | --- | --- |
| P0 | **Promesa ligada a una tarea.** Conectar beneficio → flujo existente → estado de demo exacto → siguiente paso. Inspiración: plataforma y páginas de módulo. | Medir comprensión y handoff por capacidad con consentimiento. No añadir otra galería si el tour actual ya resuelve el recorrido. Ninguna promesa sin evidencia o límite. |
| P0 | **Dos intenciones de CTA.** Explorar demo ficticia sin identificarse y solicitar conversación comercial con expectativas de contenido y siguiente respuesta. Inspiración: entradas de exploración y demo. | El usuario debe poder completar la exploración sin enviar PII. El contacto único recibe contexto cerrado; no se crean nuevos formularios reales ni agendas/CRM externos. |
| P0 | **Precio y alcance comparables.** Relacionar cada plan con capacidades, implantación, extras y pendientes operativos. Inspiración: paquetes y add-ons. | Mantener 49/149/299 €/mes e implantación orientativa autorizada, IVA/condiciones y validación comercial pendiente. Evitar afirmar ahorro frente a presupuestos que no tenemos. |
| P1 | **Móvil centrada en colas de trabajo.** Priorizar hoy/mañana, llegadas, preparación y notas en las demos que ya tengan esas capacidades. Inspiración: capturas móviles. | QA táctil, teclado, estados, retorno y persistencia local. Primero web adaptable; no comprometer app nativa ni sincronización real. |
| P1 | **Implantación que se puede revisar.** Convertir el contrato ya existente en entregables, responsables, dependencias y aceptación visibles en contexto. Inspiración: onboarding y servicio de importación separado. | Saber qué preparar, qué se entrega y qué requiere proveedor. No prometer migración, soporte 24/7 ni SLA sin recursos y contrato. |
| P1 | **Contenido por objeción y rol.** Enlazar las guías existentes al módulo y escenario que responde a cada preocupación; considerar una calculadora solo con necesidad validada. Inspiración: soluciones por rol y herramientas. | Un recurso debe permitir una decisión concreta y salida útil. Evitar páginas SEO duplicadas, métricas inventadas y lead magnets que no aporten valor. |
| P2 | **Recomendación con motivo y control.** En Aurem, explicar dato ficticio de origen, hipótesis, cambio propuesto, límite, revisión humana y descarte. Inspiración: recomendaciones y suelos/techos. | Acción exclusivamente local y reversible, sin publicación de tarifas ni comunicación. No afirmar precisión predictiva, causalidad o mejora económica. |
| P2 | **Contrato único de evidencia y madurez.** Mostrar con coherencia qué se observa en demo, qué se propone y qué está validado. Inspiración crítica: diferencias entre páginas del competidor. | Fuentes centralizadas para capacidades, planes, métricas y proveedores. Cero logos interpretables como integración activa sin validación. Cada futuro salto operativo conserva autorización y pruebas propias. |

No se propone copiar identidad, fotografías, textos, métricas, nombres de paquetes, testimonios o capturas del competidor. Las imágenes enlazadas sirven para investigar patrones; no son assets para la web de Estancias.

## Revisión multidisciplinar de este informe

### Encuadre previo

- Marketing: entender quién compra, qué objeciones se resuelven y cómo se enlaza contenido con conversación comercial.
- Producto: separar plataforma operativa, demo y apps por rol; identificar capacidad y dependencia antes de proponer paridad.
- UX: revisar exploración, formulario, contexto, móvil y recuperación sin enviar leads.
- UI: observar composición real y capturas públicas; diferenciar montaje promocional de interfaz usada.
- SEO: reconocer arquitectura por intención, módulos, roles, recursos y localización.
- Frontend: extraer patrones reutilizables y fuentes de verdad; evitar duplicación de superficies existentes.
- Full stack: no ejecutar formularios, pagos, sincronizaciones o cuentas; explicitar límites operativos.
- QA/accesibilidad/rendimiento/confianza: distinguir evidencia del proveedor, observación e inferencia; no declarar auditorías que no se realizaron.

### Revisión posterior

- Marketing estratégico: **correcto** — patrones y límites de conversión documentados sin atribuir tasas o causalidad.
- Diseño de producto: **correcto** — app de equipo, huésped, POS y escritorio separados; paridad operativa no presumida.
- UX: **correcto** — dos primeros pasos observados; el resto identificado como HTML sin probar; fricción descrita como puntual.
- UI/dirección visual: **correcto** — fuentes visuales inspeccionadas y antigüedad de capturas advertida; no se presenta QA universal.
- SEO: **correcto** — arquitectura de contenido y rutas oficiales identificadas; no se deducen tráfico o rankings.
- Arquitectura frontend: **correcto** — recomendaciones preservan contratos únicos y revisión de lo ya implementado.
- Full stack: **correcto** — no hubo operaciones externas, cuentas, envío de leads ni promesas de integración.
- QA/accesibilidad/rendimiento/confianza: **correcto en el alcance de investigación** — diferencias públicas registradas sin convertirlas en acusaciones; accesibilidad, rendimiento, datos y aplicaciones reales siguen sin auditar. No procede afirmar que Cloudbeds pasa WCAG o una puntuación Lighthouse.

Verificación del entregable: revisión de enlaces y coherencia documental. No se modificó el producto ni se ejecutaron pruebas funcionales del repositorio por este informe aislado; el coordinador integra las verificaciones del incremento completo.
