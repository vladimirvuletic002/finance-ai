import api from './api';
import { type CategoryListResponse } from '../models/Category';
import { handleError } from '../helpers/ErrorHandler';

export const categoryListApi = async () => {
    try {
        return await api.get<CategoryListResponse>(`/category/`);
    } catch (error) {
        handleError(error);
    }
}
