import { Router } from 'express';

import authMiddleware from '../../middlewares/auth.middleware';
//import { validateBody } from '../../middlewares/validate.middleware';
//import { createTransactionSchema } from '../../schemas/transaction.schema';
import CategoryController from '../../controllers/category.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', CategoryController.list);

export default router;