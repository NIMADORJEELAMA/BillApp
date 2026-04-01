// socket.js or within the file
import {Platform} from 'react-native';
import {io} from 'socket.io-client';

// import {BASE_URL} from '../services/axiosInstance';
import {LOCAL_IP} from '../services/axiosInstance';

const BASE_URL = Platform.select({
  ios: `http://${LOCAL_IP}:3000`,
  android: `http://${LOCAL_IP}:3000`, // or 'http://10.0.2.2:3000' for Emulator only
});

const SOCKET_URL = BASE_URL; // Use your machine's IP for physical devices!
export const socket = io(SOCKET_URL, {
  autoConnect: true,
  transports: ['websocket'], // Faster for mobile
});
