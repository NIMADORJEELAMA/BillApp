import React, {useEffect, useRef, useState} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';

import {
  ActivityIndicator,
  Animated,
  GestureResponderEvent,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {Div, Flex, Text} from '../components/common/UI';
import Svg, {Circle, Path} from 'react-native-svg';
import HomeScreen from '../screens/TableSelectionScreen';
import LoginScreen from '../screens/LoginScreen';
import IntroScreen from '../screens/IntroScreen';
import DateBirth from '../screens/DateBirth';
import HeightPicker from '../screens/HeightPicker';
import AuthScreen from '../screens/AuthScreen/AuthScreen';
import GenderSelection from '../screens/GenderSelect';
import Name from '../screens/Name';
import RelationStatus from '../screens/RelationStatus';
import AddPhoto from '../screens/AddPhoto';
import AnimatedTabButton from '../components/common/AnimatedTabButton';
import Notification from '../screens/notifications/Index';
import ProfileScreen from '../screens/ProfileScreen';

import Preferences from '../screens/Preferences';
import HelpCenter from '../screens/HelpCenter';
import NotificationSettings from '../screens/NotificationSettings';
import PhoneNumber from '../screens/Settings/PhoneNumber';
import Email from '../screens/Settings/Email';
import Location from '../screens/Settings/Location';
import {useDispatch, useSelector} from 'react-redux';
import {clearAuthData, getToken, getUser} from '../utils/storage';
import {logout, setToken, setUser} from '../redux/slices/authSlice';
import LoginScreenBms from '../screens/LoginScreenBms';
import OrderPage from '../screens/OrderPage';
import CartScreen from '../screens/CartScreen';
import RoomSelectionScreen from '../screens/RoomSelectionScreen';
import SplashScreen from '../screens/SplashScreen';
import HomeIcon from '../assets/Icons/home-icon-silhouette-svgrepo-com.svg';
import KitchenIcon from '../assets/Icons/kitchen-room.svg';
import PrinterIcon from '../assets/Icons/printersvg.svg';
import SettingIcon from '../assets/Icons/settings-svgrepo-com.svg';

import AttendanceIcon from '../assets/Icons/attendance1.svg';
import CashIcon from '../assets/Icons/cash.svg';
import FoodReportIcon from '../assets/Icons/database.svg';

import ProfileIcon from '../assets/Icons/profile.svg';
import ProfileScreenBms from '../screens/ProfileScreenBms';
import KitchenDashboard from '../screens/KitchenDashboard';
import AdminAttendanceScreen from '../screens/AdminAttendanceScreen';
import AdminPettyCashScreen from '../screens/AdminPettyCashScreen';
import AdminPerformanceReportScreen from '../screens/Report/PerformanceReport';
import StaffScreen from '../screens/Staff';
import PrinterSettings from '../screens/PrinterSettings';
import CreateProductScreen from '../screens/ProductScreen';
import ProductScreen from '../screens/ProductScreen';
import ProductListScreen from '../screens/ProductScreen/ProductListScreen';
import SalesScreen from '../screens/SalesScreen';
import SalesListScreen from '../screens/SalesScreen/SalesListScreen';
import ModernHomeScreen from '../screens/ModernHomeScreen';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  otpVerification: undefined;
  UserDetails: undefined;
  Main: undefined;
  ViewDetails: undefined;
  BookingDetails: undefined;
  Intro: undefined;
  DateBirth: undefined;
  HeightPicker: undefined;
  AuthScreen: undefined;
  OrderPage: undefined;
  CartScreen: undefined;
  GenderSelect: undefined;
  Name: undefined;
  Relation: undefined;
  AddPhotoList: undefined;
  Settings: undefined;

  Preferences: undefined;
  PhoneNumber: undefined;
  Email: undefined;
  Location: undefined;
  HelpCenter: undefined;
  ProfileScreenBms: undefined;
  Staff: undefined;
  NotificationSettings: undefined;
};

export type BottomTabParamList = {
  HomeScreen: undefined;
  MoreScreen: undefined;
  Notifications: undefined;

  Message: undefined;

  KitchenSelection: undefined;
  PrinterSettings: undefined;
  Attendance: undefined;
  PettyCash: undefined;
  FoodReport: undefined;
  ProductScreen: undefined;
  ProductListScreen: undefined;
  SalesScreen: undefined;
  ProfileScreen: undefined;
  Settings: undefined;
  Profile: undefined;
  ModernHomeScreen: undefined;
};
export type TabBarButtonList = {
  TouchableOpacity: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const TabNavigator: React.FC = () => {
  const user = useSelector((state: any) => state.auth.user);
  console.log('user', user);
  const role = user?.role;
  const initialRoute = role === 'KITCHEN' ? 'KitchenSelection' : 'HomeScreen';

  return (
    <Tab.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: {
          overflow: 'hidden',
          backgroundColor: '#FAFAFA',
          // height: Platform.OS === 'ios' ? 100 : 60,
          borderTopWidth: 1,
          width: '100%',
          elevation: 2,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 0},
          shadowOpacity: 0.2,
          shadowRadius: 3,
        },
        tabBarItemStyle: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#fed4d7',
      }}>
      {role !== 'KITCHEN' && (
        <Tab.Screen
          name="HomeScreen"
          component={SalesListScreen}
          options={{
            headerShown: false,
            tabBarButton: (props: any) => {
              // Check if the tab is currently selected
              const isSelected = props?.accessibilityState?.selected;

              return (
                <AnimatedTabButton
                  {...props}
                  label="Home"
                  icon={
                    <HomeIcon
                      height={20}
                      width={20}
                      fill={isSelected ? '#000000' : 'gray'}
                      stroke={isSelected ? '#000000' : 'gray'}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  }
                />
              );
            },
          }}
        />
      )}
      {role !== 'KITCHEN' && (
        <Tab.Screen
          name="ModernHomeScreen"
          component={ModernHomeScreen}
          options={{
            headerShown: false,
            tabBarButton: (props: any) => {
              // Check if the tab is currently selected
              const isSelected = props?.accessibilityState?.selected;

              return (
                <AnimatedTabButton
                  {...props}
                  label="Home 2.0 "
                  icon={
                    <HomeIcon
                      height={20}
                      width={20}
                      fill={isSelected ? '#000000' : 'gray'}
                      stroke={isSelected ? '#000000' : 'gray'}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  }
                />
              );
            },
          }}
        />
      )}
      {role == 'KITCHEN' && (
        <Tab.Screen
          name="KitchenSelection"
          component={KitchenDashboard}
          options={{
            headerShown: false,
            tabBarButton: (props: any) => {
              // Check if the tab is currently selected
              const isSelected = props?.accessibilityState?.selected;

              return (
                <AnimatedTabButton
                  {...props}
                  label="Kitchen"
                  icon={
                    <KitchenIcon
                      height={22}
                      width={22}
                      fill={isSelected ? '#000000' : 'gray'}
                      stroke={isSelected ? '#000000' : 'gray'}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  }
                />
              );
            },
          }}
        />
      )}
      {role == 'ADMIN' && (
        <Tab.Screen
          name="PrinterSettings"
          component={PrinterSettings}
          options={{
            headerShown: false,
            tabBarButton: (props: any) => {
              // Check if the tab is currently selected
              const isSelected = props?.accessibilityState?.selected;

              return (
                <AnimatedTabButton
                  {...props}
                  label="Printer"
                  icon={
                    <PrinterIcon
                      height={22}
                      width={22}
                      fill={isSelected ? '#000000' : 'gray'}
                      stroke={isSelected ? '#000000' : 'gray'}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  }
                />
              );
            },
          }}
        />
      )}

      {role == 'ADMIN' && (
        <Tab.Screen
          name="SalesScreen"
          component={SalesScreen}
          options={{
            headerShown: false,
            tabBarButton: (props: any) => {
              // Check if the tab is currently selected
              const isSelected = props?.accessibilityState?.selected;

              return (
                <AnimatedTabButton
                  {...props}
                  label="Sales"
                  isSelected={isSelected}
                  icon={
                    <AttendanceIcon
                      height={22}
                      width={22}
                      color={isSelected ? '#000000' : 'gray'}
                      stroke={isSelected ? '#000000' : 'gray'}
                      strokeWidth="0.5"
                      // strokeLinecap="round"
                      // strokeLinejoin="round"
                    />
                  }
                />
              );
            },
          }}
        />
      )}

      {role == 'ADMIN' && (
        <Tab.Screen
          name="ProductListScreen"
          component={ProductListScreen}
          options={{
            headerShown: false,
            tabBarButton: (props: any) => {
              // Check if the tab is currently selected
              const isSelected = props?.accessibilityState?.selected;

              return (
                <AnimatedTabButton
                  {...props}
                  label="Product List"
                  icon={
                    <FoodReportIcon
                      height={22}
                      width={22}
                      fill={isSelected ? '#000000' : 'gray'}
                      stroke={isSelected ? '#000000' : 'gray'}
                      // strokeWidth="1.5"
                      // strokeLinecap="round"
                      // strokeLinejoin="round"
                    />
                  }
                />
              );
            },
          }}
        />
      )}

      {role == 'ADMIN' && (
        <Tab.Screen
          name="Settings"
          component={ProfileScreen}
          options={{
            headerShown: false,
            tabBarButton: (props: any) => {
              // Check if the tab is currently selected
              const isSelected = props?.accessibilityState?.selected;

              return (
                <AnimatedTabButton
                  {...props}
                  label="Settings"
                  icon={
                    <SettingIcon
                      height={22}
                      width={22}
                      color={isSelected ? '#000000' : 'gray'}
                    />
                  }
                />
              );
            },
          }}
        />
      )}
    </Tab.Navigator>
  );
};

const Navigation = () => {
  const dispatch = useDispatch();

  // 1. Pull everything from Redux Auth Slice
  const {isAuthenticated, isLoading} = useSelector((state: any) => state.auth);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // 1. Pull from your storage utilities
        const storedToken = await getToken();
        const storedUser = await getUser();

        // 2. Strict validation
        if (storedToken && storedUser) {
          dispatch(setToken(storedToken));
          dispatch(setUser(storedUser));
        } else {
          // If data is partial or missing, ensure storage is 100% clean
          await clearAuthData();
          dispatch(logout());
        }
      } catch (e) {
        console.error('Auth Restore Failed', e);
        dispatch(logout());
      } finally {
        // If your slice has a setLoading, call it here
        // dispatch(setLoading(false));
      }
    };
    initAuth();
  }, [dispatch]);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {isAuthenticated ? (
        // APP STACK (Authenticated users)
        <Stack.Group>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen name="OrderPage" component={OrderPage} />
          <Stack.Screen name="CartScreen" component={CartScreen} />
          {/* Settings and other inner screens should be here */}
          <Stack.Screen name="Preferences" component={Preferences} />
          <Stack.Screen name="PhoneNumber" component={PhoneNumber} />
          <Stack.Screen name="Email" component={Email} />
          <Stack.Screen name="Location" component={Location} />
          <Stack.Screen name="HelpCenter" component={HelpCenter} />
          <Stack.Screen name="ProfileScreenBms" component={ProfileScreenBms} />
          <Stack.Screen name="Staff" component={StaffScreen} />

          <Stack.Screen
            name="NotificationSettings"
            component={NotificationSettings}
          />
        </Stack.Group>
      ) : (
        // AUTH STACK (Unauthenticated users)
        <Stack.Group>
          <Stack.Screen name="Login" component={LoginScreenBms} />
          <Stack.Screen name="Intro" component={IntroScreen} />
          <Stack.Screen name="AuthScreen" component={AuthScreen} />
          <Stack.Screen name="Name" component={Name} />
          <Stack.Screen name="DateBirth" component={DateBirth} />
          <Stack.Screen name="GenderSelect" component={GenderSelection} />
          <Stack.Screen name="HeightPicker" component={HeightPicker} />
          <Stack.Screen name="Relation" component={RelationStatus} />
          <Stack.Screen name="AddPhotoList" component={AddPhoto} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
};

export default Navigation;

const styles = StyleSheet.create({
  tabContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
});
