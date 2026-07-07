import 'dotenv/config';
import { z } from 'zod';

/**
 * Centralized, fail-fast environment configuration.
 *
 * This module reads `process.env`, validates it with Zod, and exports a
 * single frozen, typed config object. Any other module that needs an
 * environment value should import `config` from here instead of touching
 * `process.env` directly.
 *
 * If validation fails, a clear error is logged and an Error is thrown at
 * module-evaluation time, which crashes the process with a non-zero exit
 * code BEFORE the HTTP server starts listening.
 */

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

    PORT: z.coerce
        .number({ invalid_type_error: 'PORT must be a number' })
        .int('PORT must be an integer')
        .positive('PORT must be a positive number')
        .default(5000),

    DATABASE_URL: z
        .string({ required_error: 'DATABASE_URL is required' })
        .min(1, 'DATABASE_URL is required')
        .refine(
            (value) => value.startsWith('postgres://') || value.startsWith('postgresql://'),
            'DATABASE_URL must be a valid PostgreSQL connection string'
        ),

    JWT_SECRET_KEY: z
        .string({ required_error: 'JWT_SECRET_KEY is required' })
        .min(8, 'JWT_SECRET_KEY must be at least 8 characters long'),

    JWT_EXPIRES_IN: z.string().min(1).default('1h'),

    GEMINI_API_KEY: z
        .string({ required_error: 'GEMINI_API_KEY is required' })
        .min(1, 'GEMINI_API_KEY is required'),

    // Optional. When set, the rate limiter, AI usage quota, and insight-refresh
    // event bus use Redis (a store shared across instances) instead of
    // per-process in-memory state. When unset, the app runs single-node with
    // in-memory fallbacks — unchanged from before Redis was introduced.
    REDIS_URL: z
        .string()
        .min(1)
        .refine(
            (value) => value.startsWith('redis://') || value.startsWith('rediss://'),
            'REDIS_URL must be a redis:// or rediss:// connection string'
        )
        .optional(),
});

export type Config = z.infer<typeof envSchema>;

function loadConfig(): Config {
    const parsed = envSchema.safeParse(process.env);

    if (!parsed.success) {
        const details = parsed.error.issues
            .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
            .join('\n');

        // Fail loudly so the problem is obvious in logs/CI output.
        // eslint-disable-next-line no-console
        console.error(`[config] Invalid environment configuration:\n${details}`);

        throw new Error(
            'Invalid environment configuration. Check the error log above and your .env file.'
        );
    }

    return parsed.data;
}

const config: Readonly<Config> = Object.freeze(loadConfig());

export default config;
