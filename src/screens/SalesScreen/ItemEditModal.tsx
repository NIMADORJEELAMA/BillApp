import React, {useState, useEffect} from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';

const GST_SLABS = [0, 5, 12, 18, 28];

export default function ItemEditModal({isVisible, onClose, item, onSave}) {
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [gst, setGst] = useState(0);

  // Sync state when item changes
  useEffect(() => {
    if (item) {
      setPrice(item.price.toString());
      setDiscount((item.lineDiscount || 0).toString());
      setGst(item.taxRate || 0);
    }
  }, [item, isVisible]);

  const handleSave = () => {
    onSave({
      price: parseFloat(price) || 0,
      lineDiscount: parseFloat(discount) || 0,
      taxRate: gst,
    });
    onClose();
  };

  return (
    <Modal visible={isVisible} transparent animationType="slide">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.sheet}>
              {/* Handle Bar for Liquid Look */}
              <View style={styles.handle} />

              <Text style={styles.title}>Edit Line Item</Text>
              <Text style={styles.subtitle}>{item?.name}</Text>

              <View style={styles.form}>
                {/* Selling Price */}
                <Text style={styles.label}>Selling Price (per unit)</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.currency}>₹</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={price}
                    onChangeText={setPrice}
                  />
                </View>

                {/* Line Discount */}
                <Text style={styles.label}>Item Discount (Total ₹)</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.currency}>-₹</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={discount}
                    placeholder="0.00"
                    onChangeText={setDiscount}
                  />
                </View>

                {/* GST Slabs */}
                <Text style={styles.label}>Tax Slab (GST %)</Text>
                <View style={styles.gstContainer}>
                  {GST_SLABS.map(slab => (
                    <TouchableOpacity
                      key={slab}
                      style={[
                        styles.gstOption,
                        gst === slab && styles.gstActive,
                      ]}
                      onPress={() => setGst(slab)}>
                      <Text
                        style={[
                          styles.gstText,
                          gst === slab && styles.gstTextActive,
                        ]}>
                        {slab}%
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Update Item</Text>
              </TouchableOpacity>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: '#e2e8f0',
    alignSelf: 'center',
    borderRadius: 10,
    marginBottom: 20,
  },
  title: {fontSize: 20, fontWeight: '800', color: '#1e293b'},
  subtitle: {fontSize: 14, color: '#64748b', marginBottom: 20},
  form: {gap: 16},
  label: {fontSize: 13, fontWeight: '600', color: '#94a3b8', marginBottom: -8},
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  currency: {fontSize: 16, fontWeight: '700', color: '#64748b'},
  input: {
    flex: 1,
    height: 50,
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginLeft: 8,
  },
  gstContainer: {flexDirection: 'row', gap: 8, marginTop: 4},
  gstOption: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  gstActive: {backgroundColor: '#1e293b', borderColor: '#1e293b'},
  gstText: {fontWeight: '700', color: '#64748b'},
  gstTextActive: {color: '#fff'},
  saveBtn: {
    backgroundColor: '#1e293b',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  saveBtnText: {color: '#fff', fontWeight: '800', fontSize: 16},
});
