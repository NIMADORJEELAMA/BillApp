import React, {useEffect, useRef} from 'react';
import {TouchableOpacity, Animated, View, Text} from 'react-native';

const AnimatedTabButton = (props: any) => {
  const isSelected = props.accessibilityState?.selected;

  const borderWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isSelected) {
      Animated.timing(borderWidth, {
        toValue: 100,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(borderWidth, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [isSelected]);

  return (
    <TouchableOpacity
      onPress={props.onPress}
      style={{
        flexDirection: 'row',
        height: '100%',
        width: '90%',
        marginLeft: 'auto',
        marginRight: 'auto',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Animated.View
        style={{
          position: 'absolute',
          top: -8,
          height: 10,
          borderRadius: 50,
          backgroundColor: '#000',
          width: borderWidth.interpolate({
            inputRange: [0, 100],
            outputRange: ['0%', '100%'],
          }),
        }}
      />
      <View style={{alignItems: 'center'}}>
        {props.icon}
        <Text
          style={{
            color: isSelected ? '#000' : 'gray',
            fontSize: 12,
            fontWeight: isSelected ? 'bold' : 'normal',
          }}>
          {props.label}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default AnimatedTabButton;
