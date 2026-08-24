# Logic Estancia · Contrato técnico de demo y captación comercial

Este documento define la frontera obligatoria entre la demo comercial pública y cualquier despliegue con operaciones reales. Es un contrato de seguridad, producto y comunicación: una pantalla o una tabla no prueban que una capacidad esté activa.

> **Visible en la demo no significa activo en producción.** La demo explica el producto con fixtures y estados ficticios, pero no cobra, publica, sincroniza, crea usuarios ni modifica sistemas reales. La única excepción es la captación de leads para Logic Estancia desde sus landings comerciales, bajo una allowlist independiente y verificable.

## Regla de activación fail-closed

El modo efectivo se calcula en servidor antes de leer cuerpos de petición, acceder a almacenamiento o resolver un proveedor:

```text
product_operations_allowed =
  DEMO_MODE === "false" &&
  REAL_OPERATIONS_ENABLED === "true"

commercial_lead_allowed =
  COMMERCIAL_LEADS_ENABLED === "true" &&
  EMAIL_PROVIDER_MODE === "resend" &&
  LEADS_TRANSPORT === "resend" &&
  Resend configuration is complete and valid
```

- `DEMO_MODE`: solo el valor literal `false` permite evaluar un modo real. Ausente, vacío, `true` o cualquier otro valor significa demo.
- `REAL_OPERATIONS_ENABLED`: segunda autorización para operaciones de producto; solo cuenta con `DEMO_MODE=false`.
- `COMMERCIAL_LEADS_ENABLED`: allowlist independiente. Solo el literal `true` permite evaluar la entrega de leads comerciales desde el formulario único de la landing principal, incluso si `DEMO_MODE=true`. Las landings por tipo de estancia y el diagnóstico solo navegan hacia esa instancia.
- `EMAIL_PROVIDER_MODE`: `disabled` por defecto. `capture` y `mock` quedan reservados para harnesses aislados y hoy se resuelven sin salida; `resend` solo es elegible para la allowlist comercial con configuración completa.
- `ANALYTICS_PROVIDER_MODE`: `disabled` por defecto. `capture` y `mock` quedan reservados para harnesses aislados y hoy se resuelven sin salida; `gtm` solo es elegible con operaciones reales permitidas y consentimiento analítico.

Un valor desconocido equivale a `disabled`. La presencia de un secreto, binding, tabla, ruta o variable heredada nunca habilita por sí sola una operación.

La configuración efectiva de la demo pública es:

```json
{
  "schemaVersion": "1.0.0",
  "mode": "demo",
  "demoMode": true,
  "sideEffects": false,
  "durableWrites": false,
  "jobs": false,
  "providers": {
    "email": "disabled",
    "analytics": "disabled",
    "payments": "disabled",
    "webhooks": "disabled",
    "externalStorage": "disabled"
  },
  "operations": {
    "commercialLead": "blocked",
    "payments": "unavailable",
    "webhooks": "unavailable",
    "automations": "unavailable"
  }
}
```

Este es el manifest público exacto de `/api/capabilities`. CRM, canales, mensajería e IA no aparecen como proveedores porque no existe un adaptador ejecutable para ellos; su ausencia forma parte del cierre, no implica un estado oculto.

Las restricciones del modo demo prevalecen sobre cualquier otra operación de producto. `EMAIL_PROVIDER_MODE=resend` no tiene efecto si falta `COMMERCIAL_LEADS_ENABLED=true` o si la configuración de email es incompleta. La excepción no habilita analítica, pagos, reservas, webhooks, canales, IA, jobs ni formularios de las demos.

## Separación de arquitectura

### Demo pública

- Arranca y se puede navegar sin secretos reales.
- Usa fixtures ficticios y estado en memoria, de pestaña o de navegador que pueda restaurarse.
- No escribe en Durable Objects, bases de datos, colas, almacenamiento externo ni sistemas de terceros, salvo el coordinador de un lead comercial cuando la allowlist está activa.
- No ejecuta jobs, automatizaciones, webhooks o tareas programadas de negocio.
- No carga proveedores de analítica, pagos, CRM, canales, mensajería o IA. Resend solo puede utilizarse para un lead comercial de Logic Estancia con allowlist explícita.
- Mantiene las barreras en servidor aunque se manipule el navegador o se invoque un API directamente.

### Motor real

- Vive en un despliegue aislado y expresamente configurado, nunca como fallback de la demo.
- Valida capacidades, migraciones, secretos, permisos, ownership, proveedores, observabilidad y recuperación antes de activarse.
- Mantiene idempotencia, límites, minimización de datos y pruebas propias.
- No convierte una interfaz de demostración en una operación real sin una decisión de rollout.

Logic2B Estancias solo tiene hoy una mutación externa real implementada: la entrega del formulario comercial único de la portada mediante Resend y con `COMMERCIAL_LEADS_ENABLED=true`. Las landings de segmento navegan a esa misma instancia con un origen allowlisted. GTM exige modo real, autorización de operaciones, proveedor `gtm` y consentimiento. Reservas, pagos, PMS, canales, mensajería, CRM, IA y operaciones hoteleras no tienen adaptadores reales en este repositorio. No debe inferirse su disponibilidad por la existencia de una pantalla.

## Barreras de servidor

Las barreras visuales ayudan a comprender el estado, pero no constituyen seguridad. Toda mutación debe pasar primero por la guarda efectiva del modo:

1. Resolver la configuración efectiva.
2. Rechazar el efecto si no tiene su autorización específica: `product_operations_allowed` para producto o `commercial_lead_allowed` para la captación comercial.
3. Solo entonces validar tamaño, tipo y contenido de la petición.
4. Solo entonces acceder a persistencia o resolver un proveedor.

Contrato HTTP:

- `403`: mutación visible pero no permitida en demo, como `POST /api/leads`.
- `404`: capacidad o endpoint que no existe en la demo, incluidos pagos y webhooks.
- `410`: operación real retirada expresamente de una demo cuando conservar su ruta ayude a comunicar la retirada.

El rechazo no debe crear una cuota de rate limit, referencia durable, alarma, log con PII ni llamada externa. Los logs de demo se limitan a códigos de evento y estado; nunca incluyen nombres, emails, teléfonos, mensajes, tokens o credenciales.

## Matriz de efectos

| Superficie | Resultado visible en demo | Efecto real posible | Barrera efectiva en demo | Condición mínima de activación real |
| --- | --- | --- | --- | --- |
| Formulario comercial único de la portada | Confirmación simulada si la allowlist falta; entrega real solo si está activa | DO de coordinación y dos emails Resend | `403` antes de cuerpo, DO y proveedor si falta una puerta | `COMMERCIAL_LEADS_ENABLED=true`, `EMAIL_PROVIDER_MODE=resend`, secretos completos y smoke aislado |
| Solicitudes y reservas | Fixtures de solicitud, alternativa y reserva | Reserva, inventario, comunicación o pago | Sin endpoint transaccional; estado temporal/restaurable | Adaptador, persistencia, permisos, migraciones y aceptación del cliente |
| Planning y tarifas | Calendario y cifras ficticias | Cambios de unidad, disponibilidad o precio | Sin escritura ni PMS/canal conectado | Proveedor verificado, reconciliación, ownership y rollback |
| Pagos | Explicación o recorrido visual | Crear sesión, autorización, captura o devolución | Endpoint ausente (`404`) y proveedor `disabled` | Contrato de pagos, secretos aislados, webhooks, conciliación y smoke |
| Email y mensajería de producto | Sin superficie pública de demo | Email, SMS o mensajería externa | Proveedores `disabled`; no se aceptan destinatarios reales | Consentimiento/base jurídica, proveedor, plantillas, idempotencia y trazabilidad |
| Publicación web | Vista previa ficticia | Escritura en CMS o despliegue | Sin CMS ni credencial; publicación real ausente | Repositorio/entorno aislado, permisos, preview y rollback probado |
| Canales | Matriz de cobertura con cero conexiones | Inventario, tarifas, reservas o mensajes | Sin OAuth, webhook o adaptador; proveedor `disabled` | Contrato por canal, mapeo, deduplicación, reconciliación y recuperación |
| Automatizaciones y jobs | Sin superficie pública de demo | Jobs, colas, reglas o notificaciones | `jobs=false`; sin consumidor externo | Flag específico, observabilidad, reintentos, límites y kill switch |
| IA supervisada | Sin superficie pública de demo | Inferencia o envío a un modelo | Sin modelo ni proveedor; contenido local | Proveedor, política de datos, fuentes, evaluación, revisión y fallback |
| Analítica | Sin medición externa | Carga de GTM/GA y eventos agregados | `ANALYTICS_PROVIDER_MODE=disabled`, incluso con consentimiento previo | `DEMO_MODE=false`, `REAL_OPERATIONS_ENABLED=true`, modo `gtm`, consentimiento y contrato sin PII |
| Webhooks | Ninguno | Procesamiento de eventos de terceros | Ruta ausente o rechazo antes del cuerpo | Firma, replay protection, idempotencia, observabilidad y prueba aislada |

## Inventario de capacidades y comunicación

Cada capacidad pública usa exactamente uno de estos estados:

- `demo_visual_disponible`: existe una representación ficticia, inerte y comprensible.
- `demo_visual_pendiente`: hay base o narrativa técnica, pero no debe venderse todavía como demostrable.
- `solo_interna`: control técnico sin valor visual directo para un cliente.
- `activable_por_proyecto`: requiere configuración, migración, proveedor o validación específica antes de operar.
- `en_ruta`: todavía no está disponible.

Inventario comercial vigente:

| Capacidad | Estado | Qué puede comprenderse | Límite que debe mostrarse |
| --- | --- | --- | --- |
| Web modular de marca | `demo_visual_disponible` | Contenido, navegación, identidad y SEO técnico | No publica cambios desde la demo |
| Solicitudes por email | `demo_visual_pendiente` | La capacidad está definida, pero la demo pública ya no expone un formulario | No se presenta como demostrable y no envía email |
| Solicitudes y reservas | `demo_visual_disponible` | Continuidad visual entre consulta, alternativa y reserva ficticia | No crea reserva, inventario, cobro o comunicación |
| Planning y tarifas | `demo_visual_disponible` | Calendario común, unidad, estancia y tarifa de muestra | No cambia PMS, canal, disponibilidad o precio real |
| Editor web supervisado | `demo_visual_pendiente` | Existe una base de vista previa | No debe comunicarse como flujo demostrable hasta recuperar una ruta coherente y sus pruebas |
| Informes básicos | `demo_visual_disponible` | Ocupación e ingresos calculados desde fixtures | No usa contabilidad, pagos o datos operativos |
| Centro operativo | `demo_visual_disponible` | Priorización visual de llegadas y riesgos | No decide ni ejecuta acciones autónomas |
| Limpieza y preparación | `demo_visual_disponible` | Estados y responsabilidades ficticias | No asigna personas ni modifica habitaciones |
| Mantenimiento | `demo_visual_disponible` | Prioridad, responsable e impacto hipotético | No crea órdenes ni contacta proveedores |
| Equipos y permisos | `demo_visual_disponible` | Diferencias visuales entre roles | No crea usuarios ni aplica autorización real |
| Canales e inventario | `activable_por_proyecto` | Matriz visual de cobertura y requisitos | Cero canales conectados; cada proveedor exige validación |
| Automatizaciones | `demo_visual_pendiente` | La narrativa y los fixtures existen | No hay job, regla, cola o mensajería activa |
| Copiloto supervisado | `demo_visual_pendiente` | La narrativa de borrador y revisión existe | No hay modelo ni proveedor y nada se envía |
| Revenue y previsión | `en_ruta` | Solo un escenario matemático ficticio | No es una predicción ni una capacidad operacional disponible |

Guardas de modo, validación de configuración, rate limit, idempotencia, sanitización de logs y adaptadores de proveedor son `solo_interna`: deben probarse, pero no venderse como pantallas de producto.

En lenguaje para clientes:

- “Visible en la demo” significa que existe una representación ficticia, no una integración activa.
- “Activable” significa que se valida y configura por proyecto; no está encendido por defecto.
- “A medida” significa que puede analizarse y desarrollarse; no implica que esté incluido.
- Una capacidad parcial, pendiente o futura nunca se presenta como disponible.

## Datos ficticios y restauración

- Los fixtures usan marcas inventadas y dominios reservados como `example.test`.
- La demo no debe solicitar PII para recorrer una capacidad.
- El estado en memoria se restaura al recargar la página.
- El estado permitido en `sessionStorage` se elimina al cerrar la pestaña, caducar, descartar o finalizar el recorrido previsto.
- Cualquier estado local persistente debe ofrecer una acción de restablecimiento y tolerar valores corruptos volviendo al fixture inicial.
- La limpieza de estado demo nunca borra datos de un entorno real.

Si una migración instala una estructura, su existencia no activa la capacidad. La demo pública no crea cuentas, usuarios, credenciales, conexiones, suscripciones o datos de cliente.

## Activación real

Una capacidad solo puede salir del modo demo en un despliegue aislado cuando se haya verificado todo lo siguiente:

1. Para producto: `DEMO_MODE=false` y `REAL_OPERATIONS_ENABLED=true`. Para la única excepción de captación: `COMMERCIAL_LEADS_ENABLED=true` con las puertas de correo completas.
2. Capacidad habilitada mediante configuración validada y revisada.
3. Migraciones aplicadas y verificadas.
4. Secretos separados, mínimos, rotables y presentes.
5. Permisos, ownership y responsables de soporte definidos.
6. Proveedor y contrato comercial verificados.
7. Observabilidad, alertas, idempotencia, recuperación y retención preparadas.
8. E2E y smoke correctos en el entorno aislado.
9. Rollback ensayado.
10. Aprobación explícita del rollout.

El formulario comercial único de la portada solo envía una solicitud cuando `COMMERCIAL_LEADS_ENABLED=true`, `EMAIL_PROVIDER_MODE=resend` y la configuración de Resend es completa. Las landings de segmento solo navegan a esa instancia. La captación puede convivir con `DEMO_MODE=true`; esa excepción no vuelve operativa ninguna demo de producto. En cualquier otra configuración la interfaz muestra una simulación y el endpoint rechaza antes de leer el cuerpo.

## Recuperación y rollback

Ante una duda, incidente o configuración parcial:

1. Enrutar el tráfico a un despliegue demo verificado, con su propio namespace vacío; nunca convertir en demo el mismo namespace que operó solicitudes reales.
2. En el despliegue real aislado, retirar `REAL_OPERATIONS_ENABLED=true` y establecer proveedores en `disabled`. `DEMO_MODE` permanece en `false`, por lo que el manifest queda `real_locked`: las APIs y proveedores están cerrados, pero las alarmas ya programadas pueden terminar de borrar únicamente su cuota, referencia y resultado transitorios.
3. Conservar las referencias necesarias para investigar sin repetir envíos a ciegas y esperar/verificar el límite máximo de 24 horas.
4. Revocar o rotar secretos comprometidos en el proveedor correspondiente.
5. Aplicar el procedimiento aprobado de archivo o eliminación del namespace real; después se puede retirar ese despliegue.
6. Verificar APIs, logs saneados, fixtures y ausencia de tráfico externo antes de reabrir.

Un rollback de código no autoriza a borrar datos reales. La recuperación de persistencia se ejecuta con un procedimiento específico del cliente y una copia verificada. Bajo `DEMO_MODE=true` incluso una alarma de limpieza es un no-op: no lee, escribe ni borra Durable Objects. Por eso compartir un namespace entre demo y motor real está prohibido. Si alguien sobrescribe por error un despliegue real con modo demo antes de vencer las alarmas, sus metadatos transitorios pueden requerir un purge revisado antes de eliminar el namespace; es una limitación operativa conocida, no un motivo para relajar el aislamiento.

## Pruebas de aislamiento obligatorias

La puerta mínima combina `pnpm check`, E2E relevantes y smoke seco. Las pruebas deben demostrar:

1. Todas las superficies visuales cargan en demo sin secretos.
2. Botones y formularios de producto no realizan escrituras HTTP ni efectos externos; los formularios comerciales solo lo hacen en el harness con la allowlist activa.
3. Una llamada directa a cada API mutante recibe el rechazo esperado, incluido `/api/leads` cuando falta la allowlist comercial.
4. El rechazo ocurre antes de leer el cuerpo o escribir en persistencia.
5. Email, analítica, pagos, webhooks, almacenamiento, canales, CRM, mensajería e IA reciben cero llamadas.
6. Jobs, colas y automatizaciones permanecen inertes.
7. Fixtures y estado local pueden restaurarse.
8. Una UI o tabla no convierte una capacidad inactiva en activa.
9. El modo real funciona solo en un harness aislado con proveedores simulados o controlados.
10. Un valor ausente, desconocido o parcial falla cerrado.

El smoke de Resend es seco por defecto. Nunca debe ejecutarse contra una demo ni contra producción sin autorización humana y buzones controlados.

## Limitaciones conocidas

- El único adaptador externo de operación implementado es Resend para el formulario comercial; no es un motor de reservas para clientes.
- No existe todavía un despliegue de cliente con pagos, PMS, canales, CRM, mensajería, IA o jobs operativos.
- Las capacidades marcadas `demo_visual_pendiente` necesitan recuperar una superficie coherente y pruebas antes de comunicarse como demostrables.
- Revenue utiliza matemáticas de fixtures; no entrena, predice ni recomienda precios reales.
- Los textos legales necesitan validación profesional para cada implantación y proveedor.

Ninguna limitación se resuelve relajando el fail-closed de la demo.
