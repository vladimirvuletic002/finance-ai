import prisma from "../db/prisma.js";
import { HttpException } from "../utils/http-exception.js";
import type { ListTransactionsQuery } from "../schemas/transaction.schema.js";
import AIInsightSnapshotService from "./ai/ai-insight-snapshot.service.js";

class TransactionService{

    static async list(userId: number, query: ListTransactionsQuery){
        const { page, pageSize } = query;

        const where: any = { userId };
        if(query.type) where.type = query.type;

        if(query.categoryId) where.categoryId = query.categoryId;

        if(query.dateFrom || query.dateTo){
            where.date = {};
            if(query.dateFrom) where.date.gte = query.dateFrom;
            if(query.dateTo) where.date.lte = query.dateTo;
        }

        const [data, total] = await Promise.all([
            prisma.transaction.findMany({
                where,
                include: { category: { select: {id: true, name:true}}},
                orderBy: {id: 'desc'},
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

    // Ensures the category exists and is usable by this user
    // (either a global default or one the user owns, and not soft-deleted).
    private static async assertCategoryOwnership(userId: number, categoryId: number){
        const category = await prisma.category.findFirst({
            where: {
                id: categoryId,
                deletedAt: null,
                OR: [
                    { isDefault: true },
                    { userId }
                ]
            }
        });

        if(!category) throw new HttpException(400, 'Invalid category!');
    }

    static async create(userId: number, payload: any){
        await this.assertCategoryOwnership(userId, payload.categoryId);

        const transaction = await prisma.transaction.create({
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

        AIInsightSnapshotService.scheduleRefreshForUser(userId);

        return transaction;

    }

    static async update(userId: number, id: number, payload: any){
        const transaction = await prisma.transaction.findUnique({where: {id}});

        if(!transaction || transaction.userId != userId) throw new HttpException(404, 'Transaction not found!');

        if(payload.categoryId !== undefined){
            await this.assertCategoryOwnership(userId, payload.categoryId);
        }

        // Normalize date string into a real Date before persisting.
        const data = { ...payload };
        if(data.date !== undefined) data.date = new Date(data.date);

        const updated = await prisma.transaction.update({
            where: { id },
            data
        });

        AIInsightSnapshotService.scheduleRefreshForUser(userId);

        return updated;
    }

    static async remove(userId: number, id: number){
        const transaction = await prisma.transaction.findUnique({where: {id}});

        if(!transaction || transaction.userId != userId) throw new HttpException(404, 'Transaction not found!');

        await prisma.transaction.delete({
            where: { id }
        });

        AIInsightSnapshotService.scheduleRefreshForUser(userId);
    }

}

export default TransactionService;