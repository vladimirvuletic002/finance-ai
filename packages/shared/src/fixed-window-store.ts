import type { Redis } from 'ioredis';
import { getRedis } from './redis.js';

/**
 * Fixed-window counter store shared by rate limiters (and per-user quotas).
 *
 * Keeps fixed-window semantics but lets the counters live in Redis when
 * configured, so a single limit is enforced across all instances/services.
 *
 * - `consume` atomically increments only while under `limit`; the request that
 *   would exceed the limit is rejected WITHOUT incrementing further.
 * - `peek` reads the current count without modifying it.
 *
 * When `REDIS_URL` is unset a process-local `MemoryStore` is used instead.
 */

export interface ConsumeResult {
    allowed: boolean;
    count: number;
    resetAt: number; // epoch ms when the current window expires
}

export interface FixedWindowStore {
    consume(key: string, limit: number, windowMs: number): Promise<ConsumeResult>;
    peek(key: string, windowMs: number): Promise<{ count: number; resetAt: number }>;
}

class MemoryStore implements FixedWindowStore {
    private buckets = new Map<string, { count: number; resetAt: number }>();

    async consume(key: string, limit: number, windowMs: number): Promise<ConsumeResult> {
        const now = Date.now();
        let bucket = this.buckets.get(key);

        if (!bucket || now > bucket.resetAt) {
            bucket = { count: 0, resetAt: now + windowMs };
            this.buckets.set(key, bucket);
        }

        if (bucket.count >= limit) {
            return { allowed: false, count: bucket.count, resetAt: bucket.resetAt };
        }

        bucket.count += 1;
        return { allowed: true, count: bucket.count, resetAt: bucket.resetAt };
    }

    async peek(key: string, windowMs: number): Promise<{ count: number; resetAt: number }> {
        const now = Date.now();
        const bucket = this.buckets.get(key);

        if (!bucket || now > bucket.resetAt) {
            return { count: 0, resetAt: now + windowMs };
        }

        return { count: bucket.count, resetAt: bucket.resetAt };
    }
}

// Atomic conditional-increment + first-hit expiry, so the window is enforced
// consistently regardless of which instance handles the request.
const CONSUME_LUA = `
local current = tonumber(redis.call('GET', KEYS[1]) or '0')
local limit = tonumber(ARGV[1])
local ttl = tonumber(ARGV[2])
local pttl = redis.call('PTTL', KEYS[1])
if current >= limit then
  if pttl < 0 then pttl = ttl end
  return {0, current, pttl}
end
current = redis.call('INCR', KEYS[1])
if current == 1 or pttl < 0 then
  redis.call('PEXPIRE', KEYS[1], ttl)
  pttl = ttl
end
return {1, current, pttl}
`;

class RedisStore implements FixedWindowStore {
    constructor(private readonly client: Redis) {}

    async consume(key: string, limit: number, windowMs: number): Promise<ConsumeResult> {
        const [allowed, count, pttl] = (await this.client.eval(
            CONSUME_LUA,
            1,
            key,
            String(limit),
            String(windowMs)
        )) as [number, number, number];

        return {
            allowed: allowed === 1,
            count,
            resetAt: Date.now() + (pttl > 0 ? pttl : windowMs),
        };
    }

    async peek(key: string, windowMs: number): Promise<{ count: number; resetAt: number }> {
        const [countStr, pttl] = await Promise.all([this.client.get(key), this.client.pttl(key)]);
        return {
            count: countStr ? parseInt(countStr, 10) : 0,
            resetAt: Date.now() + (pttl > 0 ? pttl : windowMs),
        };
    }
}

let store: FixedWindowStore | null = null;

export function getFixedWindowStore(): FixedWindowStore {
    if (store) return store;

    const client = getRedis();
    store = client ? new RedisStore(client) : new MemoryStore();
    return store;
}
