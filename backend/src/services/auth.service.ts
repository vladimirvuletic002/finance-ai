import { hashPassword, comparePassword } from '../utils/password';
import { signToken } from '../utils/token';
import { HttpException } from '../utils/http-exception';
import prisma from '../db/prisma';

class AuthService {
    static async register ( {name, email, password, confirmPass }: {name: string, email: string, password: string, confirmPass: string}) {
        const existing = await prisma.user.findUnique({where: {email} });
        if(existing){
            throw new HttpException(409, 'User with that email already exists!');
        }

        if(password !== confirmPass){
            throw new HttpException(400, 'Passwords do not match!');
        } 

        if(password.length < 8){
            throw new HttpException(400, "Password is too short!");
        }

        const passwordHash = await hashPassword(password);

        const user = await prisma.user.create({
            data: { email, passwordHash, name },
            select: { id:true, email:true, name:true }
        });

        const token = signToken({email: user.email}, String(user.id));

        return { user, token };
    }

    static async login ( { email, password} : {email: string, password:string}) {
        const user = await prisma.user.findUnique({where: {email} });

        if(!user) throw new HttpException(404, 'Invalid email!');

        const passOk = await comparePassword(password, user.passwordHash);

        if(!passOk) throw new HttpException(404, 'Invalid password!');

        const token = signToken( {email: user.email}, String(user.id));

        return { user: { id: user.id, email: user.email }, token };
    }

    static async me(userId: number) {
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, name: true } });
        if (!user) throw new HttpException(404, 'User not found');
        return user;
  }
}

export default AuthService;

