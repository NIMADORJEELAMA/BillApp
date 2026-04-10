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
        {/* This View stretches the QR horizontally. 
            If it's still too tall, increase 1.4 to 1.5 or 1.6.
        */}
        <View style={{transform: [{scaleX: 1.5}]}}>
          <QRCode
            value={barcode || '00000000'}
            size={85} // Slightly smaller base size to allow for the width expansion
            quietZone={10}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    width: 384, // Standard for 58mm printers
    paddingHorizontal: 12,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    height: 190,
  },
  info: {flex: 1, paddingRight: 20}, // Increased padding to prevent overlap
  qrWrapper: {
    paddingRight: 10, // Extra room for the horizontal stretch
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },

  name: {fontSize: 13, fontWeight: '700', color: '#000', marginBottom: 4},
  price: {fontSize: 15, fontWeight: '800', color: '#000', marginBottom: 3},
  barcode: {fontSize: 10, color: '#333', letterSpacing: 1},
});
