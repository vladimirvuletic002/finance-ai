import { Router } from 'express';

import authMiddleware from '../../middlewares/auth.middleware';
import { validateBody } from '../../middlewares/validate.middleware';
import { createTransactionSchema, updateTransactionSchema } from '../../schemas/transaction.schema';
import TransactionController from '../../controllers/transaction.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', TransactionController.list);
router.post('/', validateBody(createTransactionSchema) ,TransactionController.create);
router.patch('/:id', validateBody(updateTransactionSchema) ,TransactionController.update);
router.delete('/:id',TransactionController.remove);

export default router;