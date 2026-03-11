import prisma from '../../db/prisma';

class AIAnalyticsService {
    static async getTopSpendingCategory(userId: number, month: number, year: number) {
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 1);

        const grouped = await prisma.transaction.groupBy({
            by: ['categoryId', 'currency'],
            where: {
                userId,
                type: 'EXPENSE',
                date: {
                    gte: start,
                    lt: end
                }
            },
            _sum: {
                amount: true
            },
            orderBy: {
                _sum: {
                    amount: 'desc'
                }
            }
        });

        if (!grouped.length) {
            return null;
        }

        const top = grouped[0];

        const category = await prisma.category.findUnique({
            where: { id: top.categoryId },
            select: {
                id: true,
                name: true,
                icon: true,
                color: true
            }
        });

        return {
            month,
            year,
            categoryId: top.categoryId,
            categoryName: category?.name ?? 'Unknown',
            currency: top.currency,
            totalSpent: Number(top._sum.amount?.toString() ?? 0)
        };
    }

    static async getTotalSpending(userId: number, month: number, year: number) {
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 1);

        const [totalSpend, sampleTransaction] = await Promise.all([
            prisma.transaction.aggregate({
                where: {
                    userId,
                    type: 'EXPENSE',
                    date: {
                        gte: start,
                        lt: end
                    }
                },
                _sum: {
                    amount: true
                },
            }),
            prisma.transaction.findFirst({
                where: {
                    userId,
                    type: 'EXPENSE',
                    date: {
                        gte: start,
                        lt: end
                    }
                },
                select: {
                    currency: true
                }
            })
        ]);

        return {
            month,
            year,
            totalSpent: Number(totalSpend._sum.amount?.toString() ?? 0),
            currency: sampleTransaction?.currency ?? 'EUR'
        };

        /*const totalSpend = await prisma.transaction.aggregate({
            where: {
                userId,
                type: 'EXPENSE',
                date: {
                    gte: start,
                    lt: end
                }
            },
            _sum: {
                amount: true
            },
        });

        if(!totalSpend) return null;

        return {
            month,
            year,
            totalSpent: Number(totalSpend._sum.amount?.toString() ?? 0),
            currency: 'EUR'
        }; */

    }
}

export default AIAnalyticsService;