import { Request, Response, NextFunction } from 'express';
import jwt , {Secret} from 'jsonwebtoken';

export interface AuthRequest extends Request {
	user?: { id: number, email?: string};
}

export default function authMiddleware(req: AuthRequest, res: Response, next: NextFunction){
	const auth = req.headers.authorization;
	if(!auth) return res.status(401).json({ error: "Authorization header missing"});

	const parts = auth.split(' ');
	if(parts.length != 2) return res.status(401).json({ error: "Invalid auth header"});
	
	const token = parts[1];
	
	try{
		const secret: Secret = process.env.JWT_SECRET_KEY || 'dev_secret';
		const payload = jwt.verify(token,secret) as any;
		req.user = { id: Number(payload.sub), email: payload.email };
		next();
	}
	catch(err){
		return res.status(401).json({ error: 'Invalid or expired token'});
	}
		
}
