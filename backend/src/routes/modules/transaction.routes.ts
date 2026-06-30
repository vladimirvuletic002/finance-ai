import { Router } from 'express';

import authMiddleware from '../../middlewares/auth.middleware.js';
import { validateBody, validateQuery } from '../../middlewares/validate.middleware.js';
import { createTransactionSchema, updateTransactionSchema, listTransactionsQuerySchema } from '../../schemas/transaction.schema.js';
import TransactionController from '../../controllers/transaction.controller.js';

const router = Router();

router.use(authMiddleware);

router.get('/', validateQuery(listTransactionsQuerySchema), TransactionController.list);
router.post('/', validateBody(createTransactionSchema) ,TransactionController.create);
router.patch('/:id', validateBody(updateTransactionSchema) ,TransactionController.update);
router.delete('/:id',TransactionController.remove);

export default router;