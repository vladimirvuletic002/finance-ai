class AIPromptBuilderService {
    static buildTopSpendingCategoryPrompt(userPrompt: string, data: {
        month: number;
        year: number;
        categoryName: string;
        currency: string;
        totalSpent: number;
    }) {
        return `
You are a helpful personal finance assistant.

The user asked:
"${userPrompt}"

We already computed the correct answer from the database.
Use the following factual data and do not invent anything:

- month: ${data.month}
- year: ${data.year}
- top spending category: ${data.categoryName}
- total spent: ${data.totalSpent}
- currency: ${data.currency}

Write a short, clear answer in the same language as the user's question.
Mention the category and total spent.
Keep it concise and practical.
`.trim();
    }

    static buildTotalSpendingPrompt(userPrompt: string, data: {
        month: number;
        year: number;
        totalSpent: number;
        currency: string;
    }) {
        return `
You are a helpful personal finance assistant.

The user asked:
"${userPrompt}"

We already computed the correct answer from the database.
Use only the factual data below and do not invent anything:

- month: ${data.month}
- year: ${data.year}
- total spent: ${data.totalSpent}
- currency: ${data.currency}

Write a short, clear answer in the same language as the user's question.
Mention the total amount spent for that month.
Keep it concise and practical.
`.trim();
    }

    static buildNoDataPrompt(userPrompt: string, month: number, year: number) {
        return `
You are a helpful personal finance assistant.

The user asked:
"${userPrompt}"

The database query returned no expense transactions for:
- month: ${month}
- year: ${year}

Write a short, clear answer in the same language as the user's question.
Say that there are no expense transactions for that period.
`.trim();
    }

    

}

export default AIPromptBuilderService;