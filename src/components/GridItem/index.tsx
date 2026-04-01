import React from 'react';
import {View, Text, StyleSheet, Platform} from 'react-native';
import {SvgProps} from 'react-native-svg';
import {BlurView} from '@react-native-community/blur';

interface GridItemProps {
  label: string;
  Icon: React.FC<SvgProps>;
  iconSize?: number;
  iconBgColor?: string;
  iconColor?: string;
  labelColor?: string;
}

const GridItem: React.FC<GridItemProps> = ({
  label,
  Icon,
  iconSize = 24,
  iconBgColor = '#e0e0e0',
  iconColor = '#000',
  labelColor = '#333',
}) => {
  const isIOS = Platform.OS === 'ios';

  return (
    <View style={styles.itemWrapper}>
      {isIOS ? (
        <BlurView
          style={styles.glass}
          blurType="light"
          blurAmount={15}
          reducedTransparencyFallbackColor="rgba(255,255,255,0.2)">
          <GridContent
            Icon={Icon}
            label={label}
            iconSize={iconSize}
            iconColor={iconColor}
            iconBgColor={iconBgColor}
            labelColor={labelColor}
          />
        </BlurView>
      ) : (
        <View style={[styles.glass, styles.androidGlass]}>
          <GridContent
            Icon={Icon}
            label={label}
            iconSize={iconSize}
            iconColor={iconColor}
            iconBgColor={iconBgColor}
            labelColor={labelColor}
          />
        </View>
      )}
    </View>
  );
};

const GridContent = ({
  Icon,
  label,
  iconSize,
  iconColor,
  iconBgColor,
  labelColor,
}: {
  Icon: React.FC<SvgProps>;
  label: string;
  iconSize: number;
  iconColor: string;
  iconBgColor: string;
  labelColor: string;
}) => {
  return (
    <View style={styles.innerContent}>
      <View style={[styles.iconCircle, {backgroundColor: '#fff'}]}>
        <Icon width={iconSize} height={iconSize} fill={iconColor} />
      </View>
      <Text style={[styles.label, {color: labelColor}]}>{label}</Text>
    </View>
  );
};

export default GridItem;

const styles = StyleSheet.create({
  itemWrapper: {
    width: '48%',
    // aspectRatio: 1,
    marginVertical: 2,
    borderRadius: 16,
    // backgroundColor: 'red',
    overflow: 'hidden',
  },
  glass: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)', // soft border
    backgroundColor: 'rgba(181, 39, 39, 0.89)', // semi-visible glass background
  },

  androidGlass: {
    // backgroundColor: 'rgba(169, 155, 155, 0.06)', // same as iOS fallback
    backgroundColor: '#f1f1f1',
  },

  innerContent: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,

    // Android
    elevation: 4,

    // iOS
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    backgroundColor: '#fff', // required for iOS shadow to be visible
  },

  label: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    fontWeight: 500,
  },
});
