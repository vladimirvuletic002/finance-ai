import { Router } from 'express';
import authMiddleware from '../../middlewares/auth.middleware.js';
import { validateBody } from '../../middlewares/validate.middleware.js';
import { rateLimit } from '../../middlewares/rate-limit.middleware.js';
import { registerSchema, loginSchema } from '../../schemas/auth.schemas.js';
import AuthController from '../../controllers/auth.controller.js';


const router = Router();

// Protect credential endpoints against brute-force / abuse.
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    message: 'Too many authentication attempts. Please try again later.',
});

router.post('/register', authLimiter, validateBody(registerSchema), AuthController.register);
router.post('/login', authLimiter, validateBody(loginSchema), AuthController.login);
router.get('/me', authMiddleware, AuthController.me);

export default router;