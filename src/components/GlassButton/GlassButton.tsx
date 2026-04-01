import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Image,
  Platform,
} from 'react-native';
import {BlurView} from '@react-native-community/blur';

interface GlassButtonProps {
  text: string;
  onPress: () => void;
  icon?: any;
  style?: StyleProp<ViewStyle>;
  glassColor?: 'light' | 'dark';
  width?: number | string; // Can be a fixed number or percentage string
}

const GlassButton: React.FC<GlassButtonProps> = ({
  text,
  onPress,
  icon,
  style,
  glassColor = 'light',
  width,
}) => {
  // Width styling - handle both fixed width and percentage width
  const widthStyle = width !== undefined ? {width} : {};

  const Content = () => (
    <View style={styles.innerContent}>
      {icon && <Image source={icon} style={styles.icon} resizeMode="contain" />}
      <Text
        style={[
          styles.buttonText,
          {color: glassColor === 'dark' ? '#fff' : '#111'},
        ]}>
        {text}
      </Text>
    </View>
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.6}
      style={[
        styles.buttonWrapper,
        {borderWidth: glassColor === 'light' ? 1 : 0},
        widthStyle, // Apply width style if provided
        style, // Apply custom style last to allow overriding
      ]}>
      {Platform.OS === 'ios' ? (
        <BlurView
          style={[
            styles.blurView,
            glassColor === 'dark' && styles.blurViewDark,
          ]}
          blurType={glassColor === 'dark' ? 'dark' : 'light'}
          blurAmount={15}
          reducedTransparencyFallbackColor="white">
          <Content />
        </BlurView>
      ) : (
        <View
          style={[
            styles.blurFallback,
            glassColor === 'dark' && styles.blurFallbackDark,
          ]}>
          <Content />
        </View>
      )}
    </TouchableOpacity>
  );
};

export default GlassButton;

const styles = StyleSheet.create({
  buttonWrapper: {
    borderRadius: 30,
    overflow: 'hidden',
    // Removed minWidth from here to allow width prop to work properly
  },
  blurView: {
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%', // Fill container width
  },
  blurFallback: {
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    width: '100%', // Fill container width
  },
  innerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    height: 20,
    width: 20,
    marginRight: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  blurViewDark: {
    backgroundColor: '#0F172B',
    borderColor: 'rgba(255,255,255,0.1)',
  },
  blurFallbackDark: {
    backgroundColor: '#0F172B',
    borderColor: 'rgba(255,255,255,0.1)',
  },
});
