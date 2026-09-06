# Revisión del catálogo de temas · 2026-09-05

## Alcance y criterio

Revisión solicitada de los doce temas, las tres demos de alojamiento, su presentación en el catálogo y las vistas previas de portada. Se conserva la identidad de cada marca ficticia y la separación Nivora/Básico, Terrava/Gestión y Aurem/Inteligente. Los nueve conceptos restantes muestran dirección visual, no una operación de alojamiento terminada.

Base de Git: `fd570b215241a81ef4ce2f5384c7b13c8f174a74`, rama `main`. El árbol ya contenía la revisión comercial anterior sin confirmar; se conserva. Esta revisión no publica producción ni realiza operaciones externas.

## Revisión previa

- Marketing: hacer comparables los temas, conservar el siguiente paso comercial y el carácter ficticio.
- Producto: mantener doce direcciones, tres demos canónicas, planes y límites de evidencia.
- UX: recorrer navegación interna, acceso a demos, filtros, vistas previas, retorno de foco y escenarios locales.
- UI: corregir escala tipográfica, interlineado, ritmo, encuadre fotográfico y continuidad entre desktop y móvil.
- SEO: conservar páginas comerciales indexables, ES/EN y demos excluidas.
- Frontend: aplicar reglas comunes acotadas al catálogo, sin cambiar dependencias ni contratos de datos.
- Full stack: conservar CSP, sandbox, aislamiento local y formulario comercial único.
- QA transversal: reflow, contraste, zoom de texto, orientación horizontal, carga de imágenes y regresiones.

## Hallazgos y correcciones

| Hallazgo | Corrección |
| --- | --- |
| Velares alcanzaba 557 px de ancho en pantalla de 320 px; Riscoa 408, Solerna 442 y la demo Nivora 483. | Columnas `minmax(0, 1fr)`, mínimos de contenido eliminados y cortes de texto seguros. |
| Nocta desbordaba en tablet; la marca global también podía alcanzar 327 px al ampliar texto al 200 %. | Composición apilada en tablet y logotipo flexible que conserva ambos enlaces. |
| Interlineado de titulares de hasta 0,83 y textos de 9–11 px. | Titulares con interlineado de 1,02–1,12, cuerpo principal de 16 px y controles/etiquetas habituales de 14 px; metadatos secundarios desde 12 px. |
| Navegación blanca sobre fotografías de luminosidad variable. | Velo superior en escritorio y cobertura mínima del 60 % en móvil para proteger la lectura sobre las zonas claras. |
| Navegación del alojamiento y del concepto ocultas en móvil. | Enlaces internos visibles, adaptables y de al menos 44 px de altura. |
| Imágenes editoriales de las demos no ocupaban la altura reservada y dejaban huecos. | Marco de imagen explícito, `picture` ocupando el marco y proporción 4:3 en móvil. |
| Etiqueta del plan posicionada sobre el contenido del hero. | Etiqueta dentro del flujo: la altura responde al contenido y al idioma. |
| Fotos del catálogo sin selección responsive AVIF. | `picture` con variantes de 640/960 px y fallback WebP; carga diferida y proporción reservada conservadas. |
| “City apartment”, “Rural homes” y “Independent hotel” dentro de las demos ES. | Categorías localizadas. |
| Dos accesos de escritorio con el mismo “Ver panel demo” y destinos distintos. | Acceso directo identificado como “Abrir gestor” / “Open workspace”. |
| Etiqueta de caso ficticio perdida en las miniaturas de la revisión anterior. | Pie visible de miniatura con carácter ficticio y plan; se conserva la prueba original. |
| El texto introductorio de guías había perdido el nombre del producto. | Referencia breve a las demos de Logic2B Estancias, coherente con su destino desde las fichas. |

## Coherencia de las imágenes

Se inspeccionaron las doce fotos principales y las tres editoriales de las demos. No se sustituyeron ni generaron imágenes. Las fotografías son recursos locales de escenarios ficticios; no acreditan alojamientos o clientes reales.

| Tema | Correspondencia visual revisada |
| --- | --- |
| Nivora One | Apartamento urbano, luz interior, materiales cálidos; continuidad con la foto editorial de interior. |
| Terrava Collection | Arquitectura rural, umbral hacia el paisaje y espacio de convivencia interior. |
| Aurem Hotel | Recepción contemporánea, madera oscura y continuidad con la habitación. |
| Linde Casa | Piedra, olivos y paisaje seco. |
| Cobalto Stays | Apartamento, escritorio y balcón abierto a la ciudad. |
| Oria Hotel | Recepción luminosa, cal y apertura hacia vegetación/luz exterior. |
| Boscara Finca | Finca de piedra, bosque y niebla. |
| Velares Apartamentos | Patio mediterráneo, árbol y galerías habitadas. |
| Nocta Hotel | Meseta al anochecer, arquitectura horizontal y luz cálida contenida. |
| Riscoa Casas | Casas de madera/granito, vegetación húmeda y ladera. |
| Solerna Apartamentos | Interior cálido, umbral y tejados históricos. |
| Cendra Hotel | Patio de ladrillo, metal y vegetación de carácter industrial. |

Las variantes AVIF de 640 px de las doce portadas ocupan aproximadamente 12–56 KiB cada una en disco. Esta comprobación de recursos no equivale a un resultado Lighthouse ni a una medición de red real.

## Matriz reproducible

`tests/e2e/theme-catalog.spec.ts` cubre 30 rutas: las 24 fichas ES/EN y las seis demos de alojamiento ES/EN. Cada ruta se recorre a 320×740, 360×800, 390×844, 430×932, 768×1024, 844×390, 1024×768 y 1440×1000. También se prueba texto al 200 % a 320 px.

Comprueba: respuesta 200, un main y un h1, ausencia de desbordamiento horizontal y recortes del hero, Axe WCAG 2.2 AA en 320/1440, navegación interna visible y pulsable, carga de todas las imágenes, ajuste de las fotos a su marco y ausencia de errores JavaScript. Las 24 vistas previas se abren en móvil, conservan `sandbox="allow-scripts"`, se cierran con botón/Escape y devuelven el foco.

```sh
pnpm check
pnpm exec playwright test tests/e2e/theme-catalog.spec.ts
CATALOG_SCREENSHOTS=1 pnpm exec playwright test tests/e2e/theme-catalog.spec.ts --output=/tmp/estancia-theme-final
pnpm exec playwright install webkit
pnpm exec playwright test --config playwright.catalog.config.ts --project=webkit
```

El entorno local conserva su configuración de virtual store con `pnpm_config_verify_deps_before_run=warn`; no se ha cambiado el lockfile. La validación adicional WebKit utiliza el navegador de Playwright descargado bajo `/tmp/estancia-browsers`, con la configuración opcional `playwright.catalog.config.ts`. No se modifica la matriz habitual de CI ni se instala un navegador del sistema.

## Resultado de verificación

- `pnpm check`: correcto. Siete tareas de lint y 21 de typecheck/test/build; 166 pruebas unitarias y operativas; Astro sin errores ni warnings.
- Chromium: **32/32** casos de catálogo correctos. Incluye 240 combinaciones ruta/viewport, 30 pruebas de texto al 200 %, 60 análisis Axe y las 24 aperturas de vista previa ES/EN.
- WebKit: **32/32** casos correctos con la misma matriz. Ambos motores conservan el reflow y los controles de navegación.
- Regresiones existentes: **27 casos únicos verificados** entre la primera ejecución y las correcciones focales. Incluyen planes canónicos, catálogo/filtros, enlaces, imágenes diferidas, aislamiento de las diez rutas demo, Nivora reversible, editor local de Terrava y SEO. La primera pasada detectó dos regresiones de contenido de la revisión anterior y un timeout de una prueba SEO que agrupa todas las rutas; se corrigieron los contenidos y el bloque SEO pasó con presupuesto de 120 segundos. No se relajaron sus aserciones.
- Capturas: 60 páginas completas ES/EN en `/tmp/estancia-theme-final`; hojas de contacto de las quince superficies españolas y revisión directa de los encabezados ingleses. La última protección de contraste de la navegación se contrasta de nuevo en las rutas fotográficas claras.
- Cierre focal tras los últimos ajustes: **7/7** pruebas correctas de home, etiquetas canónicas, imágenes diferidas y las fichas claras de Linde/Oria ES/EN.
- La suite monolítica completa no se presenta como ejecutada. El límite temporal por caso permanece en la suite de catálogo y el segundo motor es optativo en CI.

Logs: `/tmp/estancia-themes-check-final.log`, `/tmp/estancia-themes-final.log`, `/tmp/estancia-themes-webkit-final.log`, `/tmp/estancia-themes-regression.log` (incluye los fallos corregidos) y `/tmp/estancia-themes-closing.log`. Los logs y las capturas son artefactos locales temporales; las pruebas y este informe quedan en el proyecto.

## Límites de la evidencia

Revisión visual de escritorio y móvil con capturas locales de las quince superficies españolas y capturas de las treinta rutas ES/EN. Navegadores automatizados en macOS con tamaños de viewport y texto ampliado; no equivale a una revisión en hardware iPhone/Android ni con un lector de pantalla humano. No se afirma perfección universal ni una puntuación nueva de rendimiento. Las demos siguen siendo locales, ficticias y sin reservas, pagos, envíos, sincronizaciones o CRM.


## Revisión posterior y continuidad

Marketing, producto, UX, UI, SEO, frontend, full stack y QA se revisaron de nuevo. No quedan fallos bloqueantes conocidos dentro de la matriz ejecutada. Se mantienen como límites de evidencia los dispositivos físicos, la revisión humana con lector de pantalla y las mediciones de rendimiento en condiciones controladas. No se cambia ningún proveedor ni la política de consentimiento.

Capturas de cierre local en `test-results/catalog-review/`: escaparate móvil y Oria en móvil/escritorio. Este directorio está excluido de Git, igual que el resto de artefactos de pruebas.

Siguiente paso: revisión visual del usuario y consolidación del árbol de trabajo existente; no añadir temas ni operaciones a partir de esta auditoría. El checkpoint de continuidad identifica el estado y los bloqueos estratégicos restantes.
