import { afterEach, describe, expect, it } from 'vitest';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { composeAssets } from './compose.mjs';

const temporaryRoots = [];

async function createRoot() {
  const root = await mkdtemp(join(tmpdir(), 'logic estancia-compose-'));
  temporaryRoots.push(root);
  return root;
}

afterEach(async () => {
  await Promise.all(temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe('asset composition', () => {
  it('merges fresh site and demo builds from a workspace path with spaces', async () => {
    const root = await createRoot();
    const site = join(root, 'apps/site/dist');
    const demos = join(root, 'apps/web/dist');
    const output = join(root, 'apps/worker/dist/assets');
    await Promise.all([mkdir(site, { recursive: true }), mkdir(demos, { recursive: true }), mkdir(output, { recursive: true })]);
    await Promise.all([
      writeFile(join(site, 'index.html'), 'site'),
      writeFile(join(site, 'shared.txt'), 'site-version'),
      writeFile(join(demos, 'demo.html'), 'demo'),
      writeFile(join(demos, 'shared.txt'), 'demo-version'),
      writeFile(join(output, 'stale.txt'), 'stale'),
    ]);

    await composeAssets(root);

    await expect(readFile(join(output, 'index.html'), 'utf8')).resolves.toBe('site');
    await expect(readFile(join(output, 'demo.html'), 'utf8')).resolves.toBe('demo');
    await expect(readFile(join(output, 'shared.txt'), 'utf8')).resolves.toBe('demo-version');
    await expect(readFile(join(output, 'stale.txt'), 'utf8')).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('keeps the previous composed output when an input build is missing', async () => {
    const root = await createRoot();
    const site = join(root, 'apps/site/dist');
    const output = join(root, 'apps/worker/dist/assets');
    await Promise.all([mkdir(site, { recursive: true }), mkdir(output, { recursive: true })]);
    await writeFile(join(site, 'index.html'), 'site');
    await writeFile(join(output, 'previous.html'), 'previous');

    await expect(composeAssets(root)).rejects.toMatchObject({ code: 'ENOENT' });
    await expect(readFile(join(output, 'previous.html'), 'utf8')).resolves.toBe('previous');
  });
});
