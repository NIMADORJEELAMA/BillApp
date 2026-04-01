import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  TextInput,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../routes/navigation';

const {width} = Dimensions.get('screen');

const Name: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [selectedGender, setSelectedGender] = useState<string>('');
  const [name, setName] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSelection = (gender: string) => {
    setSelectedGender(gender);
  };

  return (
    <LinearGradient
      colors={['#ffffff', '#ffffff', '#c2bff6']}
      locations={[0, 0.9, 1]}
      start={{x: 0, y: 2}}
      end={{x: 1.5, y: 0.1}}
      style={styles.gradient}>
      <View style={styles.content}>
        <Text style={styles.title}>What's your good name?</Text>
        <Text style={styles.subtitle}>
          It will be displayed in your profile. You can change your name later
          in profile.
        </Text>
        <TextInput
          style={[styles.input, isFocused && styles.inputFocused]}
          placeholder="Enter your name"
          value={name}
          onChangeText={text => setName(text)}
          placeholderTextColor="#888"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>
      <View style={styles.arrowContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate('GenderSelect')}
          disabled={name.trim().length === 0}
          style={[
            styles.arrowButton,
            name.trim().length === 0 && styles.arrowDisabled,
          ]}>
          <Image
            source={require('../../assets/Icons/right-arrow_white.png')} // Your arrow icon
            style={styles.arrowIcon}
          />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  content: {
    alignItems: 'center',
    // backgroundColor: 'red',
  },

  input: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.2)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    color: '#000',
    fontSize: 18,
    marginBottom: 30,
    fontWeight: 500,
  },
  inputFocused: {
    shadowColor: '#6a5acd', // Or any glow color like blue/purple
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.6,
    shadowRadius: 12,
    borderColor: '#111',
  },

  title: {
    fontSize: 30,
    fontWeight: '600',
    marginBottom: 10,
    color: '#000',
    textAlign: 'left',
    width: '100%',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 40,
    color: '#666',
    textAlign: 'left',
    width: '100%',
  },
  radioButton: {
    width: width * 0.9,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 16,

    marginBottom: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.37)',
    borderWidth: 1,
    borderColor: 'rgba(37, 36, 36, 0.3)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.2,
    shadowRadius: 10,
    //   backdropFilter: 'blur(10px)', // won't apply directly but useful if using web
  },
  selectedButton: {
    backgroundColor: 'rgb(0, 0, 0)',
    borderColor: 'rgba(0, 0, 0, 0.6)',
  },
  radioText: {
    fontSize: 20,
    color: '#000',
    textAlign: 'left',
    width: '100%',
  },
  selectedText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 10,
  },
  tick: {
    fontSize: 20,
    color: '#fff', // Or any color depending on background
  },
  tickIcon: {
    width: 20,
    height: 20,
    marginRight: 5,
  },

  arrowContainer: {
    position: 'absolute',
    bottom: 60,
    right: 40,
  },

  arrowButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },

  arrowDisabled: {
    backgroundColor: '#aaa',
    opacity: 0.5,
  },

  arrowIcon: {
    width: 20,
    height: 20,
    tintColor: '#fff',
  },
});

export default Name;
