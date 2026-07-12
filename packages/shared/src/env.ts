import { z } from 'zod';

/**
 * Per-service environment loader.
 *
 * Each service composes only the env fields it needs and calls `loadEnv` at
 * startup. Validation is fail-fast: on any invalid/missing variable it logs a
 * per-field error list and throws before the service starts listening. This
 * replaces the single monolithic frozen `config` object with a helper each
 * service uses with its own schema.
 */
export function loadEnv<T extends z.ZodRawShape>(shape: T): Readonly<z.infer<z.ZodObject<T>>> {
    const schema = z.object(shape);
    const parsed = schema.safeParse(process.env);

    if (!parsed.success) {
        const details = parsed.error.issues
            .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
            .join('\n');

        // eslint-disable-next-line no-console
        console.error(`[config] Invalid environment configuration:\n${details}`);

        throw new Error(
            'Invalid environment configuration. Check the error log above and your .env file.'
        );
    }

    return Object.freeze(parsed.data);
}

const redisUrl = z
    .string()
    .min(1)
    .refine(
        (value) => value.startsWith('redis://') || value.startsWith('rediss://'),
        'REDIS_URL must be a redis:// or rediss:// connection string'
    );

/**
 * Reusable field schemas so services stay consistent. Compose into a `loadEnv`
 * call, e.g. `loadEnv({ NODE_ENV: envFields.NODE_ENV, PORT: envFields.port(8080) })`.
 */
export const envFields = {
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    port: (defaultPort: number) =>
        z.coerce.number().int().positive().default(defaultPort),
    redisUrl,
    optionalRedisUrl: redisUrl.optional(),
};
