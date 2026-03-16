import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware";
import { validateBody } from "../../middlewares/validate.middleware";
import SavingsGoalController from "../../controllers/savings-goal.controller"
import { upsertSavingsGoalSchema } from "../../schemas/savings-goal.schema";

const router = Router();

router.use(authMiddleware);

router.get("/active", SavingsGoalController.getActive);
router.put("/active", validateBody(upsertSavingsGoalSchema), SavingsGoalController.upsertActive);

export default router;


