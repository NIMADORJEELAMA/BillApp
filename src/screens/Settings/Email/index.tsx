import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import Header from '../../../components/Header';
import TickIcon from '../../../assets/Icons/tick-svgrepo-com.svg';
import Warning from '../../../assets/Icons/warning-filled-svgrepo-com.svg';
import GlassButton from '../../../components/GlassButton/GlassButton';

export default function Email() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('Kolkata'); // Sample prefilled value
  const [isVerified, setIsVerified] = useState(false);
  const handleSave = () => {
    Alert.alert('Phone number saved!', `Current number: ${email}`);
    // Add API integration here
  };

  return (
    <LinearGradient
      colors={['#ffffff', '#ffffff', '#c2bff6']}
      locations={[0, 0.9, 1]}
      start={{x: 0, y: 2}}
      end={{x: 1.5, y: 0.1}}
      style={styles.gradient}>
      <Header title="Settings" showBack />

      <View style={styles.content}>
        <Text style={styles.subtitle}>Location</Text>

        <View style={styles.inputWrapper}>
          <TextInput
            value={email}
            editable={true}
            placeholderTextColor="#999"
            style={styles.input}
          />
          {isVerified ? (
            <TickIcon width={20} height={20} />
          ) : (
            <Warning width={20} height={20} />
          )}
        </View>
        <GlassButton
          text="Update Location"
          onPress={handleSave}
          glassColor="dark"
          width={'100%'}
        />

        {/* <Pressable style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Save</Text>
        </Pressable> */}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  content: {
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666',
    width: '100%',
    textAlign: 'left',
    marginTop: 30,
    marginBottom: 4,
  },
  inputWrapper: {
    width: '100%',
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#bbb',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  button: {
    width: '100%',
    backgroundColor: '#6a5acd',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
