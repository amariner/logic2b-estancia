# Logic Estancia · Auditoría de accesibilidad

Última actualización: 2026-08-17

## Estado

Baseline automatizada WCAG 2.2 AA en verde. Esto no constituye una certificación de conformidad completa: siguen pendientes recorridos manuales con lectores de pantalla, zoom/reflow ampliado, alto contraste y validación humana de lenguaje y comprensión.

## Alcance automatizado

La suite `tests/e2e/accessibility.spec.ts` audita las 30 rutas públicas en Chromium con axe-core y las etiquetas `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` y `wcag22aa`:

- Landing, soluciones, planes, diagnóstico, documentación y recursos comerciales.
- Aviso legal, privacidad y cookies.
- Nivora, Terrava y Aurem en ES/EN, incluidos los gestores de Terrava y Aurem.

Además comprueba:

- Un único landmark `main` y un único `h1` por ruta.
- Indicador de foco visible en la web comercial, una web demo y un gestor.
- Supresión de transiciones, animaciones y scroll suave con `prefers-reduced-motion: reduce` en esas tres familias.

## Hallazgos y correcciones

La primera ejecución detectó violaciones serias de contraste en texto secundario de todas las familias visuales y objetivos táctiles insuficientes en los enlaces del pie de los gestores.

Se corrigió:

- Tokens compartidos `--slate` y `--ash`, elevando el contraste sin alterar la jerarquía tipográfica.
- Acentos secundarios de Terrava y Aurem y mezclas transparentes de etiquetas y pies de demo.
- Altura táctil mínima de 24 px en los enlaces del pie del gestor.
- Peer de `@cloudflare/workers-types` alineado con Wrangler para mantener fiable la infraestructura de pruebas.

Después de las correcciones, axe no reporta violaciones en ninguna de las 30 rutas. El QA visual responsive sobre portada a 1366 px y 375 px, Terrava y el gestor Aurem confirmó ausencia de overflow y regresiones visibles.

## Evidencia reproducible

```bash
pnpm exec playwright test tests/e2e/accessibility.spec.ts
pnpm check
pnpm e2e
pnpm peers check
```

Resultado verificado el 2026-08-17: 8 pruebas específicas de accesibilidad, 28 tareas de paquetes más lint de scripts/pruebas raíz y 35 E2E correctas; ninguna incidencia de peers.

## Deuda y siguiente revisión

- Probar recorridos completos con VoiceOver y al menos otro lector de pantalla representativo.
- Revisar zoom al 200/400 %, reflow y alto contraste en rutas y estados interactivos clave.
- Comprobar anuncios de errores, diálogos, cambios dinámicos y recuperación de foco durante los cinco flujos profundos.
- Medir Lighthouse móvil y sostener puntuaciones superiores a 90 en accesibilidad y SEO.
- Repetir la revisión manual cuando cambien navegación, formularios, overlays, tokens de color o componentes interactivos.
