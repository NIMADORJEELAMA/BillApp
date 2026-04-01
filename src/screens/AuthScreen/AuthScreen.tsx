// screens/AuthScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  useColorScheme,
  StatusBar,
} from 'react-native';
import GlassButton from '../../components/GlassButton/GlassButton';
import images from '../../assets/images/images';

import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../routes/navigation'; // adjust path as needed

const AuthScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const backgroundImage = images.wallpaper;

  return (
    <ImageBackground source={backgroundImage} style={styles.bg}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={styles.content}>
        <Text style={[styles.title, {color: isDark ? '#fff' : '#f0f0f0'}]}>
          Love never checks the clock.
        </Text>
        <Text style={[styles.subtitle, {color: isDark ? '#ccc' : '#ccc'}]}>
          Start your journey today.
        </Text>

        <View style={styles.buttonGroup}>
          <GlassButton
            text="Log in with Google"
            icon={images.googleIcon}
            onPress={() => navigation.navigate('Name')}
            width={'100%'}
          />
          <GlassButton
            text="Log in with Apple"
            icon={images.appleIcon}
            onPress={() => console.log('Apple login')}
            style={{marginTop: 16}}
            glassColor="dark"
            width={'100%'}
          />
        </View>

        <View style={styles.footerTextContainer}>
          <Text style={styles.footerText}>
            Don't have an account?{' '}
            <Text
              style={styles.signupText}
              onPress={() => console.log('Navigate to Sign Up')}>
              Sign up
            </Text>
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
};

export default AuthScreen;

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    justifyContent: 'center',
  },
  //   content: {
  //     flex: 1,
  //     justifyContent: 'center',
  //     alignItems: 'center',
  //     paddingHorizontal: 20,
  //     backgroundColor: 'rgba(0,0,0,0.3)', // optional: add slight dimming for readability
  //   },
  content: {
    flex: 1,
    justifyContent: 'flex-end', // Push content to the bottom
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 60, // Adjust as needed to give breathing room from the bottom
    backgroundColor: 'rgba(0,0,0,0.3)', // Optional dim for readability
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
    textAlign: 'center',
  },
  buttonGroup: {
    width: '100%',
    alignItems: 'center',
  },
  footerTextContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#aaa',
  },
  signupText: {
    color: '#ff5c8d',
    fontWeight: '600',
  },
});
