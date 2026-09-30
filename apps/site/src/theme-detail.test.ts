import { describe, expect, it } from 'vitest';
import { getWebPortfolio } from './web-portfolio';
import { getWebThemeVisual } from './web-theme-visuals';
import { themeAnatomy, themeCompositionLabel, themeProcess, themeRequestHref } from './theme-detail';

describe('theme detail sheet', () => {
  it('builds a five-part anatomy from each theme own pages and intent, in ES and EN', () => {
    for (const locale of ['es', 'en'] as const) {
      for (const concept of getWebPortfolio(locale)) {
        const { composition } = getWebThemeVisual(concept.slug);
        const anatomy = themeAnatomy(locale, concept, composition);
        expect(anatomy.map(({ region }) => region)).toEqual(['nav', 'hero', 'pages', 'contact', 'footer']);
        expect(anatomy[1]!.text).toBe(concept.visualIntent);
        expect(anatomy[1]!.title.toLowerCase()).toContain(themeCompositionLabel(locale, composition).toLowerCase());
        for (const page of concept.visiblePages) expect(anatomy[2]!.text).toContain(page);
        expect(themeProcess(locale, concept)).toHaveLength(4);
      }
    }
  });

  it('keeps the request handoff allowlisted and free of free text', () => {
    const [nivora] = getWebPortfolio('es');
    expect(themeRequestHref('es', nivora!)).toBe('/?theme=nivora&plan=basico&sourcePath=%2Fwebs%2F#contacto');
  });
});
