import prisma from "../../db/prisma";
import AIInsightsService from "./ai-insights.service";

class AIInsightSnapshotService {
    static async refreshForUser(userId: number) {
        const result = await AIInsightsService.getInsights(userId);

        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        const existing = await prisma.aIInsight.findFirst({
            where: {
                userId,
                month,
                year
            },
            orderBy: {
                updatedAt: "desc"
            }
        });

        const payload = {
            userId,
            month,
            year,

            spendingChangeCurrentMonth: result.spendingChange.currentMonthExpenses,
            spendingChangePreviousMonth: result.spendingChange.previousMonthExpenses,
            spendingChangePercent: result.spendingChange.percentChange,
            spendingChangeDirection: result.spendingChange.direction,

            predictedRecurringCosts: result.recurringForecast.predictedNextMonthRecurring,

            topCategoryId: result.topSpendingCategory.categoryId,
            topCategoryName: result.topSpendingCategory.categoryName,
            topCategoryTotalSpent: result.topSpendingCategory.totalSpent,
            currency: result.savingsGoal.currency,

            savingsGoalTitle: result.savingsGoal.title ?? "Main savings goal",
            savingsGoalAmount: result.savingsGoal.goalAmount,
            currentSavingsEstimate: result.savingsGoal.currentSavingsEstimate,
            savingsProgressPercent: result.savingsGoal.progressPercent,
            savingsRemainingAmount: result.savingsGoal.remainingAmount,

            aiRecommendation: result.savingsGoal.recommendation,

            recurringTransactionsJson: result.recurringForecast.recurringTransactions,
            metaJson: {
                generatedAt: new Date().toISOString()
            }
        };

        if (existing) {
            return prisma.aIInsight.update({
                where: { id: existing.id },
                data: payload
            });
        }

        return prisma.aIInsight.create({
            data: payload
        });
    }

    static async getLatestForUser(userId: number) {
        return prisma.aIInsight.findFirst({
            where: { userId },
            orderBy: {
                updatedAt: "desc"
            }
        });
    }
}

export default AIInsightSnapshotService;