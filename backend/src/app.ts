import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import apiRouter from './routes/index.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { requestIdMiddleware, RequestWithId } from './middlewares/request-id.middleware.js';
import logger from './config/logger.js';
import config from './config/env.js';

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

// Global error handler
app.use(errorMiddleware);

app.get('/health', (req, res) => res.json({ok: true}));

export default app;
