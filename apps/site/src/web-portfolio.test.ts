import { describe, expect, it } from 'vitest';
import { getWebPortfolio } from './web-portfolio';

describe('web portfolio contract', () => {
  it('keeps the first collection aligned across languages and canonical plans', () => {
    for (const locale of ['es', 'en'] as const) {
      const concepts = getWebPortfolio(locale);
      expect(concepts).toHaveLength(3);
      expect(concepts.map(({ slug, vertical, plan }) => [slug, vertical, plan])).toEqual([
        ['nivora', 'apartments', 'basico'],
        ['terrava', 'rural', 'gestion'],
        ['aurem', 'hotels', 'inteligente'],
      ]);
      expect(concepts.every(({ status, visiblePages, boundary, demoHref }) => status === 'canonical' && visiblePages.length >= 3 && boundary.length > 30 && demoHref.startsWith('/'))).toBe(true);
    }
  });

  it('uses localized demo destinations without inventing additional routes', () => {
    expect(getWebPortfolio('es').map(({ demoHref }) => demoHref)).toEqual(['/demos/nivora/', '/demos/terrava/', '/demos/aurem/']);
    expect(getWebPortfolio('en').map(({ demoHref }) => demoHref)).toEqual(['/en/demos/nivora/', '/en/demos/terrava/', '/en/demos/aurem/']);
  });
});

