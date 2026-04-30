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
import GradientButton from '../../components/Buttons/GradientButton';
import color from '../../assets/Color/color';

const GST_SLABS = [0, 5, 12, 18, 28];

// Fixed Interface: onSave now correctly expects the updated data object
interface CartItemProps {
  isVisible: boolean;
  onClose: () => void;
  item: any;
  onSave: (data: {
    price: number;
    lineDiscount: number;
    taxRate: number;
  }) => void;
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
      setPrice(item.price?.toString() || '0');
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
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose} // Required for Android back button
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          {/* Stops the click from bubbling up and closing the modal when clicking the sheet */}
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.sheet}>
              <View style={styles.handle} />

              <View style={styles.headerContainer}>
                <View style={styles.titleWrapper}>
                  <Text style={styles.labelCaps}>ITEM NAME</Text>
                  <Text style={styles.titleText} numberOfLines={1}>
                    {item?.name || 'Unknown Item'}
                  </Text>
                </View>

                <View style={styles.stockBadge}>
                  <Text style={styles.stockLabel}>STOCK</Text>
                  <Text style={styles.stockValue}>{item?.stock ?? 0}</Text>
                </View>
              </View>

              <View style={styles.form}>
                {/* <Text style={styles.label}>Selling Price (per unit)</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.currency}>₹</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="decimal-pad"
                    value={price}
                    onChangeText={setPrice}
                    placeholder="0.00"
                  />
                </View> */}

                <Text style={styles.label}>Item Discount (Total ₹)</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.currency}>-₹</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="decimal-pad"
                    value={discount}
                    placeholder="0.00"
                    onChangeText={setDiscount}
                  />
                </View>

                <Text style={styles.label}>Tax Slab (GST %)</Text>
                <View style={styles.gstContainer}>
                  {GST_SLABS.map(slab => (
                    <TouchableOpacity
                      key={slab}
                      activeOpacity={0.7}
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
              <View style={{marginTop: 30}}>
                <GradientButton
                  title="Update Item"
                  onPress={handleSave}
                  // loading={isSubmitting} // Show spinner when true
                  // containerStyle={styles.btnPrimary} // Keep your layout flex
                />
              </View>
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
  gstActive: {backgroundColor: color.themeBlue, borderColor: color.themeBlue},
  gstText: {fontWeight: '700', color: '#64748b'},
  gstTextActive: {color: '#fff'},
});
