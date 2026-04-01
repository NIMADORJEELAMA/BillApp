import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  View,
  Switch,
} from 'react-native';
import {SvgProps} from 'react-native-svg';
import color from '../../assets/Color/color';
// import ToggleButton from '../ToggleButton';
import CustomToggleSlider from '../CustomToggleSlider';

interface SmallButtonToggleProps {
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

const SmallButtonToggle: React.FC<SmallButtonToggleProps> = ({
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
  isToggle,
  toggleValue,
  onToggleChange,
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

        {isToggle && typeof toggleValue === 'boolean' && onToggleChange ? (
          <CustomToggleSlider
            value={toggleValue}
            onToggle={() => onToggleChange(!toggleValue)}
            width={50}
            height={26}
            trackColorOn={color.purple}
            trackColorOff="#ccc"
            thumbColor="#fff"
          />
        ) : (
          ShowRightIcon &&
          (RightIcon || rightLabel) && (
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
                  strokeWidth={30}
                />
              )}
            </View>
          )
        )}
        {/* {isToggle ? (
          <ToggleButton
            value={toggleValue}
            onToggle={() => setToggleValue(prev => !prev)}
            activeText="Enabled"
            inactiveText="Disabled"
          />
        ) : (
          // <Switch
          //   value={toggleValue}
          //   onValueChange={onToggleChange}
          //   trackColor={{false: '#ccc', true: color.purple || '#4CAF50'}}
          //   thumbColor={toggleValue ? '#fff' : '#f4f3f4'}
          //   ios_backgroundColor="#3e3e3e"
          // />
          ShowRightIcon &&
          (RightIcon || rightLabel) && (
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
                  strokeWidth={30}
                />
              )}
            </View>
          )
        )} */}
      </View>
    </Pressable>
  );
};

export default SmallButtonToggle;

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
    fontSize: 14,
    marginRight: 4,
    color: '#fff',
  },
});
