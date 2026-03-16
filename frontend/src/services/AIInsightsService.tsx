import axios from 'axios';
import type { AIInsightSnapshotResponse, AIInsightsResponse } from '../models/AIInsights';
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

export const getAIInsightsApi = async () => {
    try{
        const data = await axios.get<AIInsightSnapshotResponse>(`${api}/ai/insights/latest`, {
            headers: {
                "Content-Type": "application/json",
                ...authHeaders()
            }
        });

        return data;
    }
    catch(error){
        handleError(error);
        
    }
}