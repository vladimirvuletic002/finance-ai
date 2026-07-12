import { Request, Response, NextFunction } from 'express';
import { HttpException } from './http-exception.js';
import { getFixedWindowStore } from './fixed-window-store.js';
import logger from './logger.js';

interface RateLimitOptions {
    windowMs: number;   // time window in milliseconds
    max: number;        // max requests allowed per window per client
    message?: string;
    // Stable identifier for this limiter, namespacing its keys in the shared
    // store. Required in real use (e.g. 'gw-auth') so all instances share one
    // window; defaults to a per-instance anonymous id (used by tests).
    name?: string;
}

let anonymousCounter = 0;

/**
 * Fixed-window rate limiter backed by the shared fixed-window store (Redis when
 * REDIS_URL is set, in-memory otherwise). Fails OPEN on a store error so a
 * Redis blip can't take the API down.
 */
export function rateLimit(options: RateLimitOptions) {
    const { windowMs, max, message = 'Too many requests, please try again later.' } = options;
    const name = options.name ?? `anon-${++anonymousCounter}`;

    return async (req: Request, res: Response, next: NextFunction) => {
        const key = `ratelimit:${name}:${req.ip ?? 'unknown'}`;

        try {
            const { allowed, count, resetAt } = await getFixedWindowStore().consume(key, max, windowMs);

            res.setHeader('X-RateLimit-Limit', String(max));
            res.setHeader('X-RateLimit-Remaining', String(Math.max(0, max - count)));

            if (!allowed) {
                const retryAfterSec = Math.ceil((resetAt - Date.now()) / 1000);
                res.setHeader('Retry-After', String(retryAfterSec));
                return next(new HttpException(429, message, 'TOO_MANY_REQUESTS'));
            }

            return next();
        } catch (err) {
            logger.warn('Rate limiter store unavailable; allowing request', {
                error: err instanceof Error ? err.message : String(err),
            });
            return next();
        }
    };
}
