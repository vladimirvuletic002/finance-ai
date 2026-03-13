import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { HttpException } from '../../utils/http-exception';
import AIContextService from './ai-context.service';
import AIPromptBuilderService from './ai-prompt-builder.service';

const MONTH_PATTERNS: Array<[RegExp, number]> = [
    [/\bjanuary\b|\bjanuar\b/, 1],
    [/\bfebruary\b|\bfebruar\b/, 2],
    [/\bmarch\b|\bmart\b/, 3],
    [/\bapril\b/, 4],
    [/\bmay\b|\bmaj\b/, 5],
    [/\bjune\b|\bjun\b/, 6],
    [/\bjuly\b|\bjul\b/, 7],
    [/\baugust\b|\bavgust\b/, 8],
    [/\bseptember\b|\bseptembar\b/, 9],
    [/\boctober\b|\boktobar\b/, 10],
    [/\bnovember\b|\bnovembar\b/, 11],
    [/\bdecember\b|\bdecembar\b/, 12],
];

function normalizePrompt(text: string) {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function resolveRequestedMonth(prompt: string) {
    const normalized = normalizePrompt(prompt);
    const now = new Date();

    if (normalized.includes('last month') || normalized.includes('proslog meseca') || normalized.includes('prosli mesec')) {
        const currentMonth = now.getMonth() + 1;
        if (currentMonth === 1) {
            return { month: 12, year: now.getFullYear() - 1 };
        }

        return { month: currentMonth - 1, year: now.getFullYear() };
    }

    if (normalized.includes('this month') || normalized.includes('ovog meseca') || normalized.includes('ovaj mesec')) {
        return { month: now.getMonth() + 1, year: now.getFullYear() };
    }

    for (const [pattern, month] of MONTH_PATTERNS) {
        if (pattern.test(normalized)) {
            const yearMatch = normalized.match(/\b(20\d{2})\b/);
            return {
                month,
                year: yearMatch ? Number(yearMatch[1]) : now.getFullYear()
            };
        }
    }

    return null;
}

function buildMonthKey(month: number, year: number) {
    return `${year}-${String(month).padStart(2, '0')}`;
}

class AIChatService {
    private static getClient() {
        return new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY
        });
    }

    private static async generateText(prompt: string) {
        const ai = this.getClient();

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-lite',
            contents: prompt,
            config: {
                maxOutputTokens: 180,
                temperature: 0.3
            }
        });

        return response.text ?? '';
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