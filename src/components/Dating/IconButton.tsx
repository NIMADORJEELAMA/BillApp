import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface IconButtonProps {
  iconName: string;
  iconSize?: number;
  iconColor?: string;
  text: string;
  onPress: () => void;
  style?: ViewStyle | ViewStyle[];

  textStyle?: TextStyle | TextStyle[];
}

const IconButton: React.FC<IconButtonProps> = ({
  iconName,
  iconSize = 20,
  iconColor = '#000',
  text,
  onPress,
  style,
  textStyle,
}) => {
  return (
   
      <TouchableOpacity
        style={[styles.button, style]}
        onPress={onPress}
        activeOpacity={0.8}>
        <View style={styles.content}>
          <Icon
            name={iconName}
            size={iconSize}
            color={iconColor}
            style={styles.icon}
          />
          <Text style={[styles.text, textStyle]}>{text}</Text>
        </View>
      </TouchableOpacity>
    )
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#333',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 25,
    //  margin: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  text: {
    color: '#000',
    fontSize: 14,
    fontWeight: '400',
  },
});

export default IconButton;
