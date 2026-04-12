import React, {useState, useEffect, useMemo, useCallback} from 'react';
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

// 1. Separate Row Component with React.memo to prevent unnecessary re-renders
const ProductRow = React.memo(({item, index, onEdit, onDelete}: any) => {
  const isLowStock = item.stockQty <= (item.minStock || 5);

  return (
    <View style={[styles.rowContainer, index % 2 !== 0 && styles.rowAlternate]}>
      <View style={styles.colName}>
        <Text style={styles.primaryText} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.secondaryText}>{item.barcode || 'NO SKU'}</Text>
      </View>

      <View style={styles.colStatus}>
        <View
          style={[styles.badge, isLowStock ? styles.badgeLow : styles.badgeOk]}>
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
        <Text style={styles.secondaryText}>{item.category?.name || 'N/A'}</Text>
      </View>

      <View style={styles.colAction}>
        <TouchableOpacity onPress={() => onEdit(item)}>
          <Text style={styles.editActionText}>EDIT</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.colAction}>
        <TouchableOpacity onPress={() => onDelete(item.id, item.name)}>
          <Text style={styles.deleteActionText}>DEL</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

export default function ProductListScreen({navigation}: any) {
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Pagination State
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // 2. Optimized Fetching with Server-Side Search & Pagination
  const loadProducts = async (pageNum = 1, isRefreshing = false) => {
    try {
      if (pageNum === 1 && !isRefreshing) setLoading(true);
      if (pageNum > 1) setLoadingMore(true);

      const limit = 20;
      const skip = (pageNum - 1) * limit;

      // Sending search to backend so we don't have to filter locally
      const response = await axiosInstance.get(
        `/products?skip=${skip}&take=${limit}&search=${searchQuery}`,
      );

      const newItems = response.data.items || [];

      setProducts(prev => (pageNum === 1 ? newItems : [...prev, ...newItems]));
      setHasMore(newItems.length === limit);
      setPage(pageNum);
    } catch (error) {
      Toast.show({type: 'error', text1: 'Failed to load products'});
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  // 3. Debounced Search (Wait for user to stop typing)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadProducts(1);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadProducts(1, true);
  }, [searchQuery]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadProducts(page + 1);
    }
  };

  const openEditModal = useCallback((item: any) => {
    setSelectedProduct(item);
    setModalVisible(true);
  }, []);

  const handleDelete = useCallback(async (id: string, name: string) => {
    Alert.alert(
      `Delete ${name}?`,
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
              loadProducts(1);
            } catch (error: any) {
              Toast.show({type: 'error', text1: 'Delete failed'});
            }
          },
        },
      ],
    );
  }, []);

  return (
    <MainLayout title="Inventory" showBack>
      <View style={styles.container}>
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

        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <View>
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
                data={products}
                keyExtractor={item => item.id}
                renderItem={({item, index}) => (
                  <ProductRow
                    item={item}
                    index={index}
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                  />
                )}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                  loadingMore ? (
                    <ActivityIndicator size="small" color="#000" />
                  ) : null
                }
                contentContainerStyle={{paddingBottom: 100}}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                  />
                }
                // Memory & Performance tweaks
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={5}
                removeClippedSubviews={true}
              />
            )}
          </View>
        </ScrollView>

        <ProductFormModal
          isVisible={modalVisible}
          product={selectedProduct}
          onClose={() => setModalVisible(false)}
          onSuccess={() => loadProducts(1)}
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
  deleteActionText: {fontSize: 12, fontWeight: 'bold', color: '#ef4444'},
});
