# Logic Estancia — contrato visual

Fuente: referencia Steep aportada el 14-08-2026. El sistema de Logic Estancia usa papel blanco, tinta casi negra, grises fríos y un único acento peach. Las webs Nivora, Terrava y Aurem tienen identidades propias.

- Display: Source Serif 4, peso 400, con cursiva editorial puntual.
- UI y cuerpo: Inter Variable, pesos 400–500.
- Colores: `#17191c`, `#ffffff`, `#f2f2f3`, `#fafafb`, `#777b86`, `#fbe1d1`, `#5d2a1a`.
- Tarjetas: 24 px. Artefactos elevados: 20 px. Inputs: 16 px. Botones: píldora.
- Solo los artefactos de producto reciben sombra.
- Máximo un bloque peach por página.
- Contenedor: 1200 px. Ritmo vertical: 80 px.

## Home · rediseño editorial (rama `rediseno-home`, 2026-09-26)

La home carga una hoja propia, `apps/site/src/styles/home.css`, acotada bajo `.lx` (envoltorio de `Landing.astro`). El resto de la superficie comercial conserva su contrato.

- Paleta de la home: bosque `#15281d`, verde principal `#294832`, musgo `#4c7050`, salvia `#e7eee1`, crema `#f7f5ee`, arena `#f2ebe1`, melocotón `#f5d8c5` y arcilla `#9b4f2b` (solo texto pequeño con contraste AA).
- Tipografía: Source Serif 4 con su cursiva real para un único acento por titular (`em`); Inter para UI.
- Cabeceras de sección partidas: eyebrow con filete, titular a la izquierda, entrada y acción a la derecha.
- Tarjetas de 24–30 px con borde interior en lugar de sombra; la elevación aparece solo al pasar el cursor.
- Escenarios de producto sobre trama de puntos y degradado salvia-arena; los mockups flotan con sombra larga.
- El hero añade señales de producto flotantes (solicitud, planning semanal, llegada preparada) marcadas como demo y ocultas a tecnologías de apoyo.
- Movimiento: entrada del hero, revelado al hacer scroll y microinteracciones. Solo transformaciones, nunca opacidad sobre texto, y todo se desactiva con `prefers-reduced-motion`.
