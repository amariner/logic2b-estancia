import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const mediaRoot = new URL('../apps/web/public/media/', import.meta.url);

for (const brand of await readdir(mediaRoot)) {
  const brandRoot = join(mediaRoot.pathname, brand);
  for (const name of ['hero', 'detail']) {
    const input = join(brandRoot, `${name}.webp`);
    for (const width of [640, 960, 1600]) {
      await sharp(input)
        .resize({ width, withoutEnlargement: true })
        .avif({ quality: 66, effort: 6 })
        .toFile(join(brandRoot, `${name}-${width}.avif`));
    }
  }
}

console.log('Responsive AVIF photography generated.');
