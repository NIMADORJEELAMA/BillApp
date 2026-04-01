// import AsyncStorage from '@react-native-async-storage/async-storage';

// const TOKEN_KEY = '@auth_token';

// export const saveToken = async (token: string) => {
//   try {
//     await AsyncStorage.setItem(TOKEN_KEY, token);
//   } catch (e) {
//     console.error('Error saving token', e);
//   }
// };

// export const getToken = async () => {
//   return await AsyncStorage.getItem(TOKEN_KEY);
// };

// export const removeToken = async () => {
//   await AsyncStorage.removeItem(TOKEN_KEY);
// };

import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@auth_token';
const USER_KEY = '@user_data'; // New key for user profile

export const saveToken = async (token: string) => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (e) {
    console.error('Error saving token', e);
  }
};

export const getToken = async () => {
  return await AsyncStorage.getItem(TOKEN_KEY);
};

export const removeToken = async () => {
  await AsyncStorage.removeItem(TOKEN_KEY);
};

// --- Added User Storage Logic ---

export const saveUser = async (user: any) => {
  try {
    // We must stringify the object to store it
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Error saving user data', e);
  }
};

export const getUser = async () => {
  try {
    const user = await AsyncStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null; // Parse it back into an object
  } catch (e) {
    console.error('Error getting user data', e);
    return null;
  }
};

export const clearAuthData = async () => {
  try {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  } catch (e) {
    console.error('Error clearing auth data', e);
  }
};
