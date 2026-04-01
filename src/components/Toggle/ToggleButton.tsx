import React, {useState, useRef, useEffect} from 'react';
import {
  TouchableOpacity,
  Text,
  Animated,
  StyleSheet,
  View,
  Dimensions,
} from 'react-native';
import {BlurView} from '@react-native-community/blur';

const {width} = Dimensions.get('window');

const ToggleButton = ({
  onToggle,
}: {
  onToggle: (isMakeFriends: boolean) => void;
}) => {
  const [isMakeFriends, setIsMakeFriends] = useState(true);
  const slideAnimation = useRef(new Animated.Value(0)).current;

  const toggle = () => {
    // Simple slide animation
    Animated.timing(slideAnimation, {
      toValue: isMakeFriends ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();

    setIsMakeFriends(!isMakeFriends);
    onToggle(!isMakeFriends);
  };

  const translateX = slideAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [4, width * 0.95 - (width * 0.95) / 2 - 4],
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggle} activeOpacity={0.8}>
        <View style={styles.glassContainer}>
          {/* Main blur background */}
          <BlurView style={styles.blurView} blurType="light" blurAmount={15} />

          {/* Glass overlay */}
          <View style={styles.glassOverlay} />

          {/* Animated slider */}
          <Animated.View
            style={[
              styles.slider,
              {
                transform: [{translateX}],
                backgroundColor: isMakeFriends
                  ? 'rgba(255, 255, 255, 0.9)'
                  : 'rgba(255, 255, 255, 0.9)',
                shadowColor: isMakeFriends ? '#4F46E5' : '#EC4899',
              },
            ]}>
            {/* Simple inner highlight */}
            <View style={styles.sliderHighlight} />
          </Animated.View>

          {/* Label container */}
          <View style={styles.labelContainer}>
            <Text
              style={[
                styles.label,
                styles.leftLabel,
                {
                  color: isMakeFriends ? '#64748B' : '#64748B',
                },
              ]}>
              Make Friends
            </Text>
            <Text
              style={[
                styles.label,
                styles.rightLabel,
                {
                  color: !isMakeFriends ? '#64748B' : '#64748B',
                },
              ]}>
              Search Friends
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: 'green',
    // borderRadius: 25,
  },
  glassContainer: {
    width: width * 0.95, // Made wider (was 0.9)
    height: 52,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#c2bff6',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(235, 230, 230, 0.81)',
  },
  blurView: {
    ...StyleSheet.absoluteFillObject,
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 28,
  },
  slider: {
    position: 'absolute',
    width: (width * 0.95) / 2 - 8, // Adjusted for wider container
    height: 40,
    borderRadius: 22,
    top: 6,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
    overflow: 'hidden',
  },
  sliderHighlight: {
    position: 'absolute',
    top: 2,
    left: 6,
    right: 6,
    height: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24, // Increased padding for wider button
    zIndex: 1,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  leftLabel: {
    flex: 1,
    textAlign: 'center',
    marginRight: 12,
  },
  rightLabel: {
    flex: 1,
    textAlign: 'center',
    marginLeft: 12,
  },
});

export default ToggleButton;
