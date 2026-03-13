type FinancialContext = {
    period: {
        start: string;
        end: string;
        monthsBack: number;
    };
    summary: {
        totalExpenses: number;
        totalIncome: number;
        transactionCount: number;
    };
    monthlySummaries: Array<{
        month: string;
        totalExpenses: number;
        totalIncome: number;
        transactionCount: number;
        currencies: string[];
    }>;
    transactions: Array<{
        id: number;
        amount: number;
        currency: string;
        type: string;
        merchant: string | null;
        note: string | null;
        date: string;
        categoryId: number | null;
        category: {
            id: number;
            name: string;
        } | null;
    }>;
};

class AIPromptBuilderService {
    static buildUniversalFinancePrompt(
        userPrompt: string,
        context: FinancialContext,
        focus?: {
            requestedMonth: { month: number; year: number } | null;
            targetMonthKey: string | null;
            targetMonthSummary: any;
            targetMonthTransactions: any[];
        }
    ) {
        return `
You are a smart personal finance assistant.

The user asked:
"${userPrompt}"

You are given recent financial data from the user's application.

Important rules:
1. Use only the provided data.
2. Do not invent facts, months, totals, or currencies.
3. "Spent" means only transactions where type = "EXPENSE".
4. "Income" means only transactions where type = "INCOME".
5. The "summary" object is for the ENTIRE provided period, not for one specific month.
6. If a requested month is provided below, prefer "targetMonthSummary" and "targetMonthTransactions" for the final answer.
7. If the user asks about "last month" or "this month", use the already resolved requested month below, not your own assumption.
8. If the user asks for an exact monthly total, use targetMonthSummary.totalExpenses when available.
9. If there is no matching data for the requested month, clearly say so.
10. Reply in the same language as the user's question.
11. Keep the answer concise and practical.

Resolved requested month:
${JSON.stringify(focus?.requestedMonth ?? null, null, 2)}

Resolved target month key:
${JSON.stringify(focus?.targetMonthKey ?? null, null, 2)}

Target month summary:
${JSON.stringify(focus?.targetMonthSummary ?? null, null, 2)}

Target month transactions:
${JSON.stringify(focus?.targetMonthTransactions ?? [], null, 2)}

Full-period summary:
${JSON.stringify(context.summary, null, 2)}

Monthly summaries:
${JSON.stringify(context.monthlySummaries, null, 2)}

Transactions:
${JSON.stringify(context.transactions, null, 2)}

Now answer the user's question.
`.trim();
    }


    static buildNoDataPrompt(userPrompt: string) {
        return `
You are a helpful personal finance assistant.

The user asked:
"${userPrompt}"

There is not enough recent transaction data available.

Write a short answer in the same language as the user's question and explain that there is not enough data to analyze.
`.trim();
    }
}

export default AIPromptBuilderService;