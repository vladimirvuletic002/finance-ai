import prisma from "../db/prisma.js";
import { HttpException } from "../utils/http-exception.js";

class CategoryService {

    static async list(userId: number) {
        const data = await prisma.category.findMany({
	            where: {
            OR: [
                { isDefault: true },           // Global default categories
                { userId: userId }              // User's own categories
            ]
            },
            orderBy: [
            { isDefault: 'desc' }, // Defaults first
            { id: 'asc' }        
            ]
        }); 

        return { data };
    }

    static async create(userId: number, payload: any) {
        
        const nameExists = await prisma.category.findFirst({
            where: {
                userId,
                name: payload.name
            }
        });

        if(nameExists){
            throw new HttpException(400, 'Category with this name already exists!');
        }
        
        return await prisma.category.create({
            data: {
                userId,
                name: payload.name,
                icon: payload.icon,
                color: payload.color,
                isDefault: false
            }
        });
    }
}

export default CategoryService;
