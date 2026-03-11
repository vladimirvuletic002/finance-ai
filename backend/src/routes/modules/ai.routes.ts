import { Router } from 'express';
import authMiddleware from '../../middlewares/auth.middleware';
import { validateBody } from '../../middlewares/validate.middleware';
import { createRequest } from '../../schemas/ai.schemas';
import AiController from '../../controllers/ai.controller';


const router = Router();

router.use(authMiddleware);

router.post('/chat', validateBody(createRequest), AiController.respond);

export default router;