# Logic Estancia · Consejo multidisciplinar de producto

Logic Estancia no se desarrolla únicamente como software. Cada decisión debe sostener simultáneamente el producto, la experiencia, la adquisición, la operación técnica y la credibilidad comercial.

Este consejo es una revisión obligatoria para cada incremento. Los perfiles son perspectivas de trabajo: una misma persona o agente puede ejercer varias, pero ninguna debe omitirse sin registrar `no aplica` y explicar por qué.

## Perfiles y responsabilidad

### Estrategia de marketing

- Comprueba segmento, problema, propuesta de valor, diferenciación y objeción resuelta.
- Exige evidencia para cada promesa, CTA y argumento comercial.
- Evalúa si el cambio acerca a diagnóstico, reunión, propuesta o proyecto firmado.
- Evita competir principalmente por precio o utilizar IA como reclamo vacío.

### Diseño de producto

- Comprueba que el cambio resuelve una necesidad prioritaria y encaja en Básico, Gestión o Inteligente.
- Mantiene coherencia entre web comercial, diagnóstico, capacidades y demostraciones.
- Define estados, límites, dependencias y evolución futura antes de añadir superficie.
- Evita funciones sin evidencia comercial o caminos que no conduzcan a un resultado útil.

### UX

- Recorre la tarea completa desde la intención inicial hasta su resultado y recuperación.
- Revisa arquitectura de información, lenguaje, carga cognitiva, feedback, errores y reversibilidad.
- Comprueba teclado, móvil, lectores de pantalla, foco y ausencia de bloqueos innecesarios.
- Diferencia claramente lo real, lo simulado, lo futuro y lo que requiere validación.

### UI y dirección visual

- Revisa jerarquía, composición, tipografía, color, espaciado, consistencia y estados interactivos.
- Mantiene una identidad editorial calmada, diferenciada y adecuada al alojamiento demostrado.
- Comprueba responsive, contraste, densidad de información y acabado visual en estados vacíos, error y éxito.
- Evita componentes genéricos, ruido decorativo y variaciones sin sistema.

### SEO

- Valida intención de búsqueda, utilidad, unicidad, semántica y enlaces internos.
- Revisa `title`, descripción, headings, canonical, `hreflang`, sitemap y datos estructurados.
- Protege indexación: páginas comerciales indexables y demos excluidas con `noindex`.
- Considera rendimiento, accesibilidad y traducción solo cuando exista interés validado.

### Arquitectura frontend

- Protege fuentes únicas de verdad, límites entre paquetes, reutilización y consistencia de tipos.
- Revisa hidratación, estado local, migraciones, rendimiento, tamaño de bundle y resiliencia responsive.
- Evita duplicación entre escenarios, dependencias innecesarias y lógica de dominio dispersa.
- Exige componentes mantenibles y contratos estables para contenido, planes, capacidades y eventos.

### Ingeniería full stack

- Revisa validación, seguridad, privacidad, secretos, idempotencia, rate limiting y tolerancia a fallos.
- Comprueba contratos de API, integraciones, observabilidad, reintentos y recuperación manual.
- Mantiene fuera del cliente las credenciales y fuera de GA4 cualquier PII o valor libre.
- No convierte una simulación en operación externa sin alcance, consentimiento y pruebas específicos.

### Controles transversales

- QA verifica caminos principales, regresiones, estados límite y compatibilidad ES/EN.
- Accesibilidad aplica WCAG 2.2 AA a las rutas y flujos relevantes.
- Rendimiento impide regresiones injustificadas y prioriza experiencia móvil.
- Confianza comercial bloquea afirmaciones, precios, logos, testimonios o integraciones no demostrables.

## Flujo obligatorio de revisión

1. **Encuadre:** definir usuario, problema, resultado comercial esperado y métrica afectada.
2. **Revisión previa:** cada perfil identifica riesgos, requisitos o indica `no aplica` con motivo.
3. **Decisión:** ordenar los hallazgos y elegir el incremento mínimo que produzca un resultado completo.
4. **Implementación:** construir sin ampliar silenciosamente el alcance.
5. **Revisión posterior:** recorrer el resultado con todos los perfiles y corregir los hallazgos bloqueantes.
6. **Verificación:** ejecutar pruebas, QA visual y controles de seguridad/privacidad proporcionados al riesgo.
7. **Checkpoint:** registrar resultado, deuda aceptada, evidencia, siguiente prioridad y estado por perfil.

## Orden para resolver conflictos

1. Veracidad comercial, legalidad, seguridad, privacidad y prevención de pérdida de datos.
2. Accesibilidad y capacidad real del usuario para completar el recorrido.
3. Valor del producto y resultado comercial medible.
4. Coherencia de experiencia, marca y arquitectura.
5. Velocidad de entrega y conveniencia técnica.

No se considera “perfecto” aquello que solo parece terminado. Un incremento está listo cuando no quedan problemas críticos conocidos, sus límites son explícitos, la evidencia coincide con la promesa y la deuda restante está documentada.

## Plantilla para el checkpoint

```md
### Revisión multidisciplinar

- Marketing estratégico: correcto | corregido | no aplica | pendiente — motivo.
- Diseño de producto: correcto | corregido | no aplica | pendiente — motivo.
- UX: correcto | corregido | no aplica | pendiente — motivo.
- UI/dirección visual: correcto | corregido | no aplica | pendiente — motivo.
- SEO: correcto | corregido | no aplica | pendiente — motivo.
- Arquitectura frontend: correcto | corregido | no aplica | pendiente — motivo.
- Full stack: correcto | corregido | no aplica | pendiente — motivo.
- QA/accesibilidad/rendimiento/confianza: correcto | corregido | no aplica | pendiente — motivo.
```
