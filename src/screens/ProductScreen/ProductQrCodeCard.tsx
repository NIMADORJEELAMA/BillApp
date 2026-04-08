import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useCallback} from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as Printer from 'react-native-thermal-receipt-printer-image-qr';
import {Buffer} from 'buffer';
interface Props {
  isVisible: boolean;
  onClose: () => void;
  product: {
    name: string;
    price: number | string;
    barcode?: string;
  } | null;
}

const ProductQrCodeCard = ({isVisible, onClose, product}: Props) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const BTPrinter = Printer.BLEPrinter;

  const printQRCodeRaw = async (data: string) => {
    const dataBytes = Buffer.from(data, 'utf-8');

    // The 'store' command requires a length calculation: (data length + 3)
    const storeLen = dataBytes.length + 3;
    const pL = storeLen % 256;
    const pH = Math.floor(storeLen / 256);

    const bytes = [
      0x1b,
      0x40, // 1. Initialize printer
      0x1b,
      0x61,
      0x01, // 2. Center alignment

      // 3. Set QR Model (Model 2)
      0x1d,
      0x28,
      0x6b,
      0x04,
      0x00,
      0x31,
      0x41,
      0x32,
      0x00,

      // 4. Set QR Size (0x06 is medium size, adjust from 0x03 to 0x0a)
      0x1d,
      0x28,
      0x6b,
      0x03,
      0x00,
      0x31,
      0x43,
      0x06,

      // 5. Set Error Correction Level (0x30 = Level L, 7%)
      0x1d,
      0x28,
      0x6b,
      0x03,
      0x00,
      0x31,
      0x45,
      0x30,

      // 6. Store data in symbol storage area
      0x1d,
      0x28,
      0x6b,
      pL,
      pH,
      0x31,
      0x50,
      0x30,
      ...dataBytes,

      // 7. Print the symbol data
      0x1d,
      0x28,
      0x6b,
      0x03,
      0x00,
      0x31,
      0x51,
      0x30,

      0x0a,
      0x0a,
      0x0a, // Feed paper
    ];

    const base64Data = Buffer.from(bytes).toString('base64');
    await BTPrinter.printRaw(base64Data);
  };
  const printLabel = useCallback(async () => {
    if (!product || isPrinting) return;

    setIsPrinting(true);
    try {
      const savedMac = await AsyncStorage.getItem('SAVED_PRINTER_MAC');
      if (!savedMac) {
        Alert.alert('Error', 'Connect printer first');
        return;
      }

      await BTPrinter.connectPrinter(savedMac);
      await new Promise(res => setTimeout(res, 500));

      // // Print the Name and Price
      // await BTPrinter.printText(
      //   `<C><B>${product.name}</B></C>\n<C>₹${product.price}</C>\n\n`,
      // );

      // Short delay to ensure text finishes before raw bytes arrive
      await new Promise(res => setTimeout(res, 300));

      // Print the QR Code
      // You can pass a URL or just the product barcode string
      await printQRCodeRaw(product.barcode || '12345678');

      Alert.alert('Success', 'QR Code Printed!');
    } catch (err: any) {
      Alert.alert('Print Failed', err.message);
    } finally {
      setIsPrinting(false);
    }
  }, [product, isPrinting]);
  if (!product) return null;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>PRODUCT LABEL PREVIEW</Text>

          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.price}>₹{product.price}</Text>

          <View style={styles.barcodeBox}>
            <Text style={styles.barcodeText}>
              {product.barcode || '12345678'}
            </Text>
            <Text style={{fontSize: 10, color: '#94a3b8'}}>CODE 128</Text>
          </View>

          <TouchableOpacity
            style={[styles.printBtn, isPrinting && styles.disabledBtn]}
            onPress={printLabel}
            disabled={isPrinting}>
            {isPrinting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.printText}>PRINT TO THERMAL</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>CANCEL</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default React.memo(ProductQrCodeCard);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    elevation: 6,
  },
  title: {
    fontSize: 11,
    fontWeight: '900',
    color: '#94a3b8',
    letterSpacing: 2,
    marginBottom: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
    textAlign: 'center',
  },
  price: {
    fontSize: 18,
    color: '#16a34a',
    fontWeight: '700',
    marginVertical: 4,
  },
  barcodeBox: {
    padding: 14,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    marginVertical: 16,
  },
  barcodeText: {
    fontSize: 16,
    letterSpacing: 3,
    fontWeight: '600',
  },
  printBtn: {
    width: '100%',
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  disabledBtn: {
    backgroundColor: '#94a3b8',
  },
  printText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
  closeBtn: {
    paddingVertical: 10,
  },
  closeText: {
    color: '#64748b',
    fontWeight: '600',
  },
});
