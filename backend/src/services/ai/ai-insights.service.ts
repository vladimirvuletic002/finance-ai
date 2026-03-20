import prisma from "../../db/prisma";
import SavingsGoalService from "../savings-goal.service";
import AIRecommendationService from "./ai-recommendation.service";

type RecurringCandidate = {
  key: string;
  merchant: string;
  categoryName: string | null;
  currency: string;
  amounts: number[];
  monthKeys: Set<string>;
  occurrences: number;
};

class AIInsightsService {
  static getMonthRange(year: number, month: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);
    return { start, end };
  }

  static normalizeRecurringKey(txt: {
    merchant?: string | null;
    category: { name?: string | null } | null;
    categoryId?: number | null;
  }) {
    const merchant = txt.merchant?.trim().toLowerCase();
    if (merchant) return `merchant:${merchant}`;

    const categoryName = txt.category?.name?.trim().toLowerCase();
    if (categoryName) return `category:${categoryName}`;

    return `category-id:${txt.categoryId ?? "unknown"}`;
  }

  static getDisplayRecurringName(tx: {
    merchant?: string | null;
    category?: { name?: string | null } | null;
    categoryId?: number | null;
  }) {
    return (
      tx.merchant?.trim() ||
      tx.category?.name ||
      `Category ${tx.categoryId ?? ""}`
    );
  }

  static hasStableAmount(amounts: number[]) {
    if (amounts.length < 2) return false;

    const avg = amounts.reduce((s, v) => s + v, 0) / amounts.length;
    if (avg === 0) return false;

    const maxDeviationPercent = Math.max(
      ...amounts.map((a) => (Math.abs(a - avg) / avg) * 100),
    );

    return maxDeviationPercent <= 20;
  }

  static async getInsights(userId: number) {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    const currentRange = this.getMonthRange(currentYear, currentMonth);
    const previousRange = this.getMonthRange(previousYear, previousMonth);

    const [
      currentMonthExpensesAgg,
      previousMonthExpensesAgg,
      currentMonthIncomeAgg,
      currentMonthTopCategoryRaw,
      recentTransactions,
      activeGoal,
    ] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          userId,
          type: "EXPENSE",
          date: {
            gte: currentRange.start,
            lt: currentRange.end,
          },
        },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          userId,
          type: "EXPENSE",
          date: {
            gte: previousRange.start,
            lt: previousRange.end,
          },
        },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          userId,
          type: "INCOME",
          date: {
            gte: currentRange.start,
            lt: currentRange.end,
          },
        },
        _sum: { amount: true },
      }),
      prisma.transaction.groupBy({
        by: ["categoryId", "currency"],
        where: {
          userId,
          type: "EXPENSE",
          date: {
            gte: currentRange.start,
            lt: currentRange.end,
          },
        },
        _sum: {
          amount: true,
        },
        orderBy: {
          _sum: {
            amount: "desc",
          },
        },
      }),
      prisma.transaction.findMany({
        where: {
          userId,
          date: {
            gte: new Date(currentYear, currentMonth - 3, 1),
            lt: currentRange.end,
          },
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          date: "asc",
        },
      }),
      SavingsGoalService.getActiveGoal(userId),
    ]);

    const currentMonthExpenses = Number(
      currentMonthExpensesAgg._sum.amount?.toString() ?? 0,
    );
    const previousMonthExpenses = Number(
      previousMonthExpensesAgg._sum.amount?.toString() ?? 0,
    );
    const currentMonthIncome = Number(
      currentMonthIncomeAgg._sum.amount?.toString() ?? 0,
    );

    let percentChange = 0;
    let direction: "up" | "down" | "same" = "same";

    if (previousMonthExpenses === 0 && currentMonthExpenses > 0) {
      percentChange = 100;
      direction = "up";
    } else if (previousMonthExpenses > 0) {
      const rawChange =
        ((currentMonthExpenses - previousMonthExpenses) /
          previousMonthExpenses) *
        100;

      percentChange = Number(Math.abs(rawChange).toFixed(2));

      if (rawChange > 0) direction = "up";
      else if (rawChange < 0) direction = "down";
      else direction = "same";
    }

    let topSpendingCategory = {
      categoryId: null as number | null,
      categoryName: null as string | null,
      totalSpent: 0,
      currency: "EUR",
    };

    if (currentMonthTopCategoryRaw.length > 0) {
      const top = currentMonthTopCategoryRaw[0];

      const category = await prisma.category.findUnique({
        where: { id: top.categoryId },
        select: { id: true, name: true },
      });

      topSpendingCategory = {
        categoryId: top.categoryId,
        categoryName: category?.name ?? "Unknown",
        totalSpent: Number(top._sum.amount?.toString() ?? 0),
        currency: top.currency,
      };
    }

    const recurringMap = new Map<string, RecurringCandidate>();
    const expenseTransactions = recentTransactions.filter(
      (t) => t.type === "EXPENSE",
    );

    for (const tx of expenseTransactions) {
      const key = this.normalizeRecurringKey(tx);
      const displayName = this.getDisplayRecurringName(tx);
      const amount = Number(tx.amount.toString());
      const d = new Date(tx.date);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

      if (!recurringMap.has(key)) {
        recurringMap.set(key, {
          key,
          merchant: displayName,
          categoryName: tx.category?.name ?? null,
          currency: tx.currency,
          amounts: [],
          monthKeys: new Set<string>(),
          occurrences: 0,
        });
      }

      const item = recurringMap.get(key)!;
      item.amounts.push(amount);
      item.occurrences += 1;
      item.monthKeys.add(monthKey);
    }

    const recurringTransactions = Array.from(recurringMap.values())
      .filter(
        (item) =>
          item.monthKeys.size >= 2 && this.hasStableAmount(item.amounts),
      )
      .map((item) => {
        const totalAmount = item.amounts.reduce((sum, val) => sum + val, 0);
        const averageAmount = totalAmount / item.amounts.length;

        const shouldShowCategoryTotal =
          !!item.categoryName &&
          item.occurrences > 1 &&
          item.key.startsWith("category:");

        return {
          merchant: item.merchant,
          categoryName: item.categoryName,
          averageAmount: Number(averageAmount.toFixed(2)),
          totalAmount: Number(totalAmount.toFixed(2)),
          currency: item.currency,
          occurrences: item.occurrences,
          activeMonths: item.monthKeys.size,
          displayLabel: shouldShowCategoryTotal
            ? item.categoryName
            : item.merchant,
          displayAmount: Number(
            (shouldShowCategoryTotal ? totalAmount : averageAmount).toFixed(2),
          ),
          displayMode: shouldShowCategoryTotal
            ? "category-total"
            : "merchant-average",
        };
      })
      .sort((a, b) => b.displayAmount - a.displayAmount);

    const predictedNextMonthRecurring = Number(
      recurringTransactions
        .reduce((sum, item) => sum + item.averageAmount, 0)
        .toFixed(2),
    );

    const rawSavingsEstimate = currentMonthIncome - currentMonthExpenses;
    const currentSavingsEstimate = Number(
      Math.max(rawSavingsEstimate, 0).toFixed(2),
    );

    const goalAmount = Number(activeGoal?.targetAmount?.toString() ?? 1000);
    const goalCurrency =
      activeGoal?.currency ?? (topSpendingCategory.currency || "EUR");

    const progressPercent = Math.min(
      Number(((currentSavingsEstimate / goalAmount) * 100).toFixed(2)),
      100,
    );

    const remainingAmount = Number(
      Math.max(goalAmount - currentSavingsEstimate, 0).toFixed(2),
    );

    const recommendation =
      await AIRecommendationService.generateSavingsRecommendation({
        currentMonthExpenses,
        previousMonthExpenses,
        percentChange,
        direction,
        predictedNextMonthRecurring,
        topSpendingCategory,
        currentMonthIncome,
        savingsGoal: {
          goalAmount,
          currentSavingsEstimate,
          progressPercent,
          remainingAmount,
          currency: goalCurrency,
        },
      });

    return {
      spendingChange: {
        currentMonthExpenses,
        previousMonthExpenses,
        percentChange,
        direction,
        currency: goalCurrency,
      },
      recurringForecast: {
        predictedNextMonthRecurring,
        recurringTransactions: recurringTransactions.slice(0, 5),
        currency: recurringTransactions[0]?.currency ?? goalCurrency,
      },
      topSpendingCategory,
      savingsGoal: {
        title: activeGoal?.title ?? "Main savings goal",
        goalAmount,
        currentSavingsEstimate,
        progressPercent,
        remainingAmount,
        recommendation,
        currency: goalCurrency,
      },
    };
  }
}

export default AIInsightsService;
