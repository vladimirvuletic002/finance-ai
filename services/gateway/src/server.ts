import app from './app.js';
import config from './config/env.js';
import { logger, closeRedis } from '@finance-ai/shared';

const server = app.listen(config.PORT, () =>
    logger.info(`Gateway listening on http://localhost:${config.PORT}`, { backend: config.BACKEND_URL })
);

const SHUTDOWN_TIMEOUT_MS = 10_000;

function shutdown(signal: string) {
    logger.info(`Received ${signal}, starting graceful shutdown`);

    server.close(async (closeErr) => {
        if (closeErr) logger.error('Error while closing gateway HTTP server', { error: closeErr.message });
        try {
            await closeRedis();
            logger.info('Gateway shutdown complete');
            process.exit(closeErr ? 1 : 0);
        } catch (err) {
            logger.error('Error during gateway shutdown', {
                error: err instanceof Error ? err.message : String(err),
            });
            process.exit(1);
        }
    });

    setTimeout(() => {
        logger.error('Gateway graceful shutdown timed out, forcing exit');
        process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
