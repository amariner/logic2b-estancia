# Informe reproducible del embudo digital

El informe `2.0.0` transforma recuentos agregados de eventos consentidos en una lectura estable del embudo. Esta revisión reemplaza el borrador preactivación `1.0.0`: añade la entrega válida al embudo y exige formas canónicas incompatibles con aquel borrador. No consulta GA4, no modifica etiquetas, no escribe archivos y no acepta identificadores de usuario, sesión, dispositivo o contacto.

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

## Contrato de entrada

La entrada es un objeto JSON agregado:

```json
{
  "contractVersion": "2.0.0",
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

Cada fila admite exclusivamente `event`, `count`, `locale`, `segment`, `plan`, `demo`, `flow`, `step_index` y `source_section`. Son las dimensiones allowlisted en el contrato único `packages/config/src/analytics-contract.json`, consumido también por la landing y las demos. Sus valores se validan contra los valores emitidos por el producto; no se aceptan dimensiones libres. Las etapas medidas exigen además su forma canónica: por ejemplo, `assessment_submit` requiere idioma, segmento, plan y `source_section=assessment`, mientras que `solution_view` exige idioma, uno de los tres segmentos publicados y `source_section=solution`.

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

La salida Markdown incluye periodo, cobertura, tabla de etapas, tasas respecto a la etapa anterior, totales por evento, desglose de las etapas por idioma, vistas de solución por segmento, advertencias de calidad y notas de contexto. La salida JSON ofrece los mismos cálculos para revisión automatizada. `assessment_complete` con `source_section=homepage_scope` es una forma válida: queda fuera de las tasas y se presenta como contexto, no como incidencia. Las combinaciones incompletas o no canónicas se rechazan antes de calcular el informe.

## Interpretación y puerta de decisión

- Compara periodos con la misma configuración de consentimiento y etiquetas.
- No combines datos de desarrollo, demo y producción.
- Investiga primero cambios de instrumentación, consentimiento o tráfico antes de atribuir una variación al producto.
- Si una etapa posterior supera a la anterior, el informe lo señala; no corrijas ni limites el porcentaje para hacerlo parecer un embudo individual.
- No declares ganadores de un experimento sin un periodo, hipótesis y tamaño de muestra definidos antes de leer el resultado.
- Conserva el JSON agregado fuera del repositorio si procede de producción. El fixture integrado en la CLI es enteramente ficticio.
