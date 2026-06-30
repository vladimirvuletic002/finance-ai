import api from './api';
import type { SavingsGoalResponse, UpsertSavingsGoalRequest } from '../models/SavingsGoal';
import { handleError } from '../helpers/ErrorHandler';

export const getActiveSavingsGoalApi = async () => {
    try {
        return await api.get<SavingsGoalResponse>(`/savings-goal/active`);
    } catch (error) {
        handleError(error);
    }
};

export const upsertActiveSavingsGoalApi = async (payload: UpsertSavingsGoalRequest) => {
    try {
        return await api.put<SavingsGoalResponse>(`/savings-goal/active`, payload);
    } catch (error) {
        handleError(error);
    }
};
