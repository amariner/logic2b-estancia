import { afterEach, describe, expect, it, vi } from 'vitest';
import { LeadCoordinator } from './lead-coordinator';
import type { LeadEnv } from './leads';

const lead = { name: 'Ada', businessName: 'Casa Ada', email: 'ada@example.test', accommodationType: 'rural', propertyCount: 2, unitCount: 4, accept: true, website: '', lang: 'es' };
const emailEnv = {
  LEADS_TRANSPORT: 'resend',
  LEADS_RESEND_API_KEY: 'secret',
  LEADS_FROM_EMAIL: 'delivery@example.test',
  LEADS_INTERNAL_RECIPIENT: 'sales@example.test',
  LEADS_REPLY_TO: 'reply@example.test',
} as const satisfies LeadEnv;

class MemoryStorage {
  readonly values = new Map<string, unknown>();
  alarm: number | null = null;

  async get<T>(key: string): Promise<T | undefined> { return this.values.get(key) as T | undefined; }
  async put(key: string, value: unknown): Promise<void> { this.values.set(key, value); }
  async delete(key: string): Promise<boolean> { return this.values.delete(key); }
  async deleteAll(): Promise<void> { this.values.clear(); this.alarm = null; }
  async setAlarm(time: number | Date): Promise<void> { this.alarm = Number(time); }
}

function state(storage = new MemoryStorage()): DurableObjectState {
  return { storage } as unknown as DurableObjectState;
}

function deliver(coordinator: LeadCoordinator) {
  return coordinator.fetch(new Request('https://coordinator/deliver', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(lead) }));
}

describe('LeadCoordinator', () => {
  afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers(); });

  it('persists the rate limit across object instances and clears it with its alarm', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-17T10:00:00Z'));
    const storage = new MemoryStorage();
    let coordinator = new LeadCoordinator(state(storage), {});
    for (let count = 0; count < 5; count += 1) {
      const response = await coordinator.fetch(new Request('https://coordinator/rate-limit', { method: 'POST' }));
      expect(await response.json()).toEqual({ retryAfter: null });
    }
    coordinator = new LeadCoordinator(state(storage), {});
    const limited = await coordinator.fetch(new Request('https://coordinator/rate-limit', { method: 'POST' }));
    expect(await limited.json()).toEqual({ retryAfter: 60 });
    await coordinator.alarm();
    expect(storage.values.size).toBe(0);
  });

  it('replays a completed lead without calling providers again, even after a restart', async () => {
    const fetcher = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));
    const storage = new MemoryStorage();
    const env: LeadEnv = emailEnv;
    const first = await deliver(new LeadCoordinator(state(storage), env));
    const firstBody = await first.json() as { ref: string };
    const second = await deliver(new LeadCoordinator(state(storage), env));
    expect(await second.json()).toMatchObject({ ref: firstBody.ref, replayed: true });
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('coalesces simultaneous submissions into one provider delivery', async () => {
    const pending: Array<(response: Response) => void> = [];
    const fetcher = vi.spyOn(globalThis, 'fetch').mockImplementation(() => new Promise<Response>((resolve) => pending.push(resolve)));
    const coordinator = new LeadCoordinator(state(), emailEnv);
    const firstPromise = deliver(coordinator);
    await vi.waitFor(() => expect(pending).toHaveLength(2));
    const secondPromise = deliver(coordinator);
    await Promise.resolve();
    expect(fetcher).toHaveBeenCalledTimes(2);
    pending.forEach((resolve) => resolve(new Response('{}', { status: 200 })));
    const [first, second] = await Promise.all([firstPromise, secondPromise]);
    expect((await first.json() as { ref: string }).ref).toBe((await second.json() as { ref: string }).ref);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('reuses its durable reference when the mandatory internal email is retried', async () => {
    vi.useFakeTimers();
    const startedAt = new Date('2026-08-18T10:00:00Z');
    vi.setSystemTime(startedAt);
    let internalAttempts = 0;
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (_input, init) => {
      const payload = JSON.parse(String(init?.body)) as { to: string[] };
      if (payload.to[0] === 'sales@example.test') {
        internalAttempts += 1;
        return new Response('{}', { status: internalAttempts === 1 ? 500 : 200 });
      }
      return new Response('{}', { status: 200 });
    });
    const storage = new MemoryStorage();
    const first = await deliver(new LeadCoordinator(state(storage), emailEnv));
    expect(first.status).toBe(502);
    const firstBody = await first.json() as { ref: string };
    expect(storage.alarm).toBe(startedAt.getTime() + 24 * 60 * 60 * 1_000);
    vi.setSystemTime(new Date(startedAt.getTime() + 12 * 60 * 60 * 1_000));
    const second = await deliver(new LeadCoordinator(state(storage), emailEnv));
    expect(second.status).toBe(202);
    expect(await second.json()).toMatchObject({ ref: firstBody.ref });
    expect(internalAttempts).toBe(2);
    expect(storage.alarm).toBe(startedAt.getTime() + 24 * 60 * 60 * 1_000);
  });

  it('starts a fresh reference after a failed delivery window expires', async () => {
    vi.useFakeTimers();
    const startedAt = new Date('2026-08-18T10:00:00Z');
    vi.setSystemTime(startedAt);
    let succeeds = false;
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (_input, init) => {
      const payload = JSON.parse(String(init?.body)) as { to: string[] };
      const internal = payload.to[0] === 'sales@example.test';
      return new Response('{}', { status: internal && !succeeds ? 500 : 200 });
    });
    const storage = new MemoryStorage();
    const coordinator = new LeadCoordinator(state(storage), emailEnv);
    const first = await deliver(coordinator);
    const firstRef = (await first.json() as { ref: string }).ref;
    vi.setSystemTime(new Date(startedAt.getTime() + 24 * 60 * 60 * 1_000 + 1));
    succeeds = true;
    const second = await deliver(coordinator);
    expect(second.status).toBe(202);
    expect((await second.json() as { ref: string }).ref).not.toBe(firstRef);
  });

  it('preserves a legacy durable reference while adding its missing expiry', async () => {
    vi.useFakeTimers();
    const startedAt = new Date('2026-08-18T10:00:00Z');
    vi.setSystemTime(startedAt);
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));
    const storage = new MemoryStorage();
    storage.values.set('ref', 'legacy-ref');
    const response = await deliver(new LeadCoordinator(state(storage), emailEnv));
    expect(await response.json()).toMatchObject({ ref: 'legacy-ref' });
    expect(storage.values.get('refExpiresAt')).toBe(startedAt.getTime() + 24 * 60 * 60 * 1_000);
    expect(storage.alarm).toBe(startedAt.getTime() + 24 * 60 * 60 * 1_000);
  });
});
