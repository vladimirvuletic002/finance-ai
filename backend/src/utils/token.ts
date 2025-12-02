import jwt, { Secret, SignOptions }from 'jsonwebtoken';

export const signToken = (payload: object, subject: string) => {
    const secret: Secret = process.env.JWT_SECRET_KEY || 'dev_secret';
    const expires = (process.env.JWT_EXPIRES_IN || '1h') as SignOptions['expiresIn'];

    const options: SignOptions = { subject, expiresIn: expires };

    return jwt.sign(payload, secret, options);
};