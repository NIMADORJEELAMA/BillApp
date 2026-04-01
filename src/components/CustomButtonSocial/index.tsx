import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  StyleProp,
  ViewStyle,
} from 'react-native';

interface CustomButtonProps {
  onPress: () => void;
  text: string;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}
//asdf

const CustomButtonSocial: React.FC<CustomButtonProps> = ({
  onPress,
  text,
  icon,
  style,
}) => {
  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
      <View style={styles.content}>
        {icon && <View style={styles.icon}>{icon}</View>}
        <Text style={styles.text}>{text}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 10,
    height: 28,
    width: 28,
    backgroundColor: 'red',
    borderRadius: 50,
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
});

export default CustomButtonSocial;
