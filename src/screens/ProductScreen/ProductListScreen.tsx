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
  Platform,
} from 'react-native';
import MainLayout from '../../../src/screens/MainLayout';
import axiosInstance from '../../services/axiosInstance';
import Toast from 'react-native-toast-message';
import color from '../../assets/Color/color';
import ProductFormModal from './ProductFormModal'; // Ensure correct path
// Optional: import { MaterialIcons } from '@expo/vector-icons';

export default function ProductListScreen({navigation}: any) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  console.log('products', products);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const loadProducts = async (showSpinner = true) => {
    try {
      if (showSpinner) setLoading(true);
      const response = await axiosInstance.get('/products');
      console.log('response.data', response.data);
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

  const filteredProducts = useMemo(() => {
    return products.filter(
      p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.barcode &&
          p.barcode.toLowerCase().includes(searchQuery.toLowerCase())),
    );
  }, [products, searchQuery]);

  const openEditModal = (item: any) => {
    setSelectedProduct(item);
    setModalVisible(true);
  };

  const openAddModal = () => {
    setSelectedProduct(null);
    setModalVisible(true);
  };

  const renderProductRow = ({item, index}: any) => {
    const isLowStock = item.stockQty <= (item.minStock || 5);

    return (
      <View
        style={[styles.rowContainer, index % 2 !== 0 && styles.rowAlternate]}>
        {/* Product Info Column */}
        <View style={styles.colMain}>
          <Text style={styles.primaryText} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.secondaryText}>{item.barcode || 'NO SKU'}</Text>
        </View>

        {/* Stock Status Column */}
        <View style={styles.colStock}>
          <View
            style={[
              styles.badge,
              isLowStock ? styles.badgeLow : styles.badgeOk,
            ]}>
            <Text
              style={[
                styles.badgeText,
                isLowStock ? styles.textLow : styles.textOk,
              ]}>
              {item.stockQty} {item.unit}
            </Text>
          </View>
        </View>

        {/* Price Column */}
        <View style={styles.colPrice}>
          <Text style={styles.priceText}>
            ₹{parseFloat(item.price).toLocaleString()}
          </Text>
        </View>

        {/* Action Column */}
        <TouchableOpacity
          style={styles.colAction}
          onPress={() => openEditModal(item)}>
          <Text style={styles.editActionText}>EDIT</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <MainLayout title="Inventory Management" showBack>
      <View style={styles.container}>
        {/* Top Control Bar */}
        <View style={styles.topBar}>
          <View style={styles.searchWrapper}>
            <TextInput
              style={styles.searchInput}
              placeholder="Filter products..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
            <Text style={styles.addBtnText}>+ NEW</Text>
          </TouchableOpacity>
        </View>

        {/* Grid Header */}
        <View style={styles.gridHeader}>
          <Text style={[styles.headerLabel, styles.colMain]}>PRODUCT</Text>
          <Text
            style={[
              styles.headerLabel,
              styles.colStock,
              {textAlign: 'center'},
            ]}>
            STATUS
          </Text>
          <Text
            style={[styles.headerLabel, styles.colPrice, {textAlign: 'right'}]}>
            PRICE
          </Text>
          <Text
            style={[
              styles.headerLabel,
              styles.colAction,
              {textAlign: 'right'},
            ]}></Text>
        </View>

        {loading && !refreshing ? (
          <ActivityIndicator
            size="large"
            color="#000"
            style={{marginTop: 40}}
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
              <Text style={styles.emptyText}>No matching products</Text>
            }
          />
        )}

        <ProductFormModal
          isVisible={modalVisible}
          product={selectedProduct}
          onClose={() => setModalVisible(false)}
          onSuccess={() => loadProducts(false)}
        />
      </View>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f8fafc'},

  // Search Area
  topBar: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    alignItems: 'center',
    gap: 10,
  },
  searchWrapper: {flex: 1},
  searchInput: {
    height: 40,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  addBtn: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addBtnText: {color: '#fff', fontSize: 12, fontWeight: '800'},

  // Grid Header
  gridHeader: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 2,
    borderBottomColor: '#e2e8f0',
  },
  headerLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#64748b',
    letterSpacing: 1,
  },

  // Row Styles
  rowContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  rowAlternate: {backgroundColor: '#f8fafc'},

  // Columns Widths
  colMain: {flex: 2.5},
  colStock: {flex: 1.5, alignItems: 'center'},
  colPrice: {flex: 1.2, alignItems: 'flex-end'},
  colAction: {flex: 0.8, alignItems: 'flex-end'},

  // Typography
  primaryText: {fontSize: 14, fontWeight: '600', color: '#1e293b'},
  secondaryText: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
    fontWeight: '500',
  },
  priceText: {fontSize: 14, fontWeight: '700', color: '#0f172a'},

  // Status Badges
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    minWidth: 70,
    alignItems: 'center',
  },
  badgeOk: {backgroundColor: '#dcfce7'},
  badgeLow: {backgroundColor: '#fee2e2'},
  badgeText: {fontSize: 10, fontWeight: '800'},
  textOk: {color: '#166534'},
  textLow: {color: '#991b1b'},

  // Actions
  editActionText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#2563eb',
  },

  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#94a3b8',
    fontSize: 14,
  },
});
