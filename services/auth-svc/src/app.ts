import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { requestIdMiddleware } from '@finance-ai/shared';
import authRoutes from './routes.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import prisma from './db/prisma.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(requestIdMiddleware);
app.use(express.json());
app.use(morgan('dev'));

// Liveness / readiness for K8s probes and Argo Rollouts gates.
app.get('/healthz', (_req, res) => res.status(200).json({ status: 'ok' }));
app.get('/readyz', async (_req, res) => {
    let db = false;
    try {
        await prisma.$queryRaw`SELECT 1`;
        db = true;
    } catch {
        db = false;
    }
    res.status(db ? 200 : 503).json({ status: db ? 'ready' : 'not-ready', checks: { db } });
});

// Mounted at the full public path so the gateway can proxy /api/v1/auth/* here
// without rewriting the path.
app.use('/api/v1/auth', authRoutes);

app.use(errorMiddleware);

export default app;
