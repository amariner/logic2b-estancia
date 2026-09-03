import { describe, expect, it } from 'vitest';
import { getOriginalWebPortfolio, getWebPortfolio } from './web-portfolio';

describe('web portfolio contract', () => {
  it('keeps both collections aligned across languages, verticals and plans', () => {
    for (const locale of ['es', 'en'] as const) {
      const concepts = getWebPortfolio(locale);
      expect(concepts).toHaveLength(6);
      expect(concepts.map(({ slug, vertical, plan }) => [slug, vertical, plan])).toEqual([
        ['nivora', 'apartments', 'basico'],
        ['terrava', 'rural', 'gestion'],
        ['aurem', 'hotels', 'inteligente'],
        ['linde', 'rural', 'basico'],
        ['cobalto', 'apartments', 'inteligente'],
        ['oria', 'hotels', 'gestion'],
      ]);
      expect(concepts.every(({ visiblePages, boundary, demoHref }) => visiblePages.length >= 3 && boundary.length > 30 && demoHref.startsWith('/'))).toBe(true);
      expect(concepts.filter(({ status }) => status === 'canonical')).toHaveLength(3);
      expect(concepts.filter(({ status }) => status === 'original')).toHaveLength(3);
      expect(getOriginalWebPortfolio(locale).every((concept) => concept.showcase.moments.length === 3)).toBe(true);
    }
  });

  it('uses localized destinations for canonical demos and original concepts', () => {
    expect(getWebPortfolio('es').map(({ demoHref }) => demoHref)).toEqual(['/demos/nivora/', '/demos/terrava/', '/demos/aurem/', '/webs/linde/', '/webs/cobalto/', '/webs/oria/']);
    expect(getWebPortfolio('en').map(({ demoHref }) => demoHref)).toEqual(['/en/demos/nivora/', '/en/demos/terrava/', '/en/demos/aurem/', '/en/webs/linde/', '/en/webs/cobalto/', '/en/webs/oria/']);
  });
});
