import { GoogleGenAI, Type } from "@google/genai";
import { z } from "zod";
import { withGeminiRetry } from "./ai-retry.js";
import AIUsageTracker from "./ai-usage-tracker.js";
import config from "../../config/env.js";

const FALLBACK_RECOMMENDATION =
    "Try reducing your largest recurring and category-based expenses to reach your goal faster.";

const recommendationResponseSchema = z.object({
    recommendation: z.string().min(1).max(400),
});

// Mirrors recommendationResponseSchema, in the OpenAPI-subset shape Gemini's
// responseSchema config expects, so the model is constrained to return
// exactly this JSON shape instead of free text.
const geminiResponseSchema = {
    type: Type.OBJECT,
    properties: {
        recommendation: { type: Type.STRING },
    },
    required: ["recommendation"],
};

class AIRecommendationService {
    private static getClient() {
        return new GoogleGenAI({
            apiKey: config.GEMINI_API_KEY
        });
    }

    static async generateSavingsRecommendation(userId: number, summary: {
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
    }): Promise<string> {
        // Insight snapshots are refreshed automatically on every transaction
        // mutation, so this can't be allowed to bypass the daily quota —
        // silently fall back instead of erroring, since this isn't a
        // directly user-triggered request.
        if (!AIUsageTracker.tryConsume(userId)) {
            return FALLBACK_RECOMMENDATION;
        }

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
6. Respond with a single JSON object matching the required schema — no other text.

Financial summary:
${JSON.stringify(summary, null, 2)}
`.trim();

        try {
            const response = await withGeminiRetry(() =>
                ai.models.generateContent({
                    model: "gemini-2.5-flash-lite",
                    contents: prompt,
                    config: {
                        maxOutputTokens: 200,
                        temperature: 0.4,
                        responseMimeType: "application/json",
                        responseSchema: geminiResponseSchema,
                    }
                })
            );

            const parsed = recommendationResponseSchema.safeParse(JSON.parse(response.text ?? ""));

            return parsed.success ? parsed.data.recommendation.trim() : FALLBACK_RECOMMENDATION;
        } catch {
            return FALLBACK_RECOMMENDATION;
        }
    }
}

export default AIRecommendationService;
