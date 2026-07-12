import { randomUUID } from 'crypto';
import { Request, Response, NextFunction } from 'express';

export interface RequestWithId extends Request {
    id: string;
}

const REQUEST_ID_HEADER = 'X-Request-Id';

/**
 * Attaches a request id (reused from an inbound X-Request-Id header when
 * present, e.g. from a load balancer or upstream gateway, otherwise freshly
 * generated) to `req.id` and echoes it back on the response so it can be
 * correlated across services, logs, and client bug reports.
 */
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
    const incoming = req.headers['x-request-id'];
    const id = typeof incoming === 'string' && incoming.length > 0 ? incoming : randomUUID();

    (req as RequestWithId).id = id;
    res.setHeader(REQUEST_ID_HEADER, id);
    next();
}
