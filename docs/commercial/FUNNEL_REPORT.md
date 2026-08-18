# Informe reproducible del embudo digital

El informe `1.0.0` transforma recuentos agregados de eventos consentidos en una lectura estable del embudo. No consulta GA4, no modifica etiquetas, no escribe archivos y no acepta identificadores de usuario, sesión, dispositivo o contacto.

## Qué mide

El embudo principal conserva este orden:

1. `assessment_start`: diagnósticos iniciados.
2. `assessment_complete`: recomendaciones visibles.
3. `lead_submit`: solicitudes comerciales entregadas.
4. `meeting_click`: clics en una agenda válida, si se habilita.

Las tasas comparan recuentos agregados, no personas. Un envío puede comenzar fuera del diagnóstico, una misma persona puede repetir eventos y la analítica solo observa navegación con consentimiento explícito. Por eso el informe describe dirección, no atribución ni conversión individual.

Propuestas, proyectos ganados o perdidos, ingresos y objeciones no forman parte del contrato web. Se revisan con evidencia comercial separada y nunca se infieren de estos eventos.

## Contrato de entrada

La entrada es un objeto JSON agregado:

```json
{
  "contractVersion": "1.0.0",
  "period": { "start": "2026-08-01", "end": "2026-08-31" },
  "consentMode": "analytics-consent-only",
  "rows": [
    {
      "event": "assessment_start",
      "count": 24,
      "locale": "es",
      "source_section": "assessment"
    }
  ]
}
```

Cada fila admite exclusivamente `event`, `count`, `locale`, `segment`, `plan`, `demo`, `flow`, `step_index` y `source_section`. Son las dimensiones allowlisted en el contrato único `packages/config/src/analytics-contract.json`, consumido también por la landing y las demos. Sus valores se validan contra los valores emitidos por el producto; no se aceptan dimensiones libres.

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

La salida Markdown incluye periodo, cobertura, tabla de etapas, tasas respecto a la etapa anterior, totales por evento, desglose de las etapas por idioma y advertencias de calidad. La salida JSON ofrece los mismos cálculos para revisión automatizada.

## Interpretación y puerta de decisión

- Compara periodos con la misma configuración de consentimiento y etiquetas.
- No combines datos de desarrollo, demo y producción.
- Investiga primero cambios de instrumentación, consentimiento o tráfico antes de atribuir una variación al producto.
- Si una etapa posterior supera a la anterior, el informe lo señala; no corrijas ni limites el porcentaje para hacerlo parecer un embudo individual.
- No declares ganadores de un experimento sin un periodo, hipótesis y tamaño de muestra definidos antes de leer el resultado.
- Conserva el JSON agregado fuera del repositorio si procede de producción. El fixture integrado en la CLI es enteramente ficticio.
