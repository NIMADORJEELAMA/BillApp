import axiosInstance from './axiosInstance';

export const authService = {
  login: async (credentials: any) => {
    const response = await axiosInstance.post('/auth/login', credentials);

    return response.data;
  },
};
