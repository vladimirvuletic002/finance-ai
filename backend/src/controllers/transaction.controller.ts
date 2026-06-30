import { Request,Response,NextFunction } from "express";
import TransactionService from "../services/transaction.service.js";
import type { ListTransactionsQuery } from "../schemas/transaction.schema.js";

class TransactionController{
    static async list(req:Request, res:Response, next: NextFunction){
        try{
            const userId = (req as any).user.id;
            // Query is validated/coerced by validateQuery middleware.
            const query = req.query as unknown as ListTransactionsQuery;
            const data = await TransactionService.list(userId,query);

            res.status(200).json(data);
        }
        catch(err){
            next(err);
        }
    }

    static async create(req:Request, res:Response, next: NextFunction){
        try{
            const userId = (req as any).user.id;
            const payload = req.body;
            const result = await TransactionService.create(userId,payload);

            res.status(201).json(result);
        }
        catch(err){
            next(err);
        }
    }

    static async update(req:Request, res:Response, next: NextFunction){
        try{
            const userId = (req as any).user.id;
            const id = Number(req.params.id);
            const payload = req.body;
            const result = await TransactionService.update(userId, id, payload as any);

            res.status(200).json(result);
        }
        catch(err){
            next(err);
        }
    }

    static async remove(req:Request, res:Response, next: NextFunction){
        try{
            const userId = (req as any).user.id;
            const id = Number(req.params.id);
            await TransactionService.remove(userId, id);

            res.status(200).json({message: 'Transaction deleted!'});
        }
        catch(err){
            next(err);
        }
    }

}

export default TransactionController;