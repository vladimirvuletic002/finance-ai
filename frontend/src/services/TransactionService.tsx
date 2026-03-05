import axios from 'axios';
import { type TransactionResponse, type TransactionCreate, type TransactionCreateResponse } from '../models/Transaction';
import { handleError } from '../helpers/ErrorHandler';

const api = import.meta.env.VITE_API_URL;

function authHeaders() {
  try {
    const token = localStorage.getItem("token");
    //const token = JSON.parse(raw)?.Token || JSON.parse(raw)?.token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

export const transactionListApi = async (page = 1, pageSize = 20) => {
    try{
        const data = await axios.get<TransactionResponse>(`${api}/transactions/`, {
            params: { page, pageSize },
            headers: { "Content-Type": "application/json", ...authHeaders() }
    });
        return data;
    } catch (error) {
        handleError(error);
        //throw error;
    }
}

export const transactionCreateApi = async (payload: TransactionCreate) => {
    try{
        const data = await axios.post<TransactionCreateResponse>(`${api}/transactions/`, payload);
        return data;
    }
    catch(error){
        handleError(error);
        //throw error;
    }
}