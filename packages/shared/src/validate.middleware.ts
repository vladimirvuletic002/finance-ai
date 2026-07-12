import { ZodSchema, ZodError } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { HttpException } from './http-exception.js';

function formatZodMessage(error: ZodError): string {
    return error.issues
        .map((issue) => {
            const path = issue.path.join('.');
            return path ? `${path}: ${issue.message}` : issue.message;
        })
        .join('; ');
}

export const validateBody =
    (schema: ZodSchema<any>) => (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            return next(new HttpException(400, formatZodMessage(result.error), 'VALIDATION_ERROR'));
        }
        req.body = result.data;
        next();
    };

export const validateQuery =
    (schema: ZodSchema<any>) => (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.query);

        if (!result.success) {
            return next(new HttpException(400, formatZodMessage(result.error), 'VALIDATION_ERROR'));
        }
        // Coerced/defaulted values (numbers, dates) replace the raw string query.
        (req as any).query = result.data;
        next();
    };
