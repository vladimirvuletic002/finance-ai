const DEFAULT_CODE_BY_STATUS: Record<number, string> = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    409: 'CONFLICT',
    422: 'UNPROCESSABLE_ENTITY',
    429: 'TOO_MANY_REQUESTS',
};

function defaultCodeForStatus(status: number): string {
    if (DEFAULT_CODE_BY_STATUS[status]) return DEFAULT_CODE_BY_STATUS[status];
    return status >= 500 ? 'INTERNAL_SERVER_ERROR' : 'ERROR';
}

/**
 * An operational error: an expected failure (bad input, missing resource,
 * unauthorized, etc.) whose message is safe to send to the client as-is,
 * in every environment.
 */
export class HttpException extends Error {
    status: number;
    code: string;
    isOperational: boolean;

    constructor(status: number, message: string, code?: string) {
        super(message);
        this.name = 'HttpException';
        this.status = status;
        this.code = code ?? defaultCodeForStatus(status);
        this.isOperational = true;

        Object.setPrototypeOf(this, HttpException.prototype);
    }
}
