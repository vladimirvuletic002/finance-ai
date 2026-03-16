import { GoogleGenAI } from "@google/genai";

class AIRecommendationService {
    private static getClient() {
        return new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY
        });
    }

    static async generateSavingsRecommendation(summary: {
        currentMonthExpenses: number;
        previousMonthExpenses: number;
        percentChange: number;
        direction: "up" | "down" | "same";
        predictedNextMonthRecurring: number;
        topSpendingCategory: {
            categoryId: number | null;
            categoryName: string | null;
            totalSpent: number;
            currency: string;
        };
        currentMonthIncome: number;
        savingsGoal: {
            goalAmount: number;
            currentSavingsEstimate: number;
            progressPercent: number;
            remainingAmount: number;
            currency: string;
        };
    }) {
        const ai = this.getClient();

        const prompt = `
You are a smart but concise personal finance assistant.

Based ONLY on the following financial summary, give one short practical recommendation
for how the user can reach their savings goal faster.

Rules:
1. Be specific and actionable.
2. Maximum 2 sentences.
3. Do not invent numbers.
4. Mention the top expense category or recurring expenses if useful.
5. Keep the tone supportive and practical.

Financial summary:
${JSON.stringify(summary, null, 2)}
`.trim();

        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-lite",
                contents: prompt,
                config: {
                    maxOutputTokens: 120,
                    temperature: 0.4
                }
            });

            return response.text?.trim() || "Try reducing your largest recurring and category-based expenses to reach your goal faster.";
        } catch {
            return "Try reducing your largest recurring and category-based expenses to reach your goal faster.";
        }
    }
}

export default AIRecommendationService;