import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  type?: 'solid' | 'outline';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  type = 'solid',
  style,
  textStyle,
  disabled = false,
}) => {
  const isOutline = type === 'outline';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.buttonBase,
        isOutline ? styles.outlineButton : styles.solidButton,
        disabled && styles.disabled,
        style,
      ]}>
      <Text
        style={[
          styles.buttonText,
          isOutline ? styles.outlineText : styles.solidText,
          textStyle,
        ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default CustomButton;

const styles = StyleSheet.create({
  buttonBase: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  solidButton: {
    backgroundColor: '#ff5e8e',
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: '#ff5e8e',
    backgroundColor: '#fff',
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  solidText: {
    color: '#fff',
  },
  outlineText: {
    color: '#ff5e8e',
  },
  disabled: {
    opacity: 0.5,
  },
});
