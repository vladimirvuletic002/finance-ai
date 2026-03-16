export type SavingsGoalResponse = {
    id: number;
    userId: number;
    title: string;
    targetAmount: number;
    currency: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
} | null;

export type UpsertSavingsGoalRequest = {
    title?: string;
    targetAmount: number;
    currency?: string;
};