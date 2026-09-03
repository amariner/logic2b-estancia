import { describe, expect, it } from 'vitest';
import { getHomeContract } from './home-contract';

describe('home product contract', () => {
  it('keeps the product spine complete and localized', () => {
    for (const locale of ['es', 'en'] as const) {
      const home = getHomeContract(locale);

      expect(home.navigation).toHaveLength(4);
      expect(home.navigation.find(({ key }) => key === 'gestor')?.href).toBe(locale === 'en' ? '/panels/' : '/paneles/');
      expect(home.heroCases).toHaveLength(3);
      expect(home.heroCases.map(({ slug, plan }) => [slug, plan])).toEqual([
        ['nivora', 'basico'],
        ['terrava', 'gestion'],
        ['aurem', 'inteligente'],
      ]);
      expect(home.journey).toHaveLength(7);
      expect(home.journey.map(({ number }) => number)).toEqual(['01', '02', '03', '04', '05', '06', '07']);
      expect(home.productAreas).toHaveLength(5);
      expect(home.productAreas.map(({ id }) => id)).toEqual(['web', 'solicitudes', 'planning', 'huespedes', 'operacion']);
      expect(home.capabilityGroups).toHaveLength(4);
      expect(home.capabilityGroups.flatMap(({ capabilityIds }) => capabilityIds)).toEqual([
        'brand-web', 'website-editor',
        'email-enquiries', 'enquiry-workspace', 'planning', 'guest-context',
        'operations-centre', 'cleaning', 'maintenance', 'roles', 'explainable-revenue',
        'channels', 'automation', 'supervised-ai',
      ]);
    }
  });

  it('only points the journey and explorer at existing evidence or anchors', () => {
    for (const locale of ['es', 'en'] as const) {
      const home = getHomeContract(locale);
      const prefix = locale === 'en' ? '/en' : '';
      const expectedPrefix = `${prefix}/demos/`;

      for (const item of [...home.journey, ...home.productAreas]) {
        expect(item.href === '#webs' || item.href.startsWith(expectedPrefix), item.href).toBe(true);
      }
      expect(home.journey.at(-1)?.href).toBe(`${expectedPrefix}aurem/gestion/?vista=control`);
      expect(home.productAreas.at(-1)?.href).toBe(`${expectedPrefix}aurem/gestion/?vista=control`);
    }
  });
});
