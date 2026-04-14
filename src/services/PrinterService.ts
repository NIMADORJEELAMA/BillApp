import AsyncStorage from '@react-native-async-storage/async-storage';
import {BLEPrinter} from 'react-native-thermal-receipt-printer-image-qr';

export const connectAndPrint = async (sale: any) => {
  try {
    const mac = await AsyncStorage.getItem('SAVED_PRINTER_MAC');
    if (!mac) throw new Error('Printer not configured.');

    await BLEPrinter.init();
    await BLEPrinter.connectPrinter(mac);

    const MAX_CHARS = 32;
    const divider = '-'.repeat(MAX_CHARS);

    // Helper: Precisely pad strings for table columns
    const pad = (
      str: string,
      len: number,
      align: 'left' | 'right' = 'left',
    ) => {
      const s = str.toString();
      if (s.length >= len) return s.substring(0, len);
      const spaces = ' '.repeat(len - s.length);
      return align === 'left' ? s + spaces : spaces + s;
    };

    // Helper: Standard Left-Right row
    const formatRow = (left: string, right: string) => {
      const spaces = MAX_CHARS - (left.length + right.length);
      return left + ' '.repeat(spaces > 0 ? spaces : 1) + right;
    };

    let receipt = '';

    // ================= HEADER =================
    receipt += '<C><B>MINIZEO RETAIL</B></C>\n';
    receipt += `<C>#${sale.billNumber} | ${new Date(
      sale.createdAt,
    ).toLocaleDateString()}</C>\n`;
    receipt += divider + '\n';

    // Header Row: Perfectly aligned columns
    // Rate (12) | Qty (8) | Total (12) = 32
    receipt += 'ITEM\n';
    receipt +=
      pad('RATE', 12, 'left') +
      pad('QTY', 8, 'right') +
      pad('TOTAL', 12, 'right') +
      '\n';
    receipt += divider + '\n';

    // ================= ITEMS =================
    let totalItemsQty = 0;

    sale.items.forEach((item: any) => {
      const name = (item.product?.name || 'Item').toUpperCase();
      const qty = item.quantity.toString();
      const rate = parseFloat(item.price).toFixed(2);
      const lineTotal = (
        parseFloat(item.price) * parseFloat(qty) -
        (parseFloat(item.lineDiscount) || 0)
      ).toFixed(2);

      totalItemsQty += parseFloat(qty);

      // 1. Name line (Full width)
      receipt += `${name}\n`;

      // 2. Aligned Data line
      receipt +=
        pad(rate, 12, 'left') +
        pad(qty, 8, 'right') +
        pad(lineTotal, 12, 'right') +
        '\n';

      // 3. Modifiers (D@, T@)
      let mods = [];
      if (parseFloat(item.lineDiscount) > 0)
        mods.push(`D@${parseFloat(item.lineDiscount).toFixed(2)}`);
      if (item.taxRate > 0) mods.push(`T@${item.taxRate}%`);

      if (mods.length > 0) {
        receipt += `  ${mods.join(' ')}\n`;
      }
    });

    receipt += divider + '\n';

    // ================= TOTALS =================
    receipt += formatRow('TOTAL QTY', totalItemsQty.toString()) + '\n';
    receipt +=
      formatRow('SUBTOTAL', parseFloat(sale.totalAmount).toFixed(2)) + '\n';

    if (parseFloat(sale.discount) > 0) {
      receipt +=
        formatRow('DISCOUNT', `-${parseFloat(sale.discount).toFixed(2)}`) +
        '\n';
    }

    if (parseFloat(sale.taxAmount) > 0) {
      receipt += formatRow('TAX', parseFloat(sale.taxAmount).toFixed(2)) + '\n';
    }

    receipt += divider + '\n';
    receipt += `${formatRow(
      'GRAND TOTAL',
      parseFloat(sale.finalAmount).toFixed(2),
    )}\n`;
    receipt += divider + '\n';

    // ================= FOOTER =================
    receipt += `<C>${sale.paymentMode.toUpperCase()} | ${
      sale.user?.name || 'STAFF'
    }</C>\n`;
    receipt += '\n<C>THANK YOU</C>\n';

    await BLEPrinter.printBill(receipt);
    console.log('✅ Printed Successfully');
  } catch (error) {
    console.log('❌ Print Error:', error);
    throw error;
  }
};
