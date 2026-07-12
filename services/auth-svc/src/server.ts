import app from './app.js';
import config from './config/env.js';
import prisma from './db/prisma.js';
import { logger } from '@finance-ai/shared';

const server = app.listen(config.PORT, () =>
    logger.info(`auth-svc listening on http://localhost:${config.PORT}`)
);

const SHUTDOWN_TIMEOUT_MS = 10_000;

function shutdown(signal: string) {
    logger.info(`Received ${signal}, starting graceful shutdown`);

    server.close(async (closeErr) => {
        if (closeErr) logger.error('Error while closing auth-svc HTTP server', { error: closeErr.message });
        try {
            await prisma.$disconnect();
            logger.info('auth-svc shutdown complete');
            process.exit(closeErr ? 1 : 0);
        } catch (err) {
            logger.error('Error during auth-svc shutdown', {
                error: err instanceof Error ? err.message : String(err),
            });
            process.exit(1);
        }
    });

    setTimeout(() => {
        logger.error('auth-svc graceful shutdown timed out, forcing exit');
        process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
