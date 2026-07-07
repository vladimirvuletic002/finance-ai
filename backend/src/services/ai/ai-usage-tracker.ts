import { getFixedWindowStore } from '../../lib/fixed-window-store.js';
import logger from '../../config/logger.js';

const DAY_MS = 24 * 60 * 60 * 1000;

// Every Gemini-backed call (chat reply, insight recommendation) draws from
// the same per-user daily budget, to bound API cost/abuse regardless of
// which feature triggers the call.
export const AI_DAILY_USAGE_LIMIT = 50;

/**
 * Per-user daily Gemini usage quota, backed by the shared fixed-window store
 * (Redis when configured, in-memory otherwise — see fixed-window-store.ts).
 * Using the shared store means the quota is enforced across all instances
 * rather than granting each replica its own full budget.
 *
 * On a store error the tracker fails OPEN (allows the call) so a Redis blip
 * doesn't wrongly reject users; the loss is cost-bounding during the outage.
 */
class AIUsageTracker {
    private static key(userId: number): string {
        return `ai-usage:${userId}`;
    }

    static async remaining(userId: number, limit: number = AI_DAILY_USAGE_LIMIT): Promise<number> {
        try {
            const { count } = await getFixedWindowStore().peek(this.key(userId), DAY_MS);
            return Math.max(0, limit - count);
        } catch (err) {
            logger.warn('AI usage store unavailable on peek; reporting full quota', {
                error: err instanceof Error ? err.message : String(err),
            });
            return limit;
        }
    }

    // Attempts to consume one unit of the user's daily quota. Returns false
    // (without incrementing) once the limit has been reached.
    static async tryConsume(userId: number, limit: number = AI_DAILY_USAGE_LIMIT): Promise<boolean> {
        try {
            const { allowed } = await getFixedWindowStore().consume(this.key(userId), limit, DAY_MS);
            return allowed;
        } catch (err) {
            logger.warn('AI usage store unavailable on consume; allowing call', {
                error: err instanceof Error ? err.message : String(err),
            });
            return true;
        }
    }
}

export default AIUsageTracker;
