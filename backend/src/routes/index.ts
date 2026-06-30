import { Router } from 'express';
import authRoutes from './modules/auth.routes.js';
import transactionRoutes from './modules/transaction.routes.js';
import categoryRoutes from './modules/category.routes.js';
import aiRoutes from './modules/ai.routes.js';
import savingsGoalRoutes from './modules/savings-goal.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/transactions', transactionRoutes);
router.use('/category', categoryRoutes);
router.use('/ai', aiRoutes);
router.use('/savings-goal', savingsGoalRoutes);

export default router;

