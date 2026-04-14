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

    // Column widths (must total 32)
    const COL_ITEM = 14;
    const COL_RATE = 6;
    const COL_QTY = 4;
    const COL_TOTAL = 8;

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

    const formatRow = (left: string, right: string) => {
      const spaces = MAX_CHARS - (left.length + right.length);
      return left + ' '.repeat(spaces > 0 ? spaces : 1) + right;
    };

    let receipt = '';

    // ================= HEADER =================
    const d = new Date(sale.createdAt);

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear()).slice(-2);

    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');

    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours === 0 ? 12 : hours;

    const formattedTime = `${String(hours).padStart(
      2,
      '0',
    )}:${minutes} ${ampm}`;
    const formattedDate = `${day}/${month}/${year}`;

    const dateTime = `${formattedDate} ${formattedTime}`;
    receipt += '<C>MINIZEO RETAIL</C>\n';
    receipt += `<C>#${sale.billNumber} ${dateTime} </C>\n`;

    receipt += divider + '\n';

    // ================= TABLE HEADER =================
    receipt +=
      pad('ITEM', COL_ITEM) +
      pad('RATE', COL_RATE, 'right') +
      pad('QTY', COL_QTY, 'right') +
      pad('TOTAL', COL_TOTAL, 'right') +
      '\n';

    receipt += divider + '\n';

    // ================= ITEMS =================
    let totalQty = 0;

    sale.items.forEach((item: any) => {
      const name = (item.product?.name || 'Item').toUpperCase();
      const qty = parseFloat(item.quantity);
      const rate = parseFloat(item.price);
      const discount = parseFloat(item.lineDiscount) || 0;

      const total = (rate * qty - discount).toFixed(2);

      totalQty += qty;

      // 1️⃣ ITEM NAME (full line)
      receipt += `${name}\n`;

      // 2️⃣ VALUES aligned under headers
      receipt +=
        pad('', COL_ITEM) + // empty item column
        pad(rate.toFixed(2), COL_RATE, 'right') +
        pad(qty.toString(), COL_QTY, 'right') +
        pad(total, COL_TOTAL, 'right') +
        '\n';

      // 3️⃣ Optional modifiers
      let mods = [];
      if (discount > 0) mods.push(`D:${discount.toFixed(2)}`);
      if (item.taxRate > 0) mods.push(`T@${item.taxRate}%`);

      if (mods.length > 0) {
        receipt += `  ${mods.join(' ')}\n`;
      }
    });

    receipt += divider + '\n';

    receipt +=
      formatRow('SUBTOTAL', parseFloat(sale.totalAmount).toFixed(2)) + '\n';

    if (parseFloat(sale.discount) > 0) {
      receipt +=
        formatRow('DISCOUNT', `-${parseFloat(sale.discount).toFixed(2)}`) +
        '\n';
    }

    if (parseFloat(sale.taxAmount) > 0) {
      receipt += formatRow('GST', parseFloat(sale.taxAmount).toFixed(2)) + '\n';
    }

    receipt += divider + '\n';

    receipt +=
      formatRow('GRAND TOTAL', parseFloat(sale.finalAmount).toFixed(2)) + '\n';

    receipt += divider + '\n';

    // ================= FOOTER =================
    receipt += `<C>Total items: ${totalQty.toString()}</C>\n`;

    receipt += `<C>Biller: ${
      sale.user?.name || ''
    } - Mode:${sale.paymentMode.toUpperCase()}</C>\n`;
    receipt += '<C>THANK YOU! VISIT AGAIN</C>';

    await BLEPrinter.printBill(receipt);

    console.log('✅ Printed Successfully');
  } catch (error) {
    console.log('❌ Print Error:', error);
    throw error;
  }
};
