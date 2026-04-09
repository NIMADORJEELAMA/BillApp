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

  const dataBytes = Buffer.from(product.barcode, 'utf-8');
  const storeLen = dataBytes.length + 3;
  const pL = storeLen % 256;
  const pH = Math.floor(storeLen / 256);

  const bytes = [
    0x1b,
    0x40, // Initialize
    0x1b,
    0x61,
    0x01, // Center Align
    0x1b,
    0x33,
    0x18, // Set tight line spacing (24 dots)

    // 1. Name
    ...Buffer.from(`${product.name.substring(0, 20)}\n`),

    // 2. QR Code Config
    0x1d,
    0x28,
    0x6b,
    0x03,
    0x00,
    0x31,
    0x43,
    0x05, // Size 5 (Slightly larger)
    0x1d,
    0x28,
    0x6b,
    pL,
    pH,
    0x31,
    0x50,
    0x30,
    ...dataBytes,
    0x1d,
    0x28,
    0x6b,
    0x03,
    0x00,
    0x31,
    0x51,
    0x30, // Print QR

    // 3. Price (Immediately follows QR)
    ...Buffer.from(`${product.price}/-\n`),

    0x1b,
    0x32, // Reset line spacing w
    0x0a,
    0x0a, // Final feed
  ];

  const base64Data = Buffer.from(bytes).toString('base64');
  await BTPrinter.printRaw(base64Data);
};
