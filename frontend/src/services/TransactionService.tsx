import api from './api';
import { type TransactionResponse, type TransactionCreatePayload, type TransactionCreateResponse, type TransactionUpdatePayload } from '../models/Transaction';
import { handleError } from '../helpers/ErrorHandler';

export const transactionListApi = async (page = 1, pageSize = 10) => {
    try {
        return await api.get<TransactionResponse>(`/transactions/`, {
            params: { page, pageSize },
        });
    } catch (error) {
        handleError(error);
    }
}

export const transactionCreateApi = async (payload: TransactionCreatePayload) => {
    try {
        return await api.post<TransactionCreateResponse>(`/transactions/`, payload);
    } catch (error) {
        handleError(error);
    }
}

export const transactionUpdateApi = async (id: number, payload: TransactionUpdatePayload) => {
    try {
        return await api.patch(`/transactions/${id}`, payload);
    } catch (error) {
        handleError(error);
    }
}

export const transactionDeleteApi = async (id: number) => {
    try {
        return await api.delete(`/transactions/${id}`);
    } catch (error) {
        handleError(error);
    }
}
