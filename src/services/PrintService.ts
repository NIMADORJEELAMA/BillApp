// // services/PrinterService.ts
// import * as Printer from 'react-native-thermal-receipt-printer-image-qr';
// import {Buffer} from 'buffer';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const BTPrinter = Printer.BLEPrinter;

// export const printSingleLabel = async (product: {
//   name: string;
//   price: any;
//   barcode: string;
// }) => {
//   const savedMac = await AsyncStorage.getItem('SAVED_PRINTER_MAC');
//   if (!savedMac) throw new Error('Connect printer first');

//   await BTPrinter.connectPrinter(savedMac);

//   // 1. Setup Barcode Bytes (CODE 128)
//   const barcodeData = Buffer.from(product.barcode, 'utf-8');

//   const barcodeBytes = [
//     0x1d,
//     0x68,
//     0x50, // Height: 80 dots (0x50)
//     0x1d,
//     0x77,
//     0x02, // Width: 2 (thinner to ensure it fits on the right)
//     0x1d,
//     0x48,
//     0x02, // Text position: 02 (print human-readable text below barcode)
//     0x1d,
//     0x6b,
//     0x49, // Barcode System: CODE 128 (Format m=73/0x49)
//     barcodeData.length, // Length of data
//     ...barcodeData, // Barcode string
//   ];

//   // 2. Build the Command Sequence
//   const commands = [
//     0x1b,
//     0x40, // Initialize
//     0x1b,
//     0x61,
//     0x00, // Align Left

//     // Text on the left
//     ...Buffer.from(`${product.name}\n`),
//     ...Buffer.from(`Price: Rs.${product.price}\n`),

//     // Position "cursor" for Barcode
//     // Moving it to the right (about 160 dots in)
//     0x1b,
//     0x24,
//     0xa0,
//     0x00,

//     ...barcodeBytes,

//     0x0a,
//     0x0a,
//     0x0a, // Feed paper
//   ];

//   const base64Data = Buffer.from(commands).toString('base64');
//   await BTPrinter.printRaw(base64Data);
// };

import {captureRef} from 'react-native-view-shot';
import {BLEPrinter} from 'react-native-thermal-receipt-printer-image-qr';

export const printSingleLabel = async (viewRef: React.RefObject<any>) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 100));
    // Capture the hidden LabelTemplate as base64 PNG
    const base64 = await captureRef(viewRef, {
      format: 'png',
      quality: 1.0,
      result: 'base64',
      snapshotContentContainer: false,
    });

    // printImageBase64 is the correct method name

    // imageWidth: 384 for 58mm | 576 for 80mm printer

    await BLEPrinter.printImageBase64(base64, {
      imageWidth: 384,
      imageHeight: 0, // 0 = auto height
    });

    // Feed and cut
    // await BLEPrinter.printText('\n');
    // await BLEPrinter.printBill('\x1D\x56\x42\x00');
  } catch (error: any) {
    throw new Error(`Print failed: ${error.message}`);
  }
};
