import React from 'react';
import {View, Text, Pressable, StyleSheet, Platform} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import LeftIcon from '../../assets/Icons/left-arrow.svg';
// or 'react-native-vector-icons/Ionicons'

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBackPress?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showBack = true,
  onBackPress,
}) => {
  const navigation = useNavigation();
  const iconColor = '#000';

  return (
    <View style={styles.container}>
      {showBack ? (
        <Pressable
          style={styles.backButton}
          onPress={onBackPress || (() => navigation.goBack())}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <View>
              <Text>
                <LeftIcon
                  width={12}
                  height={12}
                  fill={iconColor}
                  stroke={iconColor}
                  strokeWidth={30} // Increase this for bolder lines
                />
              </Text>
            </View>
            <View>
              <Text style={styles.title}>{title}</Text>
            </View>
          </View>
        </Pressable>
      ) : (
        ''
      )}
      {/* <Text style={styles.title1}>{title}</Text> */}
      {/* <View style={styles.rightSpacer} /> //Spacer to balance title center */}
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    // paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  backButton: {
    // padding: 8,
  },
  backButtonPlaceholder: {
    width: 40,
  },
  title: {
    // flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: '#000',
    textAlign: 'left',
    marginLeft: 4,
  },
  title1: {
    backgroundColor: 'red',
    textAlign: 'center',
    flex: 1,
  },
  rightSpacer: {
    width: 40,
  },
});
