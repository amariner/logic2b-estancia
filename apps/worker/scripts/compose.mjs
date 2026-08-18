import { cp, mkdir, mkdtemp, rename, rm, stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptPath = fileURLToPath(import.meta.url);
const workspaceRoot = resolve(dirname(scriptPath), '../../..');

async function requireDirectory(path) {
  const entry = await stat(path);
  if (!entry.isDirectory()) throw new Error(`compose_input_not_directory:${path}`);
}

export async function composeAssets(root = workspaceRoot) {
  const site = resolve(root, 'apps/site/dist');
  const demos = resolve(root, 'apps/web/dist');
  const outputParent = resolve(root, 'apps/worker/dist');
  const output = resolve(outputParent, 'assets');

  await Promise.all([requireDirectory(site), requireDirectory(demos)]);
  await mkdir(outputParent, { recursive: true });

  const staged = await mkdtemp(resolve(outputParent, '.assets-staged-'));
  const previous = `${output}.previous-${process.pid}-${Date.now()}`;
  let hasPrevious = false;

  try {
    await cp(site, staged, { recursive: true });
    await cp(demos, staged, { recursive: true, force: true });

    try {
      await rename(output, previous);
      hasPrevious = true;
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
    }

    try {
      await rename(staged, output);
    } catch (error) {
      if (hasPrevious) await rename(previous, output);
      throw error;
    }

    if (hasPrevious) await rm(previous, { recursive: true, force: true });
  } finally {
    await rm(staged, { recursive: true, force: true });
  }
}

if (process.argv[1] && resolve(process.argv[1]) === scriptPath) {
  await composeAssets();
  console.log('[compose] site + demos → apps/worker/dist/assets');
}
