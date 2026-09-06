# Precios orientativos de Logic2B Estancias · 5 de septiembre de 2026

Petición del usuario: mostrar precios adecuados a Básico, Gestión e Inteligente, investigando competidores. Sustituye la restricción previa de no mostrar importes. No acredita entrevistas ni ventas y no autoriza publicación en producción.

## Fuentes consultadas

| Referencia | Información observada | Uso en la decisión |
| --- | --- | --- |
| [Smoobu](https://www.smoobu.com/es/precios/) | Una unidad: Flex 29 €/mes + 0,9 % por reserva; Prepago 35 €/mes o 31,50 €/mes con pago anual; Teams Pro+ 55 €/mes o 49,50 €/mes anual. La FAQ presenta otra base de 28 €, por lo que se prioriza la tabla y no se mezclan periodos. | Suelo de software de autoservicio; varía con unidades. |
| [Lodgify](https://www.lodgify.com/es/tarifas/) | FAQ: desde 12 €/mes anual. Tarifario dinámico por moneda, unidades y periodo; la extracción inicial sirve tarjetas USD, por lo que no se transforman esos importes a EUR. | Referencia de entrada, no equivalencia entre su Basic y nuestro Básico. |
| [AvaiBook](https://www.avaibook.com/planes-y-precios/) y [FAQ](https://www.avaibook.com/faqs/) | Presupuesto según alojamientos físicos, unidades y sincronizaciones. No se fija un importe sin una configuración verificable. | Separar unidades, conexiones y alcance. |
| [Beds24](https://www.beds24.com/pricing.html) y [facturación](https://wiki.beds24.com/index.php?title=Billing) | Cobro según uso/configuración; extras y conexiones aparte, sin comisión de reserva de la plataforma. | Evitar incluir proveedores y consumo externo en una cuota indiferenciada. |
| [Logic2B Campings](https://camp.logic2b.com/) | Inicial 49 €/mes con 6 meses de permanencia; Gestión 399 €/mes + 1.900 € de onboarding/diseño; Avanzado bajo proyecto. | Familia de servicio más cercana; no se copian permanencia ni capacidades. |

Consulta de páginas oficiales realizada el 2026-09-05. Los competidores disponen de productos operativos; Estancias sigue siendo una demostración más una propuesta de servicio a concretar. La comparación orienta posicionamiento, no demuestra equivalencia funcional ni ahorro.

## Propuesta aplicada

| Plan | Cuota desde, sin IVA | Implantación desde, sin IVA | Enfoque |
| --- | ---: | ---: | --- |
| Básico | 49 €/mes | 490 € | Web de marca gestionada, contenido y fundamentos SEO. Nivora sin dashboard. |
| Gestión | 149 €/mes | 990 € | Web y configuración de solicitudes, planning y huéspedes. Demo Terrava. |
| Inteligente | 299 €/mes | 1.990 € | Coordinación de equipo, operación e ingresos y revisión supervisada. Demo Aurem. |

Importes para una marca y hasta cinco unidades. Hosting, mantenimiento técnico y soporte base incluidos en el servicio propuesto. Unidades adicionales, dominios, migración, conexiones, licencias de terceros, consumo y soporte extendido requieren presupuesto aparte. La propuesta confirma calendario, funcionalidades operativas, condiciones y aceptación. No hay checkout, suscripción activada ni descuento anual inventado.

La prima frente a software de autoservicio remunera diseño, configuración y acompañamiento. Gestión se sitúa por debajo de Camp para una implantación acotada a cinco unidades. Estos importes son una hipótesis comercial solicitada por el usuario: falta medir horas de implantación, coste de soporte, margen y disposición a pagar en las 15 entrevistas y 5 propuestas pendientes.

Fuente de importes en código: `apps/site/src/pricing.ts`. Home y página de planes comparten las tarjetas y términos. No añadir Offers de producto operativo ni precios definitivos al marcado SEO hasta validar el alcance real.
