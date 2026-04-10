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
        <Text style={styles.name} numberOfLines={2}>
          {name}
        </Text>
        <Text style={styles.price}>Rs. {price}</Text>
        <Text style={styles.barcode}>{barcode}</Text>
      </View>
      <View style={styles.qrWrapper}>
        <QRCode value={barcode || '00000000'} size={72} quietZone={3} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    width: 384,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  info: {flex: 1, paddingRight: 10},
  name: {fontSize: 13, fontWeight: '700', color: '#000', marginBottom: 4},
  price: {fontSize: 15, fontWeight: '800', color: '#000', marginBottom: 3},
  barcode: {fontSize: 10, color: '#333', letterSpacing: 1},
  qrWrapper: {padding: 4, backgroundColor: '#ffffff'},
});
