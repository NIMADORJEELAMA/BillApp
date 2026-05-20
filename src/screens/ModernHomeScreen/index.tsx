import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  Platform,
  TextInput,
  Text,
} from 'react-native';

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

import {useNavigation} from '@react-navigation/native';
import {RootStackParamList} from '../../routes/Navigation';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useAnimatedRef, scrollTo} from 'react-native-reanimated';
import SalesChart from '../../components/Charts/SalesChart';
import CustomTileButton from '../../components/CustomTileButton';
import TinySquareButton from '../../components/Buttons/TinySquareButton';

import SupplierIcon from '../../assets/Icons/truck (1).svg';
import PurchaseIcon from '../../assets/Icons/package.svg';
import ReportsIcon from '../../assets/Icons/report.svg';
import StaffIcon from '../../assets/Icons/employee-svgrepo-com.svg';

import UsersIcon from '../../assets/Icons/users.svg';

import TimelineChart from '../../components/Charts/TimelineChart';
import color from '../../assets/Color/color';
import SearchComponent from '../../components/SearchComponent';
import ExpandableSearch from '../../components/SearchComponent';

const {width} = Dimensions.get('window');

const COLLAPSIBLE_HEIGHT = 220;
const FIXED_HEADER_HEIGHT = 80;
const STATUSBAR = Platform.OS === 'ios' ? 50 : 20;
const GRID_SPACING = 8;
const ITEM_WIDTH = (width - 20 * 2 - GRID_SPACING) / 2;
const TOTAL_HEADER_HEIGHT = FIXED_HEADER_HEIGHT + COLLAPSIBLE_HEIGHT;
const DASHBOARD_MENU = [
  {
    id: '1',
    title: 'Create Sales',
    subtitle: 'Transactions',
    image: require('../../../src/assets/Icons/billreceipt.png'),
    screen: 'SalesScreen',
    color: '#EEF2FF',
  },
  {
    id: '2',
    title: 'Sales History',
    subtitle: 'View sales history',
    image: require('../../../src/assets/Icons/sales-report.webp'),
    screen: 'SalesListScreen',
    color: '#EEF2FF',
  },

  {
    id: '3',
    title: 'Bulk Upload',
    subtitle: 'Add multiple items',
    image: require('../../../src/assets/Icons/upload.webp'),
    screen: 'BulkProductScreen',
    color: '#EEF2FF',
  },
  {
    id: '4',
    title: 'Bulk Print',
    subtitle: 'Print multiple labels',
    image: require('../../assets/Icons/printerthermal.png'),
    screen: 'BulkPrintScreen',
    color: '#EEF2FF',
  },
  // {
  //   id: '5',
  //   title: 'Sales History',
  //   subtitle: 'View sales history',
  //   image: require('../../../src/assets/Icons/sales-report.webp'),
  //   screen: 'SalesListScreen',
  //   color: '#EEF2FF',
  // },
  // {
  //   id: '6',
  //   title: 'Sales Report',
  //   subtitle: 'View sales report',
  //   image: require('../../../src/assets/Icons/sales-report.webp'),
  //   screen: 'SalesReportScreen',
  //   color: '#EEF2FF',
  // },
];
//asdfasdfadsgasdgasdfgasdfg
const ModernHomeScreen = () => {
  const scrollY = useSharedValue(0);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const SNAP_POINT = COLLAPSIBLE_HEIGHT / 2;

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollY.value = event.contentOffset.y;
    },

    onEndDrag: event => {
      const y = event.contentOffset.y;

      if (y > 0 && y < COLLAPSIBLE_HEIGHT) {
        if (y < SNAP_POINT) {
          // 🔽 SNAP BACK (expand)
          scrollTo(scrollRef, 0, 0, true);
        } else {
          // 🔼 SNAP UP (collapse)
          scrollTo(scrollRef, 0, COLLAPSIBLE_HEIGHT, true);
        }
      }
    },
  });

  /* 🔥 COLLAPSE ANIMATION */
  const collapsibleStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollY.value,
      [0, COLLAPSIBLE_HEIGHT],
      [1, 0.95],
      Extrapolate.CLAMP,
    );
    const height = interpolate(
      scrollY.value,
      [0, COLLAPSIBLE_HEIGHT],
      [COLLAPSIBLE_HEIGHT, 0],
      Extrapolate.CLAMP,
    );

    const opacity = interpolate(
      scrollY.value,
      [0, COLLAPSIBLE_HEIGHT / 2],
      [1, 0],
      Extrapolate.CLAMP,
    );

    return {
      scale,
      height,
      opacity,
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* <ExpandableSearch /> */}
        {/* <SearchComponent /> */}
        {/* <View style={styles.searchBar}>
          <TextInput placeholder="Search..." placeholderTextColor="#999" />
        </View> */}
      </View>
      {/* 🔴 SECTION 2: COLLAPSIBLE (BOTTOM LAYER) */}
      <Animated.View style={[styles.collapsible, collapsibleStyle]}>
        <TimelineChart />
      </Animated.View>

      {/* 🟢 SECTION 3: SCROLL (TOP LAYER - SAME LEVEL dfgdfgh HEADER) */}
      <Animated.ScrollView
        ref={scrollRef}
        style={styles.scroll}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.gridContainer}>
          {DASHBOARD_MENU.map(item => (
            <CustomTileButton
              key={item.id}
              isGrid={true} // 🔥 This fixes the layout internally
              title={item.title}
              subtitle={item.subtitle}
              imageSource={item.image}
              onPress={() => navigation.navigate(item.screen as any)}
              backgroundColor={item.color}
              containerStyle={{
                width: ITEM_WIDTH,
                marginVertical: GRID_SPACING,
                height: 80, // Slightly taller for better spacing
              }}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.tinyBtnGrid}>
          <TinySquareButton
            title="Customers"
            onPress={() => navigation.navigate('CustomerScreen')}
            icon={
              <UsersIcon
                width={24}
                height={24}
                //  fill="#6366F1"
                //color={color.themeBlue}
                stroke={color.black}
                strokeWidth={2}
              />
            }
          />
          <TinySquareButton
            title="Reports"
            onPress={() => navigation.navigate('SalesReportScreen')}
            icon={
              <ReportsIcon
                width={24}
                height={24}
                // fill={color.green}
                color={color.dark}
                // stroke={color.dark}
                strokeWidth={2}
              />
            }
          />
          <TinySquareButton
            title="Staff"
            onPress={() => navigation.navigate('Staff')}
            icon={
              <StaffIcon
                width={24}
                height={24}
                //  fill="#10B981"
                color={color.dark}
                stroke={color.dark}
                strokeWidth={7}
              />
            }
          />
          <TinySquareButton
            title="Supplier"
            onPress={() => navigation.navigate('Supplier')}
            icon={
              <SupplierIcon
                width={24}
                height={24}
                //  fill="#EF4444"
                stroke={color.dark}
                strokeWidth={2}
              />
            }
          />
          <TinySquareButton
            title="Purchase"
            onPress={() => navigation.navigate('Purchase')}
            icon={
              <PurchaseIcon
                width={24}
                height={24}
                // fill="#EF4444"
                stroke={color.dark}
                strokeWidth={2}
              />
            }
          />
        </View>
        <SalesChart />
        <View style={styles.fakeCard} />
        <View style={styles.fakeCard} />
      </Animated.ScrollView>
      <ExpandableSearch />
    </View>
  );
};

export default ModernHomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },

  /* 🔵 HEADER (TOP) */
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,

    height: FIXED_HEADER_HEIGHT + STATUSBAR,
    paddingTop: STATUSBAR,
    paddingHorizontal: 10,
    justifyContent: 'center',

    backgroundColor: '#f9f9f9',

    zIndex: 30,
    elevation: 30,
  },

  searchBar: {
    height: 45,
    marginTop: 20,
    // backgroundColor: 'blue',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E7FF',
    paddingHorizontal: 15,
    justifyContent: 'center',
  },

  /* 🔴 COLLAPSIBLE (LOWEST) */
  collapsible: {
    position: 'absolute',
    top: FIXED_HEADER_HEIGHT + STATUSBAR,
    left: 0,
    right: 0,

    zIndex: 900, // 👈 BELOW EVERYTHING
    paddingHorizontal: 20,
    overflow: 'hidden',
  },

  balanceCard: {
    height: 100,

    borderRadius: 16,
  },

  /* 🟢 SCROLL (COVERS COLLAPSIBLE) */
  scroll: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,

    zIndex: 20, // 👈 SAME AS HEADER
    elevation: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20, // Match your screen padding
    paddingBottom: 20,
  },

  scrollContent: {
    paddingTop: TOTAL_HEADER_HEIGHT + 20,

    paddingBottom: 40,
    borderTopLeftRadius: 50,
    backgroundColor: '#F8F9FB', // 🔥 REQUIRED TO COVER
  },

  fakeCard: {
    height: 200,
    width: width - 40,
    backgroundColor: '#757171',
    alignSelf: 'center',
    borderRadius: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginLeft: 20,
    marginBottom: 15,
  },
  tinyBtnGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
});
