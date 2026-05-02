// import React, {useEffect, useRef} from 'react';
// import {TouchableOpacity, Animated, View, Text} from 'react-native';
// import color from '../../assets/Color/color';

// const AnimatedTabButton = (props: any) => {
//   const isSelected = props.accessibilityState?.selected;

//   const borderWidth = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     if (isSelected) {
//       Animated.timing(borderWidth, {
//         toValue: 100,
//         duration: 300,
//         useNativeDriver: false,
//       }).start();
//     } else {
//       Animated.timing(borderWidth, {
//         toValue: 0,
//         duration: 300,
//         useNativeDriver: false,
//       }).start();
//     }
//   }, [isSelected]);

//   return (
//     <TouchableOpacity
//       onPress={props.onPress}
//       style={{
//         flexDirection: 'row',
//         height: '100%',
//         width: '90%',
//         marginLeft: 'auto',
//         marginRight: 'auto',
//         justifyContent: 'center',
//         alignItems: 'center',
//       }}>
//       <Animated.View
//         style={{
//           position: 'absolute',
//           top: -8,
//           height: 10,
//           borderRadius: 50,
//           backgroundColor: color.themeBlue,
//           width: borderWidth.interpolate({
//             inputRange: [0, 100],
//             outputRange: ['0%', '100%'],
//           }),
//         }}
//       />
//       <View style={{alignItems: 'center'}}>
//         {props.icon}
//         <Text
//           style={{
//             color: isSelected ? color.themeBlue : 'gray',
//             fontSize: 12,
//             fontWeight: isSelected ? 'bold' : 'normal',
//           }}>
//           {props.label}
//         </Text>
//       </View>
//     </TouchableOpacity>
//   );
// };

// export default AnimatedTabButton;

import React, {useEffect, useRef} from 'react';
import {TouchableOpacity, Animated, View, Text} from 'react-native';
import color from '../../assets/Color/color';

const AnimatedTabButton = (props: any) => {
  const isSelected = props.accessibilityState?.selected;

  // 1. Initialize Animated Values
  const borderWidth = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current; // Scale starts at 1

  useEffect(() => {
    // 2. Define Animations
    const borderAnimation = Animated.timing(borderWidth, {
      toValue: isSelected ? 100 : 0,
      duration: 300,
      useNativeDriver: false, // Layout properties (width) can't use native driver
    });

    const scaleAnimation = Animated.timing(scaleValue, {
      toValue: isSelected ? 1.12 : 1, // Scale up to 115% when active
      duration: 300,
      useNativeDriver: true, // Transform (scale) can use native driver
    });

    // 3. Run them in parallel
    Animated.parallel([borderAnimation, scaleAnimation]).start();
  }, [isSelected]);

  return (
    <TouchableOpacity
      onPress={props.onPress}
      activeOpacity={0.8}
      style={{
        flex: 1, // Use flex: 1 for equal distribution in tab bar
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      {/* Animated Top Indicator */}
      <Animated.View
        style={{
          position: 'absolute',
          top: -8,
          height: 4, // Slimmer line usually looks cleaner
          borderRadius: 2,
          backgroundColor: color.themeBlue,
          width: borderWidth.interpolate({
            inputRange: [0, 100],
            outputRange: ['0%', '80%'], // Slightly less than 100% for padding
          }),
        }}
      />

      {/* 4. Apply Scale to the Content */}
      <Animated.View
        style={{
          alignItems: 'center',
          transform: [{scale: scaleValue}],
        }}>
        {props.icon}
        <Text
          style={{
            color: isSelected ? color.themeBlue : 'gray',
            fontSize: 12,
            fontWeight: isSelected ? 'bold' : 'normal',
            marginTop: 2,
          }}>
          {props.label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default AnimatedTabButton;
