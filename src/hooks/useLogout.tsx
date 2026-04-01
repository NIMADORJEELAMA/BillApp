import {useDispatch} from 'react-redux';
import {logout} from '../redux/slices/authSlice';
import {clearCart} from '../redux/slices/cartSlice';
import {userService} from '../services/userService';
import {clearAuthData} from '../utils/storage'; // Import your utility

const useLogout = () => {
  const dispatch = useDispatch();
  const performLogout = async () => {
    try {
      // 1. UPDATE SERVER FIRST (Token still exists in storage/Redux)
      try {
        // Pass the current token explicitly if needed,
        // or just call it so the interceptor can grab it.
        await userService.updateFcmToken('');
      } catch (e) {
        console.warn('Server FCM clear failed, likely already expired');
      }

      // 2. WIPE STORAGE SECOND
      await clearAuthData();

      // 3. CLEAR REDUX LAST
      dispatch(logout());
      dispatch(clearCart());
    } catch (error) {
      console.error('Logout process failed', error);
    }
  };

  return performLogout;
};

export default useLogout;
