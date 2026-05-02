import React, {useState, useEffect, useMemo, useRef} from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  Modal,
  RefreshControl,
} from 'react-native';
import MainLayout from '../../src/screens/MainLayout';
import axiosInstance from '../services/axiosInstance';
import Toast from 'react-native-toast-message';
import QRCode from 'react-native-qrcode-svg';
import LabelTemplate from '../components/Printer/LabelTemplate';
import {printSingleLabel} from '../services/PrintService';
import GradientButton from '../components/Buttons/GradientButton';
import color from '../assets/Color/color';

export default function BulkPrintScreen() {
  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [printQtys, setPrintQtys] = useState<{[key: string]: number}>({});
  const labelRefs = useRef<{[key: string]: View | null}>({});

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
      setRefreshing(false);
    }
  };
  const onRefresh = () => {
    setRefreshing(true);
    loadProducts();
  };
  const filteredProducts = useMemo(() => {
    return products.filter(
      p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barcode?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [products, searchQuery]);

  const toggleSelect = (id: string) => {
    setPrintQtys(prev => {
      const next = {...prev};
      if (next[id]) {
        delete next[id];
      } else {
        next[id] = 1;
      }
      return next;
    });
  };

  const updateQty = (id: string, delta: number) => {
    setPrintQtys(prev => {
      const currentQty = prev[id] || 0;
      const newQty = Math.max(0, currentQty + delta);
      const next = {...prev};
      if (newQty === 0) {
        delete next[id];
      } else {
        next[id] = newQty;
      }
      return next;
    });
  };

  const selectAll = () => {
    const selectedCount = Object.keys(printQtys).length;
    if (
      selectedCount === filteredProducts.length &&
      filteredProducts.length > 0
    ) {
      setPrintQtys({});
    } else {
      const allSelected: {[key: string]: number} = {};
      filteredProducts.forEach(p => {
        allSelected[p.id] = 1;
      });
      setPrintQtys(allSelected);
    }
  };

  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printProgress, setPrintProgress] = useState(0);

  const itemsToPrint = useMemo(
    () => products.filter(p => printQtys[p.id] > 0),
    [products, printQtys],
  );

  const startBatchPrint = async () => {
    setIsPrinting(true);
    try {
      let currentLabelCount = 0;
      const totalLabels = Object.values(printQtys).reduce((a, b) => a + b, 0);

      for (const item of itemsToPrint) {
        const qty = printQtys[item.id];
        const ref = labelRefs.current[item.id];
        if (!ref) continue;

        for (let j = 0; j < qty; j++) {
          currentLabelCount++;
          setPrintProgress(currentLabelCount);
          await printSingleLabel(ref);
          await new Promise(res => setTimeout(res, 400));
        }
      }
      Alert.alert('Success', `Printed ${totalLabels} labels!`);
      setIsPreviewVisible(false);
      setPrintQtys({});
    } catch (error: any) {
      Alert.alert('Print Error', error.message);
    } finally {
      setIsPrinting(false);
      setPrintProgress(0);
    }
  };

  const ListHeader = () => (
    <View style={styles.headerRow}>
      <View style={styles.headerCheckboxSpace} />
      <Text style={[styles.headerText, {width: 150}]}>Product Name</Text>
      <Text style={[styles.headerText, {width: 120, textAlign: 'center'}]}>
        Print Qty
      </Text>
      <Text style={[styles.headerText, {width: 80, textAlign: 'center'}]}>
        Price
      </Text>
      <Text style={[styles.headerText, {width: 80, textAlign: 'center'}]}>
        Stock
      </Text>
    </View>
  );

  const renderItem = ({item}: any) => {
    const qty = printQtys[item.id] || 0;
    return (
      <View style={[styles.row, qty > 0 && styles.rowSelected]}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => toggleSelect(item.id)}>
          {qty > 0 && <View style={styles.checkboxInner} />}
        </TouchableOpacity>

        <View style={[styles.info, {width: 150}]}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.barcode}>{item.barcode || 'No Barcode'}</Text>
        </View>
        <View style={[styles.qtySelector, {width: 120}]}>
          <TouchableOpacity
            onPress={() => updateQty(item.id, -1)}
            style={styles.qtyBtn}>
            <Text style={styles.qtyBtnText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.qtyText}>{qty}</Text>
          <TouchableOpacity
            onPress={() => updateQty(item.id, 1)}
            style={styles.qtyBtn}>
            <Text style={styles.qtyBtnText}>+</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.dataColumn}>
          <Text style={styles.priceText}>₹{item.price}</Text>
        </View>

        <View style={styles.dataColumn}>
          <Text
            style={[styles.stockText, item.stockQty < 10 && {color: 'red'}]}>
            {item.stockQty}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <MainLayout title="Bulk Label Print" showBack>
      <View style={styles.container}>
        {/* Hidden rendering for printing logic */}
        {itemsToPrint.map(item => (
          <View
            key={`print-${item.id}`}
            collapsable={false}
            ref={ref => (labelRefs.current[item.id] = ref)}
            style={styles.hiddenLabel}>
            <LabelTemplate
              name={item.name}
              price={item.price}
              barcode={item.barcode || '00000000'}
            />
          </View>
        ))}

        <View style={styles.searchBar}>
          <TextInput
            style={styles.input}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.selectAllBtn} onPress={selectAll}>
            <Text style={styles.btnText}>
              {Object.keys(printQtys).length === filteredProducts.length &&
              filteredProducts.length > 0
                ? 'Deselect All'
                : 'Select All'}
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" style={{flex: 1}} />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <View style={{width: 520}}>
              <ListHeader />
              <FlatList
                data={filteredProducts}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={{paddingBottom: 100}}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={[color.themeBlue]} // Android spinner color
                    tintColor={color.themeBlue} // iOS spinner color
                  />
                }
              />
            </View>
          </ScrollView>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerTotal}>
            {Object.keys(printQtys).length} Selected
          </Text>
          <GradientButton
            title="SAVE & PRINT"
            onPress={() => setIsPreviewVisible(true)}
            containerStyle={styles.btnPrimary}
          />
        </View>

        {/* Modal Logic */}
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
            <ScrollView
              style={{flex: 1}}
              contentContainerStyle={styles.previewList}>
              {itemsToPrint.map(item => (
                <View key={`preview-${item.id}`} style={styles.previewCard}>
                  <View style={styles.previewInfo}>
                    <Text style={styles.previewName}>{item.name}</Text>
                    <Text style={styles.previewPrice}>₹{item.price}</Text>
                    <Text style={styles.previewBarcode}>{item.barcode}</Text>
                  </View>
                  <QRCode value={item.barcode || '0000'} size={60} />
                </View>
              ))}
            </ScrollView>
            <View style={styles.modalFooter}>
              {isPrinting ? (
                <View style={styles.progressBox}>
                  <ActivityIndicator color="#2563eb" />
                  <Text style={styles.progressText}>
                    Printing {printProgress} items...
                  </Text>
                </View>
              ) : (
                // <TouchableOpacity
                //   style={styles.confirmPrintBtn}
                //   onPress={startBatchPrint}>
                //   <Text style={styles.confirmPrintText}>START PRINTING</Text>
                // </TouchableOpacity>

                <GradientButton
                  title="START PRINTING"
                  onPress={startBatchPrint}
                />
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
  headerRow: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 2,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  headerCheckboxSpace: {width: 24, marginRight: 15},
  headerText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748b',
    textTransform: 'uppercase',
  },
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
  info: {justifyContent: 'center'},
  name: {fontSize: 14, fontWeight: '600', color: '#1e293b'},
  barcode: {fontSize: 11, color: '#64748b'},
  dataColumn: {width: 80, alignItems: 'center'},
  priceText: {fontSize: 14, fontWeight: 'bold', color: '#0f172a'},
  stockText: {fontSize: 14, fontWeight: '600', color: '#64748b'},
  qtySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  qtyBtn: {
    width: 30,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnText: {fontSize: 20, fontWeight: 'bold', color: '#2563eb'},
  qtyText: {fontWeight: 'bold', fontSize: 14, color: '#1e293b'},
  footer: {
    padding: 15,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#e2e8f0',
  },
  btnPrimary: {flex: 0.7},
  footerTotal: {fontWeight: 'bold', color: '#64748b'},
  hiddenLabel: {position: 'absolute', left: -9999, opacity: 0},
  modalContainer: {flex: 1, backgroundColor: '#f8fafc'},
  modalHeader: {
    padding: 20,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
  },
  modalTitle: {fontSize: 18, fontWeight: 'bold'},
  closeX: {fontSize: 22, color: '#64748b'},
  previewList: {padding: 15},
  previewCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  previewInfo: {flex: 1},
  previewName: {fontSize: 15, fontWeight: 'bold'},
  previewPrice: {fontSize: 14, color: '#16a34a', fontWeight: '700'},
  previewBarcode: {fontSize: 12, color: '#64748b'},
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
  confirmPrintText: {color: '#fff', fontWeight: 'bold'},
  progressBox: {alignItems: 'center'},
  progressText: {marginTop: 10, fontWeight: '600'},
});
