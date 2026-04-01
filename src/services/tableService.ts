// services/authService.ts
import axiosInstance from './axiosInstance';

export const tableService = {
  getTables: async () => {
    const response = await axiosInstance.get('orders/table-layout');
    // Based on your JSON, this returns the array of tables directly
    return response.data;
  },
  getCategories: async () => {
    const response = await axiosInstance.get('tables/categories');
    // Based on your JSON, this returns the array of categories directly
    return response.data;
  },
};
