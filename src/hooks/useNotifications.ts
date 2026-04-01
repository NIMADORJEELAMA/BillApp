import {useEffect, useRef, useCallback} from 'react';
import {Platform, PermissionsAndroid} from 'react-native';
import {getApp} from '@react-native-firebase/app';
import {
  getMessaging,
  getToken,
  requestPermission,
  onMessage,
  onTokenRefresh,
  onNotificationOpenedApp,
  getInitialNotification,
} from '@react-native-firebase/messaging';
import notifee, {AndroidImportance, EventType} from '@notifee/react-native';
import {userService} from '../services/userService';
import {navigate} from '../utils/navigationRef';

export const useNotifications = (isAuthenticated: boolean) => {
  const isInitialized = useRef(false);

  // 1. Initialize messaging
  const app = getApp();
  const messaging = getMessaging(app);

  // 2. Define the registration logic as a reusable function
  const registerDevice = useCallback(async () => {
    try {
      const authStatus = await requestPermission(messaging);
      const enabled = authStatus === 1 || authStatus === 2;

      if (enabled) {
        const token = await getToken(messaging);
        if (token) {
          await userService.updateFcmToken(token);
        }
      }
    } catch (error) {
      console.error('❌ FCM Registration Error:', error);
    }
  }, [messaging]);

  useEffect(() => {
    const syncTokenWithBackend = async (token: string) => {
      try {
        await userService.updateFcmToken(token);
      } catch (e) {
        console.error('❌ FCM sync failed', e);
      }
    };

    const handleNotificationNavigation = (data: any) => {
      if (data?.id) {
        navigate('OrderPage', {
          id: data.id,
          table: {
            id: data.tableId,
            name: data.name,
            readyItemId: data.readyItemId,
          },
        });
      }
    };

    const setup = async () => {
      // Create Channel for Android Sound
      await notifee.createChannel({
        id: 'kitchen_alerts',
        name: 'Kitchen Order Alerts',
        lights: true,
        vibration: true,
        importance: AndroidImportance.HIGH,
        sound: 'notification',
      });

      // Request OS-level permissions
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
      }

      // If user is already logged in (app restart), sync token automatically
      if (isAuthenticated) {
        await registerDevice();
      }
    };

    if (!isInitialized.current) {
      setup();
      isInitialized.current = true;
    }
    const checkInitialNotification = async () => {
      // Only proceed if user is logged in
      if (!isAuthenticated) return;

      const remoteMessage = await getInitialNotification(messaging);

      if (remoteMessage) {
        // Give the Navigator time to mount the AppStack
        setTimeout(() => {
          handleNotificationNavigation(remoteMessage.data);
        }, 2500);
      }
    };

    checkInitialNotification();

    // --- Listeners ---

    // Foreground Event (Notifee tap)
    const unsubscribeNotifeeEvents = notifee.onForegroundEvent(
      ({type, detail}) => {
        if (type === EventType.PRESS) {
          handleNotificationNavigation(detail.notification?.data);
        }
      },
    );

    // Firebase Foreground Message
    const unsubscribeOnMessage = onMessage(messaging, async remoteMessage => {
      await notifee.displayNotification({
        title: remoteMessage.notification?.title || 'Order Update',
        body: remoteMessage.notification?.body || 'New update from kitchen!',
        data: remoteMessage.data,
        android: {
          channelId: 'kitchen_alerts',
          importance: AndroidImportance.HIGH,
          pressAction: {id: 'default'},
        },
      });
    });

    // Background Click
    const unsubscribeNotificationOpen = onNotificationOpenedApp(
      messaging,
      remoteMessage => {
        handleNotificationNavigation(remoteMessage.data);
      },
    );

    // Quit State Click
    getInitialNotification(messaging).then(remoteMessage => {
      if (remoteMessage) {
        setTimeout(
          () => handleNotificationNavigation(remoteMessage.data),
          2000,
        );
      }
    });

    // Token Refresh
    const unsubscribeTokenRefresh = onTokenRefresh(messaging, token => {
      if (isAuthenticated) syncTokenWithBackend(token);
    });

    return () => {
      unsubscribeTokenRefresh();
      unsubscribeOnMessage();
      unsubscribeNotificationOpen();
      unsubscribeNotifeeEvents();
    };
  }, [isAuthenticated, registerDevice]);

  // Return registerDevice so LoginScreen can call it manually
  return {registerDevice};
};
