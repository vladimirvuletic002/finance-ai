import { z } from 'zod';
import { loadEnv, envFields } from '@finance-ai/shared';

/**
 * auth-svc environment. Needs the shared PostgreSQL (for the User table) and
 * the JWT secret/expiry (it is the only service that SIGNS tokens). It does not
 * need Redis or Gemini.
 */
const config = loadEnv({
    NODE_ENV: envFields.NODE_ENV,
    PORT: envFields.port(5001),
    DATABASE_URL: z
        .string()
        .min(1)
        .refine(
            (value) => value.startsWith('postgres://') || value.startsWith('postgresql://'),
            'DATABASE_URL must be a valid PostgreSQL connection string'
        ),
    JWT_SECRET_KEY: z.string().min(8, 'JWT_SECRET_KEY must be at least 8 characters long'),
    JWT_EXPIRES_IN: z.string().min(1).default('1h'),
});

export default config;
