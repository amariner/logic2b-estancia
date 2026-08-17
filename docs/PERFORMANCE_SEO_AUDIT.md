# Logic Estancia · Lighthouse móvil y SEO técnico

Última actualización: 2026-08-17

## Resultado Lighthouse

Medición local reproducible sobre el Worker compuesto, con emulación móvil y throttling simulado. La herramienta exige más de 90 en accesibilidad para todas las rutas y más de 90 en SEO para las rutas indexables.

| Ruta | Rendimiento | Accesibilidad | Buenas prácticas | SEO | FCP | LCP | TBT | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/` | 100 | 100 | 100 | 100 | 1.207 s | 1.207 s | 0 ms | 0.007 |
| `/planes/` | 99 | 100 | 100 | 100 | 1.656 s | 1.656 s | 0 ms | 0.004 |
| `/diagnostico/` | 99 | 100 | 100 | 100 | 1.659 s | 1.659 s | 0 ms | 0.003 |
| `/demos/terrava/` | 99 | 100 | 100 | 58 | 1.510 s | 1.660 s | 0 ms | 0.001 |

El 58 de SEO de Terrava es esperado y correcto: las demos deben permanecer fuera de índices mediante `noindex`. La herramienta no aplica el umbral SEO a una demo y, en su lugar, falla si Lighthouse deja de detectar que no es rastreable.

## Ejecución reproducible

Con el Worker local en ejecución sobre el build actual:

```bash
pnpm build
pnpm --filter @logic-estancia/worker exec wrangler dev --config wrangler.jsonc --ip 127.0.0.1 --port 8790
```

En otra terminal:

```bash
pnpm audit:lighthouse
```

También se puede pasar un origen autorizado con `--base-url`. La salida es un resumen JSON compacto; no conserva informes HTML ni datos de navegación.

## Canonical, hreflang, sitemap y JSON-LD

`tests/e2e/seo.spec.ts` protege las 20 URLs indexables del dominio final `https://estancia.logic2b.com`:

- Canonical propio exacto en cada página.
- Nueve parejas ES/EN con enlaces `es`, `en` y `x-default` recíprocos y existentes.
- `Organization` y `WebSite` presentes en JSON-LD.
- Sitemap sin duplicados, con todas las rutas indexables y ninguna demo.
- Recursos solo en español sin `hreflang` ni selector de idioma que conduzcan a traducciones inexistentes.

La revisión detectó y corrigió que los dos recursos españoles anunciaban antes una alternativa `/en/recursos/...` inexistente.

## Límites y siguiente revisión

- Estas cifras son una baseline local simulada; deben contrastarse de nuevo en producción después del siguiente despliegue autorizado.
- Lighthouse es sensible a versión, hardware y red. Se fijan versiones en `pnpm-lock.yaml` y se evalúan umbrales, no igualdad exacta de métricas.
- Core Web Vitals de usuarios reales requerirán tráfico suficiente y consentimiento analítico; no se inventan datos de campo.
- Repetir tras cambios de imágenes, fuentes, scripts de terceros, consentimiento, navegación o metadatos.
