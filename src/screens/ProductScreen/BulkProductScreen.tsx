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
import GradientButton from '../../components/Buttons/GradientButton';
import color from '../../assets/Color/color';
import SearchBar from '../../components/Searchbar'; // New SearchBar component

interface Category {
  id: string | number;
  name: string;
}

const UNITS = ['PCS', 'KG', 'g', 'l', 'ml'];

export default function BulkProductScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  // Selection state
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
  const getFilteredData = () => {
    const data = activeSelection?.type === 'category' ? categories : UNITS;
    const filtered = data.filter(item => {
      const name = activeSelection?.type === 'category' ? item.name : item;
      return name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    // If selecting category and search doesn't perfectly match any item, add "Create" option
    if (activeSelection?.type === 'category' && searchQuery.trim().length > 0) {
      const exactMatch = categories.find(
        c => c.name.toLowerCase() === searchQuery.toLowerCase().trim(),
      );
      if (!exactMatch) {
        return [...filtered, {id: 'new', name: searchQuery, isNew: true}];
      }
    }
    return filtered;
  };
  const handleSelect = async (item: any) => {
    if (!activeSelection) return;
    const {id, type} = activeSelection;

    if (type === 'category') {
      if (item.isNew) {
        setLoading(true);
        try {
          const res = await axiosInstance.post('/categories', {
            name: item.name.trim(),
          });
          const newCat = res.data;
          setCategories(prev => [...prev, newCat]);
          updateCell(id, 'categoryId', newCat.id);
          updateCell(id, 'categoryName', newCat.name);
          Toast.show({type: 'success', text1: 'Category created'});
        } catch (e) {
          Toast.show({type: 'error', text1: 'Failed to create category'});
        } finally {
          setLoading(false);
        }
      } else {
        updateCell(id, 'categoryId', item.id);
        updateCell(id, 'categoryName', item.name);
      }
    } else {
      updateCell(id, 'unit', item);
    }

    setActiveSelection(null);
    setSearchQuery(''); // Reset search
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
      {/* THE FLOATING SELECTOR OVERLAY */}
      {activeSelection && (
        <View style={styles.floatingOverlay}>
          <View style={styles.floatingPicker}>
            <View style={styles.pickerHeader}>
              <View style={styles.headerLeft}>
                <Text style={styles.pickerTitle}>
                  {activeSelection.type === 'category' ? 'Category' : 'Unit'}
                </Text>
                <SearchBar
                  style={styles.searchInput}
                  placeholder="Search or type new..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  //  autofocus={true} // Fixed prop name from previous argadfh
                />
              </View>

              <TouchableOpacity
                onPress={() => {
                  setActiveSelection(null);
                  setSearchQuery('');
                }}
                style={styles.closeArea}>
                <Text style={styles.closeText}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={getFilteredData()}
              keyExtractor={(item, i) =>
                item.id ? item.id.toString() : i.toString()
              }
              contentContainerStyle={styles.listContainer}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={[styles.listItem, item.isNew && styles.newItem]}
                  onPress={() => handleSelect(item)}>
                  <Text
                    style={[
                      styles.listItemText,
                      item.isNew && styles.newItemText,
                    ]}>
                    {item.isNew ? `+ Create "${item.name}"` : item.name || item}
                  </Text>
                  {!item.isNew && <View style={styles.arrow} />}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No matches found</Text>
              }
            />
          </View>
        </View>
      )}

      <View style={styles.container}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={styles.row}>
              <Text style={[styles.headerCell, {width: 140}]}>Name*</Text>
              <Text style={[styles.headerCell, {width: 120}]}>Category*</Text>
              <Text style={[styles.headerCell, {width: 80}]}>Unit</Text>
              <Text style={[styles.headerCell, {width: 80}]}>Price</Text>
              <Text style={[styles.headerCell, {width: 80}]}>Cost Price</Text>
              <Text style={[styles.headerCell, {width: 80}]}>Stock Qty</Text>
              <Text style={[styles.headerCell, {width: 150}]}>Barcode</Text>
              <Text style={[styles.headerCell, {width: 50}]}></Text>
            </View>

            <ScrollView style={{maxHeight: 450}}>
              {rows.map(row => (
                <View key={row.id} style={styles.row}>
                  <TextInput
                    style={[styles.cell, {width: 140}]}
                    value={row.name}
                    placeholder="Name"
                    placeholderTextColor="#94a3b8"
                    onChangeText={v => updateCell(row.id, 'name', v)}
                  />
                  <TouchableOpacity
                    style={[styles.cell, styles.pickerTrigger, {width: 120}]}
                    onPress={() =>
                      setActiveSelection({id: row.id, type: 'category'})
                    }>
                    <Text numberOfLines={1} style={styles.pickerText}>
                      {row.categoryName}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.cell, styles.pickerTrigger, {width: 80}]}
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
                  <TextInput
                    style={[styles.cell, {width: 80}]}
                    value={row.costPrice}
                    placeholder="0.0"
                    keyboardType="numeric"
                    onChangeText={v => updateCell(row.id, 'costPrice', v)}
                  />
                  <TextInput
                    style={[styles.cell, {width: 80}]}
                    value={row.stockQty}
                    placeholder="0"
                    keyboardType="numeric"
                    onChangeText={v => updateCell(row.id, 'stockQty', v)}
                  />
                  <View
                    style={[
                      styles.cell,
                      {width: 150, flexDirection: 'row', alignItems: 'center'},
                    ]}>
                    <TextInput
                      style={{
                        flex: 1,
                        padding: 0,
                        fontSize: 12,
                        color: '#1e293b',
                      }}
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
                    <Text style={{color: '#ef4444', fontWeight: 'bold'}}>
                      ✕
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.addRowBtn} onPress={addRow}>
            <Text style={styles.addRowText}>+ Add Row</Text>
          </TouchableOpacity>

          <GradientButton
            title="Upload All"
            onPress={handleBulkSave}
            containerStyle={{marginTop: 10}}
            disabled={loading}
          />
        </View>
      </View>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, padding: 10, backgroundColor: '#f8fafc'},

  // Floating Selector Styles
  floatingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.4)', // Darker dim
    zIndex: 1000,
    padding: 15,
    justifyContent: 'flex-start',
  },
  floatingPicker: {
    backgroundColor: '#fff',
    borderRadius: 12,
    maxHeight: '60%', // Take up top half of screen
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end', // Aligns the Cancel button with the SearchBar input
    paddingHorizontal: 15,
    paddingBottom: 15,
    paddingTop: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerLeft: {
    flex: 1,
    marginRight: 15, // Space between SearchBar and Cancel button
  },
  pickerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  searchInput: {
    // Ensure this style doesn't have a fixed width
    width: '100%',
  },
  closeArea: {
    height: 48, // Match your SearchBar height exactly
    justifyContent: 'center', // Centers the text vertically within that height
    paddingBottom: 0,
  },
  closeText: {
    color: '#ef4444',
    fontWeight: '600',
    fontSize: 15,
  },

  newItem: {
    backgroundColor: '#f0fdf4', // Light green background
    borderBottomColor: '#bbf7d0',
  },
  newItemText: {
    color: '#166534', // Dark green text
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    padding: 20,
    color: '#94a3b8',
    fontSize: 14,
  },

  listContainer: {paddingVertical: 5},
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f1f5f9',
  },
  listItemText: {fontSize: 15, color: '#334155'},
  arrow: {
    width: 8,
    height: 8,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: '#cbd5e1',
    transform: [{rotate: '45deg'}],
  },

  // Table Styles
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
    height: 48,
    justifyContent: 'center',
    color: '#1e293b',
  },
  pickerTrigger: {backgroundColor: '#f8fafc'},
  pickerText: {fontSize: 12, color: '#334155', fontWeight: '500'},
  genBtn: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  genBtnText: {color: 'white', fontSize: 9, fontWeight: '900'},
  deleteBtn: {
    width: 50,
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {marginTop: 'auto', paddingBottom: 20},
  addRowBtn: {
    marginTop: 10,
    padding: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: color.themeBlue,
    alignItems: 'center',
    borderRadius: 8,
  },
  addRowText: {color: color.themeBlue, fontWeight: '700'},
  saveBtn: {
    marginTop: 12,
    backgroundColor: '#0f172a', // Dark theme button
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveText: {color: '#fff', fontWeight: '800', letterSpacing: 1.5},
});
