import { Request,Response,NextFunction } from "express";
import AIChatService from '../services/ai/ai-chat.service.js';

class AiController{

    static async respond(req:Request, res:Response, next:NextFunction){
        try{
            const userId = (req as any).user.id;
            const { prompt } = req.body;
            const result = await AIChatService.respond(userId, prompt);

            res.status(200).json(result);
        }
        catch(err){
            next(err);
        }
    }

}

export default AiController;