import { Router } from 'express';
import authRoutes from './modules/auth.routes';
import transactionRoutes from './modules/transaction.routes';
import categoryRoutes from './modules/category.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/transactions', transactionRoutes);
router.use('/category', categoryRoutes);

export default router;

