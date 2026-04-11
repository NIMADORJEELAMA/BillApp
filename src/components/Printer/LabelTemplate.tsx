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
        <Text style={styles.name} numberOfLines={1} adjustsFontSizeToFit>
          {name}
        </Text>
        <Text style={styles.price}>Rs. {price}</Text>
        <Text style={styles.barcode} numberOfLines={1}>
          {barcode}
        </Text>
      </View>

      <View style={styles.qrWrapper}>
        <QRCode value={barcode || '00000000'} size={160} quietZone={90} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    width: 384,
    height: 190, // hard fixed height — every label = same PNG size
    paddingHorizontal: 12,
    paddingVertical: 100,
    // paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    overflow: 'hidden', // clips anything that would expand beyond 120px
  },
  info: {flex: 1, paddingRight: 16},
  qrWrapper: {
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  name: {fontSize: 13, fontWeight: '700', color: '#000', marginBottom: 2},
  price: {fontSize: 15, fontWeight: '800', color: '#000', marginBottom: 3},
  barcode: {fontSize: 10, color: '#333', letterSpacing: 1},
});
