// import {createNavigationContainerRef} from '@react-navigation/native';

// export const navigationRef = createNavigationContainerRef();

// export function navigate(name: string, params?: any) {
//   if (navigationRef.isReady()) {
//     navigationRef.navigate(name as never, params as never);
//   }
// }

// src/utils/navigationRef.ts
import {createNavigationContainerRef} from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigate(name: string, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name as never, params as never);
  } else {
    // If not ready, retry once after a short delay
    setTimeout(() => {
      if (navigationRef.isReady()) {
        navigationRef.navigate(name as never, params as never);
      }
    }, 1000);
  }
}
