import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  FlatList,
  Text,
} from 'react-native';
import axiosInstance from '../../services/axiosInstance';
import Toast from 'react-native-toast-message';
import {useNavigation} from '@react-navigation/native';
import MainLayout from '../../screens/MainLayout'; // Adjust path

interface Category {
  id: string | number;
  name: string;
}

const UNITS = ['PCS', 'KG', 'g', 'l', 'ml'];

export default function BulkProductScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // Selection state (replaces Modal)
  const [activeSelection, setActiveSelection] = useState<{
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
      categoryName: 'Select Cat...',
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
        categoryName: 'Select Cat...',
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

  const handleSelect = (item: any) => {
    if (!activeSelection) return;
    const {id, type} = activeSelection;

    if (type === 'category') {
      updateCell(id, 'categoryId', item.id);
      updateCell(id, 'categoryName', item.name);
    } else {
      updateCell(id, 'unit', item);
    }
    setActiveSelection(null);
  };

  const handleBulkSave = async () => {
    const isValid = rows.every(
      r => r.name && r.price && r.categoryId && r.barcode,
    );
    if (!isValid) {
      Toast.show({type: 'error', text1: 'Missing required fields'});
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
    <MainLayout
      title="Bulk Upload"
      subtitle={`${rows.length} Products`}
      showBack={true}>
      <View style={styles.container}>
        {/* Inline Selection List (Visible only when picking) */}
        {activeSelection && (
          <View style={styles.inlinePicker}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>
                Select {activeSelection.type}
              </Text>
              <TouchableOpacity onPress={() => setActiveSelection(null)}>
                <Text style={{color: '#ef4444'}}>Close</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              horizontal
              data={activeSelection.type === 'category' ? categories : UNITS}
              keyExtractor={(_, i) => i.toString()}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={styles.chip}
                  onPress={() => handleSelect(item)}>
                  <Text style={styles.chipText}>
                    {activeSelection.type === 'category' ? item.name : item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            {/* Table Header */}
            <View style={styles.row}>
              <Text style={[styles.headerCell, {width: 140}]}>Name*</Text>
              <Text style={[styles.headerCell, {width: 120}]}>Category*</Text>
              <Text style={[styles.headerCell, {width: 80}]}>Unit</Text>
              <Text style={[styles.headerCell, {width: 80}]}>Price</Text>
              <Text style={[styles.headerCell, {width: 150}]}>Barcode</Text>
              <Text style={[styles.headerCell, {width: 50}]}></Text>
            </View>

            {/* Table Body */}
            <ScrollView style={{maxHeight: 400}}>
              {rows.map(row => (
                <View key={row.id} style={styles.row}>
                  <TextInput
                    style={[styles.cell, {width: 140}]}
                    value={row.name}
                    placeholder="Name"
                    onChangeText={v => updateCell(row.id, 'name', v)}
                  />
                  <TouchableOpacity
                    style={[
                      styles.cell,
                      styles.pickerTrigger,
                      {width: 120},
                      activeSelection?.id === row.id &&
                        activeSelection.type === 'category' &&
                        styles.activeCell,
                    ]}
                    onPress={() =>
                      setActiveSelection({id: row.id, type: 'category'})
                    }>
                    <Text numberOfLines={1} style={styles.pickerText}>
                      {row.categoryName}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.cell,
                      styles.pickerTrigger,
                      {width: 80},
                      activeSelection?.id === row.id &&
                        activeSelection.type === 'unit' &&
                        styles.activeCell,
                    ]}
                    onPress={() =>
                      setActiveSelection({id: row.id, type: 'unit'})
                    }>
                    <Text style={styles.pickerText}>{row.unit}</Text>
                  </TouchableOpacity>

                  <TextInput
                    style={[styles.cell, {width: 80}]}
                    value={row.price}
                    placeholder="0.0"
                    keyboardType="numeric"
                    onChangeText={v => updateCell(row.id, 'price', v)}
                  />

                  <View
                    style={[
                      styles.cell,
                      {width: 150, flexDirection: 'row', alignItems: 'center'},
                    ]}>
                    <TextInput
                      style={{flex: 1, padding: 0, fontSize: 12}}
                      value={row.barcode}
                      onChangeText={v => updateCell(row.id, 'barcode', v)}
                    />
                    <TouchableOpacity
                      style={styles.genBtn}
                      onPress={() => generateBarcode(row.id)}>
                      <Text style={styles.genBtnText}>GEN</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => deleteRow(row.id)}>
                    <Text style={{color: 'white'}}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.addRowBtn} onPress={addRow}>
            <Text style={styles.addRowText}>+ Add Product Row</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleBulkSave}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveText}>SAVE ALL PRODUCTS</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, padding: 10},
  row: {flexDirection: 'row'},
  headerCell: {
    fontWeight: '700',
    padding: 10,
    backgroundColor: '#f1f5f9',
    borderWidth: 0.5,
    borderColor: '#e2e8f0',
    textAlign: 'center',
    fontSize: 11,
    color: '#475569',
  },
  cell: {
    padding: 8,
    borderWidth: 0.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
    fontSize: 13,
    height: 45,
    justifyContent: 'center',
  },
  activeCell: {borderColor: '#2563eb', backgroundColor: '#eff6ff'},
  pickerTrigger: {backgroundColor: '#f8fafc'},
  pickerText: {fontSize: 12, color: '#334155'},
  inlinePicker: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 3,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  pickerTitle: {fontSize: 12, fontWeight: 'bold', color: '#64748b'},
  chip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  chipText: {fontSize: 12, color: '#1e293b'},
  genBtn: {backgroundColor: '#3b82f6', padding: 4, borderRadius: 4},
  genBtnText: {color: 'white', fontSize: 9, fontWeight: 'bold'},
  deleteBtn: {
    width: 50,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {marginTop: 'auto', paddingBottom: 20},
  addRowBtn: {
    marginTop: 10,
    padding: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#64748b',
    alignItems: 'center',
    borderRadius: 8,
  },
  addRowText: {color: '#64748b', fontWeight: '600'},
  saveBtn: {
    marginTop: 10,
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveText: {color: '#fff', fontWeight: 'bold', letterSpacing: 1},
});
