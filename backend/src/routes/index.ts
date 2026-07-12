import { Router } from 'express';
import transactionRoutes from './modules/transaction.routes.js';
import categoryRoutes from './modules/category.routes.js';
import aiRoutes from './modules/ai.routes.js';
import savingsGoalRoutes from './modules/savings-goal.routes.js';

const router = Router();

// Auth (register/login/me) has been extracted to auth-svc and is routed there
// by the gateway; the backend no longer serves /auth. It still verifies JWTs
// (authMiddleware) on its own protected routes below.
router.use('/transactions', transactionRoutes);
router.use('/category', categoryRoutes);
router.use('/ai', aiRoutes);
router.use('/savings-goal', savingsGoalRoutes);

export default router;

