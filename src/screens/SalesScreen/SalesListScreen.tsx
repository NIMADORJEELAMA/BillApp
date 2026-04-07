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
} from 'react-native';
import MainLayout from '../../../src/screens/MainLayout';
import axiosInstance from '../../services/axiosInstance';
import {connectAndPrint} from '../../services/PrinterService';
import Toast from 'react-native-toast-message';
// Note: If you want actual date pickers, import RNDateTimePicker here

export default function SalesListScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sales, setSales] = useState<any[]>([]);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState<string | null>(null); // YYYY-MM-DD

  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedSale, setSelectedSale] = useState<any>(null);

  const fetchSales = useCallback(async (showSpinner = true) => {
    try {
      if (showSpinner) setLoading(true);
      const response = await axiosInstance.get('/sales');
      setSales(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      Toast.show({type: 'error', text1: 'Failed to load sales'});
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  // Optimized Filter Logic
  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const billNo = sale.billNumber.toString();
      const cashier = sale.user?.name?.toLowerCase() || '';
      const search = searchQuery.toLowerCase();

      const matchesSearch = billNo.includes(search) || cashier.includes(search);

      if (!filterDate) return matchesSearch;

      const saleDate = new Date(sale.createdAt).toISOString().split('T')[0];
      return matchesSearch && saleDate === filterDate;
    });
  }, [sales, searchQuery, filterDate]);

  const stats = useMemo(() => {
    const total = filteredSales.reduce(
      (acc, curr) => acc + parseFloat(curr.finalAmount),
      0,
    );
    return {total, count: filteredSales.length};
  }, [filteredSales]);

  const openBill = (sale: any) => {
    setSelectedSale(sale);
    setViewModalVisible(true);
  };

  const handlePrintFromModal = async () => {
    if (!selectedSale) return;
    try {
      const printItems = selectedSale.items.map((i: any) => ({
        name: i.product?.name || 'Product',
        quantity: i.quantity,
        price: parseFloat(i.price),
      }));

      await connectAndPrint(
        printItems,
        parseFloat(selectedSale.totalAmount),
        parseFloat(selectedSale.discount),
        parseFloat(selectedSale.finalAmount),
      );
      Toast.show({type: 'success', text1: 'Printing Receipt...'});
    } catch (error) {
      Toast.show({type: 'error', text1: 'Print failed. Check connection.'});
    }
  };

  const renderSaleItem = ({item}: {item: any}) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => openBill(item)}
      style={styles.saleCard}>
      <View style={styles.cardMain}>
        <View>
          <Text style={styles.billNumber}>Bill #{item.billNumber}</Text>
          <Text style={styles.cashierName}>
            By {item.user?.name || 'Admin'}
          </Text>
          <Text style={styles.dateText}>
            {new Date(item.createdAt).toLocaleDateString()} •{' '}
            {new Date(item.createdAt).toLocaleTimeString([], {
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
              {
                backgroundColor:
                  item.paymentMode === 'CASH' ? '#E0F2FE' : '#DCFCE7',
              },
            ]}>
            <Text style={styles.payText}>{item.paymentMode}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <MainLayout title="Sales History" showBack>
      <View style={styles.container}>
        {/* TOP FILTER BAR */}
        <View style={styles.headerFilter}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search Bill # or Cashier..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <View style={styles.statsRow}>
            <Text style={styles.statsText}>Showing {stats.count} bills</Text>
            <Text style={styles.totalRevenue}>
              Total: ₹{stats.total.toLocaleString()}
            </Text>
          </View>
        </View>

        <FlatList
          data={filteredSales}
          keyExtractor={item => item.id}
          renderItem={renderSaleItem}
          contentContainerStyle={styles.listPadding}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchSales(false)}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No matching sales found</Text>
            </View>
          }
        />

        {/* RE-USED BILL MODAL (Updated for your data) */}
        <Modal visible={viewModalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.billModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Order Details</Text>
                <TouchableOpacity onPress={() => setViewModalVisible(false)}>
                  <Text style={styles.closeX}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView>
                <View style={styles.receiptHeader}>
                  <Text style={styles.storeName}>RETAIL STORE</Text>
                  <Text style={styles.receiptMeta}>
                    Bill No: {selectedSale?.billNumber}
                  </Text>
                  <Text style={styles.receiptMeta}>
                    Date:{' '}
                    {selectedSale &&
                      new Date(selectedSale.createdAt).toLocaleString()}
                  </Text>
                </View>

                <View style={styles.divider} />

                {selectedSale?.items.map((item: any, idx: number) => (
                  <View key={idx} style={styles.itemRow}>
                    <View style={{flex: 2}}>
                      <Text style={styles.productName}>
                        {item.product?.name || 'General Item'}
                      </Text>
                      <Text style={styles.productSub}>
                        ₹{parseFloat(item.price).toFixed(2)} x {item.quantity}
                      </Text>
                    </View>
                    <Text style={styles.itemTotal}>
                      ₹{(item.quantity * parseFloat(item.price)).toFixed(2)}
                    </Text>
                  </View>
                ))}

                <View style={[styles.divider, {marginVertical: 20}]} />

                <View style={styles.rowBetween}>
                  <Text>Subtotal</Text>
                  <Text>₹{selectedSale?.totalAmount}</Text>
                </View>
                <View style={styles.rowBetween}>
                  <Text>Discount</Text>
                  <Text style={{color: 'red'}}>-₹{selectedSale?.discount}</Text>
                </View>
                <View style={[styles.rowBetween, {marginTop: 10}]}>
                  <Text style={styles.grandLabel}>GRAND TOTAL</Text>
                  <Text style={styles.grandPrice}>
                    ₹{selectedSale?.finalAmount}
                  </Text>
                </View>
              </ScrollView>

              <TouchableOpacity
                style={styles.printBtn}
                onPress={handlePrintFromModal}>
                <Text style={styles.printBtnText}>PRINT INVOICE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </MainLayout>
  );
}

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
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
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
