# R0 · Baseline comercial y demostrativa · 2026-09-18

## Alcance y contraste

Estado: **cerrado y verificado**. SHA de producto `d10dd5580e626e715e577e609bee1d82cb112db8`.

Base `b84f4c071958f4d4f79618724fb3b4194d830456`, rama `main`, junto al trabajo local de UI/UX del 7 de septiembre y la investigación del 14. R0 seguía pendiente: el aviso y el detalle de conexiones habían desaparecido y el contrato Camp esperaba `/webs/:slug/` en enlaces que ahora llevan a `/temas/:slug/`. También faltaban las 24 fichas de temas en la matriz SEO y se perdía la procedencia al solicitar un tema. Se conserva el trabajo previo; no se rehace el catálogo ni se inicia R1.

Tarea del visitante: entender el estado real de conexiones, revisar una dirección visual y solicitar información conservando su contexto. Nivel acreditado: comercial y demostrativo local; ninguna nueva capacidad operacional. No se afirma mejora de conversión medida.

## Resultado

- Aviso ES/EN visible antes de las marcas; cada gráfico dice «Referencias · sin conexión». No se afirma integración ni colaboración. Cero proveedores del alojamiento validados o activados.
- Detalle progresivo mediante `ConnectionRequirements`, que reutiliza grupos de capacidades, cinco registros, diez puertas de validación y expedientes de pago/datos del dominio. Funciona con HTML nativo; no introduce proveedor, endpoint, credencial o activación.
- `/webs/` conserva el catálogo; `/temas/:slug/` explica el diseño y su adaptación; `/webs/:slug/` conserva el caso editorial ficticio. Las dos familias tienen contenido diferente, canonical propio y traducciones reales. Las 24 fichas nuevas se comprueban en sitemap, canonical/hreflang, títulos/descripciones únicos y headings útiles. Demos y variantes `?embed=theme` permanecen noindex.
- Ficha y diálogo de tema muestran el límite fuera del iframe. El CTA conserva tema, plan y procedencia cerrada; el formulario deriva plan/tipo del catálogo, permite editarlos y solo acepta procedencias conocidas. Un diagnóstico explícito tiene prioridad. Texto libre y procedencia arbitraria no se aceptan desde URL.
- La regresión amplia detectó además límites retirados en hero, catálogo, soluciones y paneles, y la comparación detallada de capacidades ausente en planes. Se recuperan los avisos y las evidencias contractuales (con detalle progresivo en planes/soluciones), conservando la tabla resumida y el diseño anterior. Se actualizan únicamente las expectativas de destino/contacto que habían quedado obsoletas.
- En previews de casos editoriales, el shell comercial y las cookies quedan fuera del iframe; la navegación interior conserva solo el caso. El runtime de preview no consulta el manifiesto. Las acciones comerciales quedan en la ficha/diálogo exterior.
- La ficha inglesa desbordaba 15 px a 320 px por el mínimo intrínseco de la columna y una palabra larga en el heading. Se corrige la causa con columna flexible, mínimo cero y salto de palabra; no se oculta el overflow.
- La FAQ hotelera de IA y su JSON-LD aclaran que se revisa un borrador ficticio sin proveedor ni envío. Las superficies de capacidades recuperadas se protegen del contacto flotante. Se elimina la opacidad de entrada del banner de cookies para preservar contraste desde el primer frame, manteniendo el movimiento reducido.
- La QA descubrió fallos reales en dos fuentes públicas Poppins dentro del origen opaco. Se habilita CORS únicamente para esos dos nombres exactos, además de assets Astro existentes, con MIME correspondiente, GET/HEAD y respuesta correcta; nunca credenciales. Se amplían las pruebas negativas. Sandbox, CSP, noindex y captación única conservan sus restricciones.

## Revisión multidisciplinar

Encuadre previo: marketing exige veracidad junto a marcas; producto preserva planes/capacidades; UX exige acceso progresivo y recorrido completo; UI revisa legibilidad/reflow; SEO distingue intención de las dos familias; frontend reutiliza contratos; full stack conserva fronteras; QA aplica ES/EN, teclado, texto ampliado, aislamiento y ausencia de escrituras. Una revisión independiente identifica las brechas de contexto y límites en temas; otra pasada revisa el resultado y los cambios Worker/Base.

- Marketing: **corregido** — marcas y demos con límites visibles, sin cifras comerciales inventadas.
- Producto: **correcto** — Básico/Nivora sin gestor, Gestión/Terrava e Inteligente/Aurem conservados; no se duplica producto previo.
- UX: **corregido** — requisitos desplegables, preview utilizable y contexto editable hasta formulario único.
- UI: **corregido** — aviso legible, límites próximos a acciones, fuentes recuperadas y shell comercial fuera de previews.
- SEO: **corregido** — rutas y metadatos coherentes; previews siguen fuera de indexación.
- Frontend: **corregido** — componentes/contratos reutilizados; ninguna dependencia nueva ni hidratación para requisitos.
- Full stack: **correcto** — revisión independiente sin bloqueantes; CORS público acotado y pruebas negativas; ningún proveedor activado.
- QA/accesibilidad/rendimiento/confianza: **corregido** — check correcto, 191 casos únicos verificados y cierre focal 66/66; deuda humana explícita.

## Verificación final

- `pnpm check`: 7/7 lint (6 cacheadas), 21/21 tareas combinadas (15 cacheadas), 33 scripts ejecutados. 181 pruebas acreditadas: site 24, Worker 95, dominio 20, dashboard 7, web 2 y scripts 33. Build de 100 páginas comerciales y 10 demos.
- Segunda suite completa: 190/191; detecta contraste durante entrada del aviso de cookies. Corregido eliminando la opacidad de entrada, sin retirar aserciones.
- Cierre con código final: **66/66**, en 2,3 min: accesibilidad 23, Camp 8, pulido comercial 19, capacidad/FAQ 1, R0 8 y SEO 7. Los **191 casos únicos** están verificados entre regresión y cierre; no se afirma una ejecución única final de 191/191.
- QA visual en navegador y capturas: home, conexiones, validación abierta, fichas ES/EN 320/390/1440 px y tabla detallada de planes. Axe, teclado, retorno de foco, reflow y texto al 200 % correctos. Sin escrituras desde demos; solicitud comercial interceptada.
- Logs: `/tmp/estancia-r0-closure-check.log`, `/tmp/estancia-r0-closure-e2e.log`; capturas `/tmp/estancia-r0-closure-results/`. Estos artefactos son temporales; los contratos, tests y este informe son la evidencia persistente. `git diff --check` correcto.

## Evidencia y deuda

Las pruebas comerciales interceptan manifiesto y `/api/leads`; no envían correo. La primera prueba nueva asumió erróneamente que Nivora era rural: se corrigió la expectativa a apartamento, según el catálogo, sin cambiar el producto. Los fallos de fuentes son de producto y se corrigieron manteniendo aserciones. La primera regresión completa quedó en 182/191: ocho fallos de contratos/límites previos y el desbordamiento inglés de 320 px. Es evidencia intermedia, no resultado de cierre.

QA de texto ampliado al 200 % no equivale a zoom nativo del navegador. El intento de zoom nativo con Chrome quedó bloqueado por falta de permisos de automatización del sistema; no se presenta como ejecutado. Siguen pendientes dispositivo físico, lectura humana con tecnologías de asistencia y comprensión con usuarios. No hay nueva puntuación Lighthouse. El incremento reutiliza imágenes y fuentes locales, mantiene iframe diferido y no añade dependencias.

Bloqueos externos conservados: quince entrevistas y cinco propuestas, validación de disposición a pagar/margen, proveedores, GTM/medición real, revisión humana de accesibilidad y cualquier piloto/producción. No se ha desplegado ni activado proveedor, CRM, analítica o comunicaciones reales.

Siguiente incremento: **R1**, revisión acotada de hero, entrada al recorrido, fichas de plan y primera solución, conectando una pregunta concreta con evidencia existente y CTA de evaluación con contexto allowlisted. Reutilizar las cinco etapas del recorrido y los tres casos canónicos. Las cinco sesiones cualitativas son trabajo humano pendiente.
