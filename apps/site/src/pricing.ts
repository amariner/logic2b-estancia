import type { Locale } from '@logic-estancia/config';
import type { PlanLevel } from '@logic-estancia/domain';

// Indicative managed-service starting prices requested on 2026-09-05.
// These are quotes to scope, never an operational subscription or checkout.
export const PLAN_PRICING: Record<PlanLevel, { monthly: number; setup: number }> = {
  basico: { monthly: 49, setup: 490 },
  gestion: { monthly: 149, setup: 990 },
  inteligente: { monthly: 299, setup: 1990 },
};
export const euro = (value: number, locale: Locale) => new Intl.NumberFormat(locale === 'es' ? 'es-ES' : 'en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
export const pricingTerms = (locale: Locale) => locale === 'es'
  ? 'Precios orientativos sin IVA, para una marca y hasta 5 unidades. Implantación inicial aparte. Hosting, mantenimiento técnico y soporte base incluidos. Más unidades, dominios, migraciones, conexiones externas y soporte extendido se presupuestan por separado. Alcance, plazos y condiciones se confirman en la propuesta; las demos no activan servicios.'
  : 'Indicative prices excluding VAT, for one brand and up to 5 units. Initial setup is separate. Hosting, technical maintenance and base support included. Additional units, domains, migrations, external connections and extended support are quoted separately. Scope, timing and terms are confirmed in the proposal; demos activate no services.';
