import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import {SvgProps} from 'react-native-svg';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  type?: 'solid' | 'outline';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;

  ShowRightIcon?: boolean;
  ShowLeftIcon?: boolean;
  LeftIcon?: React.FC<SvgProps>;
  RightIcon?: React.FC<SvgProps>;
  rightLabel?: string;

  iconSize?: number;
  iconColor?: string;
  verticalPadding?: number;
}

const ButtonPreferences: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  type = 'solid',
  style,
  textStyle,
  disabled = false,
  ShowRightIcon = true,
  ShowLeftIcon = true,
  LeftIcon,
  RightIcon,
  rightLabel = '',
  iconSize = 18,
  iconColor = '#fff',
  verticalPadding = 18,
}) => {
  const isOutline = type === 'outline';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.buttonBase,
        {paddingVertical: verticalPadding},
        isOutline ? styles.outlineButton : styles.solidButton,
        disabled && styles.disabled,
        style,
      ]}>
      <View style={styles.contentRow}>
        {ShowLeftIcon && LeftIcon && (
          <View style={styles.leftIcon}>
            <LeftIcon width={iconSize} height={iconSize} fill={iconColor} />
          </View>
        )}

        <Text
          style={[
            styles.buttonText,
            isOutline ? styles.outlineText : styles.solidText,
            textStyle,
          ]}>
          {title}
        </Text>

        {ShowRightIcon && (RightIcon || rightLabel) && (
          <View style={styles.rightContent}>
            {rightLabel !== '' && (
              <Text style={styles.rightText}>{rightLabel}</Text>
            )}
            {RightIcon && (
              <RightIcon
                width={12}
                height={12}
                fill={iconColor}
                stroke={iconColor}
                strokeWidth={30} // Increase this for bolder lines
              />
            )}
          </View>
        )}
      </View>
    </Pressable>
  );
};

export default ButtonPreferences;

const styles = StyleSheet.create({
  buttonBase: {
    width: '98%',
    paddingVertical: 18,
    borderRadius: 8,
    justifyContent: 'center',
    marginBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE', // Blue border color
  },

  solidButton: {
    backgroundColor: '#fff',
  },
  outlineButton: {
    borderColor: '#777',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: 'blue',
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 16,
    flex: 1,
    textAlign: 'left',
    marginLeft: 10,
  },
  solidText: {
    color: '#333',
  },
  outlineText: {
    color: '#333',
  },
  disabled: {
    opacity: 0.5,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  leftIcon: {
    marginRight: 10,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rightText: {
    fontSize: 14,
    marginRight: 4,
    color: '#fff',
  },
});
