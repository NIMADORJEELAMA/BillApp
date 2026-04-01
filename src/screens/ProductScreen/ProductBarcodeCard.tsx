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

const ProductBarcodeCard = ({isVisible, onClose, product}: Props) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const BTPrinter = Printer.BLEPrinter;

  // Add this import at the top

  const printBarcodeRaw = async (data: string) => {
    const subsetB = [0x7b, 0x42];
    const dataBytes = data.split('').map(c => c.charCodeAt(0));

    const payload = [...subsetB, ...dataBytes];

    const bytes = [
      0x1b,
      0x40, // Initialize
      0x1b,
      0x61,
      0x01, // Center
      0x1d,
      0x48,
      0x02, // HRI below
      0x1d,
      0x77,
      0x02, // Width
      0x1d,
      0x68,
      0x50, // Height
      0x1d,
      0x6b,
      0x49, // CODE128
      payload.length,
      ...payload,
      0x0a,
      0x0a,
    ];

    // ⚠️ THE FIX: Convert the byte array to a Base64 String
    const base64Data = Buffer.from(bytes).toString('base64');

    // Send the string, not the array
    await BTPrinter.printRaw(base64Data);
  };
  const printBarcode = useCallback(async () => {
    if (!product || isPrinting) return;

    setIsPrinting(true);

    try {
      const savedMac = await AsyncStorage.getItem('SAVED_PRINTER_MAC');
      if (!savedMac) {
        Alert.alert(
          'No Printer',
          'Please connect a printer in settings first.',
        );
        setIsPrinting(false);
        return;
      }

      // Connect only
      await BTPrinter.connectPrinter(savedMac);

      // Short delay to allow BLE handshake to finish
      await new Promise(res => setTimeout(res, 500));

      // 1. Print Text Header
      // Using \n for spacing instead of large empty strings
      await BTPrinter.printText(
        `\n<C><B>${product.name}</B></C>\n<C>Price: Rs.${product.price}</C>\n\n`,
      );

      // 2. Small delay before sending Raw Barcode bytes
      await new Promise(res => setTimeout(res, 200));

      // 3. Print Barcode
      await printBarcodeRaw(product.barcode || '12345678');

      // Success
    } catch (err: any) {
      console.error('[Print Error]', err);
      Alert.alert('Print Failed', 'Ensure printer is ON and within range.');
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
            onPress={printBarcode}
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

export default React.memo(ProductBarcodeCard);

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
