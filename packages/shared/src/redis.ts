import { Redis } from 'ioredis';
import logger from './logger.js';

/**
 * Shared Redis access.
 *
 * Reads `REDIS_URL` from the environment directly (each service validates its
 * own env at startup) so this module stays decoupled from any single service's
 * config schema and is reusable across services. Redis is optional: when
 * `REDIS_URL` is unset, callers fall back to in-memory behaviour.
 */

let sharedClient: Redis | null = null;

// BullMQ (in services that use it) requires `maxRetriesPerRequest: null`;
// harmless for the general client.
const REDIS_OPTIONS = { maxRetriesPerRequest: null } as const;

function redisUrl(): string | undefined {
    return process.env.REDIS_URL;
}

export function isRedisEnabled(): boolean {
    return Boolean(redisUrl());
}

export function getRedis(): Redis | null {
    const url = redisUrl();
    if (!url) return null;

    if (!sharedClient) {
        sharedClient = new Redis(url, REDIS_OPTIONS);
        sharedClient.on('error', (err) => logger.error('Redis client error', { error: err.message }));
    }

    return sharedClient;
}

// Readiness probe helper. When Redis isn't configured it is not a dependency,
// so we report healthy.
export async function pingRedis(): Promise<boolean> {
    const client = getRedis();
    if (!client) return true;

    try {
        return (await client.ping()) === 'PONG';
    } catch {
        return false;
    }
}

export async function closeRedis(): Promise<void> {
    if (sharedClient) {
        try {
            await sharedClient.quit();
        } catch {
            // best-effort on shutdown
        }
        sharedClient = null;
    }
}
