import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  Image,
  ImageSourcePropType,
  ViewStyle,
  StyleProp,
} from 'react-native';

interface CustomTileButtonProps {
  title: string;
  subtitle?: string;
  imageSource: ImageSourcePropType;
  onPress: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  isGrid?: boolean;
}

const CustomTileButton = ({
  title,
  subtitle,
  imageSource,
  onPress,
  containerStyle,
  backgroundColor = '#FFFFFF',
  isGrid = false,
}: CustomTileButtonProps) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[
        styles.buttonContainer,
        isGrid ? styles.gridContainer : styles.rowContainer,
        {backgroundColor},
        containerStyle,
      ]}
      onPress={onPress}>
      <View style={styles.textContainer}>
        <Text
          style={[styles.title, isGrid && {fontSize: 14}]}
          numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>

      <View style={isGrid ? styles.imageWrapperGrid : styles.imageWrapperRow}>
        <Image source={imageSource} style={styles.image} resizeMode="contain" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    borderRadius: 16,
    padding: 15,
    // Professional Shadow
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 8,
  },
  gridContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  textContainer: {
    // flexShrink: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  subtitle: {
    fontSize: 11,
    color: '#7B7B7B',
    marginTop: 0,
  },
  imageWrapperRow: {
    width: 30,
    height: 30,
  },
  imageWrapperGrid: {
    width: 52,
    height: 52,
    alignSelf: 'flex-end',
    bottom: 20,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default CustomTileButton;
