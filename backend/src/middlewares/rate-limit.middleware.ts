import { Request, Response, NextFunction } from 'express';

interface RateLimitOptions {
    windowMs: number;   // time window in milliseconds
    max: number;        // max requests allowed per window per client
    message?: string;
}

interface Bucket {
    count: number;
    resetAt: number;
}

/**
 * Lightweight, dependency-free fixed-window rate limiter.
 *
 * State is kept in-process, so limits are per backend instance. For a
 * horizontally scaled deployment this should be backed by a shared store
 * (e.g. Redis) — see the scaling notes in the project README.
 */
export function rateLimit(options: RateLimitOptions) {
    const { windowMs, max, message = 'Too many requests, please try again later.' } = options;
    const buckets = new Map<string, Bucket>();

    return (req: Request, res: Response, next: NextFunction) => {
        const key = req.ip ?? 'unknown';
        const now = Date.now();

        let bucket = buckets.get(key);
        if (!bucket || now > bucket.resetAt) {
            bucket = { count: 0, resetAt: now + windowMs };
            buckets.set(key, bucket);
        }

        bucket.count++;

        const remaining = Math.max(0, max - bucket.count);
        res.setHeader('X-RateLimit-Limit', String(max));
        res.setHeader('X-RateLimit-Remaining', String(remaining));

        if (bucket.count > max) {
            const retryAfterSec = Math.ceil((bucket.resetAt - now) / 1000);
            res.setHeader('Retry-After', String(retryAfterSec));
            return res.status(429).json({ error: message });
        }

        return next();
    };
}
