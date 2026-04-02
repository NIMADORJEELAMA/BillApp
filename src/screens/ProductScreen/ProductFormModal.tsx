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
} from 'react-native';
import axiosInstance from '../../services/axiosInstance';
import Toast from 'react-native-toast-message';
import ProductQrCodeCard from './ProductQrCodeCard';

interface ProductFormModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSuccess: () => void; // To refresh the list in the parent
  product?: any; // If provided, we are in EDIT mode
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
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

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
    setForm(prev => ({...prev, categoryId: cat.id}));
    setSearchQuery(cat.name);
    setIsDropdownVisible(false);
  };

  const handleCreateNewCategory = () => {
    // Logic: categoryId remains null/empty, but we'll use searchQuery as the new name
    setForm(prev => ({...prev, categoryId: 'NEW_CATEGORY'}));
    setIsDropdownVisible(false);
  };

  const initialForm = {
    name: '',
    price: '',
    costPrice: '',
    barcode: '',
    stockQty: '',
    unit: 'KG',
    categoryId: '',
  };

  const [form, setForm] = useState(initialForm);

  // Sync form when modal opens or product changes
  useEffect(() => {
    if (isVisible) {
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
      } else {
        setForm(initialForm);
      }
    }
  }, [isVisible, product]);

  const handleInputChange = (field: string, value: string) => {
    setForm(prev => ({...prev, [field]: value}));
  };
  const handleSave = async (shouldPrint: boolean = false) => {
    setLoading(true);
    try {
      let finalCategoryId = form.categoryId;

      // 1. If it's a new category, create it first
      if (form.categoryId === 'NEW_CATEGORY') {
        const catRes = await axiosInstance.post('/categories', {
          name: searchQuery,
        });
        finalCategoryId = catRes.data.id;
      }

      // 2. Prepare Payload
      const payload = {
        ...form,
        categoryId: finalCategoryId,
        price: parseFloat(form.price),
        costPrice: parseFloat(form.costPrice) || 0,
        stockQty: parseInt(form.stockQty, 10),
      };

      // Remove the temporary flag if it exists
      delete (payload as any).NEW_CATEGORY;

      let response;
      if (product?._id) {
        response = await axiosInstance.put(`/products/${product._id}`, payload);
      } else {
        response = await axiosInstance.post('/products', payload);
      }

      // ... rest of success logic (Toast, Modal, etc.)
    } catch (error) {
      // ... error handling
    } finally {
      setLoading(false);
    }
  };
  //   const handleSave = async (shouldPrint: boolean = false) => {
  //     if (!form.name || !form.price || !form.stockQty) {
  //       Toast.show({type: 'error', text1: 'Please fill all required fields'});
  //       return;
  //     }

  //     setLoading(true);
  //     try {
  //       const payload = {
  //         ...form,
  //         price: parseFloat(form.price),
  //         costPrice: parseFloat(form.costPrice) || 0,
  //         stockQty: parseInt(form.stockQty, 10),
  //       };

  //       let response;
  //       if (product?._id) {
  //         // EDIT MODE
  //         response = await axiosInstance.put(`/products/${product._id}`, payload);
  //       } else {
  //         // CREATE MODE
  //         response = await axiosInstance.post('/products', payload);
  //       }

  //       const savedData = response.data;
  //       Toast.show({
  //         type: 'success',
  //         text1: product ? 'Product updated!' : 'Product created!',
  //       });

  //       if (shouldPrint) {
  //         setCreatedProduct({
  //           name: form.name,
  //           price: form.price,
  //           barcode: form.barcode || savedData.barcode,
  //         });
  //         setShowPrintModal(true);
  //       } else {
  //         onSuccess();
  //         onClose();
  //       }
  //     } catch (error: any) {
  //       Toast.show({
  //         type: 'error',
  //         text1: 'Save failed',
  //         text2: error.response?.data?.message || 'Server Error',
  //       });
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  return (
    <Modal visible={isVisible} animationType="slide" onRequestClose={onClose}>
      <View style={{flex: 1}}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {product ? 'Edit Product' : 'Add New Product'}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeX}>✕</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{flex: 1}}>
          <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Product Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Organic Apples"
                value={form.name}
                onChangeText={v => handleInputChange('name', v)}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, {flex: 1}]}>
                <Text style={styles.label}>Selling Price (₹) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="500"
                  keyboardType="numeric"
                  value={form.price}
                  onChangeText={v => handleInputChange('price', v)}
                />
              </View>
              <View style={[styles.inputGroup, {flex: 1, marginLeft: 12}]}>
                <Text style={styles.label}>Cost Price (₹)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="400"
                  keyboardType="numeric"
                  value={form.costPrice}
                  onChangeText={v => handleInputChange('costPrice', v)}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Barcode / SKU</Text>
              <TextInput
                style={styles.input}
                placeholder="APP-001"
                autoCapitalize="characters"
                value={form.barcode}
                onChangeText={v => handleInputChange('barcode', v)}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category *</Text>
              <View style={styles.dropdownContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Search or type new category..."
                  value={searchQuery}
                  onFocus={() => setIsDropdownVisible(true)}
                  onChangeText={text => {
                    setSearchQuery(text);
                    setIsDropdownVisible(true);
                    // If user clears text, reset selection
                    if (!text) setForm(prev => ({...prev, categoryId: ''}));
                  }}
                />

                {isDropdownVisible && (
                  <View style={styles.dropdownList}>
                    <ScrollView nestedScrollEnabled style={{maxHeight: 200}}>
                      {filteredCategories.map(cat => (
                        <TouchableOpacity
                          key={cat.id}
                          style={styles.dropdownItem}
                          onPress={() => handleSelectCategory(cat)}>
                          <Text style={styles.dropdownItemText}>
                            {cat.name}
                          </Text>
                        </TouchableOpacity>
                      ))}

                      {/* If no exact match found, show "Create New" */}
                      {searchQuery.length > 0 &&
                        !categories.some(
                          c =>
                            c.name.toLowerCase() === searchQuery.toLowerCase(),
                        ) && (
                          <TouchableOpacity
                            style={[styles.dropdownItem, styles.createItem]}
                            onPress={handleCreateNewCategory}>
                            <Text style={styles.createItemText}>
                              + Create "{searchQuery}"
                            </Text>
                          </TouchableOpacity>
                        )}
                    </ScrollView>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, {flex: 1}]}>
                <Text style={styles.label}>Stock Quantity *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="100"
                  keyboardType="number-pad"
                  value={form.stockQty}
                  onChangeText={v => handleInputChange('stockQty', v)}
                />
              </View>
              <View style={[styles.inputGroup, {flex: 1, marginLeft: 12}]}>
                <Text style={styles.label}>Unit</Text>
                <TextInput
                  style={styles.input}
                  placeholder="KG"
                  autoCapitalize="characters"
                  value={form.unit}
                  onChangeText={v => handleInputChange('unit', v)}
                />
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.submitButton, {backgroundColor: '#64748b'}]}
                onPress={() => handleSave(false)}
                disabled={loading}>
                <Text style={styles.submitText}>
                  {product ? 'UPDATE ONLY' : 'JUST CREATE'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitButton, {backgroundColor: '#2563eb'}]}
                onPress={() => handleSave(true)}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitText}>SAVE & PRINT QR</Text>
                )}
              </TouchableOpacity>
            </View>
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
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginTop: Platform.OS === 'ios' ? 40 : 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  closeX: {
    fontSize: 20,
    color: '#64748b',
    padding: 5,
  },
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748b',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: 16,
    color: '#1e293b',
  },
  row: {
    flexDirection: 'row',
  },
  buttonContainer: {
    marginTop: 20,
    gap: 12,
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  catScroll: {
    flexDirection: 'row',
    marginTop: 5,
  },
  catChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  catChipActive: {
    backgroundColor: '#0f172a',
    borderColor: '#0f172a',
  },
  catText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  catTextActive: {
    color: '#fff',
  },
  dropdownContainer: {
    zIndex: 1000, // Important for iOS to show over other inputs
  },
  dropdownList: {
    position: 'absolute',
    top: 55,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 2000,
  },
  dropdownItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#1e293b',
  },
  createItem: {
    backgroundColor: '#f8fafc',
  },
  createItemText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: 'bold',
  },
});
