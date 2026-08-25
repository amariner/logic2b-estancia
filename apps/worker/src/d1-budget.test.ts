import { readFileSync, readdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const repoRoot = fileURLToPath(new URL('../../../', import.meta.url));
const workerRoot = join(repoRoot, 'apps/worker');
const config = JSON.parse(readFileSync(join(workerRoot, 'wrangler.jsonc'), 'utf8')) as Record<string, unknown>;

const budget = Object.freeze({
  databases: 0,
  cronTriggers: 0,
  queriesPerCron: 0,
  rowsReadPerCron: 0,
  rowsWrittenPerCron: 0,
  rowsReadPerDay: 0,
  rowsWrittenPerDay: 0,
  protectedData: ['real_reservations', 'commercial_contacts'] as const,
});

function sourceFiles(path: string): string[] {
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    const child = join(path, entry.name);
    if (entry.isDirectory()) return sourceFiles(child);
    return ['.ts', '.tsx', '.astro', '.mjs', '.sql'].includes(extname(entry.name)) ? [child] : [];
  });
}

describe('zero D1 budget', () => {
  it('pins the only valid budget to zero and protects real customer data', () => {
    expect(budget).toMatchObject({
      databases: 0,
      cronTriggers: 0,
      queriesPerCron: 0,
      rowsReadPerCron: 0,
      rowsWrittenPerCron: 0,
      rowsReadPerDay: 0,
      rowsWrittenPerDay: 0,
    });
    expect(budget.protectedData).toEqual(['real_reservations', 'commercial_contacts']);
  });

  it('fails if the deployment manifest adds D1, a cron or a scheduled integration', () => {
    const workerSource = readFileSync(join(workerRoot, 'src/index.ts'), 'utf8');
    expect(config.d1_databases).toEqual([]);
    expect(config.triggers).toEqual({ crons: [] });
    expect(config).not.toHaveProperty('services');
    expect(config).not.toHaveProperty('queues');
    expect(config).not.toHaveProperty('workflows');
    expect(config).not.toHaveProperty('pipelines');
    expect(workerSource).not.toMatch(/\bscheduled\s*\(/);
  });

  it('fails if executable project code introduces D1 access or SQL migrations', () => {
    const executableRoots = [join(repoRoot, 'apps'), join(repoRoot, 'packages'), join(repoRoot, 'scripts')];
    const files = executableRoots.flatMap(sourceFiles).filter((path) => !path.endsWith('d1-budget.test.ts'));
    const sqlFiles = files.filter((path) => extname(path) === '.sql');
    const d1Access = files.filter((path) => /\bD1Database\b|\.prepare\s*\(|\bd1_databases\b/.test(readFileSync(path, 'utf8')));
    expect(sqlFiles, 'Logic Estancia must keep catalogue and demo data as static fixtures').toEqual([]);
    expect(d1Access, 'Logic Estancia must not read or write D1').toEqual([]);
  });
});
