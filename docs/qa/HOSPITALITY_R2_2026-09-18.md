# Hospitality R2 · Solicitud comercial más breve

Fecha: 2026-09-18. SHA de producto: `2418a521ef03d7369bd148e3c035df45757bbbe1`. Alcance: presentación y recuperación del formulario único ES/EN. Sin cambios de obligatoriedad, API, proveedores o despliegue. La validación humana y la conversión real siguen pendientes.

## Decisión y referencia

El checkpoint y el código confirman R0/R1 cerrados. Se corrige la sección 9 del roadmap, que todavía solicitaba R1 pese a su cierre. Se continúa R2; no se reconstruye el catálogo ni el recorrido.

Se han revisado de nuevo la home, el popup de L’Olivar, el popup de Planning y la entrada/primera etapa del recorrido público de [Camp](https://camp.logic2b.com/). La preview amplia, una acción principal y el detalle progresivo siguen siendo referencias útiles. No se copian sus recursos ni promesas; tampoco su recorrido temporizado. La base R1 ya aplica esos principios a temas y paneles propios.

No se necesitan recursos visuales nuevos para este incremento: se conserva la fotografía de Nivora generada con OpenAI en R1. **Cero generaciones nuevas de imagen/vídeo y cero llamadas a Higgsfield.**

## Resultado

- Contacto esencial visible: nombre, empresa/alojamiento y email.
- Un solo bloque de alojamiento: tipo, plan, propiedades, unidades y plazo. Entrada directa o tema lo muestran abierto; diagnóstico válido lo resume con los valores actuales. Al abrir, desaparece el resumen para evitar repetición.
- Plan sin elegir: «Aún no lo sé» / «Not sure yet». Teléfono y mensaje son opcionales. Si un tema prepara un mensaje, el grupo opcional se abre para revisarlo.
- El diagnóstico solo lista las respuestas adicionales: situación actual, capacidades, inversión y evidencias. Una indicación visible en el grupo cerrado avisa de que se adjuntarán y permite descubrir su revisión/retirada.
- Retirar el diagnóstico elimina adjuntos, contexto de sesión y marcador de URL; conserva contacto y valores editados. Se abre el alojamiento, se enfoca el tipo y se confirma qué se conserva.
- Cualquier grupo con un campo inválido se abre antes de la validación nativa. La protección frente a doble envío permanece activa durante la petición y el tiempo de espera de un 429.
- Introducción más corta, menos texto repetido y jerarquía móvil más compacta. No se añaden pasos, eventos analíticos, persistencia de PII ni formularios.

## Revisión del consejo

Encuadre: facilitar que quien ya ha explorado una web, un panel o el diagnóstico pida información sin repetir su contexto. Métricas a observar tras activación autorizada: inicio→entrega y calidad de solicitud; no se atribuye mejora real a la reducción visual.

| Perfil | Revisión previa | Resultado |
|---|---|---|
| Marketing | Siguiente paso claro, sin nueva promesa ni fricción. | Corregido: mensaje breve, contacto visible y una acción de envío. |
| Producto | Mantener capacidades/planes, una sola captación y diagnóstico opcional. | Correcto: no cambia el alcance ni los tres planes. |
| UX | Evitar duplicación, conservar ediciones y permitir recuperación. | Corregido: resumen actual, descarte explícito y apertura de errores. |
| UI/dirección visual | Jerarquía calma, móvil legible, detalles progresivos. | Corregido: introducción compacta y grupos consistentes. |
| SEO | Preservar intención, semántica y rutas. | Correcto: metadatos y rutas intactos; fieldset/legend en contacto. |
| Frontend | Reutilizar controles y contratos, evitar fuentes duplicadas. | Corregido: resumen derivado del formulario, sin dependencias nuevas. |
| Full stack | Payload, idempotencia, consentimiento y aislamiento. | Correcto: contrato intacto; bloqueo adicional de envíos concurrentes. |
| QA/accesibilidad/rendimiento/confianza | Teclado, reflow, errores, ES/EN y veracidad. | Corregido: 77 casos únicos y cierre visual 6/6; foco/cierre y límites verificados. |

La revisión independiente detectó que las respuestas adicionales quedaban sin aviso visible al plegar el contexto; se añadió la indicación explícita. La QA móvil detectó demasiado espacio antes de los campos; se redujeron introducción y título. Las aserciones antiguas se adaptan a la interacción de abrir los grupos, conservando comprobaciones de envío y privacidad.

## Verificación

- `pnpm check` final correcto: lint 7/7 (6 tareas cacheadas); typecheck/test/build 21/21 (15 cacheadas); 33 pruebas de scripts. Contratos: 31 site + 95 Worker + 20 dominio + 7 dashboard + 2 web + 33 scripts = **188 pruebas**. Astro revisa 118 archivos sin errores, avisos ni hints. No se afirma que las tareas cacheadas se hayan ejecutado de nuevo.
- **27/27 E2E focales**: 16 casos nuevos R2, continuidad R1, diagnóstico, captación única, recibos ES/EN, 429 y timeout/reintento con payload preservado.
- **50/50 E2E de regresión**: analítica/consentimiento/PII, Camp, límites demo y manifiesto, R0/tema y previews de temas/paneles. **77 casos únicos**, no toda la suite del repositorio.
- **6/6 de cierre visual**, después de corregir la barra de cierre: ES/EN a 320, 390 y 1440 px, Axe WCAG 2.2 AA, teclado, texto al 200 %, reflow del documento/formulario y límites geométricos del botón. Se abre un grupo cerrado con datos inválidos al 200 % y se comprueba que el campo enfocado queda visible bajo la barra.
- La inspección de capturas detectó clipping interno del cierre a 320 px/texto 200 % que no aparecía en el control global de overflow. Corregido mediante ancho flexible de etiqueta y botón sin salto de línea; barra abreviada a «Contacto» / «Contact». Se añadió la aserción geométrica; los seis casos vuelven a pasar.
- QA visual en navegador a 320/390 px, resumen y opcionales; capturas de escritorio y controles expandidos. Sin correos reales: las pruebas de entrega interceptan capacidades y `/api/leads`. El estado comercial activo de las capturas es **simulado mediante mocks**.
- ESLint de las pruebas finales y `git diff --check` correctos. Puertos propios 8794/9244. Logs: `/tmp/estancia-r2-verified-check.log`, `/tmp/estancia-r2-final-e2e.log`, `/tmp/estancia-r2-regression-e2e.log`, `/tmp/estancia-r2-visual-e2e.log`. Capturas finales: `/tmp/estancia-r2-visual-results/`.

Una primera corrida se interrumpió para corregir expectativas de copy y un intento de rechazar cookies detrás del modal, sin modificar contratos para ocultar fallos. Una primera captura de elemento recortaba el formulario dentro del diálogo; se sustituyó por capturas del viewport real. Los resultados anteriores de 27/27 y 50/50 preceden al último ajuste exclusivo de barra; los 6/6 finales verifican ese ajuste con nuevas comprobaciones de geometría y foco.

### Capturas persistentes

- [Contacto en escritorio, ES 1440](assets/hospitality-r2-2026-09-18/contact-es-1440.png).
- [Entrada en móvil, ES 390](assets/hospitality-r2-2026-09-18/contact-es-390.png).
- [Contexto editable, ES 390](assets/hospitality-r2-2026-09-18/context-es-390.png).
- [Error enfocado, ES 320 y texto 200 %](assets/hospitality-r2-2026-09-18/invalid-es-320-200.png).
- [Contacto EN 320 y texto 200 %](assets/hospitality-r2-2026-09-18/contact-en-320-200.png).

## Límites y siguiente incremento

No se han enviado correos de QA ni activado GA4, HubSpot, proveedores o producción. Ninguna demo realiza operaciones externas. Sin nueva puntuación Lighthouse. Siguen pendientes dispositivos físicos, zoom nativo, lectores de pantalla y cinco sesiones humanas de comprensión; quince entrevistas y cinco propuestas reales para validar precios/margen.

Siguiente: R3, un caso ficticio completo de Terrava, desde solicitud con conflicto hasta alternativa, estancia, modificación y cancelación. Solicitud, planning y detalle deben compartir una colección en memoria; no introducir persistencia, datos reales ni servicios externos.
