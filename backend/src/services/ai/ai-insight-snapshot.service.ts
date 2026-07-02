import prisma from "../../db/prisma.js";
import logger from "../../config/logger.js";
import AIInsightsService from "./ai-insights.service.js";

class AIInsightSnapshotService {
    // Fire-and-forget wrapper around refreshForUser() for callers that must
    // not block their HTTP response on a Gemini call (transaction/savings-goal
    // mutations). Errors are logged, never thrown back to the caller — the
    // snapshot simply stays stale until the next successful refresh.
    static scheduleRefreshForUser(userId: number): void {
        this.refreshForUser(userId).catch((err) => {
            logger.error('Failed to refresh AI insight snapshot', {
                userId,
                error: err instanceof Error ? err.message : String(err),
            });
        });
    }

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

    // Serves the cached snapshot for the current calendar month, generating
    // one on demand (deterministic analytics + a single Gemini call) the
    // first time it's requested that month. Repeat requests are a plain DB
    // read — no recomputation, no Gemini call — until the next transaction
    // mutation invalidates it via refreshForUser().
    static async getCurrentForUser(userId: number) {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        const existing = await prisma.aIInsight.findUnique({
            where: { userId_year_month: { userId, year, month } }
        });

        return existing ?? this.refreshForUser(userId);
    }
}

export default AIInsightSnapshotService;