import React, {useState, useEffect, useCallback} from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  ScrollView,
} from 'react-native';
import MainLayout from '../../../src/screens/MainLayout';
import axiosInstance from '../../services/axiosInstance';
import {connectAndPrint} from '../../services/PrinterService';
import Toast from 'react-native-toast-message';

export default function SalesListScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sales, setSales] = useState<any[]>([]);

  // Modal States
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

  const openBill = (sale: any) => {
    setSelectedSale(sale);
    setViewModalVisible(true);
  };

  const handlePrintFromModal = async () => {
    if (!selectedSale) return;
    try {
      const printItems = selectedSale.items.map((i: any) => ({
        name: i.product?.name || 'Unknown',
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
    <View style={styles.saleCard}>
      <View style={styles.cardHeader}>
        <View style={{flex: 1}}>
          <Text style={styles.billNumber}>Bill #{item.billNumber}</Text>
          <Text style={styles.dateText}>
            {new Date(item.createdAt).toLocaleDateString()} • {item.paymentMode}
          </Text>
        </View>
        <View style={{alignItems: 'flex-end'}}>
          <Text style={styles.finalAmt}>
            ₹{parseFloat(item.finalAmount).toFixed(2)}
          </Text>
          <TouchableOpacity
            onPress={() => openBill(item)}
            style={styles.viewBtn}>
            <Text style={styles.viewBtnText}>VIEW BILL</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <MainLayout title="Sales Records" showBack>
      <View style={styles.container}>
        <FlatList
          data={sales}
          keyExtractor={item => item.id}
          renderItem={renderSaleItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchSales(false)}
            />
          }
        />

        {/* BILL DETAIL MODAL */}
        <Modal visible={viewModalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.billModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Tax Invoice</Text>
                <TouchableOpacity onPress={() => setViewModalVisible(false)}>
                  <Text style={styles.closeX}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.billScroll}>
                <Text style={styles.storeName}>RETAIL STORE</Text>
                <Text style={styles.billMeta}>
                  Bill No: {selectedSale?.billNumber}
                </Text>
                <Text style={styles.billMeta}>
                  Date:{' '}
                  {selectedSale &&
                    new Date(selectedSale.createdAt).toLocaleString()}
                </Text>
                <Text style={styles.billMeta}>
                  Cashier: {selectedSale?.user?.name}
                </Text>

                <View style={styles.billDivider} />

                {/* Table Header */}
                <View style={styles.tableRow}>
                  <Text style={[styles.tableH, {flex: 2}]}>ITEM</Text>
                  <Text style={[styles.tableH, {flex: 1, textAlign: 'center'}]}>
                    QTY
                  </Text>
                  <Text style={[styles.tableH, {flex: 1, textAlign: 'right'}]}>
                    TOTAL
                  </Text>
                </View>

                {selectedSale?.items.map((item: any) => (
                  <View key={item.id} style={styles.tableRow}>
                    <View style={{flex: 2}}>
                      <Text style={styles.itemTitle}>{item.product?.name}</Text>
                      <Text style={styles.itemRate}>
                        ₹{parseFloat(item.price).toFixed(2)}
                      </Text>
                    </View>
                    <Text style={[styles.itemQty, {flex: 1}]}>
                      {item.quantity}
                    </Text>
                    <Text style={[styles.itemTotal, {flex: 1}]}>
                      ₹{(item.quantity * parseFloat(item.price)).toFixed(2)}
                    </Text>
                  </View>
                ))}

                <View style={styles.billDivider} />

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryValue}>
                    ₹{parseFloat(selectedSale?.totalAmount || 0).toFixed(2)}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Discount</Text>
                  <Text style={[styles.summaryValue, {color: 'red'}]}>
                    -₹{parseFloat(selectedSale?.discount || 0).toFixed(2)}
                  </Text>
                </View>
                <View style={[styles.summaryRow, {marginTop: 10}]}>
                  <Text style={styles.grandLabel}>GRAND TOTAL</Text>
                  <Text style={styles.grandValue}>
                    ₹{parseFloat(selectedSale?.finalAmount || 0).toFixed(2)}
                  </Text>
                </View>
              </ScrollView>

              <TouchableOpacity
                style={styles.printFullBtn}
                onPress={handlePrintFromModal}>
                <Text style={styles.printFullText}>🖨️ PRINT RECEIPT</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f8fafc'},
  listContent: {padding: 16},
  saleCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  billNumber: {fontSize: 14, fontWeight: '800', color: '#1e293b'},
  dateText: {fontSize: 12, color: '#94a3b8', marginTop: 2},
  finalAmt: {fontSize: 16, fontWeight: '900', color: '#0f172a'},
  viewBtn: {
    marginTop: 8,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  viewBtnText: {fontSize: 10, fontWeight: '800', color: '#2563eb'},

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  billModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '85%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {fontSize: 18, fontWeight: '900', color: '#0f172a'},
  closeX: {fontSize: 20, color: '#94a3b8', fontWeight: 'bold'},

  billScroll: {flex: 1},
  storeName: {
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 5,
  },
  billMeta: {fontSize: 12, color: '#64748b', textAlign: 'center'},
  billDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 15,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderRadius: 1,
  },

  tableRow: {flexDirection: 'row', marginBottom: 12, alignItems: 'center'},
  tableH: {fontSize: 11, fontWeight: '800', color: '#94a3b8'},
  itemTitle: {fontSize: 14, fontWeight: '700', color: '#1e293b'},
  itemRate: {fontSize: 11, color: '#94a3b8'},
  itemQty: {textAlign: 'center', fontSize: 14, fontWeight: '600'},
  itemTotal: {textAlign: 'right', fontSize: 14, fontWeight: '700'},

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  summaryLabel: {fontSize: 14, color: '#64748b'},
  summaryValue: {fontSize: 14, fontWeight: '600'},
  grandLabel: {fontSize: 16, fontWeight: '900', color: '#0f172a'},
  grandValue: {fontSize: 22, fontWeight: '900', color: '#2563eb'},

  printFullBtn: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  printFullText: {color: '#fff', fontWeight: '900', fontSize: 16},
});
