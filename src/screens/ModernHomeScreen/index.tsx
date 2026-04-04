import React from 'react';
import {StyleSheet, View, Dimensions, Platform} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import ButtonPreferences from '../../components/ButtonPreferences';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../routes/navigation';
import ArrowRight from '../../assets/Icons/right-arrrow.svg';
import Help from '../../assets/Icons/help.svg';
import Filter from '../../assets/Icons/filter-svgrepo-com.svg';

import Setting from '../../assets/Icons/settings.svg';

import Star from '../../assets/Icons/star-svgrepo-com.svg';
import Incognito from '../../assets/Icons/incognito-svgrepo-com.svg';

import Plane from '../../assets/Icons/plane-svgrepo-com.svg';
import GridItem from '../../components/GridItem';

const {width} = Dimensions.get('window');
const HEADER_MAX_HEIGHT = 200;
const HEADER_MIN_HEIGHT = 90;
const SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

const ModernHomeScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const scrollY = useSharedValue(0);

  // Handle Scroll Event
  const scrollHandler = useAnimatedScrollHandler(event => {
    scrollY.value = event.contentOffset.y;
  });

  // Header Animation Styles
  const headerAnimatedStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, SCROLL_DISTANCE],
      [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
      Extrapolate.CLAMP,
    );
    return {height};
  });

  const contentOpacity = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, SCROLL_DISTANCE / 2],
      [1, 0],
      Extrapolate.CLAMP,
    );
    return {opacity};
  });

  return (
    <View style={styles.container}>
      {/* ANIMATED HEADER */}
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <Animated.View style={[styles.headerContent, contentOpacity]}>
          <View style={styles.balanceCard} />
        </Animated.View>

        {/* Sticky Search Bar area */}
        <View style={styles.searchBarPlaceholder} />
      </Animated.View>

      {/* SCROLLABLE CONTENT */}
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{paddingTop: HEADER_MAX_HEIGHT}}>
        {/* Your Dynamic Sections (Carousels, Grids, Banners) */}
        <View style={styles.fakeContent} />
        <ButtonPreferences
          title="Staff"
          onPress={() => navigation.navigate('Staff')}
          LeftIcon={Filter}
          RightIcon={ArrowRight}
          // rightLabel="Next"
          // type="outline"
          iconColor={'#000'}
        />
        <ButtonPreferences
          title="Settings"
          onPress={() => navigation.navigate('Settings')}
          LeftIcon={Setting}
          RightIcon={ArrowRight}
          // rightLabel="Next"
          // type="outline"
          iconColor={'#000'}
        />
        <ButtonPreferences
          title="Help Center"
          onPress={() => navigation.navigate('HelpCenter')}
          LeftIcon={Help}
          RightIcon={ArrowRight}
          // rightLabel="Next"
          // type="outline"
          iconColor={'#000'}
        />
        <View style={styles.fakeContent} />
        <View style={styles.gridContainer}>
          <GridItem
            label="Get Super Likes"
            Icon={Star}
            iconBgColor="#FFD700"
            labelColor="#FFD700"
          />
          <GridItem
            label="Get Boosts"
            Icon={Setting}
            iconBgColor="#A61F69"
            labelColor="#A61F69"
          />
          <GridItem
            label="Go Incognito"
            Icon={Incognito}
            // iconBgColor="#81C784"
            labelColor="#c2bff6"
          />
          <GridItem
            label="Get Passport Mode"
            Icon={Plane}
            iconBgColor="#c2bff6"
            labelColor="#333"
          />
        </View>
      </Animated.ScrollView>
    </View>
  );
};

export default ModernHomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB', // Soft off-white background
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0F52BA', // Jio-style primary blue
    zIndex: 1000,
    paddingHorizontal: 20,
    justifyContent: 'flex-end',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    // Shadow for Android/iOS
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  headerContent: {
    position: 'absolute',
    top: 60, // Adjust based on your Status Bar height
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  balanceCard: {
    width: '100%',
    height: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // Glassmorphism effect
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 15,
  },
  searchBarPlaceholder: {
    width: '100%',
    height: 45,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 15, // Keeps it visible at the bottom of the header
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  fakeContent: {
    height: 250,
    width: width - 40,
    backgroundColor: '#FFFFFF',
    alignSelf: 'center',
    borderRadius: 20,
    marginTop: 20,
    // Light shadow for cards
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  scrollContent: {
    paddingTop: HEADER_MAX_HEIGHT + 20, // Offset so first card isn't hidden
    paddingBottom: 40,
  },
});
