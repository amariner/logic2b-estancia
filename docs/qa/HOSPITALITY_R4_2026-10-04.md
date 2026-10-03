# R4 · Preparación y roles de Aurem · 4 de octubre de 2026

## Alcance y base

Continúa el mismo objetivo de pulir el gestor con fixtures, sobre `3e36183929a4a96a6a51925baae855a9981de818`, rama de entorno `work` inicialmente limpia y coincidente con `origin/main`. R3 se conserva. Este incremento no despliega producción ni activa una operación real.

SHA de producto: `13c2de9b515272302f623db7d8d96cd42e1631c7`. Se acreditan 76 casos E2E únicos entre pasadas, con los fallos detectados corregidos y repetidos. La evidencia local no acredita por sí sola un resultado verde de GitHub ni un despliegue de producción.

Aurem conecta tres llegadas ficticias del 14 de agosto de 2026: Elena Rossi/408/AUR-812, Hugo Vidal/312/AUR-813 y Eva Luna/205/AUR-814. Se reutilizan los tipos de estancia, noches e importes de R3. Las salidas anteriores están vinculadas por identificador; la 205 parte preparada como caso de comparación. El informe matemático de 96 habitaciones y 28 días conserva su dataset independiente y lo explica en pantalla.

## Comportamiento entregado

- Recepción o Dirección confirma la salida anterior. Dirección asigna o reasigna a Marta o Leo, identidades de muestra. Reasignar reinicia aceptación y checklist y mantiene la incidencia.
- La persona asignada, con el rol Limpieza, acepta o rechaza con un motivo preparado. Solo ella completa las tres comprobaciones y solicita revisión. Recepción o Dirección valida o devuelve una comprobación concreta; ejecutar y revisar son pasos distintos.
- Una incidencia preparada de baño en la 408 puede declararse durante preparación, revisión o después de validar. Bloquea la habitación e invalida la comprobación del baño y su revisión. Dirección resuelve la incidencia; Limpieza vuelve a comprobar y solicitar revisión. Resolver no equivale a preparar.
- Inicio, centro operativo, limpieza, mantenimiento, planning, reservas y huéspedes consultan la misma colección. Los avisos y la búsqueda abren la tarea exacta. La preparación determina el contexto de la llegada, con motivo y siguiente responsable.
- Historial de la visita, deshacer LIFO y reinicio. Deshacer exige el mismo actor/rol del último cambio o Dirección; rechaza un historial obsoleto. Reiniciar restaura tareas, incidencias e historial de preparación; no elimina el borrador manual del copiloto.
- El copiloto deriva su fuente de preparación y no promete una habitación lista cuando sigue pendiente. Un cambio operativo invalida su revisión local conservando el texto editado. El envío sigue deshabilitado y no existe llamada a un modelo.
- Roles visibles en móvil, selector de persona ficticia, tareas propias/otras tareas, estados con texto, controles táctiles, foco y recuperación. Cambiar de viewport conserva la colección; no hay sincronización entre dispositivos.

## Frontera de demostración

La selección de rol simula responsabilidades, no autenticación ni permisos de producción. Las funciones de dominio comprueban igualmente las transiciones y el actor para que la experiencia sea consistente. Ninguna asignación, aceptación o resolución contacta a personas o proveedores. No se piden fotografías, cámara, documentos, datos personales ni destinatarios reales: el incidente usa un esquema ficticio preparado.

Solo memoria de React. Sin Web Storage, IndexedDB, HTTP writes, API, WebSockets, mensajes, pagos, PMS, cuentas ni jobs. Recargar restaura todos los fixtures. Se mantienen CSP, sandbox del iframe, noindex, captación comercial única y consentimiento analítico. No se añaden dependencias ni capacidades de R5.

## Revisión multidisciplinar

| Perspectiva | Estado | Resultado y evidencia |
| --- | --- | --- |
| Marketing | **Corregido** | Capacidades, guías y fichas describen una tarea completa en memoria sin prometer una operación real ni resultados comerciales. |
| Producto | **Corregido** | Una colección, responsabilidades y guardas de transición; resolver una incidencia no prepara la habitación. |
| UX | **Corregido** | Causa y siguiente responsable visibles, rechazo/reasignación, deshacer y foco hacia el siguiente paso. La apertura desde búsqueda enfoca la ficha después de montarla; repetición E2E ES/EN correcta, 2/2. |
| UI | **Corregido** | Revisión independiente de seis capturas a 320/390/1440 px, texto al 200 %, controles móviles y estados expandidos. Tokens compartidos, jerarquía y ausencia de desbordamiento global. |
| SEO | **Correcto** | Rutas y noindex preservados; metadescripciones y enlaces de preparación ES/EN reconciliados. |
| Frontend | **Corregido** | Dominio separado y fuentes derivadas para llegada y copiloto; sin persistencia, duplicación de estados operativos ni nuevas dependencias. |
| Full stack | **Correcto** | Los roles se explican como simulación. Transiciones comprobadas localmente; proveedores y API comercial intactos, sin peticiones inesperadas en el recorrido visual. |
| QA / accesibilidad / confianza | **Corregido** | `pnpm check` definitivo correcto con 257 contratos; 76 casos E2E únicos acreditados entre pasadas, incluida regresión de contenido y matriz R4 ES/EN de Axe/reflow correcta, 6/6. |

Se detectaron y corrigieron durante la revisión: controles de checklist que parecían activos con una incidencia abierta, texto de reinicio que podía implicar borrar el borrador manual del copiloto y texto de incidencia resuelta que debía distinguir si la habitación ya estaba validada. La revisión del shell detectó la promesa heredada de habitación lista a las 15:00 y el riesgo de conservar una revisión de IA tras cambiar sus fuentes; ambos se corrigieron.

El foco de la ficha avanza hacia asignación después de confirmar la salida, hacia checklist después de aceptar o resolver/devolver, y hacia revisión al solicitarla. Abrir la ficha enfoca su título; cerrar, deshacer y reiniciar conservan una recuperación explícita. La revisión visual comprobó estos traspasos sin sustituir la validación pendiente con lectores de pantalla humanos.

## Verificación

**`pnpm check` definitivo correcto, tras la corrección de foco:** 7/7 tareas de lint, con 6 cacheadas; 21/21 tareas de typecheck, pruebas y build, con 12 cacheadas; más 33 pruebas de scripts. No se afirma una ejecución forzada de las tareas cacheadas. Astro no presenta errores.

| Contratos | Pruebas correctas |
| --- | ---: |
| Dominio compartido | 20 |
| Dashboard | 72 |
| Sitio | 35 |
| Web | 2 |
| Worker | 95 |
| Scripts | 33 |
| **Total** | **257** |

El dashboard incluye 27 pruebas nuevas del dominio de preparación: transiciones, roles y actores, salida previa, rechazo/reasignación, checklist, incidencias, revisión, recuperación e inmutabilidad.

**Primera pasada R4:** 10 casos correctos, 3 fallidos y 5 sin ejecutar; se detuvo al alcanzar el límite de tres fallos. Dos fallos, ES/EN, detectaron un problema de foco de producto al abrir una tarea desde la búsqueda. Se retiró el foco del título general mediante `go("cleaning", false)` y el equivalente en avisos de tarea, pero ese primer ajuste resultó insuficiente. El tercer fallo fue del selector de la prueba del Copiloto ES: `getByLabel` exacto incorporaba el contenido inicial del textarea; se sustituyó por `getByRole("textbox", { name, exact: true })`, conservando el nombre accesible y todas las comprobaciones del borrador.

La primera pasada superó los tres casos ES de accesibilidad a 320/390/1440 px. La siguiente pasada verificó también sus equivalentes EN: **matriz R4 completa, 6/6**, con teclado, cambio de viewport, texto al 200 %, Axe WCAG 2.2 AA y estados expandidos de rechazo, historial, incidencia, devolución y reinicio.

**Pasada amplia: 53/55.** R4, regresión R3, aislamiento de demo y contratos relacionados de Aurem/accesibilidad se ejecutaron completos. Solo fallaron de nuevo los dos casos de foco ES/EN; el Copiloto pasó en ambos idiomas, incluida la conservación del borrador, invalidación de revisión, reinicio y envío bloqueado.

**Diagnóstico y cierre de foco: 2/2 correctos.** En cuatro recorridos de diagnóstico se observó que la función de foco se ejecutaba antes de que React montara el título: `hasTitle: false` enviaba el foco a la región de preparación. La corrección definitiva en [OperationsWorkspace.tsx](../../apps/dashboard/src/OperationsWorkspace.tsx) separa la selección de la tarea y el efecto que enfoca su título después del montaje. El ajuste de `go()` se mantiene, pero no se presenta como solución suficiente por sí solo. Las aserciones de foco y reapertura repetida no se rebajaron.

**55 casos E2E únicos acreditados entre pasadas: 53 de la ejecución amplia y los 2 casos de foco repetidos sobre la corrección definitiva. No fue una única ejecución 55/55.** Los 18 casos R4 quedan cubiertos y verifican también API, escrituras HTTP, conexiones externas, WebSockets y almacenamiento del navegador, con bloqueo preventivo de peticiones inesperadas.

**Regresión adicional de contenido: 20/21 y cierre focal 1/1.** El único fallo esperaba la frase anterior del límite del centro operativo. Se actualizó la aserción al contrato vigente, exigiendo tanto cambios solo en memoria con recuperación como ausencia de operaciones reales y sincronización. La repetición pasó; no se eliminaron las aserciones del límite ni de su visibilidad. Pasaron guías, fichas, capacidades, diez rutas demo, editor, recorridos, ingresos, canales, automatizaciones, copiloto y avisos; estos últimos comprueban también el foco en la ficha exacta. ESLint del archivo modificado correcto.

**Total final: 76 casos E2E únicos acreditados entre ejecuciones (53 + 2 + 20 + 1), no una pasada única 76/76.** No quedan fallos conocidos de estas verificaciones. El check definitivo se ejecutó después de corregir el montaje/foco; el último ajuste solo cambió la expectativa de texto de una prueba y se verificó con ESLint y la repetición focal. Chromium 151, servidor local en 8794/9244. `git diff --check` correcto.

Evidencia de ejecución local:

- [Check definitivo tras corregir el foco](/tmp/estancia-r4-release-check.log) y [check anterior](/tmp/estancia-r4-final-check.log).
- [Primera pasada E2E](/tmp/estancia-r4-first-e2e.log) y [artefactos de fallos](/tmp/estancia-r4-first-results).
- [Pasada E2E amplia, 53/55](/tmp/estancia-r4-verified-e2e.log).
- [Cierre de foco ES/EN, 2/2](/tmp/estancia-r4-focus-e2e.log).
- [Regresión de contenido, 20/21](/tmp/estancia-r4-content-e2e.log) y [cierre del límite, 1/1](/tmp/estancia-r4-boundary-e2e.log).
- [Recorrido visual reproducible](/tmp/estancia-r4-visual.mjs) y [medidas de layout, foco y red](assets/hospitality-r4-2026-10-04/visual-metrics.json).

## Capturas y revisión visual

- [Inicio, 1440 px](assets/hospitality-r4-2026-10-04/home-1440.png).
- [Planning de preparación, 1440 px](assets/hospitality-r4-2026-10-04/planning-1440.png).
- [Limpieza y responsabilidades, 390 px](assets/hospitality-r4-2026-10-04/cleaning-390.png).
- [Ficha de preparación, 390 px](assets/hospitality-r4-2026-10-04/cleaning-detail-390.png).
- [Incidencia de la habitación 408 e historial, 390 px](assets/hospitality-r4-2026-10-04/risk-408-390.png).
- [Incidencia, historial y reinicio desplegados, 320 px con texto al 200 %](assets/hospitality-r4-2026-10-04/risk-408-320-text200.png).

El agente de UI inspeccionó las seis capturas y validó el resultado a 320/390/1440 px. Las medidas registran ancho de documento igual al viewport, cero elementos desbordados y cero peticiones inesperadas en los seis estados. A 320 px se comprueba una fuente raíz efectiva de 32 px frente a 16 px iniciales. El selector de rol permanece visible y mide 44 px de alto en móvil a 390 px, y 45 px a 320 px con texto ampliado. Los registros de foco acreditan título de ficha → asignación → checklist e incidencia, manteniendo el contexto de la tarea. Esta evidencia es local y automatizada; no representa una prueba en dispositivo físico.

## Continuidad y límites de evidencia

R4 queda cerrado en local. El siguiente incremento del roadmap es R5: búsqueda y portal del huésped simulados sobre un caso común en memoria, conservando aislamiento entre documentos y sin almacenamiento persistente ni PII en URL. No se inicia en esta entrega del gestor.

Siguen pendientes comprensión con personas, dispositivos físicos, zoom nativo, lector de pantalla humano y una nueva medición Lighthouse. La validación comercial —quince entrevistas y cinco propuestas— continúa pendiente; esta evidencia no acredita superioridad de mercado ni paridad operacional. Analítica, proveedores, piloto y producción conservan sus autorizaciones separadas.
