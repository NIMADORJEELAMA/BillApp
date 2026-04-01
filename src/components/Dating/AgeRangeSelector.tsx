import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  PanResponderGestureState,
  GestureResponderEvent,
} from 'react-native';

interface AgeRangeSliderProps {
  minAge?: number;
  maxAge?: number;
  initialMinValue?: number;
  initialMaxValue?: number;
  onRangeChange?: (min: number, max: number) => void;
}

const AgeRangeSlider: React.FC<AgeRangeSliderProps> = ({
  minAge = 18,
  maxAge = 80,
  initialMinValue = 25,
  initialMaxValue = 35,
  onRangeChange,
}) => {
  const [minValue, setMinValue] = useState(initialMinValue);
  const [maxValue, setMaxValue] = useState(initialMaxValue);

  const sliderWidth = 280;
  const thumbWidth = 20;

  const getPositionFromValue = (value: number) => {
    return ((value - minAge) / (maxAge - minAge)) * (sliderWidth - thumbWidth);
  };

  const getValueFromPosition = (position: number) => {
    const value = minAge + (position / (sliderWidth - thumbWidth)) * (maxAge - minAge);
    return Math.round(Math.max(minAge, Math.min(maxAge, value)));
  };

  const [isDraggingMin, setIsDraggingMin] = useState(false);
  const [isDraggingMax, setIsDraggingMax] = useState(false);

  const minPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => setIsDraggingMin(true),
    onPanResponderMove: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
      const newPosition = Math.max(0, Math.min(gestureState.dx + getPositionFromValue(minValue), getPositionFromValue(maxValue) - thumbWidth));
      const newValue = getValueFromPosition(newPosition);
      
      if (newValue !== minValue && newValue < maxValue) {
        setMinValue(newValue);
        onRangeChange?.(newValue, maxValue);
      }
    },
    onPanResponderRelease: () => setIsDraggingMin(false),
  });

  const maxPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => setIsDraggingMax(true),
    onPanResponderMove: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
      const newPosition = Math.max(getPositionFromValue(minValue) + thumbWidth, Math.min(sliderWidth - thumbWidth, gestureState.dx + getPositionFromValue(maxValue)));
      const newValue = getValueFromPosition(newPosition);
      
      if (newValue !== maxValue && newValue > minValue) {
        setMaxValue(newValue);
        onRangeChange?.(minValue, newValue);
      }
    },
    onPanResponderRelease: () => setIsDraggingMax(false),
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Age Range</Text>
        <Text style={styles.values}>{minValue} - {maxValue} years</Text>
      </View>
      
      <View style={styles.sliderContainer}>
        {/* Track */}
        <View style={[styles.track, { width: sliderWidth }]} />
        
        {/* Active range */}
        <View
          style={[
            styles.activeTrack,
            {
              left: getPositionFromValue(minValue),
              width: getPositionFromValue(maxValue) - getPositionFromValue(minValue) + thumbWidth,
            },
          ]}
        />
        
        {/* Min thumb */}
        <View
          {...minPanResponder.panHandlers}
          style={[
            styles.thumb,
            {
              left: getPositionFromValue(minValue),
            },
            isDraggingMin && styles.thumbActive,
          ]}
        >
          <View style={styles.thumbInner} />
        </View>
        
        {/* Max thumb */}
        <View
          {...maxPanResponder.panHandlers}
          style={[
            styles.thumb,
            {
              left: getPositionFromValue(maxValue),
            },
            isDraggingMax && styles.thumbActive,
          ]}
        >
          <View style={styles.thumbInner} />
        </View>
      </View>
      
      {/* Min/Max labels */}
      {/* <View style={styles.labelsContainer}>
        <Text style={styles.minMaxLabel}>{minAge}</Text>
        <Text style={styles.minMaxLabel}>{maxAge}</Text>
      </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  values: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
  },
  sliderContainer: {
    height: 40,
    justifyContent: 'center',
    position: 'relative',
  },
  track: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
  },
  activeTrack: {
    height: 4,
    backgroundColor: '#007AFF',
    borderRadius: 2,
    position: 'absolute',
  },
  thumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
   //  top: -8,
  },
  thumbInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 10,
  },
  thumbActive: {
    transform: [{ scale: 1.1 }],
  },
  minMaxLabel: {
    fontSize: 12,
    color: '#666',
  },
});

export default AgeRangeSlider;