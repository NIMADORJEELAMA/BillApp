import axiosInstance from './axiosInstance';

export const orderService = {
  getActiveOrders: async (orderId: string) => {
    const response = await axiosInstance.get(`orders/active/${orderId}`);
    // Based on your JSON, this returns the array of tables directly
    return response.data;
  },

  getMenu: async () => {
    const response = await axiosInstance.get('menu');
    return response.data;
  },

  createOrder: async (orderData: {
    tableId: string;
    items: {menuItemId: string; quantity: number}[];
  }) => {
    // Switching to axiosInstance for consistency and automatic token handling
    const response = await axiosInstance.post('orders', orderData);
    return response.data;
  },
  serveItem: async (itemId: string) => {
    // Matches: /orders/item/${itemId}/status
    const response = await axiosInstance.patch(
      `/orders/item/${itemId}/status`,
      {
        status: 'SERVED',
      },
    );
    return response.data;
  },

  cancelItem: async (itemId: string) => {
    const response = await axiosInstance.delete(`orders/item/${itemId}`);
    return response.data;
  },
};
