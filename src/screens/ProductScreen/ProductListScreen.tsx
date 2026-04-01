import React, {useState, useEffect, useMemo} from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import MainLayout from '../../../src/screens/MainLayout';
import axiosInstance from '../../services/axiosInstance';
import Toast from 'react-native-toast-message';
import color from '../../assets/Color/color';
import swiggyColors from '../../assets/Color/swiggyColor';
import ProductBarcodeCard from './ProductBarcodeCard';

export default function ProductListScreen({navigation}: any) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const handleProductPress = (product: any) => {
    setSelectedProduct(product);
    setShowCodeModal(true);
  };
  console.log('products', products);
  const loadProducts = async (showSpinner = true) => {
    try {
      if (showSpinner) setLoading(true);
      const response = await axiosInstance.get('/products');

      // Accessing the 'items' property from your specific API structure
      setProducts(response.data.items || []);
    } catch (error) {
      Toast.show({type: 'error', text1: 'Failed to load products'});
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Filter products based on search
  const filteredProducts = useMemo(() => {
    return products.filter(
      p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.barcode &&
          p.barcode.toLowerCase().includes(searchQuery.toLowerCase())),
    );
  }, [products, searchQuery]);

  const renderProductRow = ({item, index}: any) => {
    // Your API returns price as a string "110", convert to number for formatting
    const displayPrice = parseFloat(item.price).toLocaleString();
    const isLowStock = item.stockQty <= (item.minStock || 5);

    return (
      <TouchableOpacity
        onPress={() => handleProductPress(item)}
        style={[
          styles.tableRow,
          index % 2 !== 0 && {backgroundColor: '#fcfdfe'},
        ]}>
        <View style={{flex: 2}}>
          <Text style={styles.cellName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.cellBarcode}>{item.barcode || 'No SKU'}</Text>
        </View>

        <View style={{flex: 1, alignItems: 'center'}}>
          <Text style={[styles.cellStock, isLowStock && {color: '#ef4444'}]}>
            {item.stockQty} {item.unit}
          </Text>
          {isLowStock && <Text style={styles.lowStockLabel}>LOW STOCK</Text>}
        </View>

        <View style={{flex: 1, alignItems: 'flex-end'}}>
          <Text style={styles.cellPrice}>₹{displayPrice}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <MainLayout title="Inventory" showBack>
      <View style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or barcode..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('CreateProduct')}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.columnHeader, {flex: 2}]}>PRODUCT / SKU</Text>
          <Text style={[styles.columnHeader, {flex: 1, textAlign: 'center'}]}>
            STOCK
          </Text>
          <Text style={[styles.columnHeader, {flex: 1, textAlign: 'right'}]}>
            PRICE
          </Text>
        </View>

        {loading && !refreshing ? (
          <ActivityIndicator
            size="large"
            color={color.black}
            style={{marginTop: 50}}
          />
        ) : (
          <FlatList
            data={filteredProducts}
            keyExtractor={item => item.id}
            renderItem={renderProductRow}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadProducts(false)}
              />
            }
            ListEmptyComponent={
              <Text style={styles.emptyText}>No products found</Text>
            }
            contentContainerStyle={{paddingBottom: 20}}
          />
        )}
        <ProductBarcodeCard
          isVisible={showCodeModal}
          onClose={() => setShowCodeModal(false)}
          product={selectedProduct}
        />
      </View>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},

  // Search & Add
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: swiggyColors.background,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    fontSize: 14,
  },
  addButton: {
    width: 48,
    height: 48,
    backgroundColor: color.black,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  addButtonText: {color: '#fff', fontSize: 28, fontWeight: '300'},

  // Table
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f1f5f9',
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
  },
  columnHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    alignItems: 'center',
  },

  // Cells
  cellName: {fontSize: 14, fontWeight: '700', color: '#1e293b'},
  cellBarcode: {fontSize: 11, color: '#94a3b8', marginTop: 2},
  cellStock: {fontSize: 14, fontWeight: '600', color: '#1e293b'},
  lowStockLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: '#ef4444',
    marginTop: 2,
  },
  cellPrice: {fontSize: 15, fontWeight: '800', color: color.black},

  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#94a3b8',
    fontSize: 14,
  },
});
