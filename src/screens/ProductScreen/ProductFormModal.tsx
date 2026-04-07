import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import axiosInstance from '../../services/axiosInstance';
import Toast from 'react-native-toast-message';
import ProductQrCodeCard from './ProductQrCodeCard';
import AppInput from '../../components/Input/AppInput';
import SearchableDropdown from '../../components/SearchableDropdown';
import CustomDropdown from '../../components/CustomDropdown';

interface ProductFormModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product?: any;
}

export default function ProductFormModal({
  isVisible,
  onClose,
  onSuccess,
  product,
}: ProductFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [createdProduct, setCreatedProduct] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);

  const [form, setForm] = useState({
    name: '',
    price: '',
    costPrice: '',
    barcode: '',
    stockQty: '',
    unit: 'KG',
    categoryId: '',
  });

  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [focusedField, setFocusedField] = useState('');

  useEffect(() => {
    if (isVisible) fetchCategories();
  }, [isVisible]);

  const fetchCategories = async () => {
    try {
      const res = await axiosInstance.get('/categories');
      setCategories(res.data);
    } catch (e) {
      console.error('Failed to load categories');
    }
  };

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSelectCategory = (cat: any) => {
    setSelectedCategory(cat);
    setForm(prev => ({...prev, categoryId: cat.id}));
    setSearchQuery(cat.name);
    setIsDropdownVisible(false);
  };
  const DEMO_CATEGORIES = [
    {label: 'Fruits & Vegetables', value: 'cat_01'},
    {label: 'Dairy & Eggs', value: 'cat_02'},
    {label: 'Beverages', value: 'cat_03'},
    {label: 'Meat & Seafood', value: 'cat_04'},
    {label: 'Bakery', value: 'cat_05'},
    {label: 'Frozen Foods', value: 'cat_06'},
    {label: 'Pantry Staples', value: 'cat_07'},
    {label: 'Snacks & Sweets', value: 'cat_08'},
    {label: 'Household Supplies', value: 'cat_09'},
    {label: 'Personal Care', value: 'cat_10'},
  ];

  const isCreatingNewCategory =
    searchQuery.length > 0 &&
    !categories.some(c => c.name.toLowerCase() === searchQuery.toLowerCase());

  useEffect(() => {
    if (!isVisible) return;

    if (product) {
      setForm({
        name: product.name || '',
        price: product.price?.toString() || '',
        costPrice: product.costPrice?.toString() || '',
        barcode: product.barcode || '',
        stockQty: product.stockQty?.toString() || '',
        unit: product.unit || 'KG',
        categoryId: product.categoryId || '',
      });

      if (product.categoryId && categories.length > 0) {
        const existingCat = categories.find(c => c.id === product.categoryId);

        if (existingCat) {
          setSelectedCategory(existingCat);
          setSearchQuery(existingCat.name);
        } else {
          setSelectedCategory(null);
          setSearchQuery('');
        }
      } else {
        setSelectedCategory(null);
        setSearchQuery('');
      }
    } else {
      setForm({
        name: '',
        price: '',
        costPrice: '',
        barcode: '',
        stockQty: '',
        unit: 'KG',
        categoryId: '',
      });
      setSelectedCategory(null);
      setSearchQuery('');
    }
  }, [isVisible, product, categories]);

  const handleInputChange = (field: string, value: string) => {
    setForm(prev => ({...prev, [field]: value}));
  };

  const generateBarcode = () => {
    const prefix = form.name
      ? form.name.substring(0, 3).toUpperCase().replace(/\s/g, 'X')
      : 'PRD';

    const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
    const newBarcode = `${prefix}-${randomStr}`;

    handleInputChange('barcode', newBarcode);
  };

  const handleSave = async (shouldPrint: boolean = false) => {
    if (!form.name || !form.price || !form.stockQty) {
      Toast.show({type: 'error', text1: 'Please fill required fields'});
      return;
    }

    setLoading(true);
    try {
      let finalCategoryId = form.categoryId;

      if (!selectedCategory && isCreatingNewCategory) {
        const catRes = await axiosInstance.post('/categories', {
          name: searchQuery.trim(),
        });
        finalCategoryId = catRes.data.id;
      }

      const payload = {
        ...form,
        categoryId: finalCategoryId || null,
        price: parseFloat(form.price),
        costPrice: parseFloat(form.costPrice) || 0,
        stockQty: parseInt(form.stockQty, 10),
      };

      let response;

      if (product?._id) {
        response = await axiosInstance.put(`/products/${product._id}`, payload);
      } else {
        response = await axiosInstance.post('/products', payload);
      }

      const savedData = response.data;

      Toast.show({
        type: 'success',
        text1: product ? 'Product updated!' : 'Product created!',
      });

      if (shouldPrint) {
        setCreatedProduct({
          name: payload.name,
          price: payload.price,
          barcode: savedData.barcode || payload.barcode,
        });
        setShowPrintModal(true);
      } else {
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Save failed',
        text2: error.response?.data?.message || 'Server error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={isVisible} animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback
        onPress={() => {
          setIsDropdownVisible(false);
          Keyboard.dismiss();
        }}>
        <View style={{flex: 1}}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {product ? 'Edit Product' : 'Add Product'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeX}>✕</Text>
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{flex: 1}}>
            <ScrollView
              contentContainerStyle={styles.container}
              keyboardShouldPersistTaps="handled">
              {/* CARD 1 */}

              <View style={styles.card}>
                <AppInput
                  label="Product Name"
                  required
                  value={form.name}
                  placeholder="Enter product name"
                  onChangeText={v => handleInputChange('name', v)}
                />

                <View style={styles.row}>
                  <View style={{flex: 1}}>
                    <AppInput
                      label="Selling Price"
                      required
                      containerStyle={{flex: 1}}
                      keyboardType="numeric"
                      value={form.price}
                      placeholder="0.00"
                      onChangeText={v => handleInputChange('price', v)}
                    />
                  </View>

                  <View style={{flex: 1}}>
                    <AppInput
                      label="Cost"
                      containerStyle={{flex: 1}}
                      keyboardType="numeric"
                      placeholder="0.00"
                      value={form.costPrice}
                      onChangeText={v => handleInputChange('costPrice', v)}
                    />
                  </View>
                </View>
              </View>

              {/* CARD 2 */}
              <View style={styles.card}>
                <View style={styles.barcodeRow}>
                  <AppInput
                    label="Barcode" // Empty label if you want to use the card's header logic
                    containerStyle={{flex: 1, marginBottom: 0}}
                    value={form.barcode}
                    placeholder="Enter barcode"
                    onChangeText={v => handleInputChange('barcode', v)}
                  />
                  <TouchableOpacity
                    style={styles.generateButton}
                    onPress={generateBarcode}>
                    <Text style={styles.generateButtonText}>GEN</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.row}>
                  <View style={{flex: 1}}>
                    <AppInput
                      label="Stock" // Empty label if you want to use the card's header logic
                      containerStyle={{flex: 1, marginBottom: 0}}
                      value={form.stockQty}
                      placeholder="0"
                      keyboardType="numeric"
                      onChangeText={v => handleInputChange('stockQty', v)}
                    />
                  </View>

                  <View style={{flex: 1}}>
                    <AppInput
                      label="Unit" // Empty label if you want to use the card's header logic
                      containerStyle={{flex: 1, marginBottom: 0}}
                      value={form.unit}
                      placeholder="0"
                      onChangeText={v => handleInputChange('unit', v)}
                    />
                  </View>
                </View>
              </View>
              <View style={{zIndex: 5000, elevation: 5}}>
                <SearchableDropdown
                  label="Category"
                  value={searchQuery}
                  isVisible={isDropdownVisible}
                  data={filteredCategories}
                  isCreatingNew={isCreatingNewCategory}
                  onFocus={() => setIsDropdownVisible(true)}
                  onSelectItem={cat => handleSelectCategory(cat)}
                  onChangeText={text => {
                    setSearchQuery(text);
                    setSelectedCategory(null);
                    setForm(prev => ({...prev, categoryId: ''}));
                    setIsDropdownVisible(true);
                  }}
                />
              </View>
              {/* <View style={styles.card}>
              <Text style={styles.label}>Category</Text>
              <TextInput
                style={styles.input}
                value={searchQuery}
                onFocus={() => setIsDropdownVisible(true)}
                onChangeText={text => {
                  setSearchQuery(text);
                  setSelectedCategory(null);
                  setForm(prev => ({...prev, categoryId: ''}));
                  setIsDropdownVisible(true);
                }}
              />

              {isDropdownVisible && (
                <View style={styles.dropdownList}>
                  <ScrollView style={{maxHeight: 200}}>
                    {filteredCategories.map(cat => (
                      <TouchableOpacity
                        key={cat.id}
                        style={styles.dropdownItem}
                        onPress={() => handleSelectCategory(cat)}>
                        <Text>{cat.name}</Text>
                      </TouchableOpacity>
                    ))}

                    {isCreatingNewCategory && (
                      <Text style={styles.createItemText}>
                        + Create "{searchQuery}"
                      </Text>
                    )}
                  </ScrollView>
                </View>
              )}
            </View> */}

              {/* BUTTONS */}
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => handleSave(false)}>
                <Text style={styles.secondaryText}>JUST CREATE</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => handleSave(true)}>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryText}>SAVE & PRINT</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>

          <ProductQrCodeCard
            isVisible={showPrintModal}
            product={createdProduct}
            onClose={() => {
              setShowPrintModal(false);
              onSuccess();
              onClose();
            }}
          />

          <Toast />
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 18,
    backgroundColor: '#fff',
  },
  headerTitle: {fontSize: 20, fontWeight: '700', color: '#1e293b'},
  closeX: {fontSize: 20},

  container: {
    padding: 16,
    backgroundColor: '#f1f5f9',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },

  label: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },

  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    color: '#1e293b',
  },

  inputFocus: {
    borderColor: '#2563eb',
  },

  row: {
    flexDirection: 'row',
    gap: 10,
  },

  barcodeRow: {
    flexDirection: 'row',
  },

  generateButton: {
    marginLeft: 8,
    padding: 12,
    backgroundColor: '#2563eb',
    borderRadius: 10,
  },

  generateButtonText: {
    color: '#fff',
  },

  dropdownList: {
    position: 'absolute',
    top: 55,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    elevation: 5,
    borderRadius: 10,
  },

  dropdownItem: {
    padding: 12,
  },

  createItemText: {
    padding: 12,
    color: '#2563eb',
    fontWeight: '700',
  },

  primaryButton: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },

  secondaryButton: {
    backgroundColor: '#e2e8f0',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },

  primaryText: {
    color: '#fff',
    fontWeight: '700',
  },

  secondaryText: {
    fontWeight: '600',
  },
});
