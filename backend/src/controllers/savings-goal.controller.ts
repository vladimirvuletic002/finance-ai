import { Request, Response, NextFunction } from "express";
import SavingsGoalService from "../services/savings-goal.service";

class SavingsGoalController{
    static async getActive(req:Request, res:Response, next:NextFunction){
        try{
            const userId = (req as any).user.id;
            const data = await SavingsGoalService.getActiveGoal(userId);

            res.status(200).json(data);
        }
        catch(error){
            next(error);
        }
    }

    static async upsertActive(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.id;
            const goal = await SavingsGoalService.upsertActiveGoal(userId, req.body);
            res.status(200).json(goal);
        } catch (err) {
            next(err);
        }
    }
}

export default SavingsGoalController;