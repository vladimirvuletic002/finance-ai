import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { HttpException } from '../utils/http-exception.js';
import config from '../config/env.js';
import logger from '../config/logger.js';
import { RequestWithId } from './request-id.middleware.js';

/**
 * Prisma error messages embed a source code frame (including absolute local
 * file paths) and low-level connection/query details. That's useful in a
 * terminal but must never reach an HTTP client, in any environment — so
 * these are mapped to a safe, generic message/status before the
 * dev-vs-production branch below ever sees them.
 */
function isPrismaError(err: unknown): boolean {
    return (
        err instanceof Prisma.PrismaClientInitializationError ||
        err instanceof Prisma.PrismaClientRustPanicError ||
        err instanceof Prisma.PrismaClientKnownRequestError ||
        err instanceof Prisma.PrismaClientUnknownRequestError ||
        err instanceof Prisma.PrismaClientValidationError
    );
}

function formatPrismaError(err: unknown): { status: number; body: ErrorResponseBody } {
    const isConnectivityError =
        err instanceof Prisma.PrismaClientInitializationError || err instanceof Prisma.PrismaClientRustPanicError;

    if (isConnectivityError) {
        return {
            status: 503,
            body: {
                error: {
                    message: 'The database is currently unavailable. Please try again later.',
                    code: 'DATABASE_UNAVAILABLE',
                },
            },
        };
    }

    return {
        status: 500,
        body: {
            error: {
                message: 'A database error occurred.',
                code: 'DATABASE_ERROR',
            },
        },
    };
}

/**
 * Standardized error response shape sent to every client:
 *
 *   { "error": { "message": string, "code": string } }
 *
 * - Operational errors (HttpException) always preserve their intended
 *   status/message/code — they were thrown deliberately by a service to
 *   communicate something safe to show the caller.
 * - Prisma errors are always sanitized to a generic message/status, in every
 *   environment — their raw `.message` embeds a source code frame (with
 *   absolute local file paths) and low-level connection/query details that
 *   must never reach a client.
 * - Other unexpected/programmer errors never leak their raw message or
 *   stack to the client in production; a generic message is returned
 *   instead. In non-production environments the real message is included
 *   to help debugging.
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

    if (isPrismaError(err)) {
        return formatPrismaError(err);
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
    const { status, body } = formatErrorResponse(err, config.NODE_ENV === 'production');
    const requestId = (req as RequestWithId).id;

    logger.error(err instanceof Error ? err.message : 'Unknown error', {
        requestId,
        code: body.error.code,
        status,
        stack: err instanceof Error ? err.stack : undefined,
    });

    return res.status(status).json(body);
};
