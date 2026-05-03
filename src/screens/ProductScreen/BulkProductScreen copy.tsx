import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Modal,
  FlatList,
} from 'react-native';
import axiosInstance from '../../services/axiosInstance';
import Toast from 'react-native-toast-message';
import {useNavigation} from '@react-navigation/native';

interface Category {
  id: string | number;
  name: string;
}

const UNITS = ['PCS', 'KG', 'g', 'l', 'ml'];

export default function BulkProductScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerType, setPickerType] = useState<'category' | 'unit'>('category');
  const [activeRowId, setActiveRowId] = useState<number | null>(null);

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

    // Create Prefix from name or default to 'PRD'
    const prefix =
      currentRow?.name && currentRow.name.length >= 1
        ? currentRow.name.substring(0, 3).toUpperCase().replace(/\s/g, 'X')
        : 'PRD';

    // Create random alphanumeric string (Length 5)
    const randomStr = Math.random().toString(36).substring(2, 9).toUpperCase();

    const newBarcode = `${prefix}-${randomStr}`;

    // Update the specific cell
    updateCell(id, 'barcode', newBarcode);
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

  const openPicker = (id: number, type: 'category' | 'unit') => {
    setActiveRowId(id);
    setPickerType(type);
    setPickerVisible(true);
  };

  const handleSelect = (item: any) => {
    if (activeRowId === null) return;
    if (pickerType === 'category') {
      updateCell(activeRowId, 'categoryId', item.id);
      updateCell(activeRowId, 'categoryName', item.name);
    } else {
      updateCell(activeRowId, 'unit', item);
    }
    setPickerVisible(false);
  };

  const handleBulkSave = async () => {
    const isValid = rows.every(
      r => r.name && r.price && r.categoryId && r.barcode,
    );
    if (!isValid) {
      Toast.show({
        type: 'error',
        text1: 'Fill required fields (Name, Price, Category)',
      });
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
      console.log('payload', payload);

      await axiosInstance.post('/products/bulk', {products: payload});
      Toast.show({type: 'success', text1: 'Bulk upload successful'});
    } catch (e) {
      Toast.show({type: 'error', text1: 'Upload failed'});
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bulk Product Upload</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.close}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal>
        <View>
          {/* Header */}
          <View style={styles.row}>
            <Text style={[styles.headerCell, {width: 140}]}>Name*</Text>
            <Text style={[styles.headerCell, {width: 120}]}>Category*</Text>
            <Text style={[styles.headerCell, {width: 80}]}>Unit</Text>
            <Text style={[styles.headerCell, {width: 80}]}>Price</Text>
            <Text style={[styles.headerCell, {width: 80}]}>Cost</Text>
            <Text style={[styles.headerCell, {width: 70}]}>Qty</Text>
            <Text style={[styles.headerCell, {width: 160}]}>Barcode</Text>
            <Text style={[styles.headerCell, {width: 50}]}>Del</Text>
          </View>

          {/* Rows */}
          <ScrollView style={{maxHeight: 450}}>
            {rows.map(row => (
              <View key={row.id} style={styles.row}>
                <TextInput
                  style={[styles.cell, {width: 140}]}
                  value={row.name}
                  placeholder="Name"
                  onChangeText={v => updateCell(row.id, 'name', v)}
                />
                <TouchableOpacity
                  style={[styles.cell, styles.pickerTrigger, {width: 120}]}
                  onPress={() => openPicker(row.id, 'category')}>
                  <Text numberOfLines={1} style={styles.pickerText}>
                    {row.categoryName}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.cell, styles.pickerTrigger, {width: 80}]}
                  onPress={() => openPicker(row.id, 'unit')}>
                  <Text style={styles.pickerText}>{row.unit}</Text>
                </TouchableOpacity>
                <TextInput
                  style={[styles.cell, {width: 80}]}
                  value={row.price}
                  placeholder="0.0"
                  keyboardType="numeric"
                  onChangeText={v => updateCell(row.id, 'price', v)}
                />
                <TextInput
                  style={[styles.cell, {width: 80}]}
                  value={row.costPrice}
                  placeholder="0.0"
                  keyboardType="numeric"
                  onChangeText={v => updateCell(row.id, 'costPrice', v)}
                />
                <TextInput
                  style={[styles.cell, {width: 70}]}
                  value={row.stockQty}
                  placeholder="Qty"
                  keyboardType="numeric"
                  onChangeText={v => updateCell(row.id, 'stockQty', v)}
                />

                {/* Barcode Cell with Generate Button */}
                <View
                  style={[
                    styles.cell,
                    {width: 160, flexDirection: 'row', alignItems: 'center'},
                  ]}>
                  <TextInput
                    style={{flex: 1, padding: 0, fontSize: 13}}
                    value={row.barcode}
                    placeholder="Barcode"
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

      <TouchableOpacity style={styles.addRowBtn} onPress={addRow}>
        <Text style={styles.addRowText}>+ Add Row</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.saveBtn}
        onPress={handleBulkSave}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveText}>SAVE ALL</Text>
        )}
      </TouchableOpacity>

      {/* Picker Modal */}
      <Modal visible={pickerVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Select {pickerType === 'category' ? 'Category' : 'Unit'}
            </Text>
            <FlatList
              data={pickerType === 'category' ? categories : UNITS}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleSelect(item)}>
                  <Text style={styles.modalItemText}>
                    {pickerType === 'category' ? item.name : item}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.closeModal}
              onPress={() => setPickerVisible(false)}>
              <Text style={{color: '#ef4444'}}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, padding: 15, backgroundColor: '#f8fafc'},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {fontSize: 18, fontWeight: 'bold'},
  row: {flexDirection: 'row'},
  headerCell: {
    fontWeight: 'bold',
    padding: 10,
    backgroundColor: '#cbd5e1',
    borderWidth: 0.5,
    borderColor: '#94a3b8',
    textAlign: 'center',
    fontSize: 12,
  },
  cell: {
    padding: 10,
    borderWidth: 0.5,
    borderColor: '#cbd5e1',
    backgroundColor: '#fff',
    fontSize: 13,
    height: 45,
    justifyContent: 'center',
  },
  pickerTrigger: {backgroundColor: '#fdfdfd'},
  pickerText: {fontSize: 13, color: '#334155'},
  // Barcode Generate Button Styles
  genBtn: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 5,
  },
  genBtnText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  deleteBtn: {
    width: 50,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addRowBtn: {
    marginTop: 15,
    padding: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#2563eb',
    alignItems: 'center',
    borderRadius: 8,
  },
  addRowText: {color: '#2563eb', fontWeight: '600'},
  saveBtn: {
    marginTop: 15,
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveText: {color: '#fff', fontWeight: 'bold'},
  close: {fontSize: 22, color: '#64748b'},
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalItem: {
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e2e8f0',
  },
  modalItemText: {fontSize: 16, textAlign: 'center'},
  closeModal: {marginTop: 15, alignItems: 'center'},
});
