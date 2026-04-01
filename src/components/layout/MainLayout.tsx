import React, {ReactNode} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import LinearGradient from 'react-native-linear-gradient';
import UI, {Div, Flex, Text, Touch} from '../common/UI';
import Svg, {Path} from 'react-native-svg';
import {useNavigation} from '@react-navigation/native';

interface MainLayoutProps {
  children: ReactNode;
  child?: any;
  wl?: boolean;
  pf?: boolean;
  showHeader?: boolean;
  sName?: string;
  more?: boolean;
  back?: boolean;
  loading?: boolean;
  chatPf?: boolean;
  el?: any;
  elName?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  child,
  wl,
  pf,
  showHeader,
  sName,
  more,
  back,
  loading,
  chatPf,
  el,
  elName,
}) => {
  const dispatch = useDispatch();

  const navigation = useNavigation();

  const backScreen = () => {
    navigation.goBack();
  };

  return (
    <LinearGradient
      start={{x: 0, y: 0}}
      locations={[0.3, 1, 1, 0.1]}
      end={{x: 1, y: 0.4}}
      colors={['#FA2C37', '#fff', '#FA2C37', '#FA2C37']}
      style={{flex: 1}}>
      {loading && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            justifyContent: 'center',
            height: '100%',
            width: '100%',
            backgroundColor: 'rgba(0,0,0,0.2)',
            zIndex: 1,
          }}>
          <ActivityIndicator
            // style={{marginTop: 80}}
            size="large"
            color={'red'}
          />
        </View>
      )}
      <View
        style={{
          height: Platform.OS == 'android' ? 50 : 60,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          backgroundColor: '#df1827',
        }}></View>
      {/* <SafeAreaView style={{flex: 1, marginTop: 45}}> */}
      {showHeader && (
        <View
          style={[
            {
              height: 60,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              backgroundColor: '#fff',
            },
            {
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.15,
              shadowRadius: 15,
              elevation: 10,
            },
          ]}>
          <Div width={'33.33%'}>
            {back && (
              <Flex middle p={0}>
                <Touch
                  onPress={() => backScreen()}
                  style={{flexDirection: 'row', alignItems: 'center'}}>
                  {/* <Svg width="40" height="40" viewBox="0 0 17 9" fill="none">
                    <Path
                      d="M5.91667 8L0.75 4.5M0.75 4.5L5.91667 1M0.75 4.5L16.25 4.5"
                      stroke={'#6D6D6D'}
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </Svg> */}
                  <Svg width="20" height="20" viewBox="0 0 6 12" fill="none">
                    <Path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M5.6929 0.171522C6.04575 0.441528 6.10296 0.934016 5.82068 1.27152L1.86596 6L5.82068 10.7285C6.10296 11.066 6.04575 11.5585 5.6929 11.8285C5.34005 12.0985 4.82518 12.0438 4.5429 11.7063L0.179289 6.48889C-0.0597623 6.20307 -0.0597623 5.79693 0.179289 5.51111L4.5429 0.293744C4.82518 -0.0437635 5.34005 -0.0984842 5.6929 0.171522Z"
                      fill="#28303F"
                    />
                  </Svg>
                  <Text>Back</Text>
                </Touch>
              </Flex>
            )}
          </Div>

          <Div width={'33.33%'}>
            {sName && (
              <Text
                size={20}
                center
                fa
                style={{
                  color: '#000',
                  textTransform: 'capitalize',
                }}>
                {sName}
              </Text>
            )}
          </Div>

          <View
            style={{
              width: '33.33%',
              justifyContent: 'flex-end',
              alignItems: 'flex-end',
            }}>
            {more && (
              <Touch
                onPress={() => {
                  //   dispatch(logout());
                  //   setTimeout(() => {
                  //     child.navigation.navigate('SignInScreen');
                  //   }, 1000);
                }}>
                <Svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  // xmlns="http://www.w3.org/2000/svg"
                >
                  <Path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M10 6.25C10 5.55964 10.5596 5 11.25 5C11.9404 5 12.5 5.55964 12.5 6.25C12.5 6.94036 11.9404 7.5 11.25 7.5C10.5596 7.5 10 6.94036 10 6.25ZM10 11.25C10 10.5596 10.5596 10 11.25 10C11.9404 10 12.5 10.5596 12.5 11.25C12.5 11.9404 11.9404 12.5 11.25 12.5C10.5596 12.5 10 11.9404 10 11.25ZM11.25 15C10.5596 15 10 15.5596 10 16.25C10 16.9404 10.5596 17.5 11.25 17.5C11.9404 17.5 12.5 16.9404 12.5 16.25C12.5 15.5596 11.9404 15 11.25 15Z"
                    fill={'#000'}
                  />
                </Svg>
              </Touch>
            )}

            {pf && (
              <Touch
                onPress={() => {}}
                bg={'#000'}
                width={50}
                height={50}
                br={50}
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  // overflow: 'hidden',
                }}></Touch>
            )}
          </View>
        </View>
      )}
      <View style={{flex: 1, backgroundColor: '#fff'}}>{children}</View>
      {/* </SafeAreaView> */}
    </LinearGradient>
  );
};

const style = StyleSheet.create({
  chatContainer: {
    //  flex: 1,
    //  marginBottom: 50,
    height: '70%', // if the bottom bar is height
  },
  img: {
    width: 50,
    borderRadius: 100,
    height: 50,
  },
  imgDiv: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    borderRadius: 100,
    height: 50,
    //  borderColor?
    backgroundColor: 'transparent',
  },
});
export default MainLayout;
