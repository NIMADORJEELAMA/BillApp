import React, {useState, useEffect, useCallback, useMemo} from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Modal,
  ScrollView,
  TextInput,
  Platform,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import MainLayout from '../../../src/screens/MainLayout';
import axiosInstance from '../../services/axiosInstance';
import {connectAndPrint} from '../../services/PrinterService';
import Toast from 'react-native-toast-message';
import ReceiptViewModal from '../../components/Printer/ReceiptViewModal';

// Move static components outside to prevent re-creation
const ListEmptyComponent = () => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyText}>No matching sales found</Text>
  </View>
);

export default function SalesListScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sales, setSales] = useState<any[]>([]);
  console.log('sales', sales);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  console.log('searchQuery', searchQuery);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState<'start' | 'end' | null>(null);

  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedSale, setSelectedSale] = useState<any>(null);
  console.log('selectedSale', selectedSale);

  // 1. Single Source of Truth: Fetch from API
  // const fetchSales = useCallback(
  //   async (showSpinner = true) => {
  //     try {
  //       if (showSpinner) setLoading(true);

  //       const params = {
  //         ...(searchQuery && {search: searchQuery}),
  //         ...(startDate && {startDate: startDate.toISOString()}),
  //         ...(endDate && {endDate: endDate.toISOString()}),
  //       };

  //       const response = await axiosInstance.get('/sales', {params});
  //       setSales(Array.isArray(response.data) ? response.data : []);
  //     } catch (error) {
  //       Toast.show({type: 'error', text1: 'Failed to load sales'});
  //     } finally {
  //       setLoading(false);
  //       setRefreshing(false);
  //     }
  //   },
  //   [searchQuery, startDate, endDate],
  // );

  // 2. Debounced Effect
  // useEffect(() => {
  //   const handler = setTimeout(() => fetchSales(true), 500);
  //   return () => clearTimeout(handler);
  // }, [fetchSales]);
  function useDebounce(value: any, delay: number) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
  }
  const debouncedSearch = useDebounce(searchQuery, 400);
  const debouncedStartDate = useDebounce(startDate, 400);
  const debouncedEndDate = useDebounce(endDate, 400);
  const filters = useMemo(() => {
    return {
      ...(debouncedSearch && {search: debouncedSearch}),
      ...(debouncedStartDate && {
        startDate: debouncedStartDate.toISOString(),
      }),
      ...(debouncedEndDate && {
        endDate: debouncedEndDate.toISOString(),
      }),
    };
  }, [debouncedSearch, debouncedStartDate, debouncedEndDate]);
  const fetchSales = useCallback(
    async (showSpinner = true) => {
      try {
        if (showSpinner) setLoading(true);

        const response = await axiosInstance.get('/sales', {
          params: filters,
        });
        console.log('API CALL', filters);

        setSales(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        Toast.show({type: 'error', text1: 'Failed to load sales'});
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [filters],
  );
  console.log('fetchSales', fetchSales);
  useEffect(() => {
    fetchSales(true);
  }, [fetchSales]);
  useEffect(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // end of day

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);
    oneWeekAgo.setHours(0, 0, 0, 0); // start of day

    setStartDate(oneWeekAgo);
    setEndDate(today);
  }, []);
  // 3. Optimized Handlers
  const onDateChange = useCallback(
    (event: any, selectedDate?: Date) => {
      if (Platform.OS === 'android') setShowPicker(null);
      if (event.type === 'set' && selectedDate) {
        if (showPicker === 'start') setStartDate(selectedDate);
        else if (showPicker === 'end') setEndDate(selectedDate);
      }
    },
    [showPicker],
  );

  const openBill = useCallback((sale: any) => {
    setSelectedSale(sale);
    setViewModalVisible(true);
  }, []);

  const handlePrintFromModal = useCallback(async () => {
    if (!selectedSale) return;
    try {
      const printItems = selectedSale.items.map((i: any) => ({
        name: i.product?.name || 'Product',
        quantity: i.quantity,
        price: parseFloat(i.price),
      }));
      connectAndPrint(selectedSale);
      // await connectAndPrint(
      //   printItems,
      //   parseFloat(selectedSale.totalAmount),
      //   parseFloat(selectedSale.discount),
      //   parseFloat(selectedSale.finalAmount),
      // );
      Toast.show({type: 'success', text1: 'Printing Receipt...'});
    } catch (error) {
      Toast.show({type: 'error', text1: 'Print failed. Check connection.'});
    }
  }, [selectedSale]);

  const stats = useMemo(() => {
    return sales.reduce(
      (acc, curr) => {
        acc.total += parseFloat(curr.finalAmount || 0);
        acc.count += 1;
        return acc;
      },
      {total: 0, count: 0},
    );
  }, [sales]);

  // 5. Separate Render Item for Performancedfgasdfasd f
  const SaleItem = React.memo(({item, onPress}: any) => {
    const isCash = item.paymentMode === 'CASH';
    const date = new Date(item.createdAt);

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onPress(item)}
        style={styles.saleCard}>
        <View style={styles.cardMain}>
          <View>
            <Text style={styles.billNumber}>Bill #{item.billNumber}</Text>
            <Text style={styles.cashierName}>
              By {item.user?.name || 'Admin'}
            </Text>
            <Text style={styles.dateText}>
              {date.toLocaleDateString()} •{' '}
              {date.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>

          <View style={{alignItems: 'flex-end'}}>
            <Text style={styles.finalAmt}>
              ₹{parseFloat(item.finalAmount).toFixed(2)}
            </Text>

            <View
              style={[
                styles.payBadge,
                {backgroundColor: isCash ? '#E0F2FE' : '#DCFCE7'},
              ]}>
              <Text style={styles.payText}>{item.paymentMode}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  });
  const renderSaleItem = useCallback(
    ({item}: {item: any}) => {
      return <SaleItem item={item} onPress={openBill} />;
    },
    [openBill],
  );

  return (
    <MainLayout title="Sales History" showBack>
      <View style={styles.container}>
        <View style={styles.headerFilter}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search Bill # or Cashier..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />

          <View style={styles.dateRangeContainer}>
            <DateButton
              label="FROM"
              date={startDate}
              onPress={() => setShowPicker('start')}
            />
            <DateButton
              label="TO"
              date={endDate}
              onPress={() => setShowPicker('end')}
            />

            {(startDate || endDate) && (
              <TouchableOpacity
                style={styles.resetBtn}
                onPress={() => {
                  setStartDate(null);
                  setEndDate(null);
                }}>
                <Text style={styles.resetBtnText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.statsRow}>
            <Text style={styles.statsText}>Showing {stats.count} bills</Text>
            <Text style={styles.totalRevenue}>
              Total: ₹{stats.total.toLocaleString()}
            </Text>
          </View>
        </View>

        {showPicker && (
          <DateTimePicker
            value={(showPicker === 'start' ? startDate : endDate) || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
          />
        )}

        <FlatList
          data={sales}
          keyExtractor={item => item.id}
          renderItem={renderSaleItem}
          contentContainerStyle={styles.listPadding}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          removeClippedSubviews={true}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchSales(false)}
            />
          }
          ListEmptyComponent={
            loading ? (
              <ActivityIndicator style={{marginTop: 20}} />
            ) : (
              ListEmptyComponent
            )
          }
        />

        <ReceiptViewModal
          isVisible={viewModalVisible}
          onClose={() => setViewModalVisible(false)}
          sale={selectedSale}
          onPrint={handlePrintFromModal}
        />
      </View>
    </MainLayout>
  );
}

// Sub-component for Date Buttons
const DateButton = ({label, date, onPress}: any) => (
  <TouchableOpacity style={styles.dateBtn} onPress={onPress}>
    <Text style={styles.dateBtnLabel}>{label}</Text>
    <Text style={styles.dateBtnValue}>
      {date ? date.toLocaleDateString() : 'Select'}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F8FAFC'},
  headerFilter: {
    backgroundColor: '#FFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  searchInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 45,
    fontSize: 14,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  dateRangeContainer: {flexDirection: 'row', alignItems: 'center', gap: 8},
  dateBtn: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  dateBtnLabel: {fontSize: 9, fontWeight: '800', color: '#94A3B8'},
  dateBtnValue: {fontSize: 13, fontWeight: '600', color: '#1E293B'},
  resetBtn: {
    backgroundColor: '#F1F5F9',
    width: 35,
    height: 35,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetBtnText: {color: '#64748B', fontWeight: 'bold'},
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    alignItems: 'center',
  },
  statsText: {fontSize: 12, color: '#64748B', fontWeight: '600'},
  totalRevenue: {fontSize: 14, fontWeight: '800', color: '#2563EB'},
  listPadding: {padding: 12},
  saleCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billNumber: {fontSize: 15, fontWeight: 'bold', color: '#0F172A'},
  cashierName: {fontSize: 12, color: '#64748B', marginVertical: 2},
  dateText: {fontSize: 11, color: '#94A3B8'},
  finalAmt: {fontSize: 18, fontWeight: '900', color: '#0F172A'},
  payBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 5,
    marginTop: 5,
  },
  payText: {fontSize: 10, fontWeight: 'bold', color: '#1E293B'},
  emptyState: {alignItems: 'center', marginTop: 50},
  emptyText: {color: '#94A3B8'},
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  billModal: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {fontSize: 18, fontWeight: 'bold'},
  closeX: {fontSize: 22, color: '#94A3B8'},
  receiptHeader: {alignItems: 'center', marginBottom: 15},
  storeName: {fontSize: 18, fontWeight: '900'},
  receiptMeta: {fontSize: 12, color: '#64748B'},
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderRadius: 1,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  productName: {fontSize: 14, fontWeight: '700', color: '#1E293B'},
  productSub: {fontSize: 12, color: '#94A3B8'},
  itemTotal: {fontSize: 14, fontWeight: 'bold'},
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  grandLabel: {fontSize: 16, fontWeight: 'bold'},
  grandPrice: {fontSize: 22, fontWeight: '900', color: '#2563EB'},
  printBtn: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  printBtnText: {color: '#FFF', fontWeight: 'bold', fontSize: 16},
});
