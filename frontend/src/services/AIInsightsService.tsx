import api from './api';
import type { AIInsightSnapshotResponse } from '../models/AIInsights';
import { handleError } from '../helpers/ErrorHandler';

export const getAIInsightsApi = async () => {
    try {
        return await api.get<AIInsightSnapshotResponse>(`/ai/insights/latest`);
    } catch (error) {
        handleError(error);
    }
}
