import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import apiRouter from './routes/index.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { requestIdMiddleware, RequestWithId } from './middlewares/request-id.middleware.js';
import logger from './config/logger.js';
import config from './config/env.js';
import prisma from './db/prisma.js';
import { pingRedis } from './db/redis.js';

const app = express();
app.use(helmet());
app.use(cors());

// Assign/propagate a request id before anything else so it's available to
// every downstream log line (including the HTTP request log below).
app.use(requestIdMiddleware);

// Use express.json() middleware to parse JSON request bodies
app.use(express.json());

morgan.token('id', (req) => (req as RequestWithId).id);

app.use(
    config.NODE_ENV === 'production'
        ? morgan((tokens, req, res) =>
              JSON.stringify({
                  requestId: tokens.id(req, res),
                  method: tokens.method(req, res),
                  url: tokens.url(req, res),
                  status: Number(tokens.status(req, res)),
                  responseTimeMs: Number(tokens['response-time'](req, res)),
              }),
              { stream: { write: (line) => logger.info(line.trim()) } }
          )
        // (colored) Logging HTTP requests in console
        : morgan('dev')
);

app.use('/api/v1', apiRouter);

// Liveness: the process is up and the event loop is responsive. Kept dependency-
// free so a slow/broken DB or Redis doesn't cause the orchestrator to kill an
// otherwise-healthy pod. `/health` is retained for backward compatibility.
app.get('/health', (req, res) => res.json({ ok: true }));
app.get('/healthz', (req, res) => res.status(200).json({ status: 'ok' }));

// Readiness: only route traffic here when the backing services this instance
// needs are reachable. Used by K8s readiness probes and Argo Rollouts gates.
app.get('/readyz', async (req, res) => {
    const checks = { db: false, redis: false };

    try {
        await prisma.$queryRaw`SELECT 1`;
        checks.db = true;
    } catch {
        checks.db = false;
    }

    try {
        checks.redis = await pingRedis(); // true when Redis isn't configured
    } catch {
        checks.redis = false;
    }

    const ready = checks.db && checks.redis;
    res.status(ready ? 200 : 503).json({ status: ready ? 'ready' : 'not-ready', checks });
});

// Global error handler
app.use(errorMiddleware);

export default app;
