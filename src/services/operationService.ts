// services/operationService.ts
import axiosInstance from './axiosInstance';

export const operationService = {
  // POST or PATCH to mark attendance
  markAttendance: async (userId: string, date: string) => {
    const response = await axiosInstance.post('operations/attendance/toggle', {
      userId,
      date,
    });
    return response.data;
  },

  // GET monthly logs and summary
  getMonthlyAttendance: async (year: number, month: number) => {
    const response = await axiosInstance.get(`operations/monthly-attendance`, {
      params: {year, month},
    });
    // Expected return: { logs: [...], summary: { "user-id": total } }
    return response.data;
  },

  ///petty cash

  getPettyCash: async (startDate: string, endDate: string, userId?: string) => {
    const response = await axiosInstance.get('operations/petty-cash', {
      params: {
        startDate,
        endDate,
        userId: userId === 'ALL' ? undefined : userId,
      },
    });
    // Expected return: { logs: [...], totalAmount: number }
    return response.data;
  },

  /**
   * Deletes a specific petty cash record
   */
  deletePettyCash: async (id: string) => {
    const response = await axiosInstance.delete(`operations/petty-cash/${id}`);
    return response.data;
  },

  /**
   * Creates a new petty cash entry
   */
  createPettyCash: async (data: {
    userId: string;
    amount: number;
    reason: string;
    date?: string;
  }) => {
    const response = await axiosInstance.post('operations/petty-cash', data);
    return response.data;
  },

  getPerformanceReport: async (
    startDate: string,
    endDate: string,
    userId?: string,
  ) => {
    const response = await axiosInstance.get('orders/reports/performance', {
      params: {
        startDate,
        endDate,
        // Ensure 'ALL' is handled so it doesn't send "ALL" as a string to the backend
        userId: userId === 'ALL' ? undefined : userId,
        page: 1,
        limit: 1000,
        search: '',
      },
    });

    // The API returns the whole object (summary, topSellingItems, etc.)
    // We return response.data directly so 'setData(res)' in your component
    // can access data.summary and data.topSellingItems.
    return response.data;
  },
};
