import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import {BLEPrinter} from 'react-native-thermal-receipt-printer-image-qr';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MainLayout from '../MainLayout';
import Toast from 'react-native-toast-message';
import SearchIcon from '../../assets/Icons/search.svg'; // Adjust path
import PrinterIcon from '../../assets/Icons/printersvg.svg'; // Adjust path
import swiggyColors from '../../assets/Color/swiggyColor';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PrinterSettings = () => {
  const [printers, setPrinters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [connectedMac, setConnectedMac] = useState<string | null>(null);
  const [availableDevices, setAvailableDevices] = useState<any[]>([]);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
    }
  };

  const scanPrinters = async () => {
    setLoading(true);
    try {
      await requestPermissions();
      await BLEPrinter.init();

      const results = await BLEPrinter.getDeviceList();

      const valid = results.filter(
        (d: any) =>
          d?.inner_mac_address && d?.device_name && d.device_name !== '',
      );

      setPrinters(valid);
      setAvailableDevices(valid); // 🔥 important
    } catch (err) {
      Toast.show({type: 'error', text1: 'Discovery Failed'});
    } finally {
      setLoading(false);
    }
  };
  const isDeviceAvailable = (mac: string) => {
    return availableDevices.some(d => d.inner_mac_address === mac);
  };
  const connectToPrinter = async (printer: any) => {
    if (!printer?.inner_mac_address) {
      Toast.show({type: 'error', text1: 'Invalid printer'});
      return;
    }

    // 🔥 MOST IMPORTANT CHECK
    if (!isDeviceAvailable(printer.inner_mac_address)) {
      Toast.show({
        type: 'error',
        text1: 'Printer Not Found',
        text2: 'Turn ON printer and scan again',
      });
      return;
    }

    try {
      setLoading(true);

      await BLEPrinter.init();

      // 🔥 Wrap native call safely
      await new Promise(async (resolve, reject) => {
        try {
          await BLEPrinter.connectPrinter(printer.inner_mac_address);
          resolve(true);
        } catch (e) {
          reject(e);
        }
      });

      // 🔥 DO NOT call printText immediately (causes crash)
      setConnectedMac(printer.inner_mac_address);

      await AsyncStorage.setItem(
        'SAVED_PRINTER_MAC',
        printer.inner_mac_address,
      );
      await AsyncStorage.setItem('SAVED_PRINTER_NAME', printer.device_name);

      Toast.show({
        type: 'success',
        text1: 'Connected',
      });
    } catch (err) {
      console.log('Connect error:', err);

      setConnectedMac(null);

      Toast.show({
        type: 'error',
        text1: 'Printer OFF',
        text2: 'Please turn on printer',
      });
    } finally {
      setLoading(false);
    }
  };
  const connectWithTimeout = (mac: string, timeout = 5000) => {
    return Promise.race([
      BLEPrinter.connectPrinter(mac),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Connection timeout')), timeout),
      ),
    ]);
  };
  // const connectToPrinter = async (printer: any) => {
  //   try {
  //     setLoading(true);
  //     await BLEPrinter.connectPrinter(printer.inner_mac_address);

  //     // Save to storage
  //     await AsyncStorage.setItem(
  //       'SAVED_PRINTER_MAC',
  //       printer.inner_mac_address,
  //     );
  //     await AsyncStorage.setItem('SAVED_PRINTER_NAME', printer.device_name);

  //     setConnectedMac(printer.inner_mac_address);
  //     Toast.show({
  //       type: 'success',
  //       text1: `Connected to ${printer.device_name}`,
  //     });
  //   } catch (err) {
  //     Toast.show({type: 'error', text1: 'Connection Failed'});
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  // const connectToPrinter = async (printer: any) => {
  //   try {
  //     setLoading(true);
  //     await BLEPrinter.connectPrinter(printer.inner_mac_address);
  //     setConnectedMac(printer.inner_mac_address);
  //     Toast.show({
  //       type: 'success',
  //       text1: `Connected to ${printer.device_name}`,
  //     });
  //   } catch (err) {
  //     Toast.show({type: 'error', text1: 'Connection Failed'});
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <MainLayout title="Printer Settings" subtitle="Configure Bluetooth KOT">
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.scanBtn}
          onPress={scanPrinters}
          disabled={loading}>
          <SearchIcon
            width={18}
            height={18}
            stroke="#ffffff"
            fill={'#ffffff'}
            style={styles.searchIcon}
          />
          <Text style={styles.btnText}>
            {loading ? 'Searching...' : 'Scan for Printers'}
          </Text>
        </TouchableOpacity>

        <FlatList
          data={printers}
          keyExtractor={(item: any) => item.inner_mac_address}
          renderItem={({item}: any) => (
            <TouchableOpacity
              style={[
                styles.deviceCard,
                connectedMac === item.inner_mac_address && styles.connected,
              ]}
              onPress={() => connectToPrinter(item)}>
              <View>
                <Text style={styles.deviceName}>
                  {item.device_name || 'Unknown Device'}
                </Text>
                <Text style={styles.macAddress}>{item.inner_mac_address}</Text>
              </View>
              {connectedMac === item.inner_mac_address && (
                <PrinterIcon
                  width={26}
                  height={26}
                  fill={swiggyColors.veg}
                  style={styles.searchIcon}
                />
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No printers found. Scan to begin.
            </Text>
          }
        />
      </View>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, padding: 20},
  scanBtn: {
    backgroundColor: '#1e293b',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  searchIcon: {
    marginRight: 10,
    color: 'red',
  },
  btnText: {color: '#fff', fontWeight: 'bold'},
  deviceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  connected: {borderColor: '#059669', borderWidth: 1},
  deviceName: {fontWeight: 'bold', fontSize: 16},
  macAddress: {color: '#64748b', fontSize: 12},
  emptyText: {textAlign: 'center', marginTop: 50, color: '#94a3b8'},
});

export default PrinterSettings;
