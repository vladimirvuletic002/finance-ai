import jwt, { Secret, SignOptions }from 'jsonwebtoken';
import config from '../config/env.js';

export const signToken = (payload: object, subject: string) => {
    const secret: Secret = config.JWT_SECRET_KEY;
    const expires = config.JWT_EXPIRES_IN as SignOptions['expiresIn'];

    const options: SignOptions = { subject, expiresIn: expires };

    return jwt.sign(payload, secret, options);
};