import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {BLEPrinter} from 'react-native-thermal-receipt-printer-image-qr';

const PrinterStatusHeader = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [printerName, setPrinterName] = useState('No Printer');

  const verifyAndReconnect = async () => {
    try {
      await BLEPrinter.init();
      const savedMac = await AsyncStorage.getItem('SAVED_PRINTER_MAC');
      const savedName = await AsyncStorage.getItem('SAVED_PRINTER_NAME');

      if (!savedMac) {
        setIsConnected(false);
        return;
      }

      await BLEPrinter.connectPrinter(savedMac);
      setIsConnected(true);
      setPrinterName(savedName || 'Printer');
    } catch (e) {
      console.log('Adapter not ready yet:', e);
      setIsConnected(false);
    }
  };

  useEffect(() => {
    verifyAndReconnect();
    const interval = setInterval(verifyAndReconnect, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.statusBadge}>
      <View
        style={[
          styles.dot,
          {backgroundColor: isConnected ? '#22c55e' : '#ef4444'},
        ]}
      />
      <Text numberOfLines={1} style={styles.statusText}>
        {isConnected ? printerName : 'Offline'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9', // Light slate background
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    maxWidth: 150, // Prevents long names from pushing out header icons
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
    // Add a slight glow effect
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 2,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default PrinterStatusHeader;
