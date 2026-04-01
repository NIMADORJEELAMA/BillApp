import React, {useState} from 'react';
import {View, StyleSheet, FlatList, Dimensions, ScrollView} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import LinearGradient from 'react-native-linear-gradient';
import color from '../../assets/Color/color';

import ArrowRight from '../../assets/Icons/right-arrrow.svg';
import Help from '../../assets/Icons/help.svg';
import Filter from '../../assets/Icons/filter-svgrepo-com.svg';

import Setting from '../../assets/Icons/settings.svg';

import Star from '../../assets/Icons/star-svgrepo-com.svg';
import Incognito from '../../assets/Icons/incognito-svgrepo-com.svg';

import Plane from '../../assets/Icons/plane-svgrepo-com.svg';

const {width} = Dimensions.get('screen');
const IMAGE_SIZE = width / 3 - 20;
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../routes/navigation';

import ProfileHeader from '../../components/Profile/ProfileHeader';
import Premium from '../../components/Profile/Premium.tsx';
import ButtonPreferences from '../../components/ButtonPreferences/index.tsx';
import GridItem from '../../components/GridItem/index.tsx';
const ProfileScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [images, setImages] = useState<string[]>([]);
  const [showPickerModal, setShowPickerModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  const handleAddImage = () => {
    setShowPickerModal(true);
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={['#ffffff', '#ffffff', '#c2bff6']}
        locations={[0, 0.9, 1]}
        start={{x: 0, y: 2}}
        end={{x: 1.5, y: 0.1}}
        style={styles.gradient}>
        <View style={styles.container}>
          <ScrollView
            style={styles.subcontainer}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}>
            {/* <ProfileHeader
              name="Nima"
              isVerified={true}
              onEditPress={() => console.log('Edit pressed')}
            /> */}

            <View style={{alignItems: 'center', marginTop: 400}}>
              <ButtonPreferences
                title="Staff"
                onPress={() => navigation.navigate('Staff')}
                LeftIcon={Filter}
                RightIcon={ArrowRight}
                // rightLabel="Next"
                // type="outline"
                iconColor={'#000'}
              />
              <ButtonPreferences
                title="Settings"
                onPress={() => navigation.navigate('Settings')}
                LeftIcon={Setting}
                RightIcon={ArrowRight}
                // rightLabel="Next"
                // type="outline"
                iconColor={'#000'}
              />
              <ButtonPreferences
                title="Help Center"
                onPress={() => navigation.navigate('HelpCenter')}
                LeftIcon={Help}
                RightIcon={ArrowRight}
                // rightLabel="Next"
                // type="outline"
                iconColor={'#000'}
              />

              <View style={styles.gridContainer}>
                <GridItem
                  label="Get Super Likes"
                  Icon={Star}
                  iconBgColor="#FFD700"
                  labelColor="#FFD700"
                />
                <GridItem
                  label="Get Boosts"
                  Icon={Setting}
                  iconBgColor="#A61F69"
                  labelColor="#A61F69"
                />
                <GridItem
                  label="Go Incognito"
                  Icon={Incognito}
                  // iconBgColor="#81C784"
                  labelColor="#c2bff6"
                />
                <GridItem
                  label="Get Passport Mode"
                  Icon={Plane}
                  iconBgColor="#c2bff6"
                  labelColor="#333"
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    // marginTop: 60,
    // paddingTop: 80,
    // paddingHorizontal: 20,
    // width: '100%',
    // backgroundColor: 'yellow',
  },
  container: {
    flex: 1,
    // backgroundColor: 'green',
    width: '100%',
    alignContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    // padding: 16,
    // alignItems: 'center',
    // alignContent: 'center',
  },
  subcontainer: {
    flex: 1,
    // backgroundColor: 'blue',
    width: '92%',
    marginTop: 50,
  },
  title: {fontSize: 30, fontWeight: '600', marginBottom: 10},
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 20,
    color: color.grey,
  },
  grid: {gap: 10},
  imageWrapper: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    margin: 4,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  removeButton: {
    position: 'absolute',
    top: -6,
    right: -3,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    paddingHorizontal: 5,
  },
  removeText: {color: '#fff', fontSize: 16},
  // addImage: {
  //   width: IMAGE_SIZE,
  //   height: IMAGE_SIZE,
  //   backgroundColor: '#eee',
  //   borderRadius: 12,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   margin: 5,
  // },
  // addText: {fontSize: 36, color: '#999'},

  addImage: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    // height: 150,
    backgroundColor: '#f3f3f3',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    marginHorizontal: 3,
    marginTop: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1, // for Android shadow
  },
  addText: {
    fontSize: 28,
    color: '#888',
    fontWeight: '300',
  },

  ////Modal

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
  modalButton: {
    width: '100%',
    paddingVertical: 12,
    backgroundColor: '#6C63FF',
    borderRadius: 10,
    marginBottom: 10,
  },
  modalButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
  modalCancel: {
    marginTop: 10,
    fontSize: 16,
    color: '#888',
  },

  //

  suggestion: {
    fontSize: 14,
    color: color.black,
    marginBottom: 10,
    marginTop: 10,
    textAlign: 'left',
    fontWeight: 'bold',
    // backgroundColor: 'purple',
    width: '100%',
  },
  suggestionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },

  suggestionIcon: {
    width: 18,
    height: 18,
    marginRight: 6,
  },

  modalContent: {
    fontSize: 14,
    color: '#333',
    marginBottom: 20,
    lineHeight: 20,
    textAlign: 'left',
  },

  footer: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    alignItems: 'center',
  },

  ///griditem

  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: 10,
  },
});

export default ProfileScreen;
