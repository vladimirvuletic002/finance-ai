import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import apiRouter from './routes/index.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import logger from './config/logger.js';

const app = express();
app.use(helmet());
app.use(cors());

// Use express.json() middleware to parse JSON request bodies
app.use(express.json());

// (colored) Logging HTTP requests in console
app.use(morgan('dev'));

app.use('/api/v1', apiRouter);

// Global error handler
app.use(errorMiddleware);

app.get('/health', (req, res) => res.json({ok: true}));

export default app;
