import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import color from '../../../assets/Color/color';
import VerifiedIcon from '../../../assets/Icons/verified-badge-svgrepo-com.svg';

interface ProfileHeaderProps {
  name: string;
  isVerified?: boolean;
  onEditPress: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  isVerified,
  onEditPress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={styles.name}>{name}</Text>
        {isVerified && <VerifiedIcon height={20} width={20} />}
      </View>
      <TouchableOpacity
        onPress={onEditPress}
        style={[
          styles.editButton,
          {flexDirection: 'row', alignItems: 'center'},
        ]}>
        <Svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          style={{marginRight: 4}}>
          <Path
            d="M4 21H20M14.1213 4.12132C14.6839 3.55871 15.4911 3.25 16.3284 3.25C17.1657 3.25 17.9729 3.55871 18.5355 4.12132C19.0981 4.68393 19.4069 5.49112 19.4069 6.32843C19.4069 7.16574 19.0981 7.97294 18.5355 8.53555L8.00001 19.0711L3 20.5L4.42893 15.5L14.1213 4.12132Z"
            stroke="#000"
            fill="#000"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
        <Text style={styles.edit}>Edit</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProfileHeader;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // backgroundColor: 'red',
    // padding: 16,
  },
  editButton: {
    backgroundColor: color.lightGrey,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 35,
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
