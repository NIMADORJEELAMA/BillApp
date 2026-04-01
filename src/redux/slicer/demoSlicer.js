import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';

const initialState = {
  isLogin: false, // To track if the user is logged in
};

const AuthSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    logout: state => {
      state.isLogin = 'fuck';
    },
  },
});
export const {logout} = AuthSlice.actions;
export default AuthSlice.reducer;
