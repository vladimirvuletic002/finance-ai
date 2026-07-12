import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { requestIdMiddleware, rateLimit, pingRedis, HttpException } from '@finance-ai/shared';
import config from './config/env.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(requestIdMiddleware);
app.use(morgan('dev'));

// NOTE: no express.json() here — the gateway must forward the raw request body
// untouched to the backend. Parsing it would consume the stream and break
// proxied POST/PATCH requests.

// Edge rate limits, Redis-backed via the shared store (memory fallback when
// REDIS_URL is unset). Applied at the single entrypoint so limits are enforced
// once, consistently, across everything behind the gateway.
const authLimiter = rateLimit({
    name: 'gw-auth',
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: 'Too many authentication attempts. Please try again later.',
});
const aiChatLimiter = rateLimit({
    name: 'gw-ai-chat',
    windowMs: 60 * 1000,
    max: 10,
    message: 'AI request limit reached. Please wait a moment before trying again.',
});

app.use('/api/v1/auth', authLimiter);
app.use('/api/v1/ai/chat', aiChatLimiter);

// Liveness / readiness for K8s probes and Argo Rollouts gates.
app.get('/healthz', (_req, res) => res.status(200).json({ status: 'ok' }));
app.get('/readyz', async (_req, res) => {
    const redis = await pingRedis().catch(() => false); // true when Redis isn't configured
    res.status(redis ? 200 : 503).json({ status: redis ? 'ready' : 'not-ready', checks: { redis } });
});

// Reverse-proxy every /api/v1/* request to the backend, preserving the full
// path and body. During the strangler migration the Authorization header is
// forwarded unchanged so the (still-monolithic) backend keeps doing auth;
// once services are carved out, the gateway will verify the JWT here and pass
// a trusted X-User-Id instead.
app.use(
    createProxyMiddleware({
        pathFilter: '/api/v1',
        target: config.BACKEND_URL,
        changeOrigin: true,
        xfwd: true,
    })
);

// Consistent error shape, matching the services: { error: { message, code } }.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const isHttp = err instanceof HttpException;
    const status = isHttp ? err.status : 500;
    const code = isHttp ? err.code : 'INTERNAL_SERVER_ERROR';
    const message = isHttp ? err.message : 'Internal Server Error';
    res.status(status).json({ error: { message, code } });
});

export default app;
