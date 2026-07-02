import prisma from "../../db/prisma.js";
import AIInsightsService from "./ai-insights.service.js";

class AIInsightSnapshotService {
    static async refreshForUser(userId: number) {
        const result = await AIInsightsService.getInsights(userId);

        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

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

        return prisma.aIInsight.upsert({
            where: { userId_year_month: { userId, year, month } },
            create: payload,
            update: payload
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