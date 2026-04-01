// services/userService.ts
import axiosInstance from './axiosInstance';

export interface User {
  id: string;
  name: string;
  email: string; // Added email
  role: string;
  isActive: boolean;
  password?: string; // Optional for creation
  phoneNumber?: string;
}

const REGISTER_URL = 'https://api-staging.hilltoptourism.in/auth/register';

export const usersService = {
  /**
   * Fetches all users
   */
  getUsers: async (): Promise<User[]> => {
    const response = await axiosInstance.get('/users');
    // If you want to show both Active and Inactive in the list,
    // remove the .filter() or handle it in the UI.
    return response.data;
  },

  /**
   * Creates a new staff member (Registration)
   */
  createUser: async (userData: Partial<User>) => {
    // No more "long url" here!
    const response = await axiosInstance.post('/auth/register', userData);
    return response.data;
  },

  /**
   * Updates existing staff member
   */
  updateUser: async (id: string, userData: Partial<User>): Promise<User> => {
    // Typically updates go to /users/:id
    const response = await axiosInstance.patch(`/users/${id}`, userData);
    return response.data;
  },

  /**
   * Deletes/Removes a staff member
   */
  deleteUser: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/users/${id}`);
  },

  /**
   * Fetches a specific user by ID
   */
  getUserById: async (id: string): Promise<User> => {
    const response = await axiosInstance.get(`/users/${id}`);
    return response.data;
  },
};
