import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { HttpException } from '../../utils/http-exception.js';
import AIContextService from './ai-context.service.js';
import AIPromptBuilderService from './ai-prompt-builder.service.js';
import { withGeminiRetry } from './ai-retry.js';
import { resolveRequestedMonth, buildMonthKey } from './month-parser.js';
import config from '../../config/env.js';

const FALLBACK_RESPONSE = "Sorry, I couldn't process that right now. Please try again in a moment.";

class AIChatService {
    private static getClient() {
        return new GoogleGenAI({
            apiKey: config.GEMINI_API_KEY
        });
    }

    // Never throws: on total Gemini failure (retries exhausted), returns a
    // friendly fallback reply instead of surfacing a 500 to the user.
    private static async generateText(prompt: string): Promise<string> {
        const ai = this.getClient();

        try {
            const response = await withGeminiRetry(() =>
                ai.models.generateContent({
                    model: 'gemini-2.5-flash-lite',
                    contents: prompt,
                    config: {
                        maxOutputTokens: 180,
                        temperature: 0.3
                    }
                })
            );

            return response.text?.trim() || FALLBACK_RESPONSE;
        } catch {
            return FALLBACK_RESPONSE;
        }
    }

    static async respond(userId: number, prompt: string) {
        if (!prompt || typeof prompt !== 'string') {
        throw new HttpException(400, 'Prompt is required');
    }

    const context = await AIContextService.getRecentFinancialContext(userId, 3);

    if (!context) {
        const noDataPrompt = AIPromptBuilderService.buildNoDataPrompt(prompt);
        const response = await this.generateText(noDataPrompt);

        return {
            data: null,
            response
        };
    }

    const requestedMonth = resolveRequestedMonth(prompt);

    let targetMonthKey: string | null = null;
    let targetMonthSummary = null;
    let targetMonthTransactions = context.transactions;

    if (requestedMonth) {
        targetMonthKey = buildMonthKey(requestedMonth.month, requestedMonth.year);

        targetMonthSummary =
            context.monthlySummaries.find((m: any) => m.month === targetMonthKey) ?? null;

        targetMonthTransactions = context.transactions.filter((tx: any) => {
            const d = new Date(tx.date);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            return key === targetMonthKey;
        });
    }

    const finalPrompt = AIPromptBuilderService.buildUniversalFinancePrompt(
        prompt,
        context,
        {
            requestedMonth,
            targetMonthKey,
            targetMonthSummary,
            targetMonthTransactions
        }
    );

    const response = await this.generateText(finalPrompt);

    return {
        data: {
            ...context,
            requestedMonth,
            targetMonthKey,
            targetMonthSummary,
            targetMonthTransactions
        },
        response
    };
    }
}

export default AIChatService;