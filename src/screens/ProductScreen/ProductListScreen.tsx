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
  ScrollView,
  Alert,
} from 'react-native';
import MainLayout from '../../../src/screens/MainLayout';
import axiosInstance from '../../services/axiosInstance';
import Toast from 'react-native-toast-message';
import ProductFormModal from './ProductFormModal';

export default function ProductListScreen({navigation}: any) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const loadProducts = async (showSpinner = true) => {
    try {
      if (showSpinner) setLoading(true);
      const response = await axiosInstance.get('/products');
      // Adjusting based on your backend response structure
      setProducts(response.data.items || response.data || []);
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
  const handleDelete = async (id: string, name: string) => {
    Alert.alert(
      `Delete ${name || 'product'}?`,
      'Are you sure? This will deactivate the product if it has sales history.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await axiosInstance.delete(`/products/${id}`);
              Toast.show({type: 'success', text1: 'Product removed'});
              loadProducts(false); // Refresh list
            } catch (error: any) {
              Toast.show({
                type: 'error',
                text1: 'Delete failed',
                text2: error.response?.data?.message || 'Server error',
              });
            }
          },
        },
      ],
    );
  };

  const renderProductRow = ({item, index}: any) => {
    const isLowStock = item.stockQty <= (item.minStock || 5);

    return (
      <View
        style={[styles.rowContainer, index % 2 !== 0 && styles.rowAlternate]}>
        <View style={styles.colName}>
          <Text style={styles.primaryText} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.secondaryText}>{item.barcode || 'NO SKU'}</Text>
        </View>

        <View style={styles.colStatus}>
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

        <View style={styles.colData}>
          <Text style={styles.priceText}>₹{item.price}</Text>
        </View>

        <View style={styles.colData}>
          <Text style={[styles.priceText, {color: '#64748b'}]}>
            ₹{item.costPrice || 0}
          </Text>
        </View>

        <View style={styles.colData}>
          <Text style={styles.secondaryText}>
            {item.category?.name || 'N/A'}
          </Text>
        </View>

        {/* Action Column with Edit and Delete */}
        <View style={styles.colAction}>
          <TouchableOpacity onPress={() => openEditModal(item)}>
            <Text style={styles.editActionText}>EDIT</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.colAction}>
          <TouchableOpacity onPress={() => handleDelete(item.id, item.name)}>
            <Text style={styles.deleteActionText}>DEL</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <MainLayout title="Inventory" showBack>
      <View style={styles.container}>
        {/* Search & Add Bar */}
        <View style={styles.topBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search name or barcode..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => {
              setSelectedProduct(null);
              setModalVisible(true);
            }}>
            <Text style={styles.addBtnText}>+ NEW</Text>
          </TouchableOpacity>
        </View>

        {/* Horizontal Scrolling Table */}
        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <View>
            {/* Fixed Width Header */}
            <View style={styles.gridHeader}>
              <Text style={[styles.headerLabel, styles.colName]}>PRODUCT</Text>
              <Text
                style={[
                  styles.headerLabel,
                  styles.colStatus,
                  {textAlign: 'center'},
                ]}>
                STOCK
              </Text>
              <Text
                style={[
                  styles.headerLabel,
                  styles.colData,
                  {textAlign: 'right'},
                ]}>
                PRICE
              </Text>
              <Text
                style={[
                  styles.headerLabel,
                  styles.colData,
                  {textAlign: 'right'},
                ]}>
                COST
              </Text>
              <Text
                style={[
                  styles.headerLabel,
                  styles.colData,
                  {textAlign: 'right'},
                ]}>
                CAT
              </Text>
              <Text style={[styles.headerLabel, styles.colAction]}></Text>
            </View>

            {loading ? (
              <ActivityIndicator size="large" style={{marginTop: 50}} />
            ) : (
              <FlatList
                data={filteredProducts}
                keyExtractor={item => item.id}
                renderItem={renderProductRow}
                contentContainerStyle={{paddingBottom: 100}}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={() => loadProducts(false)}
                  />
                }
              />
            )}
          </View>
        </ScrollView>

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
  topBar: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  addBtn: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addBtnText: {color: '#fff', fontWeight: 'bold'},

  // Grid Structure - Giving fixed widths for scrollability
  gridHeader: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 2,
    borderBottomColor: '#e2e8f0',
  },
  rowContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    alignItems: 'center',
  },
  rowAlternate: {backgroundColor: '#f8fafc'},

  // Column Widths (Sum total defines the table width)
  colName: {width: 180},
  colStatus: {width: 100, alignItems: 'center'},
  colData: {width: 90, alignItems: 'flex-end'},
  colAction: {width: 70, alignItems: 'flex-end'},

  headerLabel: {fontSize: 11, fontWeight: 'bold', color: '#64748b'},
  primaryText: {fontSize: 14, fontWeight: '600', color: '#1e293b'},
  secondaryText: {fontSize: 11, color: '#94a3b8'},
  priceText: {fontSize: 13, fontWeight: '700', color: '#0f172a'},

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
  editActionText: {fontSize: 12, fontWeight: 'bold', color: '#2563eb'},
});
