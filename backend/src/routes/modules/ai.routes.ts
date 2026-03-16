import { Router } from 'express';
import authMiddleware from '../../middlewares/auth.middleware';
import { validateBody } from '../../middlewares/validate.middleware';
import { createRequest } from '../../schemas/ai.schemas';
import AiController from '../../controllers/ai.controller';
import AIInsightsController from '../../controllers/ai-insights.controller';
import AIInsightSnapshotController from '../../controllers/ai-insight-snapshot.controller';

const router = Router();

router.use(authMiddleware);

router.post('/chat', validateBody(createRequest), AiController.respond);
router.get('/insights', AIInsightsController.getInsights);
router.get('/insights/latest', AIInsightSnapshotController.getLatest);

export default router;