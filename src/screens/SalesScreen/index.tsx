import React, {useState, useEffect, useRef} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import {
  Camera,
  useCameraDevices,
  useCodeScanner,
} from 'react-native-vision-camera';
// Import the service at the top
import {connectAndPrint} from '../../services/PrinterService';
import {useDispatch, useSelector} from 'react-redux';
import {addToCart, updateQty, clearCart} from '../../redux/slices/cartSlice'; // Ensure this path is correct
import MainLayout from '../../../src/screens/MainLayout';
import axiosInstance from '../../services/axiosInstance';
import Toast from 'react-native-toast-message';
import color from '../../assets/Color/color';
import Sound from 'react-native-sound';
import ProductPickerModal from '../ProductScreen/ProductPickerModal';

export default function SalesScreen() {
  const dispatch = useDispatch();
  const beepSound = useRef<Sound | null>(null);
  // Get cart items from Redux
  const cart = useSelector((state: any) => state.cart.items || []);
  const discount = useSelector((state: any) => state.cart.discount || 0);

  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCameraVisible, setIsCameraVisible] = useState(true); // Toggle State
  const [pickerVisible, setPickerVisible] = useState(false);
  const lastScannedCode = useRef<string | null>(null);
  const lastScanTime = useRef<number>(0);
  const [qtyModalVisible, setQtyModalVisible] = useState(false);
  const [tempQty, setTempQty] = useState('');
  const [activeProductId, setActiveProductId] = useState<string | null>(null);

  const openQtyModal = (productId: string, currentQty: number) => {
    setActiveProductId(productId);
    setTempQty(currentQty.toString());
    setQtyModalVisible(true);
  };

  const submitManualQty = () => {
    const newQty = parseInt(tempQty || '0', 10);
    if (!isNaN(newQty) && activeProductId) {
      const currentItem = cart.find(
        (i: any) => i.productId === activeProductId,
      );
      const delta = newQty - (currentItem?.quantity || 0);
      dispatch(updateQty({id: activeProductId, delta}));
    }
    setQtyModalVisible(false);
  };
  const handleManualQty = (productId: string, currentQty: number) => {
    Alert.prompt(
      'Set Quantity',
      'Enter the total quantity for this item:',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'OK',
          onPress: value => {
            const newQty = parseInt(value || '0', 10);
            if (!isNaN(newQty) && newQty >= 0) {
              // Calculate delta to reach the target number
              const delta = newQty - currentQty;
              dispatch(updateQty({id: productId, delta}));
            }
          },
        },
      ],
      'plain-text',
      currentQty.toString(),
      'number-pad',
    );
  };
  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');
    })();
  }, []);
  useEffect(() => {
    // Initialize sound (Make sure 'success_beep.mp3' exists in your resources)
    beepSound.current = new Sound('beep.mp3', Sound.MAIN_BUNDLE, error => {
      if (error) {
        console.log('Failed to load the sound', error);
        return;
      }
    });

    return () => {
      if (beepSound.current) beepSound.current.release();
    };
  }, []);
  const playSuccessSound = () => {
    if (beepSound.current) {
      beepSound.current.stop(() => {
        beepSound.current?.play();
      });
    }
  };

  const codeScanner = useCodeScanner({
    codeTypes: ['ean-13', 'code-128', 'qr', 'code-39'],
    onCodeScanned: codes => {
      const now = Date.now();
      const value = codes[0]?.value;

      // Debounce: Prevents duplicate scans of the same item within 2 seconds
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

  const handleLookup = async (barcode: string) => {
    try {
      const response = await axiosInstance.get(`/products/barcode/${barcode}`);
      if (response.data) {
        playSuccessSound();
        dispatch(addToCart(response.data));
        Toast.show({
          type: 'success',
          text1: `Added ${response.data.name}`,
          position: 'bottom',
        });
      }
    } catch (error) {
      console.log('Product not found for barcode:', barcode);
    }
  };

  const subtotal = cart.reduce(
    (s: number, i: any) => s + i.price * i.quantity,
    0,
  );
  const finalAmount = subtotal - (parseFloat(discount.toString()) || 0);

  // Inside SalesScreen component...
  const handleCheckout = async () => {
    setLoading(true);
    try {
      const payload = {
        userId: 'a5d0861f-0248-45cb-ba23-9bf3844ffc1a',
        paymentMode: 'CASH',
        totalAmount: subtotal,
        discount: discount,
        finalAmount: finalAmount,
        items: cart.map((i: any) => ({
          productId: i.productId,
          quantity: i.quantity,
          price: i.price,
        })),
      };

      const response = await axiosInstance.post('/sales', payload);

      if (response.status === 201 || response.status === 200) {
        Toast.show({type: 'success', text1: 'Sale Record Created'});

        // --- START PRINTING ---
        try {
          await connectAndPrint(cart, subtotal, discount, finalAmount);
        } catch (printError) {
          Alert.alert(
            'Printer Error',
            'Sale saved, but failed to print receipt.',
          );
        }
        // --- END PRINTING ---

        dispatch(clearCart());
      }
    } catch (e) {
      Toast.show({type: 'error', text1: 'Checkout failed'});
    } finally {
      setLoading(false);
    }
  };

  const devices = useCameraDevices();
  const device = devices.find(d => d.position === 'back');

  return (
    <MainLayout title="POS Terminal" showBack>
      <Modal visible={qtyModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.qtyModalContent}>
            <Text style={styles.modalTitle}>Set Quantity</Text>
            <TextInput
              style={styles.qtyInput}
              keyboardType="number-pad"
              value={tempQty}
              onChangeText={setTempQty}
              autoFocus
              selectTextOnFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, {backgroundColor: '#e2e8f0'}]}
                onPress={() => setQtyModalVisible(false)}>
                <Text style={{color: '#475569', fontWeight: 'bold'}}>
                  CANCEL
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, {backgroundColor: '#000'}]}
                onPress={submitManualQty}>
                <Text style={{color: '#fff', fontWeight: 'bold'}}>UPDATE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <View style={styles.container}>
        {/* CAMERA SECTION (25% Height) */}
        <View
          style={[
            styles.cameraContainer,
            !isCameraVisible && styles.cameraClosed, // Dynamic styling
          ]}>
          {isCameraVisible ? (
            <>
              {device && hasPermission ? (
                <Camera
                  style={StyleSheet.absoluteFill}
                  device={device}
                  isActive={isCameraVisible}
                  codeScanner={codeScanner}
                />
              ) : (
                <ActivityIndicator color="#fff" style={{flex: 1}} />
              )}
              <View style={styles.scanLine} />
              <TouchableOpacity
                style={styles.closeCameraButton}
                onPress={() => setIsCameraVisible(false)}>
                <Text style={styles.closeCameraText}>✕ CLOSE SCANNER</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.reopenContainer}
              onPress={() => setIsCameraVisible(true)}>
              <Text style={styles.reopenText}>📷 TAP TO OPEN SCANNER</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={styles.manualAddBtn}
            onPress={() => setPickerVisible(true)}>
            <Text style={styles.manualAddText}>+ BROWSE PRODUCTS</Text>
          </TouchableOpacity>
        </View>

        {/* CART LIST SECTION */}
        <View style={styles.cartSection}>
          <FlatList
            data={cart}
            keyExtractor={item => item.productId}
            renderItem={({item}) => (
              <View style={styles.cartItem}>
                <View style={{flex: 1}}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.itemSubText}>
                    ₹{item.price.toFixed(2)}
                  </Text>
                </View>

                {/* IMPROVED QTY CONTROLS */}
                <View style={styles.qtyContainer}>
                  <TouchableOpacity
                    onPress={() =>
                      dispatch(updateQty({id: item.productId, delta: -1}))
                    }
                    style={styles.qtyBtn}>
                    <Text style={styles.qtyBtnText}>−</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onLongPress={() =>
                      openQtyModal(item.productId, item.quantity)
                    }
                    style={styles.qtyNumberBox}>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      dispatch(updateQty({id: item.productId, delta: +1}))
                    }
                    style={styles.qtyBtn}>
                    <Text style={styles.qtyBtnText}>+</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.itemTotal}>
                  ₹{(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Cart is empty</Text>
                <Text style={styles.emptySubText}>
                  Scan barcodes to add products
                </Text>
              </View>
            }
          />
        </View>
        <ProductPickerModal
          isVisible={pickerVisible}
          onClose={() => setPickerVisible(false)}
          onProductSelected={() => {
            // playSuccessSound();
            Toast.show({
              type: 'success',
              text1: 'Added to cart',
              position: 'bottom',
            });
          }}
        />

        {/* FOOTER */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.footer}>
            <View style={styles.footerRow}>
              <View>
                <Text style={styles.totalLabel}>Total Payable</Text>
                <Text style={styles.totalValue}>₹{finalAmount.toFixed(2)}</Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.payBtn,
                  (!cart.length || loading) && {backgroundColor: '#cbd5e1'},
                ]}
                onPress={handleCheckout}
                disabled={!cart.length || loading}>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.payText}>COMPLETE SALE</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f8fafc'},

  cameraContainer: {
    height: '25%', // Visible height
    backgroundColor: '#1e293b',
    overflow: 'hidden',
    position: 'relative',
  },
  cameraClosed: {
    height: 50, // Minimal height when closed
    backgroundColor: '#f1f5f9',
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
  },
  scanLine: {
    position: 'absolute',
    top: '50%',
    left: '15%',
    right: '15%',
    height: 1,
    backgroundColor: '#22c55e',
    zIndex: 2,
    shadowColor: '#22c55e',
    shadowOpacity: 0.8,
    elevation: 5,
  },
  closeCameraButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 10,
  },
  closeCameraText: {color: '#fff', fontSize: 10, fontWeight: '800'},
  reopenContainer: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  reopenText: {color: '#94a3b8', fontWeight: '800', letterSpacing: 1},
  actionBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
  },
  manualAddBtn: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#cbd5e1',
  },
  manualAddText: {
    color: '#475569',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.5,
  },
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
    elevation: 10,
  },
  modalTitle: {fontSize: 16, fontWeight: 'bold', marginBottom: 15},
  qtyInput: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
  },
  modalButtons: {flexDirection: 'row', gap: 10},
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  // Cart Styles
  cartSection: {flex: 1, paddingHorizontal: 16, paddingTop: 16},
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cartTitle: {fontSize: 16, fontWeight: '800', color: '#1e293b'},
  itemCount: {fontSize: 12, color: '#64748b', fontWeight: '600'},

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
  itemSubText: {fontSize: 12, color: '#94a3b8', marginTop: 2},

  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  qtyDisplay: {
    paddingHorizontal: 12,
    backgroundColor: '#f8fafc',
    height: '100%',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#e2e8f0',
  },
  qtyBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  qtyBtnText: {fontWeight: 'bold', fontSize: 16, color: '#000'},
  qtyText: {fontWeight: '800', minWidth: 20, textAlign: 'center', fontSize: 14},
  itemTotal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    width: 75,
    textAlign: 'right',
  },

  // Footer
  footer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -3},
    shadowOpacity: 0.05,
    elevation: 10,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  totalValue: {fontSize: 26, fontWeight: '900', color: '#000'},
  payBtn: {
    backgroundColor: color.black || '#000',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 160,
  },
  payText: {color: '#fff', fontWeight: '800', fontSize: 14, letterSpacing: 0.5},

  emptyContainer: {alignItems: 'center', marginTop: 60},
  emptyText: {color: '#cbd5e1', fontSize: 18, fontWeight: '800'},
  emptySubText: {color: '#cbd5e1', fontSize: 12, marginTop: 4},
});
