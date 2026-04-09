// services/PrinterService.ts
import * as Printer from 'react-native-thermal-receipt-printer-image-qr';
import {Buffer} from 'buffer';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BTPrinter = Printer.BLEPrinter;

export const printSingleLabel = async (product: {
  name: string;
  price: any;
  barcode: string;
}) => {
  const savedMac = await AsyncStorage.getItem('SAVED_PRINTER_MAC');
  if (!savedMac) throw new Error('Connect printer first');

  await BTPrinter.connectPrinter(savedMac);

  // Command bytes for the QR Code (extracted from your component)
  const dataBytes = Buffer.from(product.barcode, 'utf-8');
  const storeLen = dataBytes.length + 3;
  const pL = storeLen % 256;
  const pH = Math.floor(storeLen / 256);

  const bytes = [
    0x1b,
    0x40, // Init
    0x1b,
    0x61,
    0x01, // Center
    // ... include all your Set QR Size/Model/Error bytes from your original file here
    0x1d,
    0x28,
    0x6b,
    pL,
    pH,
    0x31,
    0x50,
    0x30,
    ...dataBytes, // Store
    0x1d,
    0x28,
    0x6b,
    0x03,
    0x00,
    0x31,
    0x51,
    0x30, // Print
    0x0a,
    0x0a, // Feed
  ];

  const base64Data = Buffer.from(bytes).toString('base64');

  // Optional: Print Text Header
  await BTPrinter.printText(
    `<C>${product.name}</C>\n<C>Rs.${product.price}</C>\n`,
  );

  // Print QR
  await BTPrinter.printRaw(base64Data);
};
