import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

interface TinySquareButtonProps {
  title: string;
  onPress: () => void;
  icon: React.ReactNode;
  backgroundColor?: string;
}

const TinySquareButton = ({
  title,
  onPress,
  icon,
  backgroundColor = '#FFF',
}: TinySquareButtonProps) => {
  return (
    <TouchableOpacity
      style={styles.btnContainer}
      onPress={onPress}
      activeOpacity={0.7}>
      <View style={[styles.square, {backgroundColor}]}>{icon}</View>
      <Text numberOfLines={1} style={styles.btnText}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btnContainer: {
    width: '22%', // Fits 4 per row with spacing
    alignItems: 'center',
    marginBottom: 15,
  },
  square: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    // Shadow/Elevation
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  btnText: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
  },
});

export default TinySquareButton;
