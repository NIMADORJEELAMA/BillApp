// export default axiosInstance;
import axios from 'axios';
import {Platform, Alert} from 'react-native';
import {getToken, removeToken} from '../utils/storage';
import {logout} from '../redux/slices/authSlice';
import store from '../redux/store'; // Import your actual store file

export const STAGING_URL = 'https://api-staging.hilltoptourism.in';
export const PRODUCTION_URL = 'https://api.hilltoptourism.in';
export const LOCAL_IP = '192.168.1.9';
// const BASE_URL = 'http://localhost:3000';

const USE_PRODUCTION = true;

// export const BASE_URL = USE_PRODUCTION ? PRODUCTION_URL : STAGING_URL;
const BASE_URL = Platform.select({
  ios: `http://${LOCAL_IP}:3000`,
  android: `http://${LOCAL_IP}:3000`, // or 'http://10.0.2.2:3000' for Emulator only
});

// 1. Create the instance
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

// 2. Request Interceptor (Outgoing)
axiosInstance.interceptors.request.use(
  async config => {
    const token = await getToken();
    if (token) {
      // Note: Keep the 'xyz' only while testing your 401 logic!
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error),
);

// 3. Response Interceptor (Incoming)
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const isLoginRequest = error.config?.url?.includes('/auth/login');

    if (error.response && error.response.status === 401 && !isLoginRequest) {
      // ONLY logout if it's NOT a login attempt
      await removeToken();
      store.dispatch(logout());
      Alert.alert('Session Expired', 'Please login again.');
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
