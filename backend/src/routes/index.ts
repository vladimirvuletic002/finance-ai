import { Router } from 'express';
import authRoutes from './modules/auth.routes';
import transactionRoutes from './modules/transaction.routes';
import categoryRoutes from './modules/category.routes';
import aiRoutes from './modules/ai.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/transactions', transactionRoutes);
router.use('/category', categoryRoutes);
router.use('/ai', aiRoutes);

export default router;

