import axiosInstance from './axiosInstance';

export const userService = {
  /**
   * Sends the FCM token to the backend to associate it with the logged-in user.
   */
  updateFcmToken: async (fcmToken: string) => {
    try {
      const response = await axiosInstance.patch('/users/fcm-token', {
        token: fcmToken,
      });

      return response.data;
    } catch (error) {
      // Log internally but let the caller handle UI-specific errors if needed
      console.error('Failed to sync FCM token:', error);
      throw error;
    }
  },
};
