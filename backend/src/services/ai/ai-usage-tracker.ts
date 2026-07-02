const DAY_MS = 24 * 60 * 60 * 1000;

// Every Gemini-backed call (chat reply, insight recommendation) draws from
// the same per-user daily budget, to bound API cost/abuse regardless of
// which feature triggers the call.
export const AI_DAILY_USAGE_LIMIT = 50;

interface UsageBucket {
    count: number;
    resetAt: number;
}

/**
 * Lightweight, dependency-free, in-process daily usage tracker — same
 * fixed-window approach as rate-limit.middleware.ts, just with a 24h window
 * instead of a short one. State is per-instance; see the scaling notes in
 * the project README for a shared-store (Redis) upgrade.
 */
class AIUsageTracker {
    private static buckets = new Map<number, UsageBucket>();

    private static getBucket(userId: number): UsageBucket {
        const now = Date.now();
        let bucket = this.buckets.get(userId);

        if (!bucket || now > bucket.resetAt) {
            bucket = { count: 0, resetAt: now + DAY_MS };
            this.buckets.set(userId, bucket);
        }

        return bucket;
    }

    static remaining(userId: number, limit: number = AI_DAILY_USAGE_LIMIT): number {
        return Math.max(0, limit - this.getBucket(userId).count);
    }

    // Attempts to consume one unit of the user's daily quota. Returns false
    // (without incrementing) once the limit has been reached.
    static tryConsume(userId: number, limit: number = AI_DAILY_USAGE_LIMIT): boolean {
        const bucket = this.getBucket(userId);

        if (bucket.count >= limit) return false;

        bucket.count += 1;
        return true;
    }
}

export default AIUsageTracker;
