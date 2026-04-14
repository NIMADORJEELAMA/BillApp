import React, {useState, useEffect, useRef, useMemo, useCallback} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import {
  Camera,
  useCameraDevices,
  useCodeScanner,
} from 'react-native-vision-camera';
import {connectAndPrint} from '../../services/PrinterService';
import {useDispatch, useSelector} from 'react-redux';
import {
  addToCart,
  updateQty,
  clearCart,
  updateItemDetails,
} from '../../redux/slices/cartSlice';
import MainLayout from '../../../src/screens/MainLayout';
import axiosInstance from '../../services/axiosInstance';
import Toast from 'react-native-toast-message';
import Sound from 'react-native-sound';
import ProductPickerModal from '../ProductScreen/ProductPickerModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScanIcon from '../../assets/Icons/scan.svg';

import ProductScreen from '../ProductScreen/ProductFormModal';
import ItemEditModal from './ItemEditModal';
import GlassButton from '../../components/GlassButton/GlassButton';
import CustomButton from '../../components/CustomButton';
import CustomDropdown from '../../components/CustomDropdown';
export default function SalesScreen() {
  const dispatch = useDispatch();
  const beepSound = useRef<Sound | null>(null);

  // Selectors
  const cart = useSelector((state: any) => state.cart.items || []);
  const discount = useSelector((state: any) => state.cart.discount || 0);

  // States
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [qtyModalVisible, setQtyModalVisible] = useState(false);
  const [tempQty, setTempQty] = useState('');
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [splitCash, setSplitCash] = useState('');
  const [splitOnline, setSplitOnline] = useState('');
  // Refs for Scanner Debounce
  const lastScannedCode = useRef<string | null>(null);
  const lastScanTime = useRef<number>(0);

  // Add these to your state declarations
  const [discountPercent, setDiscountPercent] = useState('0');
  const [manualDiscount, setManualDiscount] = useState('0');
  const [gstPercentInput, setGstPercentInput] = useState('0');

  const resetForm = () => {
    setDiscountPercent('0');
    setManualDiscount('0');
    setGstPercentInput('0');
    setPaymentMode('CASH');
  };
  const paymentOptions = [
    {label: 'Cash', value: 'CASH'},
    {label: 'Online', value: 'UPI'},
    {label: 'Card', value: 'CARD'},
    {label: 'Split', value: 'SPLIT'},

    {label: 'Credit', value: 'CREDIT'},
  ];
  const handleCashChange = (val: string) => {
    setSplitCash(val);
    const cashAmount = parseFloat(val) || 0;
    const remaining = Math.max(0, finalAmount - cashAmount);
    setSplitOnline(remaining.toFixed(2));
  };
  // Update Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((total, item) => {
      const itemTotal = item.price * item.quantity;
      const discount = item.lineDiscount || 0;
      return total + (itemTotal - discount);
    }, 0);
  }, [cart]);
  const itemLevelGst = useMemo(() => {
    return cart.reduce((totalGst, item) => {
      const taxable = item.price * item.quantity - (item.lineDiscount || 0);
      const rate = item.taxRate || 0;
      return totalGst + (taxable * rate) / 100;
    }, 0);
  }, [cart]);

  // Sync Discount Amount when Percent changes
  const handleDiscountPercentChange = val => {
    setDiscountPercent(val);
    const num = parseFloat(val) || 0;
    const amount = (subtotal * num) / 100;
    setManualDiscount(amount.toFixed(2));
  };

  // Sync Discount Percent when Amount changes
  const handleManualDiscountChange = val => {
    setManualDiscount(val);
    const num = parseFloat(val) || 0;
    if (subtotal > 0) {
      const percent = (num / subtotal) * 100;
      setDiscountPercent(percent.toFixed(1));
    }
  };

  const finalDiscount = useMemo(
    () => parseFloat(manualDiscount) || 0,
    [manualDiscount],
  );
  const taxableAmount = useMemo(
    () => Math.max(0, subtotal - finalDiscount),
    [subtotal, finalDiscount],
  );
  const finalGstAmount = useMemo(() => {
    const globalGstPercent = parseFloat(gstPercentInput) || 0;
    const globalGst = (taxableAmount * globalGstPercent) / 100;
    return globalGst + itemLevelGst;
  }, [taxableAmount, gstPercentInput, itemLevelGst]);

  const finalAmount = taxableAmount + finalGstAmount;

  // --- Helpers ---
  const playSuccessSound = useCallback(() => {
    beepSound.current?.stop(() => beepSound.current?.play());
  }, []);
  const handleUpdateItem = updates => {
    dispatch(
      updateItemDetails({
        id: editingItem.productId,
        updates: updates,
      }),
    );
  };
  const handleLookup = async (barcode: string) => {
    try {
      setLoading(true);
      const {data} = await axiosInstance.get(`/products/barcode/${barcode}`);

      if (data) {
        playSuccessSound();
        dispatch(addToCart(data));
        Toast.show({
          type: 'success',
          text1: `Added ${data.name}`,
          position: 'bottom',
        });
      }
    } catch (error: any) {
      // If product is not found (usually 404)
      if (error.response?.status === 404) {
        setScannedBarcode(barcode); // Save barcode to pass to the form
        Alert.alert(
          'Product Not Found',
          `No product found for ${barcode}. Would you like to add it?`,
          [
            {text: 'Cancel', style: 'cancel'},
            {
              text: 'Add New Product',
              onPress: () => setIsAddModalVisible(true),
            },
          ],
        );
      } else {
        Toast.show({
          type: 'error',
          text1: 'Lookup Error',
          text2: 'Could not connect to server',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const codeScanner = useCodeScanner({
    codeTypes: ['ean-13', 'code-128', 'qr', 'code-39'],
    onCodeScanned: codes => {
      const value = codes[0]?.value;
      const now = Date.now();
      if (
        value &&
        (value !== lastScannedCode.current || now - lastScanTime.current > 2000)
      ) {
        lastScannedCode.current = value;
        lastScanTime.current = now;
        handleLookup(value);
      }
    },
  });

  // --- Actions ---
  const handleCheckout = async (shouldPrint: boolean) => {
    if (!cart.length || loading) return;

    setLoading(true);
    let cash = 0;
    let online = 0;
    let card = 0;

    if (paymentMode === 'CASH') {
      cash = finalAmount;
    } else if (paymentMode === 'UPI') {
      online = finalAmount;
    } else if (paymentMode === 'CARD') {
      card = finalAmount;
    } else if (paymentMode === 'SPLIT') {
      cash = parseFloat(splitCash) || 0;
      online = parseFloat(splitOnline) || 0;
      // card = parseFloat(splitCard) || 0; (if you add a third field)
    }
    try {
      const payload = {
        paymentMode: paymentMode,
        amountCash: cash,
        amountOnline: online,
        amountCard: card,
        totalAmount: subtotal,
        // FIX: Use finalDiscount (local state) instead of the Redux 'discount' variable
        discount: finalDiscount,
        taxAmount: finalGstAmount,
        gstPercentage: parseFloat(gstPercentInput) || 0,
        finalAmount: finalAmount,
        items: cart.map((i: any) => ({
          productId: i.productId,
          quantity: i.quantity,
          price: i.price,
          lineDiscount: i.lineDiscount || 0, // Individual item discount
          taxRate: i.taxRate || 0,
        })),
      };
      console.log('payload', payload);
      const response = await axiosInstance.post('/sales', payload);

      if (response.status === 201 || response.status === 200) {
        if (shouldPrint) {
          const mac = await AsyncStorage.getItem('SAVED_PRINTER_MAC');
          if (!mac) {
            Toast.show({
              type: 'info',
              text1: 'Sale Saved',
              text2: 'No printer paired to print receipt.',
            });
          } else {
            const result = await connectAndPrint(
              cart,
              subtotal,
              discount,
              finalAmount,
            );
            if (!result.success) {
              Toast.show({
                type: 'error',
                text1: 'Print Failed',
                text2: result?.error,
              });
            }
          }
        }
        dispatch(clearCart());

        resetForm();

        Toast.show({type: 'success', text1: 'Transaction Complete'});
      }
    } catch (e: any) {
      Toast.show({
        type: 'error',
        text1: 'Checkout Failed',
        text2: e.response?.data?.message || 'Server connection error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Camera.requestCameraPermission().then(status =>
      setHasPermission(status === 'granted'),
    );

    beepSound.current = new Sound('beep.mp3', Sound.MAIN_BUNDLE, error => {
      if (error) console.log('Sound load error', error);
    });

    // Explicitly return void by using curly braces
    return () => {
      if (beepSound.current) {
        beepSound.current.release();
        beepSound.current = null;
      }
    };
  }, []);
  const devices = useCameraDevices();
  const device = devices.find(d => d.position === 'back');

  return (
    <MainLayout title="POS Terminal" showBack>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}>
        <View style={styles.container}>
          {/* 🔹 TOP SECTION */}
          <View>
            <View style={styles.topActionBar}>
              <TouchableOpacity
                style={styles.browseButton}
                onPress={() => setPickerVisible(true)}>
                <Text style={styles.browseButtonText}>+ Browse Products</Text>
              </TouchableOpacity>
              <View style={{width: 110, justifyContent: 'center'}}>
                <CustomDropdown
                  options={paymentOptions}
                  selectedValue={paymentMode}
                  onSelect={val => setPaymentMode(val)}
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.cameraToggleButton,
                  isCameraVisible && styles.cameraActiveBtn,
                ]}
                onPress={() => setIsCameraVisible(!isCameraVisible)}>
                {isCameraVisible ? (
                  <Text style={styles.cameraActiveIcon}>✕</Text>
                ) : (
                  <ScanIcon width={28} height={28} />
                )}
              </TouchableOpacity>
            </View>

            {isCameraVisible && (
              <View style={styles.cameraContainer}>
                {device && hasPermission ? (
                  <>
                    <Camera
                      style={StyleSheet.absoluteFill}
                      device={device}
                      isActive={isCameraVisible}
                      codeScanner={codeScanner}
                    />
                    <View style={styles.scanLine} />
                  </>
                ) : (
                  <ActivityIndicator color="#6366f1" style={{flex: 1}} />
                )}
              </View>
            )}
          </View>

          {/* 🔹 CART LIST (ONLY SCROLLABLE AREA) */}
          <FlatList
            data={cart}
            keyExtractor={item => item.productId}
            style={{flex: 1}}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingBottom: 20,
            }}
            keyboardShouldPersistTaps="handled"
            renderItem={({item}) => (
              <View style={styles.cartItem}>
                {/* Left Section: Info & Edit Trigger */}
                <TouchableOpacity
                  style={{flex: 1}}
                  onPress={() => {
                    setEditingItem(item);
                    setIsEditModalVisible(true);
                  }}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.name}
                  </Text>

                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginTop: 2,
                    }}>
                    <Text style={styles.itemSubText}>₹{item.price}</Text>

                    {/* Show Item Discount if exists */}
                    {item.lineDiscount > 0 && (
                      <Text
                        style={[
                          styles.itemSubText,
                          {color: '#ef4444', marginLeft: 8},
                        ]}>
                        (-₹{item.lineDiscount})
                      </Text>
                    )}

                    {/* Show GST Tag if exists */}
                    {item.taxRate > 0 && (
                      <View style={styles.tagTextContainer}>
                        <Text style={styles.tagText}>{item.taxRate}% GST</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>

                {/* Center Section: Quantity Controls */}
                <View style={styles.qtyContainer}>
                  <TouchableOpacity
                    onPress={() =>
                      dispatch(updateQty({id: item.productId, delta: -1}))
                    }
                    style={styles.qtyBtn}>
                    <Text style={styles.qtyBtnText}>−</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onLongPress={() => {
                      setActiveProductId(item.productId);
                      setTempQty(item.quantity.toString());
                      setQtyModalVisible(true);
                    }}
                    style={styles.qtyNumberBox}>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() =>
                      dispatch(updateQty({id: item.productId, delta: 1}))
                    }
                    style={styles.qtyBtn}>
                    <Text style={styles.qtyBtnText}>+</Text>
                  </TouchableOpacity>
                </View>

                {/* Right Section: Line Total */}
                <View style={{width: 80, alignItems: 'flex-end'}}>
                  <Text style={styles.itemTotal}>
                    ₹{item.price * item.quantity - (item.lineDiscount || 0)}
                  </Text>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Cart is empty</Text>
              </View>
            }
          />
          <ItemEditModal
            isVisible={isEditModalVisible}
            item={editingItem}
            onClose={() => setIsEditModalVisible(false)}
            onSave={handleUpdateItem}
          />

          {/* 🔹 FOOTER (KEYBOARD SAFE) */}
          <View style={styles.footerContainer}>
            <View style={styles.summarySection}>
              {paymentMode === 'SPLIT' && (
                <View style={styles.splitInputContainer}>
                  <Text style={styles.splitTitle}>Split Breakdown</Text>
                  <View style={styles.editRow}>
                    <Text style={styles.summaryLabel}>Cash Amount</Text>
                    <View style={styles.inputWrapper}>
                      <Text style={styles.inputPrefix}>₹</Text>
                      <TextInput
                        style={styles.inlineInput}
                        keyboardType="numeric"
                        value={splitCash}
                        onChangeText={handleCashChange}
                        placeholder="0.00"
                      />
                    </View>
                  </View>
                  <View style={styles.editRow}>
                    <Text style={styles.summaryLabel}>Online/UPI</Text>
                    <View style={styles.inputWrapper}>
                      <Text style={styles.inputPrefix}>₹</Text>
                      <TextInput
                        style={[styles.inlineInput, {color: '#6366f1'}]}
                        keyboardType="numeric"
                        value={splitOnline}
                        onChangeText={setSplitOnline}
                      />
                    </View>
                  </View>
                </View>
              )}
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValueSmall}>
                  ₹{subtotal.toFixed(2)}
                </Text>
              </View>

              <View style={styles.editRow}>
                <Text style={styles.summaryLabel}>Discount</Text>
                <View style={styles.inputGroup}>
                  {/* Percentage Input */}
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.inlineInput}
                      keyboardType="numeric"
                      value={discountPercent}
                      onChangeText={handleDiscountPercentChange}
                    />
                    <Text style={styles.inputSuffix}>%</Text>
                  </View>

                  {/* Amount Input */}
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputPrefix}>₹</Text>
                    <TextInput
                      style={styles.inlineInput}
                      keyboardType="numeric"
                      value={manualDiscount}
                      onChangeText={handleManualDiscountChange}
                    />
                  </View>
                </View>
              </View>
              {/* GST Row */}
              <View style={styles.editRow}>
                <Text style={styles.summaryLabel}>GST</Text>
                <View style={styles.inputGroup}>
                  {/* Percentage Input */}
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.inlineInput}
                      keyboardType="numeric"
                      value={gstPercentInput}
                      onChangeText={setGstPercentInput}
                    />
                    <Text style={styles.inputSuffix}>%</Text>
                  </View>

                  {/* Amount Input */}
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputPrefix}>₹</Text>
                    <TextInput
                      style={[styles.inlineInput, {color: '#94a3b8'}]}
                      keyboardType="numeric"
                      value={finalGstAmount.toFixed(2)}
                      editable={false}
                    />
                  </View>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabelMain}>Total</Text>
                <Text style={styles.totalAmountMain}>
                  ₹{finalAmount.toFixed(2)}
                </Text>
              </View>
            </View>

            {/* Buttons */}
            <View style={styles.footerActionRow}>
              <TouchableOpacity
                style={styles.btnSecondary}
                onPress={() => handleCheckout(false)}>
                <Text style={styles.btnSecondaryText}>SAVE</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnPrimary}
                onPress={() => handleCheckout(true)}>
                <Text style={styles.btnPrimaryText}>SAVE & PRINT</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ProductScreen
            isVisible={isAddModalVisible}
            onClose={() => setIsAddModalVisible(false)}
            onSuccess={() => {
              setIsAddModalVisible(false);
              // After successfully creating, look it up again to add to cart
              handleLookup(scannedBarcode);
            }}
            // Pass the barcode so the "Add" form is pre-filled
            product={{barcode: scannedBarcode}}
          />
          <ProductPickerModal
            isVisible={pickerVisible}
            onClose={() => setPickerVisible(false)}
            onProductSelected={() => {}}
          />
        </View>
      </KeyboardAvoidingView>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f8fafc'},
  topActionBar: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 10,
  },
  browseButton: {
    flex: 1,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2d2e2e',
  },
  browseButtonText: {fontWeight: '600', color: '#475569'},
  cameraToggleButton: {
    width: 50,
    height: 50,
    backgroundColor: '#000',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraActiveBtn: {backgroundColor: '#fee2e2'},
  cameraActiveIcon: {color: '#ef4444', fontWeight: 'bold', fontSize: 18},
  cameraContainer: {
    height: 180,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
    marginBottom: 16,
  },
  scanLine: {
    position: 'absolute',
    top: '50%',
    left: '10%',
    right: '10%',
    height: 1,
    backgroundColor: '#22c55e',
    zIndex: 2,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  itemName: {fontSize: 15, fontWeight: '700', color: '#1e293b'},
  itemSubText: {fontSize: 12, color: '#94a3b8'},
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    marginHorizontal: 8,
  },
  qtyBtn: {padding: 8, paddingHorizontal: 12},
  qtyBtnText: {fontSize: 18, fontWeight: 'bold'},
  qtyNumberBox: {minWidth: 30, alignItems: 'center'},
  qtyText: {fontWeight: '800'},
  itemTotal: {width: 70, textAlign: 'right', fontWeight: '800'},
  footerContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 10,
  },
  summarySection: {marginBottom: 15},
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  splitInputContainer: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  splitTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  editRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  inlineInput: {
    paddingVertical: 2,
    paddingHorizontal: 4,
    minWidth: 60,
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    // borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
  },
  inputPrefix: {fontSize: 12, color: '#64748b', marginRight: 2},
  inputSuffix: {fontSize: 12, color: '#64748b', marginLeft: 2},
  calculatedTax: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    minWidth: 70,
    textAlign: 'right',
  },
  tagTextContainer: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  tagText: {
    fontSize: 10,
    color: '#6366f1',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  summaryLabel: {color: '#64748b'},
  summaryValueSmall: {fontWeight: '600'},
  divider: {height: 1, backgroundColor: '#f1f5f9', marginVertical: 2},
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabelMain: {fontWeight: '700', color: '#94a3b8'},
  totalAmountMain: {fontSize: 22, fontWeight: '900', color: '#0f172a'},
  footerActionRow: {flexDirection: 'row', gap: 12},
  btnPrimary: {
    flex: 1.5,
    height: 44,
    backgroundColor: '#111',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnPrimaryText: {color: '#fff', fontWeight: '800'},
  btnSecondary: {
    flex: 1,
    height: 44,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#848688',
  },
  btnSecondaryText: {color: '#000', fontWeight: '700'},
  btnDisabled: {opacity: 0.5},
  emptyContainer: {marginTop: 40, alignItems: 'center'},
  emptyText: {color: '#cbd5e1', fontSize: 16},
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyModalContent: {
    width: 280,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {fontWeight: 'bold', marginBottom: 15},
  qtyInput: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 24,
    marginBottom: 20,
  },
  modalButtons: {flexDirection: 'row', gap: 10},
  modalBtn: {flex: 1, padding: 12, borderRadius: 8, alignItems: 'center'},
});
