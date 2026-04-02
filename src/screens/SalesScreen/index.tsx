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
} from 'react-native';
import {
  Camera,
  useCameraDevices,
  useCodeScanner,
} from 'react-native-vision-camera';
import {useDispatch, useSelector} from 'react-redux';
import {addToCart, updateQty, clearCart} from '../../redux/slices/cartSlice'; // Ensure this path is correct
import MainLayout from '../../../src/screens/MainLayout';
import axiosInstance from '../../services/axiosInstance';
import Toast from 'react-native-toast-message';
import color from '../../assets/Color/color';
import Sound from 'react-native-sound';

export default function SalesScreen() {
  const dispatch = useDispatch();
  const beepSound = useRef<Sound | null>(null);
  // Get cart items from Redux
  const cart = useSelector((state: any) => state.cart.items || []);
  const discount = useSelector((state: any) => state.cart.discount || 0);

  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCameraVisible, setIsCameraVisible] = useState(true); // Toggle State

  const lastScannedCode = useRef<string | null>(null);
  const lastScanTime = useRef<number>(0);

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
      await axiosInstance.post('/sales', payload);
      Toast.show({type: 'success', text1: 'Sale Record Created'});
      dispatch(clearCart());
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
      <View style={styles.container}>
        {/* CAMERA SECTION (25% Height) */}
        <View style={styles.cameraContainer}>
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

              {/* Scan UI Overlays */}
              <View style={styles.scanLine} />
              <TouchableOpacity
                style={styles.closeCameraButton}
                onPress={() => setIsCameraVisible(false)}>
                <Text style={styles.closeCameraText}>✕ CLOSE CAMERA</Text>
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

        {/* CART LIST SECTION */}
        <View style={styles.cartSection}>
          <View style={styles.cartHeader}>
            <Text style={styles.cartTitle}>Current Items</Text>
            <Text style={styles.itemCount}>{cart.length} unique items</Text>
          </View>

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
                    ₹{item.price.toFixed(2)} / unit
                  </Text>
                </View>

                <View style={styles.qtyContainer}>
                  <TouchableOpacity
                    onPress={() =>
                      dispatch(updateQty({id: item.productId, delta: -1}))
                    }
                    style={styles.qtyBtn}>
                    <Text style={styles.qtyBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{item.quantity}</Text>
                  <TouchableOpacity
                    onPress={() =>
                      dispatch(updateQty({id: item.productId, delta: 1}))
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

  // Camera Styles
  cameraContainer: {
    height: '25%',
    backgroundColor: '#1e293b',
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
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
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginHorizontal: 10,
  },
  qtyBtn: {padding: 6, paddingHorizontal: 10},
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
