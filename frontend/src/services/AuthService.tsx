import api from './api';
import { type AuthResponse, type LoginPayload, type RegisterPayload } from '../models/Auth';
import { handleError } from '../helpers/ErrorHandler';

export const loginApi = async (payload: LoginPayload) => {
    try {
        return await api.post<AuthResponse>(`/auth/login`, payload);
    } catch (error) {
        handleError(error);
    }
}

export const registerApi = async (payload: RegisterPayload) => {
    try {
        return await api.post(`/auth/register`, payload);
    } catch (error) {
        handleError(error);
    }
}
