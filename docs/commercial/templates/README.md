# Kit comercial versionado

Este directorio contiene las plantillas internas de resumen de diagnóstico, seguimiento y propuesta. La versión activa es `1.0.0` y su contrato está en `manifest.json`.

## Reglas de uso

1. Parte únicamente de información confirmada en una solicitud o conversación real; no inventes objeciones, integraciones, clientes ni resultados.
2. Usa solo los planes `Básico`, `Gestión` o `Inteligente`. La escala aporta contexto de implantación, no decide el plan.
3. Distingue siempre hecho confirmado, hipótesis, pregunta abierta, evidencia ficticia y alcance propuesto.
4. Conserva un único siguiente paso con responsable y fecha o condición verificable.
5. No incluyas datos de huéspedes, credenciales, secretos o PII innecesaria. No copies el documento generado al repositorio.
6. No envíes seguimiento promocional sin consentimiento aplicable. Responder a una solicitud y mantener marketing adicional son finalidades distintas.
7. No publiques precios hasta superar la puerta de 15 entrevistas cualificadas y 5 propuestas reales. Cada propuesta debe revisarse humanamente antes de enviarse.

## Uso de la CLI

Lista y valida el kit sin leer datos:

```bash
pnpm commercial:template -- --list
pnpm commercial:template -- --validate
```

Renderiza un ejemplo inequívocamente ficticio:

```bash
pnpm commercial:template -- --template diagnostic-summary --example
```

Para un caso autorizado, pasa un objeto JSON por entrada estándar. La CLI no escribe archivos ni hace peticiones; el Markdown se devuelve por salida estándar. Los nombres de campo requeridos se consultan con `--list`.

```bash
pnpm commercial:template -- --template follow-up < /ruta/segura/datos.json
```

La entrada debe contener exactamente los campos obligatorios del manifiesto. Todos son texto; las listas se redactan como Markdown. Un token ausente, vacío o desconocido detiene el renderizado. Redirigir la salida a un archivo es una decisión operativa: guárdalo fuera del repositorio y aplica la política de conservación correspondiente.

## Versionado

- Un cambio editorial compatible incrementa la versión menor.
- Quitar o renombrar tokens, cambiar el propósito o alterar salvaguardas incrementa la versión mayor.
- Cada nueva versión actualiza el manifiesto, los tres marcadores de plantilla, las pruebas y el registro del playbook.
- Las versiones antiguas se conservan solo si existen propuestas abiertas que dependan de ellas; deben marcarse como retiradas y no usarse para casos nuevos.

## Antes de enviar

- Confirma contexto, plan y capacidades con la persona interesada.
- Abre cada evidencia citada y comprueba que demuestra exactamente lo descrito.
- Revisa alcance incluido, exclusiones, dependencias y criterios de aceptación.
- Elimina cualquier afirmación sin fuente y cualquier dato personal no necesario.
- Verifica que el siguiente paso tiene responsable y fecha o condición.
- Registra la versión de plantilla usada y conserva la aprobación humana.
