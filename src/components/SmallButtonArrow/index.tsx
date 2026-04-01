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
import color from '../../assets/Color/color';

interface SmallButtonProps {
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
  borderBottomColor?: string;

  isToggle?: boolean; // whether to show a toggle switch instead of right icon
  toggleValue?: boolean; // current value of the toggle
  onToggleChange?: (val: boolean) => void; // callback when toggle changes
}

const SmallButtonArrow: React.FC<SmallButtonProps> = ({
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
  verticalPadding = 15,
  borderBottomColor = '#f7f7f7',
}) => {
  const isOutline = type === 'outline';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.buttonBase,
        {
          borderBottomColor: borderBottomColor,
        },
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

export default SmallButtonArrow;

const styles = StyleSheet.create({
  buttonBase: {
    width: '98%',
    paddingVertical: 18,
    borderRadius: 8,
    justifyContent: 'center',
    marginBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#f9f9f9', // Blue border color
  },

  solidButton: {
    backgroundColor: color.Egrey,
  },
  outlineButton: {
    borderColor: '#777',
    backgroundColor: color.Egrey,
    borderBottomWidth: 1,
    borderBottomColor: 'blue',
  },
  buttonText: {
    fontWeight: '500',
    fontSize: 12,
    flex: 1,
    textAlign: 'left',
    marginLeft: 10,
  },
  solidText: {
    color: '#000',
  },
  outlineText: {
    color: '#000',
  },
  disabled: {
    opacity: 0.5,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
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
    fontSize: 12,

    marginRight: 4,
    // color: '#fff',
  },
});
