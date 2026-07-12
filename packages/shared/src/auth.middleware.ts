import { Request, Response, NextFunction } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import { HttpException } from './http-exception.js';

export interface AuthRequest extends Request {
    user?: { id: number; email?: string };
}

/**
 * Verifies a Bearer JWT and populates `req.user`. Reads `JWT_SECRET_KEY` from
 * the environment directly (each service validates its own env at startup) so
 * every service — and the gateway — can verify tokens the auth service signed,
 * all sharing one secret.
 */
export default function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
    const auth = req.headers.authorization;
    if (!auth) return next(new HttpException(401, 'Authorization header missing', 'UNAUTHORIZED'));

    const parts = auth.split(' ');
    if (parts.length !== 2) return next(new HttpException(401, 'Invalid auth header', 'UNAUTHORIZED'));

    const token = parts[1];

    try {
        const secret: Secret = process.env.JWT_SECRET_KEY as string;
        const payload = jwt.verify(token, secret) as { sub?: string; email?: string };
        req.user = { id: Number(payload.sub), email: payload.email };
        next();
    } catch {
        return next(new HttpException(401, 'Invalid or expired token', 'UNAUTHORIZED'));
    }
}
