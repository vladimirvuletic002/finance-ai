import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { validateBody } from "../../middlewares/validate.middleware.js";
import SavingsGoalController from "../../controllers/savings-goal.controller.js"
import { upsertSavingsGoalSchema } from "../../schemas/savings-goal.schema.js";

const router = Router();

router.use(authMiddleware);

router.get("/active", SavingsGoalController.getActive);
router.put("/active", validateBody(upsertSavingsGoalSchema), SavingsGoalController.upsertActive);

export default router;


