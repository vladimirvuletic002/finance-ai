export type AIInsightsResponse = {
    spendingChange: {
        currentMonthExpenses: number;
        previousMonthExpenses: number;
        percentChange: number;
        direction: 'up' | 'down' | 'same';
        currency: string;
    };
    recurringForecast: {
        predictedNextMonthRecurring: number;
        recurringTransactions: Array<{
            merchant: string;
            averageAmount: number;
            currency: string;
            occurrences: number;
        }>;
        currency: string;
    };
    topSpendingCategory: {
        categoryId: number | null;
        categoryName: string | null;
        totalSpent: number;
        currency: string;
    };
    savingsGoal: {
        goalAmount: number;
        currentSavingsEstimate: number;
        progressPercent: number;
        remainingAmount: number;
        recommendation: string;
        currency: string;
    };
};

export type AIInsightSnapshotResponse = {
    id: number;
    userId: number;
    month: number;
    year: number;

    spendingChangeCurrentMonth: number;
    spendingChangePreviousMonth: number;
    spendingChangePercent: number;
    spendingChangeDirection: 'up' | 'down' | 'same';

    predictedRecurringCosts: number;

    topCategoryId: number | null;
    topCategoryName: string | null;
    topCategoryTotalSpent: number;
    currency: string;

    savingsGoalTitle: string | null;
    savingsGoalAmount: number;
    currentSavingsEstimate: number;
    savingsProgressPercent: number;
    savingsRemainingAmount: number;

    aiRecommendation: string;
    recurringTransactionsJson: any;
    metaJson: any;

    createdAt: string;
    updatedAt: string;
} | null;