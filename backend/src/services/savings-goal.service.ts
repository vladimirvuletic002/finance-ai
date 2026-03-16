import prisma from "../db/prisma";
import AIInsightSnapshotService from "./ai/ai-insight-snapshot.service";

class SavingsGoalService {
    static async getActiveGoal(userId: number) {
        return prisma.savingsGoal.findFirst({
            where: {
                userId,
                isActive: true
            },
            orderBy: {
                updatedAt: "desc"
            }
        });
    }

    static async upsertActiveGoal(userId: number, payload: {
        title?: string;
        targetAmount: number;
        currency?: string;
    }) {
        const existing = await prisma.savingsGoal.findFirst({
            where: {
                userId,
                isActive: true
            }
        });

        if (existing) {
            const updatedGoal = prisma.savingsGoal.update({
                where: { id: existing.id },
                data: {
                    title: payload.title ?? existing.title,
                    targetAmount: payload.targetAmount,
                    currency: payload.currency ?? existing.currency
                }
            });

            await AIInsightSnapshotService.refreshForUser(userId);

            return updatedGoal;
        }

        const newGoal = prisma.savingsGoal.create({
            data: {
                userId,
                title: payload.title ?? "Main savings goal",
                targetAmount: payload.targetAmount,
                currency: payload.currency ?? "EUR",
                isActive: true
            }
        });

        await AIInsightSnapshotService.refreshForUser(userId);

        return newGoal;
    }
}

export default SavingsGoalService;