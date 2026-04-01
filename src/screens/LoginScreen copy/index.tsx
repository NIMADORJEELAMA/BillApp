import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
} from 'react-native';
import CustomButton from '../../components/CustomButton';
import images from '../../assets/images/images';
import CustomButtonSocial from '../../components/CustomButtonSocial';
import color from '../../assets/Color/color';
import Navigation from '../../routes/Navigation';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../routes/Navigation';

export default function LoginScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image source={images.likeeLogo} style={styles.logo} />

      {/* Title and Subtitle */}
      <Text style={styles.title}>Signup to Continue</Text>
      <Text style={styles.subtitle}>Please login to continue</Text>

      {/* Email Button */}

      <CustomButton
        title="Continue with Email"
        onPress={() => navigation.navigate('Intro')}
        type="solid"
      />

      {/* Phone Button */}
      <CustomButton
        title="Continue with Phone Number"
        onPress={() => console.log('Phone')}
        type="outline"
      />

      {/* Divider */}
      <View style={styles.dividerContainer}>
        <View style={styles.line} />
        <Text style={styles.orText}>Or Signup with</Text>
        <View style={styles.line} />
      </View>

      {/* Social Buttons */}
      <View style={styles.socialContainer}>
        <CustomButtonSocial
          text="Google"
          onPress={() => console.log('Pressed Google')}
          icon={images.googleIcon}
          style={{
            backgroundColor: '#fff',
            borderWidth: 1,
            borderColor: color.lightgray,
          }}
        />
        <CustomButtonSocial
          text="Apple"
          onPress={() => console.log('Presseddd  Google')}
          icon={images.likeeLogo}
          style={{
            backgroundColor: '#fff',
            borderWidth: 1,
            borderColor: color.lightgray,
          }}
        />
      </View>

      {/* Terms and Conditions */}
      <Text style={styles.termsText}>
        I accept {'\n'}
        <Text style={styles.link}>Terms & Conditions</Text> &{' '}
        <Text style={styles.link}>Privacy Policy</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    // backgroundColor: 'red',
    height: '100%',
  },
  logo: {
    width: 80,
    height: 80,
    marginTop: 120,
    marginBottom: 50,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#000',
  },
  subtitle: {
    color: '#888',
    marginBottom: 30,
  },
  gradientBtn: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: 'red',
  },
  gradient: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  outlineBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ff5858',
    alignItems: 'center',
    marginBottom: 20,
  },
  outlineBtnText: {
    color: '#ff5858',
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    width: '100%',
    marginTop: 30,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  orText: {
    marginHorizontal: 8,
    color: '#333',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    gap: 0,
    marginTop: 20,
  },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 1,
    justifyContent: 'center',
    gap: 8,
  },
  socialText: {
    fontWeight: '500',
    color: '#333',
  },
  termsText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#333',
    marginTop: 30,
    paddingHorizontal: 10,
    position: 'absolute',
    bottom: 30,
  },
  link: {
    color: '#ff588d',
    fontWeight: '500',
  },
});
