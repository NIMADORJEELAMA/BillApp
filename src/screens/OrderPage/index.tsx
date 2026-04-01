import React, {useState, useEffect, useMemo, useCallback, useRef} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  StatusBar,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Animated,
} from 'react-native';
import {Div} from '../../components/common/UI';
import MainLayout from '../../screens/MainLayout';
import {orderService} from '../../services/orderService';
import {useDispatch, useSelector} from 'react-redux';
import {clearCart, updateCartQuantity} from '../../redux/slices/cartSlice';
import {RootState} from '../../redux/store';
import {useNavigation} from '@react-navigation/native';
import ViewOrderModal from './ViewOrderModal';
import SearchBar from '../../components/Searchbar';
import swiggyColors from '../../assets/Color/swiggyColor';
import CustomDropdown from '../../components/CustomDropdown';
import CartEmpty from '../../assets/Icons/empty-cart.svg'; // Adjust path
import Cart from '../../assets/Icons/cart.svg';

import color from '../../assets/Color/color';
import Toast from 'react-native-toast-message';
import MenuSkeleton from '../../components/Skeleton/MenuSkeleton';
const screenWidth = Dimensions.get('window').width;
const itemWidth = (screenWidth - 48) / 3; // Precise spacing for 3-column grid

const OrderPage = ({route}: any) => {
  const navigation = useNavigation<any>();
  const {table, id} = route.params;

  const tableId = table.id;

  // State
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isVegOnly, setIsVegOnly] = useState(false);
  const [selectedType, setSelectedType] = useState<'FOOD' | 'DRINKS'>('FOOD');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isOrdering, setIsOrdering] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true); // Start as true
  // Redux
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items);

  const totalCartCount = Object.values(cartItems).reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  const itemList = Object.values(cartItems);

  const vegAnim = useRef(new Animated.Value(isVegOnly ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(vegAnim, {
      toValue: isVegOnly ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isVegOnly]);
  // Fetch Menu on Mount

  useEffect(() => {
    // If 'id' exists, it means we came from a notification
    if (id) {
      setModalVisible(true);
    }
  }, [id]);
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true); // Ensure it's true when starting
        const data = await orderService.getMenu();
        setMenuItems(data.filter((item: any) => item.isActive));
      } catch (err) {
        console.error('Failed to fetch menu:', err);
      } finally {
        setLoading(false); // Turn off once done
      }
    };
    fetchMenu();
  }, []);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await orderService.getMenu();
      setMenuItems(data.filter((item: any) => item.isActive));
    } catch (err) {
      console.error('Failed to refresh menu:', err);
    } finally {
      setRefreshing(false);
    }
  }, []);
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
        note: '',
        items: itemList.map(item => ({
          menuItemId: item.id,
          quantity: item.quantity,
        })),
      };
      console.log('payload 11', payload);

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
      dispatch(clearCart());
      // navigation.goBack();
    } catch (err: any) {
      // Extract the most relevant message
      const errorMessage =
        err.response?.data?.message || err.message || 'Something went wrong';

      Toast.show({
        type: 'error',
        text1: 'Order Failed',
        text2: errorMessage, // Now shows a readable string
        position: 'top',
        topOffset: 50,
        visibilityTime: 4000,
      });
    } finally {
      setIsOrdering(false);
    }
  };
  const categoriesList = useMemo(() => {
    const uniqueCats = Array.from(
      new Set(menuItems.map(item => item.category)),
    );
    return [
      {label: 'All Categories', value: 'ALL'},
      ...uniqueCats.map(cat => ({label: cat, value: cat})),
    ];
  }, [menuItems]);
  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesVeg = isVegOnly ? item.isVeg === true : true;
      const matchesType = item.type === selectedType;

      // New Category Filter
      const matchesCategory =
        selectedCategory === 'ALL' || item.category === selectedCategory;

      return matchesSearch && matchesVeg && matchesType && matchesCategory;
    });
  }, [search, isVegOnly, selectedType, selectedCategory, menuItems]);
  const handleQtyChange = (item: any, delta: number) => {
    dispatch(updateCartQuantity({item, delta}));
  };

  // Header Cart Icon Component
  const CartIcon = () => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => navigation.navigate('CartScreen', {table})}
      style={styles.cartHeaderBtn}>
      <View style={{width: 24, height: 24}}>
        <Cart width={24} height={24} fill="#000000" />
      </View>
      {totalCartCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{totalCartCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderGridItem = ({item}: any) => {
    const quantity = cartItems[item.id]?.quantity || 0;

    return (
      <View style={styles.swiggyCard}>
        {/* Veg/Non-Veg Marker - Top Left */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 6,
          }}>
          <View
            style={[
              styles.marker,
              {
                borderColor: item.isVeg
                  ? swiggyColors.veg
                  : swiggyColors.nonVeg,
              },
            ]}>
            <View
              style={[
                styles.dot,
                {
                  backgroundColor: item.isVeg
                    ? swiggyColors.veg
                    : swiggyColors.nonVeg,
                },
              ]}
            />
          </View>
          <View>
            <Text style={styles.itemCategory}>{item.category}</Text>
          </View>
        </View>
        {/* Item Info */}
        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={2}>
            {item.name}
          </Text>
        </View>

        <View style={styles.cardFooter}>
          <View style={{alignSelf: 'flex-start'}}>
            <Text style={styles.itemPrice}>₹{item.price}</Text>
          </View>

          {/* Dynamic Button Section */}
          <View style={styles.buttonWrapper}>
            {quantity === 0 ? (
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.swiggyAddBtn}
                onPress={() => handleQtyChange(item, 1)}>
                <Text style={styles.addBtnText}>ADD</Text>
                <Text style={styles.plusSign}>+</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.swiggyQtyBtn}>
                <TouchableOpacity
                  onPress={() => handleQtyChange(item, -1)}
                  style={styles.qtyTouch}>
                  <Text style={styles.qtyActionText}>−</Text>
                </TouchableOpacity>

                <Text style={styles.qtyValueText}>{quantity}</Text>

                <TouchableOpacity
                  onPress={() => handleQtyChange(item, 1)}
                  style={styles.qtyTouch}>
                  <Text style={styles.qtyActionText}>+</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <MainLayout
      title={`${table.name || table.number}`}
      showBack
      rightComponent={<CartIcon />}>
      <StatusBar barStyle="dark-content" />

      <View style={{flex: 1, backgroundColor: '#FBFBFE'}}>
        <View style={styles.headerContainer}>
          {/* Search Row */}
          <View style={styles.searchRowContainer}>
            <View style={{flex: 1}}>
              <SearchBar
                value={search}
                onChangeText={setSearch}
                placeholder="Search menu..."
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              style={[
                styles.vegToggle,
                {borderColor: isVegOnly ? swiggyColors.veg : '#E2E8F0'},
              ]}
              onPress={() => setIsVegOnly(!isVegOnly)}>
              <View style={styles.topRow}>
                {/* <View
                  style={[
                    styles.vegBox,
                    {borderColor: isVegOnly ? swiggyColors.veg : '#CBD5E1'},
                  ]}>
                  <View
                    style={[
                      styles.vegInnerDot,
                      {
                        backgroundColor: isVegOnly
                          ? swiggyColors.veg
                          : 'transparent',
                      },
                    ]}
                  />
                </View> */}
                <Text
                  style={[
                    styles.vegToggleLabel,
                    isVegOnly && {color: swiggyColors.veg},
                  ]}>
                  VEG
                </Text>
              </View>

              {/* Small Slider Below */}
              <View style={styles.switchTrack}>
                <Animated.View
                  style={[
                    styles.switchThumb,
                    {
                      marginLeft: vegAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [2, 14], // Distance thumb travels
                      }),
                      backgroundColor: isVegOnly ? swiggyColors.veg : '#94A3B8',
                    },
                  ]}
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* Horizontal Scroll Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{overflow: 'visible'}}
            contentContainerStyle={styles.filterScroll}>
            {/* Food/Drinks Toggle */}
            <View style={styles.slider}>
              {['FOOD', 'DRINKS'].map((t: any) => (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.sliderTab,
                    selectedType === t && styles.activeTab,
                  ]}
                  onPress={() => setSelectedType(t)}>
                  <Text
                    style={[
                      styles.tabText,
                      selectedType === t && styles.activeTabText,
                    ]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Category Dropdown as a Chip */}
            <View style={styles.dropdownWrapper}>
              <CustomDropdown
                options={categoriesList}
                selectedValue={selectedCategory}
                onSelect={val => setSelectedCategory(val)}
                placeholder="Category"
              />
            </View>

            {/* View Order Action */}
            <TouchableOpacity
              style={styles.headerActionBtn}
              onPress={() => setModalVisible(true)}>
              <Text style={styles.headerActionBtnText}>Active Order</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {loading ? (
          <ScrollView contentContainerStyle={{padding: 12}}>
            <MenuSkeleton />
          </ScrollView>
        ) : (
          <FlatList
            data={filteredItems}
            keyExtractor={item => item.id}
            renderItem={renderGridItem}
            numColumns={3}
            columnWrapperStyle={styles.gridRow}
            contentContainerStyle={{padding: 12, paddingBottom: 10}}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[swiggyColors.veg]}
                tintColor={swiggyColors.veg}
              />
            }
            ListEmptyComponent={
              <Div center mt={50}>
                <Text style={{color: '#94A3B8'}}>No items found.</Text>
              </Div>
            }
          />
        )}
      </View>

      {totalCartCount > 0 && (
        <View style={styles.footerContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => dispatch(clearCart())}
            style={styles.footerCartBtn}>
            <CartEmpty height={20} width={20} fill={color.dark} />
            <Text style={styles.textCart}>Clear Cart</Text>
          </TouchableOpacity>
          {/* <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('CartScreen', {table})}
            style={styles.footerCartBtn}>
            <Cart height={24} width={24} fill="#1E293B" />
            {totalCartCount > 0 && (
              <View style={styles.footerBadge}>
                <Text style={styles.badgeText}>{totalCartCount}</Text>
              </View>
            )}
          </TouchableOpacity> */}

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
      )}
      <ViewOrderModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        table={table}
      />
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    zIndex: 5000,
    position: 'relative',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    // elevation: 1,
  },
  searchRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
  },
  filterScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    overflow: 'visible',
    // marginBottom: 80,
  },
  slider: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
    marginRight: 10,
    width: 160, // Fixed width for the toggle
  },
  sliderTab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 9,
  },
  activeTab: {
    backgroundColor: '#FFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
  },
  tabText: {fontSize: 11, fontWeight: '700', color: '#94A3B8'},
  activeTabText: {color: '#1E293B'}, // Swiggy Orange

  dropdownWrapper: {
    minWidth: 130,
    marginRight: 10,
    overflow: 'visible',
    zIndex: 6000, // Higher than headerContainer
  },
  headerActionBtn: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  headerActionBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },

  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  activeFilterChip: {
    borderColor: '#FC8019',
    backgroundColor: '#FFF5EE', // Very light orange tint
  },
  activeVegChip: {
    borderColor: swiggyColors.veg,
    backgroundColor: '#F0FDF4',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3D4152', // Swiggy's deep grey for text
  },
  activeFilterText: {
    color: '#FC8019',
  },
  // Veg Icon Styling

  vegDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  // Modern Veg Toggle

  vegToggleActive: {
    borderColor: '#27ae60',
    backgroundColor: '#F0FDF4',
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4, // Space between text and slider
  },
  switchTrack: {
    width: 28,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#E2E8F0', // Light gray background
    justifyContent: 'center',
  },
  switchThumb: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  vegBox: {
    width: 14,
    height: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  vegToggle: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderWidth: 1,
    borderRadius: 8,
    padding: 5,
  },
  vegInnerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  vegToggleLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#64748B',
  },
  // Action Row
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  currentOrderBtn: {
    flex: 1,
    backgroundColor: '#fa2c37',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  historyBtn: {
    width: 48,
    height: 48,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Slider

  // Grid Item
  gridRow: {
    justifyContent: 'flex-start',
  },

  // Badge
  cartHeaderBtn: {padding: 8},
  badge: {
    position: 'absolute',
    top: 2,
    right: 0,
    backgroundColor: '#fa2c37',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    borderWidth: 2,
    borderColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {color: '#FFF', fontSize: 9, fontWeight: '900'},
  swiggyCard: {
    width: itemWidth,
    margin: 4,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 16,
    // Refined Shadow
    shadowColor: '#282C3F',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    justifyContent: 'space-between',
    minHeight: 160,
  },
  marker: {
    width: 14,
    height: 14,
    borderWidth: 1.5,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    // marginBottom: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  itemInfo: {
    flex: 1,
    marginBottom: 0,
  },
  itemName: {
    fontSize: 11,
    fontWeight: '800',
    color: '#3D4152', // Deep grey
    lineHeight: 18,
  },
  itemCategory: {
    fontSize: 10,
    color: '#7E808C',
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  cardFooter: {
    alignItems: 'center',
    marginTop: 'auto',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3D4152',
    marginBottom: 8,
    alignContent: 'flex-start',
  },
  buttonWrapper: {
    width: '100%',
    height: 36,
  },
  // ADD Button Styling
  swiggyAddBtn: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D4D5D9',
    borderRadius: 8,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    // Button Shadow
    shadowColor: '#000',
    shadowOpacity: 0.05,
    elevation: 2,
  },
  addBtnText: {
    color: swiggyColors.veg,
    fontWeight: '900',
    fontSize: 13,
  },
  plusSign: {
    position: 'absolute',
    right: 8,
    top: 2,
    color: swiggyColors.veg,
    fontSize: 12,
    fontWeight: '900',
  },
  // Qty Selector Styling
  swiggyQtyBtn: {
    flexDirection: 'row',
    backgroundColor: swiggyColors.veg, // Swiggy uses green for active qty controls
    borderRadius: 8,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  qtyTouch: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyActionText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  qtyValueText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    minWidth: 20,
    textAlign: 'center',
  },

  //footer
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    // Border for subtle separation
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    // Ensures it sits at the very bottom
    paddingBottom: 36,
    gap: 12,
  },
  footerCartBtn: {
    flex: 0.2, // 20% width
    height: 52,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  textCart: {
    fontSize: 10,
    fontWeight: '700',
  },
  footerBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#fa2c37',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  confirmBtn: {
    flex: 0.8, // 80% width
    height: 52,
    backgroundColor: color.dark, // Success Green
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    // Shadow/Elevation
    shadowColor: color.dark,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnAction: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});

export default OrderPage;
