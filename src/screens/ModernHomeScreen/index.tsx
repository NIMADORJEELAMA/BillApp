import React from 'react';
import {StyleSheet, View, Dimensions, Platform, TextInput} from 'react-native';

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import ButtonPreferences from '../../components/ButtonPreferences';
import {useNavigation} from '@react-navigation/native';
import {RootStackParamList} from '../../routes/Navigation';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import ArrowRight from '../../assets/Icons/right-arrrow.svg';
import Help from '../../assets/Icons/help.svg';
import Filter from '../../assets/Icons/filter-svgrepo-com.svg';

import Setting from '../../assets/Icons/settings.svg';

import Star from '../../assets/Icons/star-svgrepo-com.svg';
import Incognito from '../../assets/Icons/incognito-svgrepo-com.svg';

import Plane from '../../assets/Icons/plane-svgrepo-com.svg';

const {width} = Dimensions.get('window');

/* 🔥 CONFIG */
const COLLAPSIBLE_HEIGHT = 130;
const FIXED_HEADER_HEIGHT = 80;
const STATUSBAR = Platform.OS === 'ios' ? 50 : 20;

const TOTAL_HEADER_HEIGHT = FIXED_HEADER_HEIGHT + COLLAPSIBLE_HEIGHT;

const ModernHomeScreen = () => {
  const scrollY = useSharedValue(0);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const scrollHandler = useAnimatedScrollHandler(event => {
    scrollY.value = event.contentOffset.y;
  });

  /* 🔥 COLLAPSE ANIMATION */
  const collapsibleStyle = useAnimatedStyle(() => {
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
      height,
      opacity,
    };
  });

  return (
    <View style={styles.container}>
      {/* 🔴 SECTION 2: COLLAPSIBLE (BOTTOM LAYER) */}
      <Animated.View style={[styles.collapsible, collapsibleStyle]}>
        <View style={styles.balanceCard} />
        <ButtonPreferences
          title="Help Center"
          onPress={() => navigation.navigate('HelpCenter')}
          LeftIcon={Help}
          RightIcon={ArrowRight}
          // rightLabel="Next"
          // type="outline"
          iconColor={'#000'}
        />
      </Animated.View>

      {/* 🔵 SECTION 1: HEADER (TOP LAYER) */}
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <TextInput placeholder="Search..." placeholderTextColor="#999" />
        </View>
      </View>

      {/* 🟢 SECTION 3: SCROLL (TOP LAYER - SAME LEVEL AS HEADER) */}
      <Animated.ScrollView
        style={styles.scroll}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.fakeCard} />
        <View style={styles.fakeCard} />
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
    paddingHorizontal: 20,
    justifyContent: 'center',

    backgroundColor: '#f9f9f9',

    zIndex: 30,
    elevation: 30,
  },

  searchBar: {
    height: 45,
    backgroundColor: 'blue',
    borderRadius: 12,
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
    backgroundColor: 'red',
  },

  balanceCard: {
    height: 100,
    backgroundColor: 'red',
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

  scrollContent: {
    paddingTop: TOTAL_HEADER_HEIGHT + 20,
    paddingBottom: 40,

    backgroundColor: '#F8F9FB', // 🔥 REQUIRED TO COVER
  },

  fakeCard: {
    height: 200,
    width: width - 40,
    backgroundColor: 'green',
    alignSelf: 'center',
    borderRadius: 20,
    marginBottom: 20,
  },
});
