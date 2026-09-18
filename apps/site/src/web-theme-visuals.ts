import type { WebPortfolioConcept } from './web-portfolio';

interface WebThemeVisual {
  paper: string;
  ink: string;
  accent: string;
  composition: 'split' | 'landscape' | 'framed';
  imagePosition: string;
}

// Keep these small previews in the same colour family as their full theme.
const visuals = {
  nivora: { paper: '#f5f0e8', ink: '#1f2524', accent: '#9b543b', composition: 'split', imagePosition: '52% center' },
  terrava: { paper: '#f1efe6', ink: '#283126', accent: '#555a35', composition: 'landscape', imagePosition: '58% center' },
  aurem: { paper: '#eef0ef', ink: '#131719', accent: '#6c502c', composition: 'framed', imagePosition: '54% center' },
  linde: { paper: '#f3efe5', ink: '#1b211a', accent: '#66603f', composition: 'landscape', imagePosition: '60% center' },
  cobalto: { paper: '#e9edf0', ink: '#17212a', accent: '#37546b', composition: 'split', imagePosition: '63% center' },
  oria: { paper: '#edf1ed', ink: '#172221', accent: '#45645d', composition: 'framed', imagePosition: '60% center' },
  boscara: { paper: '#e9ebe4', ink: '#18211b', accent: '#4d604d', composition: 'landscape', imagePosition: '52% center' },
  velares: { paper: '#f2e9df', ink: '#38261f', accent: '#965b3f', composition: 'split', imagePosition: '55% center' },
  nocta: { paper: '#e7e9ee', ink: '#111b2b', accent: '#425270', composition: 'framed', imagePosition: '55% center' },
  riscoa: { paper: '#e7ebe5', ink: '#172119', accent: '#466050', composition: 'landscape', imagePosition: '56% center' },
  solerna: { paper: '#f1ece1', ink: '#39291c', accent: '#8c5837', composition: 'split', imagePosition: '57% center' },
  cendra: { paper: '#e8e5e0', ink: '#1f1915', accent: '#78563e', composition: 'framed', imagePosition: '55% center' },
} as const satisfies Record<WebPortfolioConcept['slug'], WebThemeVisual>;

export function getWebThemeVisual(slug: WebPortfolioConcept['slug']) {
  const visual = visuals[slug];
  return {
    ...visual,
    style: `--theme-paper:${visual.paper};--theme-ink:${visual.ink};--theme-accent:${visual.accent};--theme-image-position:${visual.imagePosition}`,
  };
}
