# Informe reproducible del embudo digital

El informe `2.3.0` transforma recuentos agregados de eventos consentidos en una lectura estable del embudo, la evidencia comercial consultada, sus siguientes pasos y el recorrido guiado. Conserva vistas y handoffs de `2.2.0`, y añade `tour_start` y `tour_complete` para distinguir un inicio y un final explícitos. No consulta GA4, no modifica etiquetas, no escribe archivos y no acepta identificadores de usuario, sesión, dispositivo o contacto.

## Qué mide

El embudo principal conserva este orden:

1. `assessment_start`: diagnósticos iniciados.
2. `assessment_submit`: acción final válida con todas las respuestas requeridas y un plan calculado.
3. `assessment_complete`: recomendación ya visible en la interfaz.
4. `lead_submit`: solicitud comercial entregada por el único formulario real.
5. `meeting_click`: clic en una agenda válida, si se habilita.

Las tasas del embudo usan el `source_section` canónico de cada etapa: `assessment` para inicio, entrega válida y recomendación; `homepage_contact` para solicitud y agenda. El configurador breve de portada puede emitir `assessment_complete` con `source_section=homepage_scope` porque también muestra una recomendación, pero ese recuento solo aparece en los totales de evento y queda fuera de las tasas del diagnóstico.

Las tasas comparan recuentos agregados, no personas. Un envío puede comenzar fuera del diagnóstico, una misma persona puede repetir eventos y la analítica solo observa navegación con consentimiento explícito. Por eso el informe describe dirección, no atribución ni conversión individual.

Propuestas, proyectos ganados o perdidos, ingresos y objeciones no forman parte del contrato web. Se revisan con evidencia comercial separada y nunca se infieren de estos eventos.

Las vistas de evidencia tampoco representan personas únicas. Cada carga consentida de una dirección o ficha comercial cuenta una vista y conserva únicamente idioma, identificador cerrado, plan canónico y sección de origen. Las doce direcciones —incluidas las fichas canónicas de Nivora, Terrava y Aurem— y las seis fichas de panel se miden en rutas indexables con consentimiento. Las demos permanecen fuera de analítica: no leen consentimiento, no consultan el runtime, no cargan GTM y conservan su CSP sin conexiones externas.

Los handoffs solo se emiten ante un clic real en una salida comercial publicada. `demo` abre la evidencia local exacta, `assessment` abre el diagnóstico con contexto allowlisted y `contact` conduce al único formulario real de la portada. La navegación no se bloquea ni espera a una etiqueta; el tracker registra sincrónicamente cuando el runtime ya está validado y, en cualquier otro caso, vuelve a comprobar consentimiento y runtime antes de aceptar el evento. No se conserva el `href`, la URL de origen, el texto del enlace ni ninguna respuesta del usuario.

El recorrido guiado vive en `/recorrido/` y `/en/journey/`. `tour_start` solo corresponde al botón que inicia sus cinco pasos y `tour_complete` al control final que aparece después del quinto. Abrir la ruta, hacer scroll, esperar, cambiar de paso o abandonar no genera ninguno de los dos eventos. Ambos usan únicamente idioma, `flow=guided` y `source_section=guided_tour`; el informe muestra inicios, finales y una tasa direccional agregada por idioma, sin unir interacciones en perfiles individuales.

## Contrato de entrada

La entrada es un objeto JSON agregado:

```json
{
  "contractVersion": "2.3.0",
  "period": { "start": "2026-08-01", "end": "2026-08-31" },
  "consentMode": "analytics-consent-only",
  "rows": [
    {
      "event": "assessment_start",
      "count": 24,
      "locale": "es",
      "segment": "rural",
      "source_section": "assessment"
    }
  ]
}
```

Cada fila admite exclusivamente `event`, `count`, `locale`, `segment`, `plan`, `web`, `panel`, `handoff`, `demo`, `flow`, `step_index` y `source_section`. Son las dimensiones allowlisted en el contrato único `packages/config/src/analytics-contract.json`, consumido también por la landing y las demos. Sus valores se validan contra los valores emitidos por el producto; no se aceptan dimensiones libres. Las etapas medidas exigen además su forma canónica: por ejemplo, `assessment_submit` requiere idioma, segmento, plan y `source_section=assessment`, mientras que `solution_view` exige idioma, uno de los tres segmentos publicados y `source_section=solution`. Vistas y handoffs requieren además que identificador y plan formen una de las dieciocho combinaciones publicadas; los handoffs solo aceptan `demo`, `assessment` o `contact`. Los dos eventos del recorrido exigen `flow=guided` y `source_section=guided_tour`. Mezclar Linde con Inteligente, Copiloto con Gestión, otro flujo o cualquier destino libre se rechaza aunque los valores restantes existan por separado.

Para preparar el JSON, agrega en la fuente por evento y dimensiones permitidas. No exportes `user_pseudo_id`, session ID, URL completa, títulos libres, términos de búsqueda, datos del formulario ni ningún valor personalizado. La CLI rechazará cualquier clave desconocida, aunque el origen la considere inocua.

## Uso

Valida el contrato y consulta un ejemplo ficticio:

```bash
pnpm funnel:report -- --validate
pnpm funnel:report -- --example
pnpm funnel:report -- --example --format json
```

Genera el informe desde un archivo temporal autorizado:

```bash
pnpm funnel:report -- < /ruta/segura/recuentos-agregados.json
```

La salida Markdown incluye periodo, cobertura, tabla de etapas, tasas respecto a la etapa anterior, totales por evento, desglose de las etapas por idioma, vistas de solución por segmento, vistas web por concepto/plan, vistas de panel por superficie/plan, handoffs por origen/destino/idioma e inicio/final del recorrido por idioma, además de advertencias de calidad y notas de contexto. La salida JSON ofrece los mismos cálculos para revisión automatizada. `assessment_complete` con `source_section=homepage_scope` es una forma válida: queda fuera de las tasas y se presenta como contexto, no como incidencia. Un dataset puede contener solo vistas, handoffs o recorrido canónicos; las combinaciones incompletas o no canónicas se rechazan antes de calcular el informe. Si los finales superan los inicios en un idioma, se conserva el dato y se emite una advertencia de calidad en vez de ocultarlo.

## Interpretación y puerta de decisión

- Compara periodos con la misma configuración de consentimiento y etiquetas.
- No combines datos de desarrollo, demo y producción.
- Investiga primero cambios de instrumentación, consentimiento o tráfico antes de atribuir una variación al producto.
- Si una etapa posterior supera a la anterior, el informe lo señala; no corrijas ni limites el porcentaje para hacerlo parecer un embudo individual.
- No declares ganadores de un experimento sin un periodo, hipótesis y tamaño de muestra definidos antes de leer el resultado.
- Conserva el JSON agregado fuera del repositorio si procede de producción. El fixture integrado en la CLI es enteramente ficticio.
