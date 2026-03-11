export type AIChatRequest = {
    prompt: string;
};

export type AIChatData = {
    month: number;
    year: number;
    categoryId: number;
    categoryName: string;
    currency: string;
    totalSpent: number;
} | null;

export type AIChatResponse = {
    intent: string;
    data: AIChatData;
    response: string;
};

export type AIMessage = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    createdAt: string;
};