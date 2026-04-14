import AsyncStorage from '@react-native-async-storage/async-storage';
import {BLEPrinter} from 'react-native-thermal-receipt-printer-image-qr';

export const connectAndPrint = async (sale: any) => {
  try {
    const mac = await AsyncStorage.getItem('SAVED_PRINTER_MAC');
    if (!mac) throw new Error('Printer not configured.');

    await BLEPrinter.init();
    await BLEPrinter.connectPrinter(mac);

    const MAX_CHARS = 32;
    const line = '-'.repeat(MAX_CHARS);
    const thickLine = '='.repeat(MAX_CHARS);

    let receipt = '';

    // ================= HEADER =================
    receipt += '<C><B>MINIZEO RETAIL</B></C>\n';
    receipt += `<C>Bill No: #${sale.billNumber}</C>\n`;
    receipt += `<C>${new Date(sale.createdAt).toLocaleString()}</C>\n`;
    receipt += `<C>Billed by: ${sale.user?.name || '-'}</C>\n`;
    receipt += line + '\n';

    // ================= ITEMS =================
    sale.items.forEach((item: any) => {
      const name = item.product?.name || 'Item';
      const price = parseFloat(item.price);
      const qty = item.quantity;
      const discount = parseFloat(item.lineDiscount) || 0;
      const tax = item.taxRate || 0;

      const baseTotal = price * qty;
      const lineTotal = baseTotal - discount;

      // Product Name (multi-line safe)
      receipt += `${name}\n`;

      // Price x Qty
      receipt += ` ${price.toFixed(2)} x ${qty}\n`;

      // GST
      if (tax > 0) {
        receipt += ` GST: ${tax}%\n`;
      }

      // Item Discount
      if (discount > 0) {
        receipt += ` Disc: -${discount.toFixed(2)}\n`;
      }

      // Line Total (right aligned)
      const totalStr = lineTotal.toFixed(2);
      const spaces = MAX_CHARS - totalStr.length;
      receipt += ' '.repeat(spaces > 0 ? spaces : 1) + totalStr + '\n';

      receipt += line + '\n';
    });

    // ================= TOTALS =================
    const formatLine = (label: string, value: string) => {
      const spaces = MAX_CHARS - (label.length + value.length);
      return label + ' '.repeat(spaces > 0 ? spaces : 1) + value;
    };

    receipt +=
      formatLine('Subtotal', `${parseFloat(sale.totalAmount).toFixed(2)}`) +
      '\n';

    if (parseFloat(sale.discount) > 0) {
      receipt +=
        formatLine('Order Disc', `-${parseFloat(sale.discount).toFixed(2)}`) +
        '\n';
    }

    receipt +=
      formatLine('GST', `${parseFloat(sale.taxAmount).toFixed(2)}`) + '\n';

    receipt += thickLine + '\n';

    receipt +=
      formatLine('GRAND TOTAL', `${parseFloat(sale.finalAmount).toFixed(2)}`) +
      '\n';

    receipt += thickLine + '\n';

    // ================= FOOTER =================
    receipt += `<C>Paid via: ${sale.paymentMode}</C>\n`;
    receipt += '<C>Thank You! Visit Again</C>\n\n\n';

    await BLEPrinter.printBill(receipt);

    console.log('✅ Printed Successfully');
  } catch (error) {
    console.log('❌ Print Error:', error);
    throw error;
  }
};
