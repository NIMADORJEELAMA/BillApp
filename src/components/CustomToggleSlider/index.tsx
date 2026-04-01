import React from 'react';
import {Pressable, StyleSheet, Animated, View, ViewStyle} from 'react-native';

interface CustomToggleSliderProps {
  value: boolean;
  onToggle: () => void;
  width?: number;
  height?: number;
  trackColorOn?: string;
  trackColorOff?: string;
  thumbColor?: string;
  style?: ViewStyle;
}

const CustomToggleSlider: React.FC<CustomToggleSliderProps> = ({
  value,
  onToggle,
  width = 50,
  height = 30,
  trackColorOn = '#6a0dad',
  trackColorOff = '#ccc',
  thumbColor = '#fff',
  style,
}) => {
  const thumbSize = height - 6;
  const animatedValue = new Animated.Value(value ? 1 : 0);

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [3, width - thumbSize - 3],
  });

  return (
    <Pressable onPress={onToggle} style={[{width, height}, style]}>
      <View
        style={[
          styles.track,
          {
            backgroundColor: value ? trackColorOn : trackColorOff,
            width,
            height,
            borderRadius: height / 2,
          },
        ]}>
        <Animated.View
          style={[
            styles.thumb,
            {
              width: thumbSize,
              height: thumbSize,
              borderRadius: thumbSize / 2,
              backgroundColor: thumbColor,
              transform: [{translateX}],
            },
          ]}
        />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  track: {
    justifyContent: 'center',
    padding: 2,
  },
  thumb: {
    position: 'absolute',
    top: 3,
  },
});

export default CustomToggleSlider;
