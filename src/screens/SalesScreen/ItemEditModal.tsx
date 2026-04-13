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

interface CartItemProps {
  isVisible: boolean;
  onClose: () => void;
  item: any;
  onSave: () => void;
}

export default function ItemEditModal({
  isVisible,
  onClose,
  item,
  onSave,
}: CartItemProps) {
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [gst, setGst] = useState(0);

  useEffect(() => {
    if (item && isVisible) {
      setPrice(item.price.toString());
      setDiscount((item.lineDiscount || 0).toString());
      setGst(item.taxRate || 0);
    }
  }, [item, isVisible]);
  console.log('item', item);

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

              <View style={styles.headerContainer}>
                <View style={styles.titleWrapper}>
                  <Text style={styles.labelCaps}>ITEM NAME</Text>
                  <Text style={styles.titleText}>{item?.name}</Text>
                </View>

                <View style={styles.stockBadge}>
                  <Text style={styles.stockLabel}>STOCK</Text>
                  <Text style={styles.stockValue}>{item?.stock}</Text>
                </View>
              </View>

              <View style={styles.form}>
                {/* Selling Price */}
                {/* <Text style={styles.label}>Selling Price (per unit)</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.currency}>₹</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={price}
                    onChangeText={setPrice}
                  />
                </View> */}

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
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9', // Very subtle divider
    marginBottom: 20,
  },
  titleWrapper: {
    flex: 1,
    marginRight: 12,
  },
  labelCaps: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8', // Muted blue-grey
    letterSpacing: 1,
    marginBottom: 4,
  },
  titleText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1e293b', // Deep slate
    letterSpacing: -0.5,
  },
  stockBadge: {
    backgroundColor: '#f8fafc', // Light slate
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minWidth: 65,
  },
  stockLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#000',
    marginBottom: 2,
  },
  stockValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#334155',
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
