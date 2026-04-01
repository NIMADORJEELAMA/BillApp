import React, {useState} from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  View,
  TextInput,
  Text,
} from 'react-native';

import MainLayout from '../../screens/MainLayout';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../redux/store';
import {updateCartQuantity, clearCart} from '../../redux/slices/cartSlice';
import {orderService} from '../../services/orderService';
import swiggyColors from '../../assets/Color/swiggyColor';
import Toast from 'react-native-toast-message';
import color from '../../assets/Color/color';

const CartScreen = ({route, navigation}: any) => {
  const {table} = route.params;
  const tableId = table?.id;
  const tableName = table?.name || table?.number;
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const [isOrdering, setIsOrdering] = useState(false);

  const [orderNote, setOrderNote] = useState('');
  const [isSpicy, setIsSpicy] = useState(false);

  const itemList = Object.values(cartItems);
  const totalAmount = itemList.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const handlePlaceOrder = async () => {
    if (itemList.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Empty Cart',
        text2: 'Please add items before placing an order.',
      });
      return;
    }
    setIsOrdering(true);
    try {
      const payload = {
        tableId: tableId,
        // isSpicy: isSpicy, // Global field
        note: orderNote,
        items: itemList.map(item => ({
          menuItemId: item.id,
          quantity: item.quantity,
          isSpicy: !!item.isSpicy,
        })),
      };
      console.log('payload', payload);
      await orderService.createOrder(payload);
      Toast.show({
        type: 'success',
        text1: 'Order Placed!',
        text2: 'The kitchen has received your order.',
        position: 'top',
        topOffset: 50,
        // Pass custom data here
        props: {
          backgroundColor: swiggyColors.veg,
        },
      });
      setOrderNote('');
      dispatch(clearCart());
      navigation.goBack();
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Order Failed',
        text2: 'Could not connect to the kitchen. Please try again.',
        position: 'top',
        topOffset: 50,
      });
    } finally {
      setIsOrdering(false);
    }
  };
  return (
    <MainLayout title="Review Order" subtitle={`${tableName}`} showBack>
      <View style={{flex: 1, backgroundColor: swiggyColors.surface}}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: 120}}>
          {/* Order Items Section */}

          <View style={styles.sectionCard}>
            {itemList.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.cartItem,
                  index === itemList.length - 1 && {borderBottomWidth: 0},
                ]}>
                <View style={styles.itemMain}>
                  {/* Standard Veg/Non-Veg Marker */}
                  <View
                    style={[
                      styles.marker,
                      {
                        borderColor: item?.isVeg
                          ? swiggyColors.veg
                          : swiggyColors.nonVeg,
                      },
                    ]}>
                    <View
                      style={[
                        styles.dot,
                        {
                          backgroundColor: item?.isVeg
                            ? swiggyColors.veg
                            : swiggyColors.nonVeg,
                        },
                      ]}
                    />
                    {/* <Text style={styles.index}>
                          {index + 1} {'.'}
                        </Text> */}
                  </View>
                  <View style={{marginLeft: 10}}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemPrice}>₹{item.price}</Text>
                  </View>
                </View>

                {/* Swiggy-Style Qty Counter */}
                <View style={styles.qtyContainer}>
                  <TouchableOpacity
                    onPress={() =>
                      dispatch(updateCartQuantity({item, delta: -1}))
                    }
                    style={styles.qtyBtn}>
                    <Text style={styles.qtyBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{item.quantity}</Text>
                  <TouchableOpacity
                    onPress={() =>
                      dispatch(updateCartQuantity({item, delta: 1}))
                    }
                    style={styles.qtyBtn}>
                    <Text style={styles.qtyBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
                <View>
                  <TouchableOpacity
                    onPress={() =>
                      dispatch(
                        updateCartQuantity({
                          item,
                          delta: 0,
                          toggleSpicy: true,
                        }),
                      )
                    }
                    style={[
                      styles.miniSpicyBadge,
                      item.isSpicy && styles.miniSpicyActive,
                    ]}>
                    <Text
                      style={[
                        styles.miniSpicyText,
                        item.isSpicy && {color: '#fff'},
                      ]}>
                      🌶️
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {itemList.length === 0 && (
              <View style={{padding: 40, alignItems: 'center'}}>
                <Text style={{color: swiggyColors.textSecondary}}>
                  Your cart is empty
                </Text>
              </View>
            )}
          </View>

          {/* Bill Details Section */}
          {/* {itemList.length > 0 && (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Bill Details</Text>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Item Total</Text>
                <Text style={styles.billValue}>₹{totalAmount}</Text>
              </View>
              <View style={[styles.billRow, styles.totalRow]}>
                <Text style={styles.grandTotalLabel}>Grand Total</Text>
                <Text style={styles.grandTotalValue}>₹{totalAmount}</Text>
              </View>
            </View>
          )} */}

          <View style={styles.sectionCard}>
            {/* <View style={styles.preferenceRow}>
              <View>
                <Text style={styles.prefLabel}>Mark all as Spicy?</Text>
                <Text style={styles.prefSub}>
                  Applies to all eligible items
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsSpicy(!isSpicy)}
                style={[styles.spicyToggle, isSpicy && styles.spicyActive]}>
                <Text
                  style={[styles.spicyToggleText, isSpicy && {color: '#fff'}]}>
                  🌶️ {isSpicy ? 'YES' : 'NO'}
                </Text>
              </TouchableOpacity>
            </View> */}

            <View style={styles.noteContainer}>
              <Text style={styles.noteLabel}>Cooking Instructions / Notes</Text>
              <TextInput
                style={styles.orderNoteInput}
                placeholder="E.g. Table prefers less salt, bring water first..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                value={orderNote}
                onChangeText={setOrderNote}
              />
            </View>
          </View>
        </ScrollView>
        {/* Global Order Customizations */}

        <View style={styles.footer}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <View>
              <Text style={styles.btnPrice}>₹{totalAmount}</Text>
              <Text style={styles.btnSub}>View detailed bill</Text>
            </View>
            <View>
              <TouchableOpacity
                activeOpacity={0.9}
                style={[
                  styles.confirmBtn,
                  isOrdering && {backgroundColor: swiggyColors.textSecondary},
                ]}
                onPress={handlePlaceOrder}
                disabled={isOrdering}>
                <View style={styles.btnContent}>
                  {!isOrdering ? (
                    <Text style={styles.btnAction}>CONFIRM ORDER</Text>
                  ) : (
                    <ActivityIndicator color={swiggyColors.background} />
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  sectionCard: {
    backgroundColor: swiggyColors.background,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    shadowColor: swiggyColors.textPrimary,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  itemMain: {flex: 1, flexDirection: 'row', alignItems: 'center'},
  marker: {
    width: 14,
    height: 14,
    borderWidth: 1.5,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: swiggyColors.textSecondary,
  },
  dot: {width: 6, height: 6, borderRadius: 3},
  index: {fontSize: 12, fontWeight: '700', color: swiggyColors.background},
  itemName: {fontSize: 14, fontWeight: '700', color: swiggyColors.textPrimary},
  itemPrice: {fontSize: 13, color: swiggyColors.textSecondary, marginTop: 2},

  miniSpicyBadge: {
    marginLeft: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
  },
  miniSpicyActive: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  miniSpicyText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D4D5D9',
    borderRadius: 8,
    height: 32,
    backgroundColor: swiggyColors.background,
  },
  qtyBtn: {paddingHorizontal: 12, height: '100%', justifyContent: 'center'},
  qtyBtnText: {color: swiggyColors.veg, fontSize: 18, fontWeight: '700'},
  qtyText: {
    color: swiggyColors.veg,
    fontWeight: '800',
    minWidth: 20,
    textAlign: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline', // Keeps the symbol and number aligned at the bottom
  },
  currencySymbol: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151', // Gray-700
    marginRight: 2,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827', // Gray-900
    letterSpacing: -0.5,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: swiggyColors.textPrimary,
    marginBottom: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  billLabel: {fontSize: 14, color: swiggyColors.textSecondary},
  billValue: {fontSize: 14, color: swiggyColors.textPrimary, fontWeight: '600'},
  totalRow: {
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: swiggyColors.textPrimary,
  },
  grandTotalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: swiggyColors.textPrimary,
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 16,
  },
  prefLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: swiggyColors.textPrimary,
  },
  prefSub: {
    fontSize: 11,
    color: swiggyColors.textSecondary,
  },
  spicyToggle: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D4D5D9',
    backgroundColor: '#F8FAFC',
  },
  spicyActive: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  spicyToggleText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
  },
  noteContainer: {
    marginTop: 4,
  },
  noteLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
  },
  orderNoteInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#1E293B',
    minHeight: 80,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: swiggyColors.background,
    padding: 14,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  confirmBtn: {
    flex: 0.8, // 80% width
    height: 52,
    backgroundColor: color.dark, // Success Green
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    // Shadow/Elevation
    shadowColor: color.dark,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
    minWidth: 200,
  },
  btnContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  btnPrice: {
    color: swiggyColors.textPrimary,
    fontSize: 26,
    fontWeight: '900',

    lineHeight: 28,
  },
  btnSub: {
    color: color.dark,
    fontSize: 12,
    fontWeight: '700',
    opacity: 0.9,
  },
  btnAction: {
    color: swiggyColors.background,
    fontSize: 14,
    fontWeight: '900',
  },
});

export default CartScreen;
