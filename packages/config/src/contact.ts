import type { Locale } from './index';

const PHONE = '+34 626 432 316';
const WA = '34626432316';

export function logic2bContact(locale: Locale, context: 'commercial' | 'docs' | 'tenant' | 'dashboard') {
  const labels = locale === 'en'
    ? { commercial: 'Contact', docs: 'Help', tenant: 'Logic2B · Contact', dashboard: 'Logic2B help' }
    : { commercial: 'Contacta', docs: 'Ayuda', tenant: 'Logic2B · Contacta', dashboard: 'Ayuda Logic2B' };
  const message = locale === 'en'
    ? `Hello Logic2B, I would like to know more about Logic Estancia (${context}).`
    : `Hola Logic2B, quiero conocer mejor Logic Estancia (${context}).`;
  return { phone: PHONE, label: labels[context], href: `https://wa.me/${WA}?text=${encodeURIComponent(message)}` };
}
