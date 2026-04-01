// src/redux/slices/authSlice.ts
import {createSlice} from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: null,
    user: null,
    isAuthenticated: false,
    isLoading: true, // App starts by checking storage
  },
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
      // If token exists, user is authenticated
      state.isAuthenticated = !!action.payload;
      state.isLoading = false; // Stop showing splash screen
    },
    setUser: (state, action) => {
      // Add this
      state.user = action.payload;
    },
    logout: state => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const {setToken, logout, setUser, setLoading} = authSlice.actions;
export default authSlice.reducer;
