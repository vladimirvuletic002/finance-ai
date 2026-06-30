import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../utils/http-exception.js';
import config from '../config/env.js';

/**
 * Standardized error response shape sent to every client:
 *
 *   { "error": { "message": string, "code": string } }
 *
 * - Operational errors (HttpException) always preserve their intended
 *   status/message/code — they were thrown deliberately by a service to
 *   communicate something safe to show the caller.
 * - Unexpected/programmer errors never leak their raw message or stack to
 *   the client in production; a generic message is returned instead. In
 *   non-production environments the real message is included to help
 *   debugging.
 */
export interface ErrorResponseBody {
    error: {
        message: string;
        code: string;
    };
}

/**
 * Pure helper that maps any thrown error into the standardized response
 * shape. Kept separate from the Express middleware so it can be unit
 * tested directly, without depending on the env-derived NODE_ENV value
 * captured by the (eagerly validated, frozen) config module at import time.
 */
export function formatErrorResponse(
    err: unknown,
    isProduction: boolean
): { status: number; body: ErrorResponseBody } {
    if (err instanceof HttpException) {
        return {
            status: err.status,
            body: {
                error: {
                    message: err.message,
                    code: err.code,
                },
            },
        };
    }

    const rawMessage = err instanceof Error ? err.message : undefined;
    const message = isProduction ? 'Internal Server Error' : rawMessage || 'Internal Server Error';

    return {
        status: 500,
        body: {
            error: {
                message,
                code: 'INTERNAL_SERVER_ERROR',
            },
        },
    };
}

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
    // Server-side logging is intentionally left as-is (out of scope here).
    console.error(err);

    const { status, body } = formatErrorResponse(err, config.NODE_ENV === 'production');

    return res.status(status).json(body);
};
