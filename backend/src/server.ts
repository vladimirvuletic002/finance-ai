import app from './app.js';
import logger from './config/logger.js';
import config from './config/env.js';
import prisma from './db/prisma.js';
import { closeRedis, isRedisEnabled } from './db/redis.js';
import { closeInsightQueue } from './events/insight-refresh.queue.js';
import { startInsightRefreshWorker } from './events/insight-refresh.worker.js';

const server = app.listen(config.PORT, () =>
    logger.info(`Server is listening on http://localhost:${config.PORT}`)
);

// When a broker is configured, consume insight-refresh events in-process for
// now. Once the AI service is extracted this worker moves there unchanged.
const insightWorker = isRedisEnabled() ? startInsightRefreshWorker() : null;

const SHUTDOWN_TIMEOUT_MS = 10_000;

function shutdown(signal: string) {
    logger.info(`Received ${signal}, starting graceful shutdown`);

    // Stop accepting new connections; let in-flight requests finish.
    server.close(async (closeErr) => {
        if (closeErr) {
            logger.error('Error while closing HTTP server', { error: closeErr.message });
        }

        try {
            if (insightWorker) await insightWorker.close();
            await closeInsightQueue();
            await prisma.$disconnect();
            await closeRedis();
            logger.info('Shutdown complete');
            process.exit(closeErr ? 1 : 0);
        } catch (disconnectErr) {
            logger.error('Error during graceful shutdown', {
                error: disconnectErr instanceof Error ? disconnectErr.message : String(disconnectErr),
            });
            process.exit(1);
        }
    });

    // Safety net in case something (e.g. a stuck connection) prevents
    // server.close() from ever calling back.
    setTimeout(() => {
        logger.error('Graceful shutdown timed out, forcing exit');
        process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
