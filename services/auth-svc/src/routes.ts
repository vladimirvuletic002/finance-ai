import { Router } from 'express';
import { validateBody, authMiddleware } from '@finance-ai/shared';
import { registerSchema, loginSchema } from './schemas/auth.schemas.js';
import AuthController from './controllers/auth.controller.js';

const router = Router();

// Rate limiting for register/login is applied at the gateway edge (gw-auth),
// so it is not repeated here.
router.post('/register', validateBody(registerSchema), AuthController.register);
router.post('/login', validateBody(loginSchema), AuthController.login);
router.get('/me', authMiddleware, AuthController.me);

export default router;
