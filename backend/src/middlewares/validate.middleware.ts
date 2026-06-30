import { ZodSchema } from "zod";
import { Request, Response, NextFunction } from 'express';

export const validateBody = (schema: ZodSchema<any>) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if(!result.success){
        return res.status(400).json({ error: result.error.flatten() });
    }
    req.body = result.data;
    next();
};

export const validateQuery = (schema: ZodSchema<any>) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);

    if(!result.success){
        return res.status(400).json({ error: result.error.flatten() });
    }
    // Coerced/defaulted values (numbers, dates) replace the raw string query.
    (req as any).query = result.data;
    next();
};