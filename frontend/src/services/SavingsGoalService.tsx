import axios from 'axios';
import type { SavingsGoalResponse, UpsertSavingsGoalRequest } from '../models/SavingsGoal';
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

export const getActiveSavingsGoalApi = async () => {
    try {
        return await axios.get<SavingsGoalResponse>(`${api}/savings-goal/active`, {
            headers: {
                "Content-Type": "application/json",
                ...authHeaders()
            }
        });
    } catch (error) {
        handleError(error);
    }
};

export const upsertActiveSavingsGoalApi = async (payload: UpsertSavingsGoalRequest) => {
    try {
        return await axios.put<SavingsGoalResponse>(`${api}/savings-goal/active`, payload, {
            headers: {
                "Content-Type": "application/json",
                ...authHeaders()
            }
        });
    } catch (error) {
        handleError(error);
    }
};