import { Request, Response, NextFunction } from 'express';
import jwt , {Secret} from 'jsonwebtoken';
import config from '../config/env.js';
import { HttpException } from '../utils/http-exception.js';

export interface AuthRequest extends Request {
	user?: { id: number, email?: string};
}

export default function authMiddleware(req: AuthRequest, res: Response, next: NextFunction){
	const auth = req.headers.authorization;
	if(!auth) return next(new HttpException(401, 'Authorization header missing', 'UNAUTHORIZED'));

	const parts = auth.split(' ');
	if(parts.length != 2) return next(new HttpException(401, 'Invalid auth header', 'UNAUTHORIZED'));

	const token = parts[1];

	try{
		const secret: Secret = config.JWT_SECRET_KEY;
		const payload = jwt.verify(token,secret) as any;
		req.user = { id: Number(payload.sub), email: payload.email };
		next();
	}
	catch(err){
		return next(new HttpException(401, 'Invalid or expired token', 'UNAUTHORIZED'));
	}

}
