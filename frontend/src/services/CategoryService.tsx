import axios from 'axios';
import { type CategoryListResponse } from '../models/Category';
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

export const categoryListApi = async () => {
    try{
        const data = await axios.get<CategoryListResponse>(`${api}/category/`, {
            headers: { "Content-Type": "application/json", ...authHeaders() }
        });
        return data;
    }
    catch(err){
        handleError(err);
    }
}