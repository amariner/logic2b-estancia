import { describe, expect, it } from 'vitest';
import { getSiteShell } from './site-shell';

describe('global site shell contract', () => {
  it('keeps the Camp-shaped product navigation mapped to Estancias routes', () => {
    for (const locale of ['es', 'en'] as const) {
      const home = getSiteShell(locale, true);
      const nested = getSiteShell(locale, false);
      const prefix = locale === 'en' ? '/en' : '';

      expect(home.product.map(({ label }) => label)).toEqual(locale === 'en'
        ? ['Websites', 'Workspace', 'Plans']
        : ['Webs', 'Gestor', 'Planes']);
      expect(home.product.at(-1)?.href).toBe('#planes');
      expect(nested.product.at(-1)?.href).toBe(`${prefix}/#planes`);
      expect(home.journey.href).toBe(`${prefix}/${locale === 'en' ? 'journey' : 'recorrido'}/`);
      expect(home.contact.href).toBe(`${prefix}/#contacto`);
    }
  });

  it('exposes only verified public destinations and never creates a pricing route', () => {
    for (const locale of ['es', 'en'] as const) {
      const shell = getSiteShell(locale, true);
      const allLinks = [
        ...shell.product,
        shell.journey,
        shell.contact,
        shell.assessment,
        shell.guides,
        ...shell.solutions,
        ...shell.footerProduct,
        ...shell.legal,
      ];

      expect(shell.solutions).toHaveLength(3);
      expect(shell.footerProduct).toHaveLength(4);
      expect(allLinks.some(({ href }) => href.includes('precios') || href.includes('pricing'))).toBe(false);
      expect(allLinks.every(({ href }) => href.startsWith('/') || href.startsWith('#'))).toBe(true);
    }
  });
});
