import { Router } from 'express';
import { validateBody } from '../../middlewares/validate.middleware';
import { registerSchema, loginSchema } from '../../schemas/auth.schemas';
import AuthController from '../../controllers/auth.controller';


const router = Router();

router.post('/register', validateBody(registerSchema), AuthController.register);
router.post('/login', validateBody(loginSchema), AuthController.login);
router.get('/me', AuthController.me);

export default router;