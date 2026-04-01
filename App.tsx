// import React from 'react';
// import {SafeAreaView, StatusBar} from 'react-native';
// import {Provider} from 'react-redux';
// import {GestureHandlerRootView} from 'react-native-gesture-handler';

// import store from './src/redux/store';
// import Navigation from './src/routes/Navigation';
// import {NavigationContainer} from '@react-navigation/native';

// const MainApp = () => {
//   return (
//     <GestureHandlerRootView style={{flex: 1}}>
//       <NavigationContainer>
//         <StatusBar
//           translucent={true}
//           barStyle={'light-content'}
//           backgroundColor={'transparent'}
//         />
//         <Navigation />
//       </NavigationContainer>
//     </GestureHandlerRootView>
//   );
// };

// const App = () => {
//   return (
//     <Provider store={store}>
//       <MainApp />
//     </Provider>
//   );
// };

// export default App;

import React from 'react';
import {StatusBar, View} from 'react-native';
import {Provider, useSelector} from 'react-redux';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {NavigationContainer} from '@react-navigation/native';
import {getApps, initializeApp} from '@react-native-firebase/app';
import store from './src/redux/store';
import Navigation from './src/routes/Navigation';
// 1. Import the navigation reference
import {navigationRef} from './src/utils/navigationRef';
import Toast from 'react-native-toast-message';

import toastConfig from './toastConfig';
import {useNotifications} from './src/hooks/useNotifications';

if (!getApps().length) {
  initializeApp({} as any); // ✅ Satisfies TS, uses native config
}
const MainApp = () => {
  const isAuthenticated = useSelector(
    (state: any) => state.auth.isAuthenticated,
  );
  const token = useSelector((state: any) => state.auth.token);
  console.log('token', token);

  useNotifications(isAuthenticated);
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      {/* 2. Attach the ref to the NavigationContainer */}
      <NavigationContainer ref={navigationRef}>
        <StatusBar
          translucent={true}
          barStyle={'dark-content'}
          backgroundColor={'transparent'}
        />
        <Navigation />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <MainApp />
      <Toast config={toastConfig} />
    </Provider>
  );
};

export default App;
