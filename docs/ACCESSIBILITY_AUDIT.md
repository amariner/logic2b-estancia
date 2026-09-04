# Logic Estancia · Auditoría de accesibilidad

Última actualización: 2026-09-04

## Estado

Baseline automatizada WCAG 2.2 AA en verde. Esto no constituye una certificación de conformidad completa: siguen pendientes recorridos humanos con lectores de pantalla, modos de alto contraste y validación de lenguaje y comprensión.

## Alcance automatizado

La suite `tests/e2e/accessibility.spec.ts` audita 82 rutas públicas en Chromium con axe-core y las etiquetas `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` y `wcag22aa`, además de 14 estados profundos de dashboard:

- Landing, soluciones, planes, diagnóstico, documentación y recursos comerciales.
- Aviso legal, privacidad y cookies.
- Las doce fichas comerciales web ES/EN, incluidos los casos canónicos de Nivora, Terrava y Aurem; sus demos y los gestores de Terrava y Aurem permanecen en el alcance separado de producto ficticio.
- La interacción y el expediente de entrega 0/13 de Nivora, los estados profundos ES/EN del editor y expediente de publicación de Terrava, además de ingresos, preparación de canales, automatizaciones inertes y Copiloto supervisado de Aurem, se añaden a axe, landmarks y reflow sin contarlos como nuevas URLs públicas. La portada incorpora un registro de cinco expedientes con una puerta desplegable de diez evidencias, además de pagos 0/15 y datos/PMS 0/16; los tres disclosures están cerrados por defecto. Publicación y canales exponen doce requisitos sin validar; `automations` y `automation` son superficies deliberadamente distintas.

Además comprueba:

- Un único landmark `main` y un único `h1` por ruta.
- Reflow sin scroll horizontal de página en las 82 rutas y 14 estados profundos a 320 CSS px, equivalente al viewport de referencia de WCAG a 400 %.
- Texto al 200 % sin provocar scroll horizontal de página en las cinco familias representativas.
- Indicador de foco visible en la web comercial, una web demo y un gestor.
- Supresión de transiciones, animaciones y scroll suave con `prefers-reduced-motion: reduce` en esas tres familias.
- Foco contextual al avanzar, retroceder, obtener y editar el resultado del diagnóstico.
- Foco al entrar y volver de preferencias de cookies, y al abrir/cerrar validaciones, el expediente informativo de pagos, la visita guiada y paneles del gestor.
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
- Anchura intrínseca del editor de IA y cabecera larga de Automatización a 320 px, manteniendo textarea, acciones y trazabilidad dentro del viewport.

Después de las correcciones, axe no reporta violaciones en ninguna de las 82 rutas ni en los 14 estados profundos cubiertos. El QA visual responsive más reciente añadió las fichas canónicas de Nivora, Terrava y Aurem ES/EN a 1440 × 1000 y 390 × 844: las doce capturas conservaron jerarquía y límites visibles, imágenes responsivas correctas, cero overflow, cero recursos rotos y cero errores de consola. La matriz de reflow a 320 px y texto al 200 % continúa verde; Automatizaciones y Copiloto conservan rutas y pruebas independientes.

## Evidencia reproducible

```bash
pnpm exec playwright test tests/e2e/accessibility.spec.ts
pnpm check
pnpm e2e
pnpm peers check
```

Resultado verificado el 2026-09-04: la puerta global pasa 112/112 E2E, incluida la cobertura axe, landmarks, reflow a 320 px y texto al 200 % de Canales, `automations`, `automation` y las doce fichas web. La ampliación de P6 detectó una precarga inexistente de 1280 px en los tres casos canónicos; se alineó con sus assets 640/960/1600 antes del barrido final. `pnpm check` completa 7/7 tareas de lint, 21/21 tareas de typecheck/pruebas/build, 18/18 pruebas del site, 79/79 del Worker y 18/18 pruebas operativas.

## Deuda y siguiente revisión

- Probar recorridos completos con VoiceOver y al menos otro lector de pantalla representativo.
- Revisar manualmente los modos de alto contraste del sistema y del navegador.
- Validar con personas el lenguaje, orden de lectura y comprensión de los siete flujos profundos.
- Repetir Lighthouse móvil y las matrices de reflow/foco cuando cambien layout, tipografía o componentes interactivos.
- Repetir la revisión manual cuando cambien navegación, formularios, overlays, tokens de color o componentes interactivos.
