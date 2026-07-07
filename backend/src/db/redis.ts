import { Redis } from 'ioredis';
import type { ConnectionOptions } from 'bullmq';
import config from '../config/env.js';
import logger from '../config/logger.js';

/**
 * Shared Redis access.
 *
 * Redis is optional: when `REDIS_URL` is unset the app runs single-node with
 * in-memory fallbacks (rate limiter, AI usage quota, insight-refresh dispatch),
 * exactly as it did before Redis was introduced. When set, those subsystems use
 * Redis so their state is shared across instances — the prerequisite for the
 * horizontal/microservices split.
 *
 * `getRedis()` returns one lazily-created client for general command use.
 * BullMQ needs its own dedicated connections (a Worker blocks its connection on
 * a blocking pop), so queue/worker code uses `createRedisConnection()` instead.
 */

let sharedClient: Redis | null = null;

// BullMQ requires `maxRetriesPerRequest: null`; harmless for the general client.
const REDIS_OPTIONS = { maxRetriesPerRequest: null } as const;

export function isRedisEnabled(): boolean {
    return Boolean(config.REDIS_URL);
}

export function getRedis(): Redis | null {
    if (!config.REDIS_URL) return null;

    if (!sharedClient) {
        sharedClient = new Redis(config.REDIS_URL, REDIS_OPTIONS);
        sharedClient.on('error', (err) =>
            logger.error('Redis client error', { error: err.message })
        );
    }

    return sharedClient;
}

// Connection options for BullMQ. We hand BullMQ plain options (not a shared
// ioredis instance) so it manages its own dedicated connections — a Worker
// blocks its connection on a blocking pop — and to avoid the type clash from
// BullMQ bundling its own copy of ioredis. Returns null when Redis is not
// configured, so callers can fall back to in-process behaviour.
export function getBullMqConnection(): ConnectionOptions | null {
    if (!config.REDIS_URL) return null;

    const url = new URL(config.REDIS_URL);

    return {
        host: url.hostname,
        port: url.port ? Number(url.port) : 6379,
        username: url.username || undefined,
        password: url.password || undefined,
        db: url.pathname.length > 1 ? Number(url.pathname.slice(1)) : undefined,
        tls: url.protocol === 'rediss:' ? {} : undefined,
        maxRetriesPerRequest: null,
    };
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
