import { Worker } from 'bullmq';
import { INSIGHT_REFRESH_QUEUE } from './insight-refresh.queue.js';
import { getBullMqConnection } from '../db/redis.js';
import AIInsightSnapshotService from '../services/ai/ai-insight-snapshot.service.js';
import logger from '../config/logger.js';

/**
 * Consumer side of the insight-refresh event bus. Runs the (Gemini-backed)
 * snapshot recomputation off the request path.
 *
 * Today this worker is started inside the backend process (server.ts); once the
 * AI service is extracted this same worker moves there unchanged, consuming the
 * same queue. Returns null when Redis is not configured (no broker to consume).
 */
export function startInsightRefreshWorker(): Worker | null {
    const connection = getBullMqConnection();
    if (!connection) return null;

    const worker = new Worker(
        INSIGHT_REFRESH_QUEUE,
        async (job) => {
            const userId = job.data.userId as number;
            await AIInsightSnapshotService.refreshForUser(userId);
        },
        { connection }
    );

    worker.on('ready', () => logger.info('Insight refresh worker ready'));
    worker.on('failed', (job, err) =>
        logger.error('Insight refresh job failed', {
            userId: job?.data?.userId,
            error: err instanceof Error ? err.message : String(err),
        })
    );

    return worker;
}
