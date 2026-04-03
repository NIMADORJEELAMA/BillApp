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
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {addToCart, updateQty} from '../../redux/slices/cartSlice';
import axiosInstance from '../../services/axiosInstance';

const {width} = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 3;

export default function ProductPickerModal({isVisible, onClose}: any) {
  const dispatch = useDispatch();
  // Get cart from Redux to show current quantities in the grid
  const cart = useSelector((state: any) => state.cart.items || []);

  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isVisible) fetchProducts();
  }, [isVisible]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/products');
      setProducts(response.data.items || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [products, searchQuery]);

  const renderProductItem = ({item}: {item: any}) => {
    // Check if item is already in cart to show QTY controls
    const cartItem = cart.find((i: any) => i.productId === item.id);
    const quantity = cartItem ? cartItem.quantity : 0;

    return (
      <View style={styles.gridItem}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productPrice}>₹{item.price}</Text>

        {quantity > 0 ? (
          <View style={styles.qtyBadgeContainer}>
            <TouchableOpacity
              style={styles.miniQtyBtn}
              onPress={() => dispatch(updateQty({id: item.id, delta: -1}))}>
              <Text style={styles.qtyBtnText}>−</Text>
            </TouchableOpacity>

            <Text style={styles.qtyValueText}>{quantity}</Text>

            <TouchableOpacity
              style={styles.miniQtyBtn}
              onPress={() => dispatch(updateQty({id: item.id, delta: 1}))}>
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => dispatch(addToCart(item))}>
            <Text style={styles.addBtnText}>ADD</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <Modal visible={isVisible} animationType="slide">
      <View style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>All Products</Text>
          <TouchableOpacity onPress={onClose} style={styles.doneBtn}>
            <Text style={styles.doneBtnText}>CLOSE</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {loading ? (
          <ActivityIndicator color="#000" style={{marginTop: 50}} />
        ) : (
          <FlatList
            data={filteredProducts}
            keyExtractor={item => item.id}
            renderItem={renderProductItem}
            numColumns={3}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#f8fafc', paddingTop: 40},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    alignItems: 'center',
  },
  title: {fontSize: 18, fontWeight: '900', color: '#0f172a'},
  doneBtn: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  doneBtnText: {color: '#fff', fontWeight: 'bold', fontSize: 12},
  searchInput: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10,
  },
  listContainer: {paddingHorizontal: 8},
  gridItem: {
    width: ITEM_WIDTH,
    backgroundColor: '#fff',
    margin: 4,
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    justifyContent: 'space-between',
    minHeight: 120,
  },
  productName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
  },
  productPrice: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563eb',
    marginVertical: 4,
  },

  // Qty Controls Styling
  qtyBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingHorizontal: 4,
    marginTop: 5,
    width: '100%',
    justifyContent: 'space-between',
  },
  miniQtyBtn: {
    width: 24,
    height: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  qtyBtnText: {fontSize: 14, fontWeight: 'bold', color: '#000'},
  qtyValueText: {fontSize: 13, fontWeight: '900', color: '#0f172a'},

  addBtn: {
    backgroundColor: '#e2e8f0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    width: '100%',
    alignItems: 'center',
  },
  addBtnText: {fontSize: 10, fontWeight: '800', color: '#475569'},
});
