import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
} from 'react-native';
import images from '../../assets/images/images';
import GlassButton from '../../components/GlassButton/GlassButton';

const {width} = Dimensions.get('window');

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      {/* Profile Circle Area */}
      <View style={styles.ringWrapper}>
        <View style={styles.outerCircle}>
          <View style={styles.middleCircle}>
            <View style={styles.innerCircle}>
              <Image source={images.likeeLogo} style={styles.profileImage} />
              <Image source={images.likeeLogo} style={styles.heartIcon} />
            </View>
          </View>
        </View>

        {/* Floating Avatars (positioned absolutely) */}
        <Image
          source={images.likeeLogo}
          style={[styles.avatar, styles.avatar1]}
        />

        <Image
          source={images.likeeLogo}
          style={[styles.avatar, styles.avatar1]}
        />
        <Image
          source={images.likeeLogo}
          style={[styles.avatar, styles.avatar1]}
        />
        <Image
          source={images.likeeLogo}
          style={[styles.avatar, styles.avatar1]}
        />
      </View>

      {/* Tagline */}
      <Text style={styles.text}>
        <Text style={styles.love}>Love</Text> never checks the clock. Start your{' '}
        <Text style={styles.journey}>journey</Text> today.
      </Text>

      {/* Login Buttons */}
      <GlassButton
        text="Log in with Google"
        icon={require('../../assets/Images_main/google.png')}
        onPress={() => console.log('Google Login')}
      />
      <TouchableOpacity style={styles.appleButton}>
        <Text style={{color: 'white'}}>Log in with Apple</Text>
      </TouchableOpacity>

      {/* Signup Text */}
      <Text style={styles.signup}>
        Don’t have an account? <Text style={styles.signupLink}>Signup</Text>
      </Text>
    </View>
  );
}

const CIRCLE_SIZE = width * 0.6;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    marginTop: 120,
    marginBottom: 50,
    resizeMode: 'contain',
  },
  ringWrapper: {
    width: CIRCLE_SIZE + 60,
    height: CIRCLE_SIZE + 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerCircle: {
    width: CIRCLE_SIZE + 40,
    height: CIRCLE_SIZE + 40,
    borderRadius: (CIRCLE_SIZE + 40) / 2,
    backgroundColor: '#EADCF2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  middleCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: '#D1B8EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    width: CIRCLE_SIZE - 40,
    height: CIRCLE_SIZE - 40,
    borderRadius: (CIRCLE_SIZE - 40) / 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  heartIcon: {
    width: 30,
    height: 30,
    position: 'absolute',
    bottom: -15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatar1: {top: 0, left: 10},
  avatar2: {top: 20, right: 0},
  avatar3: {bottom: 20, right: 10},
  avatar4: {bottom: 0, left: 20},
  text: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 18,
    paddingHorizontal: 30,
    color: '#333',
  },
  love: {color: '#C0589B', fontWeight: '600'},
  journey: {color: '#C0589B', fontWeight: '600'},
  googleButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  appleButton: {
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    backgroundColor: '#000',
  },
  signup: {
    marginTop: 20,
    fontSize: 14,
    color: '#555',
  },
  signupLink: {
    color: '#C0589B',
    fontWeight: '600',
  },
});
