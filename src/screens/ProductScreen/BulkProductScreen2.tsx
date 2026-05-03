import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import axiosInstance from '../../services/axiosInstance';
import Toast from 'react-native-toast-message';
import {useNavigation} from '@react-navigation/native';

interface Category {
  id: string | number;
  name: string;
}

const UNITS = ['PCS', 'KG', 'G', 'L', 'ML'];

export default function BulkProductScreen2() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // Local state for the "inline" selection logic
  const [selectionActive, setSelectionActive] = useState<{
    id: number;
    type: 'category' | 'unit';
  } | null>(null);

  const [rows, setRows] = useState([
    {
      id: Date.now(),
      name: '',
      price: '',
      costPrice: '',
      barcode: '',
      stockQty: '',
      unit: 'PCS',
      categoryId: '',
      categoryName: 'Select Category',
    },
  ]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axiosInstance.get('/categories');
      setCategories(res.data);
    } catch (e) {
      Toast.show({type: 'error', text1: 'Failed to load categories'});
    }
  };

  const generateBarcode = (id: number) => {
    const currentRow = rows.find(r => r.id === id);
    const prefix =
      currentRow?.name && currentRow.name.length >= 1
        ? currentRow.name.substring(0, 3).toUpperCase().replace(/\s/g, 'X')
        : 'PRD';
    const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
    updateCell(id, 'barcode', `${prefix}-${randomStr}`);
  };

  const addRow = () => {
    setRows(prev => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        name: '',
        price: '',
        costPrice: '',
        barcode: '',
        stockQty: '',
        unit: 'PCS',
        categoryId: '',
        categoryName: 'Select Category',
      },
    ]);
  };

  const updateCell = (id: number, field: string, value: any) => {
    setRows(prev =>
      prev.map(row => (row.id === id ? {...row, [field]: value} : row)),
    );
  };

  const deleteRow = (id: number) => {
    if (rows.length === 1) return;
    setRows(prev => prev.filter(r => r.id !== id));
  };

  const handleSelection = (item: any) => {
    if (!selectionActive) return;
    const {id, type} = selectionActive;

    if (type === 'category') {
      updateCell(id, 'categoryId', item.id);
      updateCell(id, 'categoryName', item.name);
    } else {
      updateCell(id, 'unit', item);
    }
    setSelectionActive(null);
  };

  const handleBulkSave = async () => {
    const isValid = rows.every(r => r.name && r.price && r.categoryId);
    if (!isValid) {
      Toast.show({type: 'error', text1: 'Please fill all required fields'});
      return;
    }

    setLoading(true);
    try {
      const payload = rows.map(r => ({
        name: r.name,
        price: parseFloat(r.price),
        costPrice: parseFloat(r.costPrice) || 0,
        barcode: r.barcode,
        stockQty: parseInt(r.stockQty, 10) || 0,
        unit: r.unit,
        categoryId: r.categoryId,
      }));
      await axiosInstance.post('/products/bulk', {products: payload});
      Toast.show({type: 'success', text1: 'Bulk upload successful'});
      navigation.goBack();
    } catch (e) {
      Toast.show({type: 'error', text1: 'Upload failed'});
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>Inventory Management</Text>
          <Text style={styles.headerTitle}>Bulk Add Products</Text>
        </View>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => navigation.goBack()}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {rows.map((row, index) => (
            <View key={row.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.itemCount}>Item #{index + 1}</Text>
                <TouchableOpacity onPress={() => deleteRow(row.id)}>
                  <Text style={styles.deleteText}>Remove</Text>
                </TouchableOpacity>
              </View>

              {/* Product Name */}
              <TextInput
                style={styles.mainInput}
                placeholder="Product Name *"
                placeholderTextColor="#94a3b8"
                value={row.name}
                onChangeText={v => updateCell(row.id, 'name', v)}
              />

              {/* Pickers Row */}
              <View style={styles.row}>
                <TouchableOpacity
                  style={[styles.selector, {flex: 2}]}
                  onPress={() =>
                    setSelectionActive({id: row.id, type: 'category'})
                  }>
                  <Text style={styles.label}>Category</Text>
                  <Text
                    style={
                      row.categoryId ? styles.valText : styles.placeholderText
                    }>
                    {row.categoryName}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.selector, {flex: 1, marginLeft: 10}]}
                  onPress={() =>
                    setSelectionActive({id: row.id, type: 'unit'})
                  }>
                  <Text style={styles.label}>Unit</Text>
                  <Text style={styles.valText}>{row.unit}</Text>
                </TouchableOpacity>
              </View>

              {/* Pricing & Qty Row */}
              <View style={styles.row}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Price</Text>
                  <TextInput
                    style={styles.innerInput}
                    placeholder="0.00"
                    keyboardType="numeric"
                    value={row.price}
                    onChangeText={v => updateCell(row.id, 'price', v)}
                  />
                </View>
                <View style={[styles.inputContainer, {marginHorizontal: 10}]}>
                  <Text style={styles.label}>Cost</Text>
                  <TextInput
                    style={styles.innerInput}
                    placeholder="0.00"
                    keyboardType="numeric"
                    value={row.costPrice}
                    onChangeText={v => updateCell(row.id, 'costPrice', v)}
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Stock</Text>
                  <TextInput
                    style={styles.innerInput}
                    placeholder="Qty"
                    keyboardType="numeric"
                    value={row.stockQty}
                    onChangeText={v => updateCell(row.id, 'stockQty', v)}
                  />
                </View>
              </View>

              {/* Barcode Field */}
              <View style={styles.barcodeRow}>
                <View style={{flex: 1}}>
                  <Text style={styles.label}>Barcode</Text>
                  <TextInput
                    style={styles.innerInput}
                    placeholder="Manual or Generate"
                    value={row.barcode}
                    onChangeText={v => updateCell(row.id, 'barcode', v)}
                  />
                </View>
                <TouchableOpacity
                  style={styles.genButton}
                  onPress={() => generateBarcode(row.id)}>
                  <Text style={styles.genButtonText}>GENERATE</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.addBtn} onPress={addRow}>
            <Text style={styles.addBtnText}>+ Add Another Product</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Persistent Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveBtn, loading && {opacity: 0.7}]}
          onPress={handleBulkSave}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>
              UPLOAD {rows.length} PRODUCTS
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Inline Selection Overlay (Modern replacement for Modal) */}
      {selectionActive && (
        <View style={styles.overlay}>
          <TouchableOpacity
            style={styles.overlayBlur}
            onPress={() => setSelectionActive(null)}
          />
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>
              Select {selectionActive.type === 'category' ? 'Category' : 'Unit'}
            </Text>
            <ScrollView style={{maxHeight: 300}}>
              {(selectionActive.type === 'category' ? categories : UNITS).map(
                (item, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.sheetItem}
                    onPress={() => handleSelection(item)}>
                    <Text style={styles.sheetItemText}>
                      {selectionActive.type === 'category' ? item.name : item}
                    </Text>
                  </TouchableOpacity>
                ),
              )}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f1f5f9'},
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  headerTitle: {fontSize: 22, fontWeight: 'bold', color: '#0f172a'},
  closeBtn: {padding: 8, backgroundColor: '#f1f5f9', borderRadius: 20},
  closeBtnText: {color: '#64748b', fontWeight: 'bold'},
  scrollContent: {padding: 16, paddingBottom: 100},
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  itemCount: {fontSize: 12, fontWeight: '700', color: '#3b82f6'},
  deleteText: {fontSize: 12, color: '#ef4444', fontWeight: '600'},
  mainInput: {
    fontSize: 16,
    fontWeight: '600',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 8,
    color: '#1e293b',
    marginBottom: 16,
  },
  row: {flexDirection: 'row', marginBottom: 16},
  selector: {
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  valText: {fontSize: 14, color: '#334155', fontWeight: '500'},
  placeholderText: {fontSize: 14, color: '#cbd5e1'},
  inputContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  innerInput: {fontSize: 14, color: '#334155', fontWeight: '600', padding: 0},
  barcodeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  genButton: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 10,
  },
  genButtonText: {color: '#fff', fontSize: 10, fontWeight: '800'},
  addBtn: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3b82f6',
    borderStyle: 'dashed',
    alignItems: 'center',
    marginTop: 8,
  },
  addBtnText: {color: '#3b82f6', fontWeight: '700'},
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  saveBtn: {
    backgroundColor: '#3b82f6',
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  saveBtnText: {color: '#fff', fontWeight: '800', fontSize: 16},
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  overlayBlur: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 20,
    textAlign: 'center',
  },
  sheetItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  sheetItemText: {
    fontSize: 16,
    color: '#334155',
    textAlign: 'center',
    fontWeight: '500',
  },
});
