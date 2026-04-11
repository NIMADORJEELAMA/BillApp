import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

interface Props {
  name: string;
  price: string | number;
  barcode: string;
}

export default function LabelTemplate({name, price, barcode}: Props) {
  return (
    <View style={styles.label}>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.price}>Rs. {price}</Text>
        <Text style={styles.barcodeText} numberOfLines={1}>
          {barcode}
        </Text>
      </View>

      <View style={styles.qrWrapper}>
        {/* Size 60 fits well within a 70-unit height */}
        <QRCode value={barcode || '00000000'} size={85} quietZone={10} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    width: 384, // ~50mm at 72 DPI
    height: 140, // ~25mm at 72 DPI
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  qrWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  name: {
    fontSize: 18, // Adjusted for physical 25mm height
    fontWeight: '700',
    color: '#000',
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000',
    marginVertical: 2,
  },
  barcodeText: {
    fontSize: 14,
    color: '#000',
  },
});
