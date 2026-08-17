# Logic Estancia · Auditoría de accesibilidad

Última actualización: 2026-08-17

## Estado

Baseline automatizada WCAG 2.2 AA en verde. Esto no constituye una certificación de conformidad completa: siguen pendientes recorridos humanos con lectores de pantalla, modos de alto contraste y validación de lenguaje y comprensión.

## Alcance automatizado

La suite `tests/e2e/accessibility.spec.ts` audita las 30 rutas públicas en Chromium con axe-core y las etiquetas `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` y `wcag22aa`:

- Landing, soluciones, planes, diagnóstico, documentación y recursos comerciales.
- Aviso legal, privacidad y cookies.
- Nivora, Terrava y Aurem en ES/EN, incluidos los gestores de Terrava y Aurem.

Además comprueba:

- Un único landmark `main` y un único `h1` por ruta.
- Reflow sin scroll horizontal de página en las 30 rutas a 320 CSS px, equivalente al viewport de referencia de WCAG a 400 %.
- Texto al 200 % sin provocar scroll horizontal de página en las cinco familias representativas.
- Indicador de foco visible en la web comercial, una web demo y un gestor.
- Supresión de transiciones, animaciones y scroll suave con `prefers-reduced-motion: reduce` en esas tres familias.
- Foco contextual al avanzar, retroceder, obtener y editar el resultado del diagnóstico.
- Foco al entrar y volver de preferencias de cookies, y al abrir/cerrar validaciones, pago ficticio, visita guiada y paneles del gestor.
- Mensajes de error y estado dinámico anunciados mediante regiones semánticas ya cubiertas por axe y recorridos E2E.

## Hallazgos y correcciones

La primera ejecución detectó violaciones serias de contraste en texto secundario de todas las familias visuales y objetivos táctiles insuficientes en los enlaces del pie de los gestores.

Se corrigió en la primera pasada:

- Tokens compartidos `--slate` y `--ash`, elevando el contraste sin alterar la jerarquía tipográfica.
- Acentos secundarios de Terrava y Aurem y mezclas transparentes de etiquetas y pies de demo.
- Altura táctil mínima de 24 px en los enlaces del pie del gestor.
- Peer de `@cloudflare/workers-types` alineado con Wrangler para mantener fiable la infraestructura de pruebas.

La segunda pasada de interacción y reflow detectó y corrigió:

- Pérdida de contexto de teclado al cambiar de paso o mostrar el resultado del diagnóstico.
- Paneles y overlays del gestor que cerraban sin devolver el foco a su disparador.
- Anchura intrínseca de la tabla de capacidades, títulos editoriales largos, filas de recursos y hero de las demos a 320 px.
- Foco inicial explícito en las decisiones y pasos de la visita guiada.
- Diagnóstico permanente del selector y geometría responsables cuando una futura ruta vuelva a desbordar.

Después de las correcciones, axe no reporta violaciones en ninguna de las 30 rutas. El QA visual responsive sobre portada a 1366 px y 375 px, Terrava, el gestor Aurem, el recurso largo español y Aurem inglés a 320 px confirmó ausencia de overflow y regresiones visibles.

## Evidencia reproducible

```bash
pnpm exec playwright test tests/e2e/accessibility.spec.ts
pnpm check
pnpm e2e
pnpm peers check
```

Resultado verificado el 2026-08-17: 14 pruebas específicas de accesibilidad correctas. La puerta global suma 41 E2E —24 funcionales, 14 de accesibilidad y 3 de SEO técnico—, además de 28 tareas de paquetes más lint de scripts/pruebas raíz y ninguna incidencia de peers.

## Deuda y siguiente revisión

- Probar recorridos completos con VoiceOver y al menos otro lector de pantalla representativo.
- Revisar manualmente los modos de alto contraste del sistema y del navegador.
- Validar con personas el lenguaje, orden de lectura y comprensión de los cinco flujos profundos.
- Repetir Lighthouse móvil y las matrices de reflow/foco cuando cambien layout, tipografía o componentes interactivos.
- Repetir la revisión manual cuando cambien navegación, formularios, overlays, tokens de color o componentes interactivos.
