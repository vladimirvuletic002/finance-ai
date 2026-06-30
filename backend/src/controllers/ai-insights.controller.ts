import { Request, Response, NextFunction } from "express";
import AIInsightsService from "../services/ai/ai-insights.service.js";

class AIInsightsController {
    static async getInsights(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.id;
            const result = await AIInsightsService.getInsights(userId);
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    }
}

export default AIInsightsController;