import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  Alert,
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import LinearGradient from 'react-native-linear-gradient';
import color from '../../assets/Color/color';

import ArrowRight from '../../assets/Icons/right-arrrow.svg';
import Help from '../../assets/Icons/help.svg';
import Setting from '../../assets/Icons/settings.svg';

import Star from '../../assets/Icons/star-svgrepo-com.svg';
import Incognito from '../../assets/Icons/incognito-svgrepo-com.svg';

import Plane from '../../assets/Icons/plane-svgrepo-com.svg';

const {width} = Dimensions.get('screen');
const IMAGE_SIZE = width / 3 - 20;
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../routes/navigation';

import GridItem from '../../components/GridItem/index.tsx';
import SmallButtonArrow from '../../components/SmallButtonArrow/index.tsx';
import CustomButton from '../../components/CustomButton/index.tsx';
import GlassButton from '../../components/GlassButton/GlassButton.tsx';
import {policies} from '../../json/policies.tsx';
import SmallButtonToggle from '../../components/SmallButtonToggle/index.tsx';
const NotificationSettings = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [visible, setVisible] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<
    (typeof policies)[0] | null
  >(null);

  const openModal = (id: string) => {
    const policy = policies.find(p => p.id === id);
    if (policy) {
      setSelectedPolicy(policy);
      setVisible(true);
    }
  };
  return (
    <LinearGradient
      colors={['#ffffff', '#ffffff', '#c2bff6']}
      locations={[0, 0.9, 1]}
      start={{x: 0, y: 2}}
      end={{x: 1.5, y: 0.1}}
      style={styles.gradient}>
      <View style={styles.container}>
        <View>
          <ScrollView
            style={styles.subcontainer}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}>
            <View style={styles.containerTop}>
              <View style={{alignItems: 'center'}}>
                <Text style={styles.textTitle}>New Activity</Text>
              </View>
              <View style={[styles.containerGrey, {alignItems: 'center'}]}>
                <SmallButtonToggle
                  title="Messages"
                  onPress={() => console.log('messages')}
                  // LeftIcon={Help}
                  RightIcon={ArrowRight}
                  // rightLabel="Next"
                  verticalPadding={10}
                  // type="outline"
                  iconColor={'#000'}
                  isToggle={true}
                  toggleValue={enabled}
                  onToggleChange={setEnabled}
                />
                <SmallButtonToggle
                  title="Crushes"
                  onPress={() => navigation.navigate('Preferences')}
                  // LeftIcon={Help}
                  RightIcon={ArrowRight}
                  // rightLabel="Next"
                  verticalPadding={10}
                  // type="outline"
                  isToggle={true}
                  toggleValue={enabled}
                  onToggleChange={setEnabled}
                  iconColor={'#000'}
                />
                <SmallButtonToggle
                  title="Super Crushes"
                  onPress={() => navigation.navigate('Preferences')}
                  // LeftIcon={Help}
                  RightIcon={ArrowRight}
                  // rightLabel="Next"
                  verticalPadding={10}
                  // type="outline"
                  iconColor={'#000'}
                  isToggle={true}
                  toggleValue={enabled}
                  onToggleChange={setEnabled}
                />
                <SmallButtonToggle
                  title="Likes Received"
                  onPress={() => navigation.navigate('Preferences')}
                  // LeftIcon={Help}
                  RightIcon={ArrowRight}
                  // rightLabel="Next"
                  verticalPadding={10}
                  // type="outline"
                  iconColor={'#000'}
                  borderBottomColor="#EEEEEE"
                  isToggle={true}
                  toggleValue={enabled}
                  onToggleChange={setEnabled}
                />
              </View>

              <View style={[{paddingHorizontal: 20, marginTop: 5}]}>
                <Text style={{color: '#9AA6B2'}}>
                  Customize your notifications to stay in the loop with all the
                  good stuff!
                </Text>
              </View>

              <View
                style={[
                  styles.containerGrey,
                  {alignItems: 'center', marginTop: 60},
                ]}>
                <SmallButtonToggle
                  title="Other notifications"
                  onPress={() => navigation.navigate('Preferences')}
                  // LeftIcon={Help}
                  RightIcon={ArrowRight}
                  // rightLabel="Next"
                  verticalPadding={10}
                  // type="outline"
                  iconColor={'#000'}
                  borderBottomColor="#EEEEEE"
                  isToggle={true}
                  toggleValue={enabled}
                  onToggleChange={setEnabled}
                />
              </View>
              <View style={[{paddingHorizontal: 20, marginTop: 5}]}>
                <Text style={{color: '#9AA6B2'}}>
                  Control extra notifications such as special offers, app tips,
                  and more.
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  titleMain: {
    alignItems: 'center',
    marginTop: 28,
  },
  titleText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  subtitleText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  header: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    width: '100%',
    zIndex: 1,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },

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

  containerGrey: {
    backgroundColor: color.Egrey,
    // flexDirection: 'row',
    width: '100%',
    // flexWrap: 'wrap',
    // justifyContent: 'space-between',
    // paddingHorizontal: 10,
    // alignSelf: 'stretch',

    borderRadius: 14,
  },

  containerTop: {
    width: width - 20,
    alignItems: 'flex-start',
    padding: 0,
    borderRadius: 14,
    marginTop: 28,
    // backgroundColor: 'red',
  },
  textTitle: {
    paddingHorizontal: 20,
    marginBottom: 4,
    color: '#9AA6B2',
    fontWeight: 400,
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

  addText: {
    fontSize: 28,
    color: '#888',
    fontWeight: '300',
  },

  //

  ///griditem

  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: 10,
  },

  //modal

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    width: '95%',
    maxHeight: '95%',
    borderRadius: 10,
    padding: 20,
  },
  modalMainTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'sans-seriff',
  },
  modalContentWrapper: {
    marginBottom: 20,
  },
  modalContent: {
    fontSize: 14,
    color: '#444',
    alignItems: 'center',
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#333',
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
});

export default NotificationSettings;
