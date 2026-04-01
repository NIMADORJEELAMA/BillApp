import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import color from '../../../assets/Color/color';
import VerifiedIcon from '../../../assets/Icons/verified-badge-svgrepo-com.svg';
import NotificationIcon from '../../../assets/Icons/notifications-outline-svgrepo-com.svg';

interface HomeHeaderProps {
  name: string;
  isVerified?: boolean;
  onPress: () => void;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({name, isVerified, onPress}) => {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={styles.name}>{name}</Text>
        {/* {isVerified && <VerifiedIcon height={20} width={20} />} */}
      </View>
      <TouchableOpacity
        onPress={onPress}
        style={[
          styles.notificationButton,
          {flexDirection: 'row', alignItems: 'center'},
        ]}>
        <View style={styles.iconContainer}>
          <NotificationIcon width={22} height={22} />
          <View style={styles.badge}>
            {/* <Text style={styles.badgeText}>3</Text> */}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default HomeHeader;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    // backgroundColor: 'red',
    // padding: 16,
  },
  notificationButton: {
    backgroundColor: color.white,
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRadius: 25,
  },
  iconContainer: {
    position: 'relative',
  },

  badge: {
    position: 'absolute',
    top: -4,
    right: -2,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 10,
    height: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },

  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },

  left: {
    flexDirection: 'row',
    alignItems: 'center',
    fontSize: 14,
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    marginRight: 8,
  },
  icon: {
    marginTop: 2,
  },
  edit: {
    fontSize: 16,
    color: color.black,
    fontWeight: '600',
  },
});
