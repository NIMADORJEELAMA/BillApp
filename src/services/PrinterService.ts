import AsyncStorage from '@react-native-async-storage/async-storage';
import {BLEPrinter} from 'react-native-thermal-receipt-printer-image-qr';

export const connectAndPrint = async (
  cart: any[],
  subtotal: number,
  discount: number,
  finalAmount: number,
) => {
  try {
    const mac = await AsyncStorage.getItem('SAVED_PRINTER_MAC');
    if (!mac) throw new Error('Printer not configured.');

    await BLEPrinter.init();
    await BLEPrinter.connectPrinter(mac);

    // 58mm printers usually support 32 characters per line
    const MAX_CHARS = 32;
    const line = '-'.repeat(MAX_CHARS);
    const thickLine = '='.repeat(MAX_CHARS);

    let receipt = '';

    // --- HEADER ---
    receipt += '<C>RETAIL STORE</C>\n';
    receipt += '<C>123 Business Avenue, City</C>\n';
    receipt += `<C>Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString(
      [],
      {hour: '2-digit', minute: '2-digit'},
    )}</C>\n`;
    receipt += thickLine + '\n';

    // --- COLUMN HEADERS (32 Chars Total) ---
    // Item (12) | Rate (7) | Qty (4) | Total (9)
    const hName = 'ITEM'.padEnd(12);
    const hRate = 'RATE'.padStart(7);
    const hQty = 'QTY'.padStart(4);
    const hTotal = 'TOTAL'.padStart(9);
    receipt += `${hName}${hRate}${hQty}${hTotal}\n`;
    receipt += line + '\n';

    // --- ITEMS ---
    cart.forEach(item => {
      // Line 1: Full Name if it's long
      if (item.name.length > 12) {
        receipt += `${item.name.substring(0, MAX_CHARS)}\n`;
      }

      // Line 2: The Grid (Price breakdown)
      const name = (item.name.length > 12 ? '' : item.name).padEnd(12);
      const rate = parseFloat(item.price).toFixed(2).padStart(7);
      const qty = String(item.quantity).padStart(4);
      const total = (item.price * item.quantity).toFixed(2).padStart(9);

      receipt += `${name}${rate}${qty}${total}\n`;
    });

    // --- TOTALS ---
    receipt += line + '\n';

    // Helper to align label and value to edges
    const formatTotalLine = (label: string, value: string) => {
      const spaces = MAX_CHARS - (label.length + value.length);
      return label + ' '.repeat(spaces > 0 ? spaces : 1) + value;
    };

    receipt += formatTotalLine('Subtotal:', `${subtotal.toFixed(2)}`) + '\n';
    receipt += formatTotalLine('Discount:', `-${discount.toFixed(2)}`) + '\n';
    receipt += thickLine + '\n';
    receipt += `${formatTotalLine(
      'GRAND TOTAL:',
      ` ${finalAmount.toFixed(2)}`,
    )}\n`;
    receipt += thickLine + '\n';

    // --- FOOTER ---
    receipt += '<C>Items Sold: ' + cart.length + '</C>\n';
    receipt += '<C>Thank You! Visit Again</C>\n';
    receipt += ''; // Extra feed for manual tearing

    await BLEPrinter.printBill(receipt);
    console.log('✅ Printed Successfully');
  } catch (error) {
    console.log('❌ Print Error:', error);
    throw error;
  }
};
