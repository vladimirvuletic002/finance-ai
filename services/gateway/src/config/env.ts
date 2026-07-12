import { z } from 'zod';
import { loadEnv, envFields } from '@finance-ai/shared';

/**
 * Gateway environment. The gateway is the single public entrypoint: it needs a
 * port to listen on, the internal backend URL to proxy to, and (optionally)
 * Redis for a shared rate-limit store. It deliberately does NOT need the DB or
 * Gemini keys — those belong to the services behind it.
 */
const config = loadEnv({
    NODE_ENV: envFields.NODE_ENV,
    PORT: envFields.port(8080),
    REDIS_URL: envFields.optionalRedisUrl,
    BACKEND_URL: z.string().url().default('http://localhost:5003'),
});

export default config;
