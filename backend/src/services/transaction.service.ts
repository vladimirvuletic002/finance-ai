import prisma from "../db/prisma";
import { HttpException } from "../utils/http-exception";

class TransactionService{
    
    static async list(userId: number, query: any){
        const page = Number(query.page || 1);
        const pageSize = Number(query.pageSize || 20);

        const where: any = { userId };
        if(query.type) where.type = query.type;

        if(query.categoryId) where.categoryId = Number(query.categoryId);

        if(query.dateFrom || query.dateTo){
            where.date = {};
            if(query.dateFrom) where.date.gte = new Date(String(query.dateFrom));
            if(query.dateTo) where.date.lte = new Date(String(query.dateTo));
        }

        const [data, total] = await Promise.all([
            prisma.transaction.findMany({
                where,
                include: { category: { select: {id: true, name:true}}},
                orderBy: {date: 'desc'},
                skip: (page-1) * pageSize,
                take: pageSize
            }),
            prisma.transaction.count({where})
        ]);

        return {
            data,
            pagination: { page, pageSize, total }
        };

    }

    static async create(userId: number, payload: any){
        const category = await prisma.category.findUnique({
            where: { id: payload.categoryId }
        });

        if(!category) throw new HttpException(400, 'Invalid category!');

        return await prisma.transaction.create({
            data: {
                userId,
                categoryId: payload.categoryId,
                type: payload.type,
                amount: payload.amount,
                currency: payload.currency || 'EUR',
                note: payload.note,
                merchant: payload.merchant,
                date: new Date(payload.date) 
            }
        });

    }

    static async update(userId: number, id: number, payload: any){
        const transaction = await prisma.transaction.findUnique({where: {id}});

        if(!transaction || transaction.userId != userId) throw new HttpException(404, 'Transaction not found!');

        return await prisma.transaction.update({
            where: { id },
            data: payload
        });
    }

    static async remove(userId: number, id: number){
        const transaction = await prisma.transaction.findUnique({where: {id}});

        if(!transaction || transaction.userId != userId) throw new HttpException(404, 'Transaction not found!');

        await prisma.transaction.delete({
            where: { id }
        });
    }

}

export default TransactionService;