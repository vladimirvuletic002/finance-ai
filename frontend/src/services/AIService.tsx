import axios from 'axios';
import type { AIChatRequest, AIChatResponse } from '../models/AI';
import { handleError } from '../helpers/ErrorHandler';

const api = import.meta.env.VITE_API_URL;

function authHeaders() {
    try {
        const token = localStorage.getItem("token");
        return token ? { Authorization: `Bearer ${token}` } : {};
    } catch {
        return {};
    }
}

export const aiChatApi = async (payload: AIChatRequest) => {
    try {
        const data = await axios.post<AIChatResponse>(
            `${api}/ai/chat`,
            payload,
            {
                headers: {
                    "Content-Type": "application/json",
                    ...authHeaders()
                }
            }
        );

        return data;
    } catch (error) {
        handleError(error);
        throw error;
    }
};