import { Request, Response, NextFunction } from "express";
import AIInsightSnapshotService from "../services/ai/ai-insight-snapshot.service.js";

class AIInsightSnapshotController {
    static async getLatest(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.id;
            const snapshot = await AIInsightSnapshotService.getCurrentForUser(userId);
            res.status(200).json(snapshot);
        } catch (err) {
            next(err);
        }
    }
}

export default AIInsightSnapshotController;