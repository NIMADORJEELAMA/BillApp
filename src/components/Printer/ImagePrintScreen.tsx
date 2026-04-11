import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Printer from 'react-native-thermal-receipt-printer-image-qr';
import {launchImageLibrary} from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';

import RNFS from 'react-native-fs';
import ViewShot from 'react-native-view-shot';
import {useRef} from 'react';
const BTPrinter = Printer.BLEPrinter;

export default function ImagePrintScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const viewShotRef = useRef(null);
  // 📌 Pick Image
  const pickImage = async () => {
    try {
      const res = await launchImageLibrary({
        mediaType: 'photo',
        quality: 1,
      });

      if (!res.assets || !res.assets[0].uri) return;

      const uri = res.assets[0].uri;
      setImageUri(uri);

      // Convert to Base64
      const base64 = await RNFS.readFile(uri, 'base64');
      setBase64Image(base64);
    } catch (err) {
      console.log(err);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const printImage = async () => {
    if (!imageUri) {
      Alert.alert('No Image', 'Please upload image first');
      return;
    }

    try {
      setLoading(true);

      const savedMac = await AsyncStorage.getItem('SAVED_PRINTER_MAC');
      if (!savedMac) {
        Alert.alert('No Printer');
        return;
      }

      await BTPrinter.connectPrinter(savedMac);
      await new Promise(res => setTimeout(res, 800));

      await BTPrinter.printText('HELLO TEST\n\n');

      // ✅ STEP 1: Resize image (CRITICAL)
      const resized = await ImageResizer.createResizedImage(
        imageUri,
        300, // 👈 smaller = better for thermal
        200,
        'PNG',
        80, // lower quality helps
      );

      // ✅ STEP 2: Convert to base64
      const base64 = await RNFS.readFile(resized.uri, 'base64');

      // ✅ STEP 3: Print
      await BTPrinter.printImage(base64, {
        width: 300,
      });

      await BTPrinter.printText('\n\n\n');
    } catch (e) {
      console.log('PRINT ERROR:', e);
      Alert.alert('Print Failed', JSON.stringify(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>IMAGE PRINTING</Text>

      <ViewShot
        ref={viewShotRef}
        options={{
          format: 'png',
          quality: 1,
          result: 'base64',
        }}>
        <View style={{backgroundColor: '#fff', padding: 10}}>
          {imageUri && (
            <Image
              source={{uri: imageUri}}
              style={{
                width: 300,
                height: 200,
                resizeMode: 'cover',
              }}
            />
          )}
        </View>
      </ViewShot>
      {/* Pick Button */}
      <TouchableOpacity style={styles.btn} onPress={pickImage}>
        <Text style={styles.btnText}>UPLOAD IMAGE</Text>
      </TouchableOpacity>

      {/* Print Button */}
      <TouchableOpacity
        style={[styles.btn, styles.printBtn]}
        onPress={printImage}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>PRINT IMAGE</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginBottom: 20,
    borderRadius: 10,
  },
  btn: {
    width: '80%',
    backgroundColor: '#2563eb',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 8,
  },
  printBtn: {
    backgroundColor: '#16a34a',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
