import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
} from 'react-native';
import color from '../../assets/Color/color';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../routes/Navigation';
export default function IntroScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [firstName, setFirstName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | null>('Male');

  return (
    <View style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progress} />

      {/* Title */}
      <Text style={styles.title}>Let’s start with a{'\n'}quick intro</Text>

      {/* First Name */}
      <TextInput
        style={styles.input}
        placeholder="First Name"
        placeholderTextColor="#888"
        value={firstName}
        onChangeText={setFirstName}
      />

      {/* Gender Buttons */}
      <View style={styles.genderContainer}>
        {['Male', 'Female'].map(g => (
          <TouchableOpacity
            key={g}
            style={[styles.genderBtn, gender === g && styles.genderBtnSelected]}
            onPress={() => setGender(g as 'Male' | 'Female')}>
            <Text
              style={[
                styles.genderText,
                gender === g && styles.genderTextSelected,
              ]}>
              {g}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Info Note */}
      <View style={styles.infoBox}>
        {/* <Ionicons name="information-circle-outline" size={16} color="#555" /> */}
        <Text style={styles.infoText}>
          You can choose to hide your first name after verifying yourself.
        </Text>
      </View>

      {/* Next Button */}

      <TouchableOpacity
        style={[
          styles.nextBtn,
          {backgroundColor: firstName.trim() ? color.black : '#ccc'},
        ]}
        onPress={() => {
          if (firstName.trim()) {
            navigation.navigate('DateBirth'); // replace with your actual screen name
          }
        }}>
        <Image
          source={require('../../assets/Icons/right-arrow_white.png')}
          style={[
            styles.nextIcon,
            {tintColor: firstName.trim() ? color.white : '#888'},
          ]}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: color.white,
  },
  progress: {
    height: 4,
    width: 40,
    backgroundColor: color.black,
    borderRadius: 2,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 32,
    color: '#000',
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 10,
    marginBottom: 30,
    fontSize: 16,
    color: color.black,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 30,
  },
  genderBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  genderBtnSelected: {
    backgroundColor: color.black,
    borderColor: color.black,
  },
  genderText: {
    color: color.black,
    fontWeight: '500',
  },
  genderTextSelected: {
    color: color.white,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#f6f6f6',
    padding: 12,
    borderRadius: 10,
  },
  infoText: {
    fontSize: 12,
    color: '#333',
    flex: 1,
  },
  nextBtn: {
    backgroundColor: color.black,
    width: 50,
    height: 50,
    borderRadius: 25,
    position: 'absolute',
    bottom: 30,
    right: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextIcon: {
    width: 20,
    height: 20,

    marginLeft: 5,
  },
});
