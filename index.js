/**
 * @format
 */

import {AppRegistry} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import {name as appName} from './app.json';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  // Note: You cannot use Toast here because the app is in the background.
  // Firebase will automatically show the notification if the payload
  // contains a 'notification' object.
});

AppRegistry.registerComponent(appName, () => App);
