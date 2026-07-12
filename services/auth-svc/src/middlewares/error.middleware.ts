import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { HttpException, logger, type RequestWithId } from '@finance-ai/shared';

/**
 * Standardized error responses: { error: { message, code } }.
 * - HttpException: preserves its status/message/code (safe, intentional).
 * - Prisma errors: sanitized to a generic message in every environment (their
 *   raw message embeds a source frame with local paths + query details).
 * - Anything else: generic message; raw message only outside production.
 *
 * Local to auth-svc (rather than shared) so @prisma/client stays out of
 * Prisma-free services like the gateway.
 */
interface ErrorResponseBody {
    error: { message: string; code: string };
}

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
            body: { error: { message: 'The database is currently unavailable. Please try again later.', code: 'DATABASE_UNAVAILABLE' } },
        };
    }

    return {
        status: 500,
        body: { error: { message: 'A database error occurred.', code: 'DATABASE_ERROR' } },
    };
}

export function formatErrorResponse(err: unknown, isProduction: boolean): { status: number; body: ErrorResponseBody } {
    if (err instanceof HttpException) {
        return { status: err.status, body: { error: { message: err.message, code: err.code } } };
    }

    if (isPrismaError(err)) {
        return formatPrismaError(err);
    }

    const rawMessage = err instanceof Error ? err.message : undefined;
    const message = isProduction ? 'Internal Server Error' : rawMessage || 'Internal Server Error';

    return { status: 500, body: { error: { message, code: 'INTERNAL_SERVER_ERROR' } } };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorMiddleware = (err: any, req: Request, res: Response, _next: NextFunction) => {
    const { status, body } = formatErrorResponse(err, process.env.NODE_ENV === 'production');
    const requestId = (req as RequestWithId).id;

    logger.error(err instanceof Error ? err.message : 'Unknown error', {
        requestId,
        code: body.error.code,
        status,
        stack: err instanceof Error ? err.stack : undefined,
    });

    return res.status(status).json(body);
};
