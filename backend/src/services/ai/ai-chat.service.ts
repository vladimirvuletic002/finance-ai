import { GoogleGenAI } from '@google/genai';
import { HttpException } from '../../utils/http-exception';
import AIIntentService from './ai-intent.service';
import AIAnalyticsService from './ai-analytics.service';
import AIPromptBuilderService from './ai-prompt-builder.service';

class AIChatService {
    private static getClient() {
        return new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY
        });
    }

    private static async generateText(prompt: string) {
        const ai = this.getClient();

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt
        });

        return response.text ?? '';
    }

    static async respond(userId: number, prompt: string) {
        if (!prompt || typeof prompt !== 'string') {
            throw new HttpException(400, 'Prompt is required');
        }

        const intent = AIIntentService.parse(prompt);

        if (intent.type === 'TOP_SPENDING_CATEGORY') {
            const analytics = await AIAnalyticsService.getTopSpendingCategory(
                userId,
                intent.month,
                intent.year
            );

            if (!analytics) {
                const noDataPrompt = AIPromptBuilderService.buildNoDataPrompt(
                    prompt,
                    intent.month,
                    intent.year
                );

                const response = await this.generateText(noDataPrompt);

                return {
                    intent: intent.type,
                    data: null,
                    response
                };
            }

            const finalPrompt = AIPromptBuilderService.buildTopSpendingCategoryPrompt(
                prompt,
                analytics
            );

            const response = await this.generateText(finalPrompt);

            return {
                intent: intent.type,
                data: analytics,
                response
            };
        }

            if (intent.type === 'TOTAL_SPENDING') {
            const analytics = await AIAnalyticsService.getTotalSpending(
                userId,
                intent.month,
                intent.year
            );

            if (!analytics || analytics.totalSpent === 0) {
                const noDataPrompt = AIPromptBuilderService.buildNoDataPrompt(
                    prompt,
                    intent.month,
                    intent.year
                );

                const response = await this.generateText(noDataPrompt);

                return {
                    intent: intent.type,
                    data: null,
                    response
                };
            }

            const finalPrompt = AIPromptBuilderService.buildTotalSpendingPrompt(
                prompt,
                analytics
            );

            const response = await this.generateText(finalPrompt);

            return {
                intent: intent.type,
                data: analytics,
                response
            };
        }

        throw new HttpException(
            400,
            'Unsupported AI request for now. Try asking what you spent the most on in a given month.'
        );
    }
}

export default AIChatService;