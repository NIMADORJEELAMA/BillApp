import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
// Import the library
import LinearGradient from 'react-native-linear-gradient';

// Define the component props (TypeScript users can create an interface)
interface GradientButtonProps {
  onPress: () => void;
  title: string;
  colors?: string[]; // Optional custom colors
  loading?: boolean;
  disabled?: boolean;
  containerStyle?: ViewStyle; // Optional style overrides
  textStyle?: TextStyle;
}

const GradientButton: React.FC<GradientButtonProps> = ({
  onPress,
  title,
  colors, // Will default to your primary theme below
  loading = false,
  disabled = false,
  containerStyle,
  textStyle,
}) => {
  // Use provided colors, or default to a nice Indigo gradient matching your theme
  const gradientColors = colors || ['#7280fc', '#2f33f7']; // Lighter to your primary

  // Disable the button if explicitly disabled OR if loading
  const isInteractionDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isInteractionDisabled}
      style={[
        styles.wrapper,
        containerStyle,
        isInteractionDisabled && styles.disabledWrapper,
      ]}
      activeOpacity={0.8} // Subtle feedback on press
    >
      <LinearGradient
        colors={gradientColors}
        start={{x: 0, y: 0}} // Start Top Left
        end={{x: 1, y: 0}} // End Top Right (Horizontal gradient)
        style={styles.gradientContainer}>
        {loading ? (
          // Spinner shown during loading state
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          // White text matching your original primary button style
          <Text style={[styles.text, textStyle]}>{title}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    // This container holds the shape and shadow
    borderRadius: 12,
    elevation: 3, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  gradientContainer: {
    // The gradient must have the same height and border radius as the button
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700', // Matches your 800 but slightly cleaner
    letterSpacing: 0.5,
  },
  disabledWrapper: {
    opacity: 0.6, // Visual feedback when disabled
    elevation: 0, // Remove shadow when disabled
    shadowOpacity: 0,
  },
});

export default GradientButton;
