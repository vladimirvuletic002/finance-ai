import { Response, NextFunction } from 'express';
import { HttpException } from '../utils/http-exception.js';
import AIUsageTracker from '../services/ai/ai-usage-tracker.js';
import type { AuthRequest } from './auth.middleware.js';

/**
 * Enforces the per-user daily Gemini usage quota (AIUsageTracker) on
 * directly user-triggered AI endpoints (e.g. chat). Must run after
 * authMiddleware and after body validation, so a malformed request doesn't
 * consume quota for a call that was never going to reach Gemini.
 */
export function aiUsageLimitMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
    const userId = req.user?.id;
    if (!userId) return next(new HttpException(401, 'Unauthorized', 'UNAUTHORIZED'));

    if (!AIUsageTracker.tryConsume(userId)) {
        return next(
            new HttpException(429, 'Daily AI usage limit reached. Please try again tomorrow.', 'AI_USAGE_LIMIT_REACHED')
        );
    }

    next();
}
