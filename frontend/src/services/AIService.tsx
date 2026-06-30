import api from './api';
import type { AIChatRequest, AIChatResponse } from '../models/AI';
import { handleError } from '../helpers/ErrorHandler';

export const aiChatApi = async (payload: AIChatRequest) => {
    try {
        return await api.post<AIChatResponse>(`/ai/chat`, payload);
    } catch (error) {
        handleError(error);
        throw error;
    }
};
