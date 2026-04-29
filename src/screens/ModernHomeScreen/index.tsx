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
import SettingsIcon from '../../assets/Icons/settings.svg';
import SalesReportScreen from '../SalesReportScreen';
import TimelineChart from '../../components/Charts/TimelineChart';

const {width} = Dimensions.get('window');

const COLLAPSIBLE_HEIGHT = 200;
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
    title: 'Bulk Print',
    subtitle: 'Print multiple labels',
    image: require('../../assets/Icons/printerthermal.png'),
    screen: 'BulkPrintScreen',
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
    title: 'Sales Report',
    subtitle: 'View sales report',
    image: require('../../../src/assets/Icons/sales-report.webp'),
    screen: 'SalesReportScreen',
    color: '#EEF2FF',
  },
  // {
  //   id: '5',
  //   title: 'Sales Report',
  //   subtitle: 'Client list',
  //   image: require('../../../src/assets/Images_main/google.png'),
  //   screen: 'SalesReportScreen',
  //   color: '#FAF5FF',
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
        <View style={styles.searchBar}>
          <TextInput placeholder="Search..." placeholderTextColor="#999" />
        </View>
      </View>
      {/* 🔴 SECTION 2: COLLAPSIBLE (BOTTOM LAYER) */}
      <Animated.View style={[styles.collapsible, collapsibleStyle]}>
        <TimelineChart />
      </Animated.View>

      {/* 🟢 SECTION 3: SCROLL (TOP LAYER - SAME LEVEL AS HEADER) */}
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
            icon={<SettingsIcon width={20} height={20} fill="#6366F1" />}
          />
          <TinySquareButton
            title="Reports"
            onPress={() => {}}
            icon={<SettingsIcon width={20} height={20} fill="#F59E0B" />}
          />
          <TinySquareButton
            title="Profile"
            onPress={() => {}}
            icon={<SettingsIcon width={20} height={20} fill="#10B981" />}
          />
          <TinySquareButton
            title="Help"
            onPress={() => {}}
            icon={<SettingsIcon width={20} height={20} fill="#EF4444" />}
          />
        </View>
        <SalesChart />
        <View style={styles.fakeCard} />
        <View style={styles.fakeCard} />
      </Animated.ScrollView>
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

    zIndex: 1010, // 👈 BELOW EVERYTHING
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
