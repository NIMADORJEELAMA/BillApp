import React, {useState, useEffect, useMemo, useRef} from 'react';
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
  Modal,
} from 'react-native';
import MainLayout from '../../src/screens/MainLayout';
import axiosInstance from '../services/axiosInstance';
import Toast from 'react-native-toast-message';
// import {printSingleLabel} from '../services/PrintService';
import QRCode from 'react-native-qrcode-svg';
import ViewShot from 'react-native-view-shot';
import LabelTemplate from '../components/Printer/LabelTemplate';
import {printSingleLabel} from '../services/PrintService';
import {BLEPrinter} from 'react-native-thermal-receipt-printer-image-qr';

export default function BulkPrintScreen() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const labelRefs = useRef<{[key: string]: any}>({});
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await axiosInstance.get('/products');
      setProducts(response.data.items || response.data || []);
    } catch (error) {
      Toast.show({type: 'error', text1: 'Load failed'});
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const selectAll = () => {
    if (selectedIds.size === filteredProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map(p => p.id)));
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(
      p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barcode?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [products, searchQuery]);

  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printProgress, setPrintProgress] = useState(0);

  // Filter products based on selection for the Preview Modal
  const itemsToPrint = useMemo(
    () => products.filter(p => selectedIds.has(p.id)),
    [products, selectedIds],
  );
  const startBatchPrint = async () => {
    setIsPrinting(true);
    try {
      for (let i = 0; i < itemsToPrint.length; i++) {
        setPrintProgress(i + 1);
        const item = itemsToPrint[i];
        const ref = labelRefs.current[item.id];

        if (!ref) {
          console.warn(`No ref for item ${item.id}`);
          continue;
        }

        await printSingleLabel(ref);

        // Delay between labels to avoid BT buffer overflow
        if (i < itemsToPrint.length - 1) {
          await new Promise(res => setTimeout(res, 100));
        }
      }
      Alert.alert('Success', 'All labels printed successfully!');
      setIsPreviewVisible(false);
      setSelectedIds(new Set());
    } catch (error: any) {
      Alert.alert('Print Error', error.message);
    } finally {
      setIsPrinting(false);
      setPrintProgress(0);
    }
  };

  const renderItem = ({item}: any) => {
    const isSelected = selectedIds.has(item.id);
    return (
      <TouchableOpacity
        style={[styles.row, isSelected && styles.rowSelected]}
        onPress={() => toggleSelect(item.id)}>
        <View style={styles.checkbox}>
          {isSelected && <View style={styles.checkboxInner} />}
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.barcode}>{item.barcode || 'No Barcode'}</Text>
        </View>
        <View style={styles.qtyContainer}>
          <Text style={styles.price}>₹{item.price}</Text>
          <Text style={styles.stock}>Stock: {item.stockQty}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <MainLayout title="Bulk Label Print" showBack>
      <View style={styles.container}>
        <View style={styles.searchBar}>
          <TextInput
            style={styles.input}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.selectAllBtn} onPress={selectAll}>
            <Text style={styles.btnText}>
              {selectedIds.size === filteredProducts.length
                ? 'Deselect All'
                : 'Select All'}
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" style={{flex: 1}} />
        ) : (
          <FlatList
            data={filteredProducts}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={{paddingBottom: 100}}
          />
        )}

        {/* Floating Print Action Button */}
        <View style={styles.footer}>
          <Text style={styles.footerTotal}>{selectedIds.size} Selected</Text>
          <TouchableOpacity
            style={[
              styles.printBtn,
              selectedIds.size === 0 && {backgroundColor: '#cbd5e1'},
            ]}
            onPress={() => setIsPreviewVisible(true)}
            disabled={selectedIds.size === 0}>
            <Text style={styles.printBtnText}>PREVIEW & PRINT</Text>
          </TouchableOpacity>
        </View>

        {/* --- BATCH PREVIEW MODAL --- */}
        <Modal visible={isPreviewVisible} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Print Preview ({itemsToPrint.length})
              </Text>
              <TouchableOpacity
                onPress={() => !isPrinting && setIsPreviewVisible(false)}>
                <Text style={styles.closeX}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.previewList}>
              {itemsToPrint.map(item => (
                <View key={item.id} style={styles.previewCard}>
                  {/* Live preview shown to user */}
                  <View style={styles.previewInfo}>
                    <Text style={styles.previewName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.previewPrice}>₹{item.price}</Text>
                    <Text style={styles.previewBarcode}>{item.barcode}</Text>
                  </View>

                  <View style={styles.qrContainer}>
                    <QRCode value={item.barcode || '0000'} size={90} ecl="H" />
                  </View>

                  {/* Hidden ViewShot — this is what actually gets printed */}
                  <ViewShot
                    collapsable={false}
                    ref={ref => (labelRefs.current[item.id] = ref)}
                    options={{format: 'png', quality: 1.0}}
                    style={styles.hiddenLabel}>
                    <LabelTemplate
                      name={item.name}
                      price={item.price}
                      barcode={item.barcode || '00000000'}
                    />
                  </ViewShot>
                </View>
              ))}
            </ScrollView>

            <View style={styles.modalFooter}>
              {isPrinting ? (
                <View style={styles.progressBox}>
                  <ActivityIndicator color="#2563eb" />
                  <Text style={styles.progressText}>
                    Printing label {printProgress} of {itemsToPrint.length}...
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.confirmPrintBtn}
                  onPress={startBatchPrint}>
                  <Text style={styles.confirmPrintText}>
                    CONFIRM & START PRINTING
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f1f5f9'},
  searchBar: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    flex: 1,
    height: 45,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  selectAllBtn: {justifyContent: 'center', paddingHorizontal: 10},
  btnText: {color: '#2563eb', fontWeight: 'bold', fontSize: 12},
  row: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
    alignItems: 'center',
  },
  rowSelected: {backgroundColor: '#eff6ff'},
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 2,
    backgroundColor: '#2563eb',
  },
  info: {flex: 1},
  name: {fontSize: 16, fontWeight: '600', color: '#1e293b'},
  barcode: {fontSize: 12, color: '#64748b', marginTop: 2},
  qtyContainer: {alignItems: 'flex-end'},
  price: {fontSize: 14, fontWeight: 'bold', color: '#0f172a'},
  stock: {fontSize: 11, color: '#94a3b8'},
  modalContainer: {flex: 1, backgroundColor: '#f8fafc'},
  modalHeader: {
    padding: 20,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
  },
  modalTitle: {fontSize: 18, fontWeight: 'bold', color: '#1e293b'},
  closeX: {fontSize: 22, color: '#64748b', padding: 5},
  previewList: {padding: 15},
  previewCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  previewInfo: {flex: 1},
  previewName: {fontSize: 15, fontWeight: 'bold', color: '#1e293b'},
  previewPrice: {fontSize: 14, color: '#16a34a', fontWeight: '700'},
  previewBarcode: {fontSize: 12, color: '#64748b', fontStyle: 'italic'},
  qrPlaceholder: {
    width: 50,
    height: 50,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#cbd5e1',
  },
  qrContainer: {
    padding: 5,
    backgroundColor: '#fff',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#eee',
  },
  hiddenLabel: {
    position: 'absolute',
    top: -9999, // pushed off screen, still renders for capture
    left: 0,
    opacity: 0,
  },
  modalFooter: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#e2e8f0',
  },
  confirmPrintBtn: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmPrintText: {color: '#fff', fontWeight: 'bold', fontSize: 16},
  progressBox: {alignItems: 'center', gap: 10},
  progressText: {color: '#1e293b', fontWeight: '600'},
  footer: {
    padding: 15,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#e2e8f0',
  },
  printBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  printBtnText: {color: '#fff', fontWeight: 'bold'},
  footerTotal: {fontWeight: 'bold', color: '#64748b'},
});
