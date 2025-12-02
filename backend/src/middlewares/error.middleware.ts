import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../utils/http-exception';

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
	/*console.error(err);
	const status = err.status || 500;
	const message = err.message || "Internal Server Error";
	res.status(status).json({error: message}); */

	console.error(err);

	if(err instanceof HttpException){
		return res.status(err.status).json({
			error: err.message
		});
	}

	return res.status(500).json({
		error: "Internal Server Error",
		details: err.message
	});

};
