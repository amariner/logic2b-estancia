# R3 · Gestor de estancias ficticias · 4 de octubre de 2026

## Alcance

Terrava permite completar un caso de estancia y comprobar sus efectos en Inicio, Solicitudes, Planning, Reservas, Huéspedes e Informes. Todo parte de una colección local; no representa una operación comercial real. Se conservan Nivora/Básico sin gestor y Aurem/Inteligente con sus límites actuales. No hay despliegue de producción.

La revisión parte de `25f21af0c03ca5d2e862f48942dbcb415bb4a006`, árbol inicialmente limpio en la rama de entorno `work`. La prioridad R3 se contrastó con el checkpoint y el roadmap; el rediseño de septiembre ya estaba integrado. La comparación inicial del remoto falló por el sandbox de red; la consulta con permiso de red confirmó después que `origin/main` coincidía con la base. El [Quality pendiente de R2](https://github.com/amariner/logic2b-estancia/actions/runs/35365607591) se consultó en GitHub: `success`, incluidos check y E2E.

Producto verificado: `b428cea15672219cafc0a8c245a5a6dc034e3950`. El commit documental posterior conserva esta evidencia; el push no constituye un despliegue de producción.

## Producto entregado

- Un contrato de estancia con identificador, propiedad/unidad, fechas, ocupantes ficticios, estado, origen y desglose en céntimos. Fechas ISO estrictas, noches UTC e intervalos de ocupación que excluyen la salida: permite una entrada el día de la salida anterior.
- Ocho casas, un bloqueo de mantenimiento y cuatro solicitudes: conflicto con alternativa, disponibilidad normal, colección ocupada y capacidad insuficiente. Marina Costa, cuatro huéspedes, 21–24 de agosto: Casa Aira ocupada; Casa Bruma disponible por 612 € (3 × 189 € + 45 € de limpieza).
- Confirmación local, modificación con disponibilidad y presupuesto actualizado, cancelación con confirmación y deshacer del último cambio. La recuperación revalida disponibilidad. Los borradores no pueden confirmarse sin guardar o descartar; restablecer elimina también ediciones sin guardar.
- Planning de 14 días derivado de los mismos intervalos; navegación de fechas, noche de referencia, bloqueo visible y fichas accesibles con teclado. Reservas y huéspedes abren la misma ficha. Filtros efectivos por propiedad, también en móvil, y estados vacíos explicativos.
- Búsqueda por huésped, referencia, casa y sección sin distinguir acentos; avisos que abren la solicitud correspondiente. Menú, utilidades y ficha conservan el foco; Escape actúa sobre el contexto activo.
- Informes calculados desde las estancias confirmadas: importes de muestra, alojamiento, limpieza y ocupación con el mantenimiento excluido del denominador. Base independiente: 15 estancias, 8.040 €, 39 noches ocupadas / 242 disponibles; 16,1 %. Tabla diaria alternativa al gráfico. Cancelar excluye la estancia del cálculo.
- Sistema visual compartido, mayor densidad útil en Terrava, botones táctiles, detalle progresivo, feedback, confirmaciones y diagnóstico al pie para evitar cubrir controles. Guías, capacidades, previews y fichas ES/EN ajustados a la interacción local. Los previews comerciales siguen rotulados como estáticos.

## Límites comprobados

Solo se editan fechas, unidad y número de huéspedes de fixtures; no se pide identidad, tarjeta, documento ni información real. No hay HTTP writes, llamadas a `/api/`, proveedores, WebSockets ni escrituras en localStorage/sessionStorage/IndexedDB durante los nuevos recorridos. Se conservan CSP `connect-src 'none'`, `form-action 'none'` y noindex. Recargar restaura el escenario; no hay sincronización entre dispositivos.

El estado y las reglas están separados de las vistas. No se incorporan dependencias nuevas. Los importes no se presentan como cobros, facturas ni resultados comerciales; las marcas y precios comerciales existentes conservan sus condiciones.

## Verificación

`pnpm check` final correcto: 7 tareas de lint (6 cacheadas) y 21 de typecheck/test/build (12 cacheadas); 230 pruebas de contrato (dominio 20, dashboard 45 —38 nuevas—, web 2, sitio 35, Worker 95 y scripts 33). No se afirma ejecución forzada de tareas cacheadas. Astro: cero errores.

**270 casos E2E únicos acreditados entre ejecuciones, no una única pasada 270/270.**

- Regresión general: 195 correctos y un fallo de foco en el recorrido de Aurem. Se detuvo al terminar R2 para reconstruir las correcciones antes de R3; el primer caso R3 quedó interrumpido y 73 no se ejecutaron en esa pasada.
- Continuación de la regresión y repetición de Aurem: 67/75. Quedaron seis fallos de semántica de las métricas del informe y dos por el CTA visible dentro del iframe; ambos problemas se corrigieron.
- Repetición de esos ocho casos: 4/8. Aurem ya estaba acreditado y las vistas previas quedaron correctas. La nueva aserción tras desplegar la tabla encontró cuatro desbordamientos móviles con texto al 200 %; se limitó la columna y el panel, conservando el scroll dentro de la tabla.
- Cierre sobre el build definitivo: **6/6**, ES/EN a 320/390/1440 px. Incluye teclado, foco, edición inválida, planning, informe con tabla desplegada, texto al 200 %, etiquetas del eje completas y contenidas, y Axe WCAG 2.2 AA sin violaciones. Los dos casos de escritorio se repiten: 195 + 67 + 4 + 6 resultados correctos corresponden a 270 casos distintos.

Los 21 casos de R3 cubren las cuatro tareas, escenarios sin disponibilidad, filtros, avisos, búsqueda, reinicio y recarga, además del aislamiento. Las suites restantes comprueban accesibilidad, analítica, captación, demos, guías, recorridos, previews, SEO y temas. No se debilitaron barreras ni aserciones para aprobarlos.

Logs: `/tmp/estancia-r3-final-verified-check.log`, `/tmp/estancia-r3-regression-e2e.log`, `/tmp/estancia-r3-release-e2e.log`, `/tmp/estancia-r3-closed-e2e.log` y `/tmp/estancia-r3-final-verified-e2e.log`. Artefactos del cierre: `/tmp/estancia-r3-final-verified-results/`. Puertos locales 8794/9244. `git diff --check` correcto.

Se corrigieron hallazgos de revisión independientes: selección de la vivienda preferida cuando está disponible, ficha conservada al modificar la unidad fuera del filtro, devolución de foco tras cancelar, reapertura involuntaria al regresar de Informes, Escape sobre capas, borradores visibles al confirmar/restablecer, cierre de menú oculto por CSS y filtro móvil ausente. El QA visual añadió columnas explícitas para evitar que las reservas desplazaran el fondo del calendario y reflow de importes al 200 %. La comprobación del informe expandido detectó notas fuera de las definiciones HTML; se incorporaron a sus valores correspondientes. Los días del eje mantienen sus dos dígitos juntos y contenidos en el gráfico. La tabla ampliada conserva el desplazamiento dentro de su región. El recorrido guiado de Aurem conserva su foco propio al cambiar de vista y los previews mantienen su CTA exterior único.

Comandos de verificación en este entorno Linux:

```bash
XDG_CONFIG_HOME=/tmp/estancia-r3-config ASTRO_TELEMETRY_DISABLED=1 TURBO_ENV_MODE=loose pnpm check
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium XDG_CONFIG_HOME=/tmp/estancia-r3-config PLAYWRIGHT_PORT=8794 PLAYWRIGHT_INSPECTOR_PORT=9244 pnpm exec playwright test --timeout=90000
```

Se usó Chromium 151. La variable opcional de ejecutable permite usar el navegador del entorno; en otros equipos se conserva la detección previa o Chromium de Playwright. El navegador y el servidor local necesitan permisos que el sandbox restringido no concede por defecto. Ningún test envía correos reales.

## Capturas de revisión

- [Inicio, 1440 px](assets/hospitality-r3-2026-10-04/home-1440.png).
- [Planning, 1440 px](assets/hospitality-r3-2026-10-04/planning-1440.png).
- [Solicitud y alternativa, 390 px](assets/hospitality-r3-2026-10-04/enquiry-390.png).
- [Filtro y estado vacío, 390 px](assets/hospitality-r3-2026-10-04/property-empty-390.png).
- [Informe, 390 px](assets/hospitality-r3-2026-10-04/report-390.png).
- [Informe, 320 px con texto al 200 %](assets/hospitality-r3-2026-10-04/report-320-text200.png).
- [Tabla del informe desplegada, 320 px con texto al 200 %](assets/hospitality-r3-2026-10-04/report-320-text200-ledger.png).

Inspección visual de las capturas y medición en navegador: ocho filas con la fecha de referencia en la misma columna; cero desbordamiento global en los tamaños capturados. La tabla desplegada a 320 px/200 % tiene una región de 250 px y contenido de 643 px; su desplazamiento horizontal se probó sin ampliar el documento. Cero peticiones inesperadas en los recorridos visuales.

## Consejo multidisciplinar

| Perspectiva | Estado | Evidencia / criterio |
| --- | --- | --- |
| Marketing | Corregido | La prueba y su copy muestran una tarea completa y los límites de ficción; sin promesas de conversión. |
| Producto | Corregido | Una estancia compartida, escenarios de error y recuperación; planes preservados. |
| UX | Corregido | Siguiente acción, edición explícita, filtros, foco y deshacer; revisión independiente de los estados. |
| UI | Corregido | Tokens existentes, jerarquía y densidad, móvil y controles sin superposición comercial. |
| SEO | Correcto | Rutas/canonical/hreflang preservados; metadescripciones y enlaces mantienen intención; demos noindex. |
| Frontend | Corregido | Contrato puro y vistas derivadas; ninguna persistencia o dependencia añadida. |
| Full stack | Correcto | Frontera de demo y API comercial intactas; sin proveedores o datos reales. |
| QA / accesibilidad / confianza | Corregido | 230 contratos y 270 E2E únicos acreditados; correcciones verificadas, Axe limpio, teclado y reflow con tabla expandida; límites de investigación humana explícitos. |

## Continuidad

El siguiente incremento es R4: preparación de una llegada de Aurem por rol, con tareas y estados compartidos en memoria, reversión y móvil. No convertir este avance en activación de PMS, pagos, canales, mensajería, IA ni producción.

Siguen pendientes la observación con personas, dispositivo físico, lector de pantalla humano y una nueva medición Lighthouse. Las pruebas de reflow automatizadas no equivalen a zoom nativo ni a una auditoría humana completa. No se acredita superioridad de mercado ni resultados comerciales sin investigación y medición propias.
