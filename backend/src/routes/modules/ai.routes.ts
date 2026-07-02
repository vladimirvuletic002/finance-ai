import { Router } from 'express';
import authMiddleware from '../../middlewares/auth.middleware.js';
import { validateBody } from '../../middlewares/validate.middleware.js';
import { rateLimit } from '../../middlewares/rate-limit.middleware.js';
import { aiUsageLimitMiddleware } from '../../middlewares/ai-usage-limit.middleware.js';
import { createRequest } from '../../schemas/ai.schemas.js';
import AiController from '../../controllers/ai.controller.js';
import AIInsightSnapshotController from '../../controllers/ai-insight-snapshot.controller.js';

const router = Router();

router.use(authMiddleware);

// AI chat calls Gemini and is expensive — keep it tightly limited.
const aiChatLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    message: 'AI request limit reached. Please wait a moment before trying again.',
});

// aiUsageLimitMiddleware runs after validation so a malformed request never
// consumes a unit of the daily quota.
router.post('/chat', aiChatLimiter, validateBody(createRequest), aiUsageLimitMiddleware, AiController.respond);
router.get('/insights/latest', AIInsightSnapshotController.getLatest);

export default router;