import prisma from '../../db/prisma.js';

class AIContextService {
    static async getRecentFinancialContext(userId: number, monthsBack = 3) {
        const now = new Date();

        const start = new Date(
            now.getFullYear(),
            now.getMonth() - (monthsBack - 1),
            1
        );

        const end = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            1
        );

        const transactions = await prisma.transaction.findMany({
            where: {
                userId,
                date: {
                    gte: start,
                    lt: end
                }
            },
            select: {
                id: true,
                amount: true,
                currency: true,
                type: true,
                merchant: true,
                note: true,
                date: true,
                categoryId: true,
                category: {
                    select: {
                        id: true,
                        name: true,
                        icon: true,
                        color: true
                    }
                }
            },
            orderBy: {
                date: 'asc'
            }
        });

        if (!transactions.length) {
            return null;
        }

        const sanitizedTransactions = transactions.map((t) => ({
            id: t.id,
            amount: Number(t.amount.toString()),
            currency: t.currency,
            type: t.type,
            merchant: t.merchant,
            note: t.note,
            date: t.date.toISOString(),
            categoryId: t.categoryId,
            category: t.category
                ? {
                    id: t.category.id,
                    name: t.category.name
                }
                : null
        }));

        const totalExpenses = Number(sanitizedTransactions
            .filter(t => t.type === 'EXPENSE')
            .reduce((sum, t) => sum + t.amount, 0)
            .toFixed(2));

        const totalIncome = Number(sanitizedTransactions
            .filter(t => t.type === 'INCOME')
            .reduce((sum, t) => sum + t.amount, 0)
            .toFixed(2));

        const monthlySummariesMap = new Map<string, {
            month: string;
            totalExpenses: number;
            totalIncome: number;
            transactionCount: number;
            currencies: string[];
        }>();

        for (const tx of sanitizedTransactions) {
            const d = new Date(tx.date);
            const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

            if (!monthlySummariesMap.has(monthKey)) {
                monthlySummariesMap.set(monthKey, {
                    month: monthKey,
                    totalExpenses: 0,
                    totalIncome: 0,
                    transactionCount: 0,
                    currencies: []
                });
            }

            const summary = monthlySummariesMap.get(monthKey)!;
            summary.transactionCount += 1;

            if (!summary.currencies.includes(tx.currency)) {
                summary.currencies.push(tx.currency);
            }

            if (tx.type === 'EXPENSE') {
                summary.totalExpenses = Number((summary.totalExpenses + tx.amount).toFixed(2));
            }

            if (tx.type === 'INCOME') {
                summary.totalIncome = Number((summary.totalIncome + tx.amount).toFixed(2));
            }
        }

        const monthlySummaries = Array.from(monthlySummariesMap.values());

        return {
            period: {
                start: start.toISOString(),
                end: end.toISOString(),
                monthsBack
            },
            summary: {
                totalExpenses,
                totalIncome,
                transactionCount: sanitizedTransactions.length
            },
            monthlySummaries,
            transactions: sanitizedTransactions
        };
    }
}

export default AIContextService;