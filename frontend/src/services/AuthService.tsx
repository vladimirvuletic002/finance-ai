import axios from 'axios';
import { type AuthResponse, type LoginPayload, type RegisterPayload } from '../models/Auth';
import { handleError } from '../helpers/ErrorHandler';

const api = import.meta.env.VITE_API_URL;

export const loginApi = async (payload: LoginPayload) => {
    try{
        const data = await axios.post<AuthResponse>(`${api}/auth/login`, payload);
        return data;
    } catch (error) {
        handleError(error);
        
    }
}

export const registerApi = async (payload: RegisterPayload) => {
    try{
        const data = await axios.post(`${api}/auth/register`, payload);
        return data;
    } catch(error){
        handleError(error);
    }
}