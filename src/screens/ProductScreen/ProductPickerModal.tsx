import React, {useState, useEffect, useMemo} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {addToCart, updateQty} from '../../redux/slices/cartSlice';
import axiosInstance from '../../services/axiosInstance';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const {width} = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 3;

export default function ProductPickerModal({isVisible, onClose}: any) {
  const dispatch = useDispatch();
  const cart = useSelector((state: any) => state.cart.items || []);

  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  useEffect(() => {
    if (isVisible) fetchProducts();
  }, [isVisible]);

  const fetchProducts = async (pageNum = 1, isSearching = false) => {
    try {
      if (pageNum === 1 && !isSearching) setLoading(true);
      if (pageNum > 1) setLoadingMore(true);

      const limit = 100; // Reasonable small batch
      const skip = (pageNum - 1) * limit;

      const response = await axiosInstance.get(
        `/products?search=${searchQuery}&skip=${skip}&take=${limit}`,
      );

      const newItems = response.data.items || [];

      // If page 1, replace list. If page > 1, append.
      setProducts(prev => (pageNum === 1 ? newItems : [...prev, ...newItems]));
      setHasMore(newItems.length === limit);
      setPage(pageNum);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };
  useEffect(() => {
    if (!isVisible) return;
    const delayDebounceFn = setTimeout(() => {
      fetchProducts(1, true);
    }, 400); // 400ms delay to prevent API spam
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, isVisible]);

  // 3. Load more function for FlatList
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchProducts(page + 1);
    }
  };
  const filteredProducts = useMemo(() => {
    return products.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [products, searchQuery]);

  const cartCount = cart.reduce((s: number, i: any) => s + i.quantity, 0);

  const renderProductItem = ({item}: {item: any}) => {
    const cartItem = cart.find((i: any) => i.productId === item.id);
    const quantity = cartItem ? cartItem.quantity : 0;
    const isInCart = quantity > 0;

    return (
      <View style={[styles.gridItem, isInCart && styles.gridItemActive]}>
        <View style={styles.priceTag}>
          <Text style={styles.priceTagText}>₹{item.price}</Text>
        </View>

        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>

        {isInCart ? (
          <View style={styles.qtyContainer}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => dispatch(updateQty({id: item.id, delta: -1}))}>
              <Text style={styles.qtyBtnText}>−</Text>
            </TouchableOpacity>

            <Text style={styles.qtyValue}>{quantity}</Text>

            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => dispatch(updateQty({id: item.id, delta: 1}))}>
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => dispatch(addToCart(item))}>
            <Text style={styles.addBtnText}>+ ADD</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet">
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />

        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Product Catalog</Text>
            <Text style={styles.headerSubtitle}>
              {products.length} Items Available
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeCircle}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* SEARCH BAR */}
        <View style={styles.searchSection}>
          <View style={styles.searchWrapper}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or category..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
          </View>
        </View>

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#6366f1" />
            <Text style={styles.loaderText}>Loading Products...</Text>
          </View>
        ) : (
          <FlatList
            data={products}
            keyExtractor={item => item.id}
            renderItem={renderProductItem}
            numColumns={3}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              loadingMore ? (
                <ActivityIndicator
                  size="small"
                  color="#6366f1"
                  style={{padding: 20}}
                />
              ) : null
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No products found</Text>
              </View>
            }
          />
        )}

        {/* FLOATING ACTION FOOTER */}
        {cartCount > 0 && (
          <View style={styles.footerFloating}>
            <TouchableOpacity style={styles.footerButton} onPress={onClose}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartCount}</Text>
              </View>
              <Text style={styles.footerButtonText}>Review Selections</Text>
              <Text style={styles.footerArrow}>→</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#fdfdfd'},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
    alignItems: 'center',
  },
  headerTitle: {fontSize: 22, fontWeight: '800', color: '#1e293b'},
  headerSubtitle: {fontSize: 12, color: '#64748b', fontWeight: '500'},
  closeCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {fontSize: 14, fontWeight: 'bold', color: '#64748b'},

  searchSection: {paddingHorizontal: 16, paddingBottom: 15},
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {marginRight: 8, fontSize: 16},
  searchInput: {flex: 1, fontSize: 15, color: '#1e293b', fontWeight: '500'},

  listContainer: {paddingHorizontal: 10, paddingBottom: 100},
  gridItem: {
    width: ITEM_WIDTH,
    backgroundColor: '#fff',
    margin: 6,
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    // Elevation for Android
    elevation: 2,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  gridItemActive: {
    borderColor: '#6366f1',
    backgroundColor: '#f5f7ff',
    borderWidth: 1.5,
  },
  priceTag: {
    backgroundColor: '#eef2ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  priceTagText: {fontSize: 11, fontWeight: '800', color: '#6366f1'},
  productName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center',
    lineHeight: 16,
    flex: 1,
  },

  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: 10,
    padding: 2,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: {fontSize: 16, fontWeight: 'bold', color: '#1e293b'},
  qtyValue: {fontSize: 14, fontWeight: '800', color: '#6366f1'},

  addBtn: {
    backgroundColor: '#6366f1',
    paddingVertical: 8,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  addBtnText: {fontSize: 11, fontWeight: '800', color: '#fff'},

  loaderContainer: {marginTop: 100, alignItems: 'center'},
  loaderText: {marginTop: 10, color: '#94a3b8', fontSize: 14},

  emptyContainer: {marginTop: 50, alignItems: 'center'},
  emptyText: {color: '#94a3b8', fontSize: 16, fontWeight: '600'},

  footerFloating: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  footerButtonText: {
    flex: 1,
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 12,
  },
  badge: {
    backgroundColor: '#6366f1',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {color: '#fff', fontSize: 12, fontWeight: '900'},
  footerArrow: {color: '#fff', fontSize: 20, fontWeight: 'bold'},
});
