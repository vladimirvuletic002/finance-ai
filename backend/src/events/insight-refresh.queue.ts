import { Queue } from 'bullmq';
import { getBullMqConnection } from '../db/redis.js';

/**
 * Producer side of the insight-refresh event bus.
 *
 * Transaction/savings-goal mutations previously called
 * `AIInsightSnapshotService.scheduleRefreshForUser()` in-process. That is now
 * published as a `user.data.changed` event onto this BullMQ queue, consumed by
 * insight-refresh.worker.ts. This decouples the write path from the (Gemini-
 * backed) snapshot recomputation and is the seam the future AI service consumes.
 *
 * When Redis is not configured the queue is null and callers fall back to the
 * original in-process fire-and-forget, so single-node dev is unchanged.
 */

export const INSIGHT_REFRESH_QUEUE = 'insight-refresh';
export const INSIGHT_REFRESH_JOB = 'user.data.changed';

let queue: Queue | null = null;
let initialized = false;

function getQueue(): Queue | null {
    if (initialized) return queue;
    initialized = true;

    const connection = getBullMqConnection();
    if (connection) {
        queue = new Queue(INSIGHT_REFRESH_QUEUE, { connection });
    }

    return queue;
}

/**
 * Enqueue an insight refresh for a user. Returns true if it was enqueued onto
 * the broker, false if no broker is configured (caller should refresh inline).
 *
 * The jobId is keyed per user so a burst of mutations coalesces into a single
 * pending refresh instead of piling up redundant Gemini calls.
 */
export async function enqueueInsightRefresh(userId: number): Promise<boolean> {
    const q = getQueue();
    if (!q) return false;

    await q.add(
        INSIGHT_REFRESH_JOB,
        { userId },
        {
            jobId: `user-${userId}`,
            removeOnComplete: true,
            removeOnFail: 100,
        }
    );

    return true;
}

export async function closeInsightQueue(): Promise<void> {
    if (queue) {
        await queue.close();
        queue = null;
        initialized = false;
    }
}
