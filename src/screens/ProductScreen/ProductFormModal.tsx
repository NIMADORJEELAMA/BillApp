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
  Alert,
} from 'react-native';
import axiosInstance from '../../services/axiosInstance';
import Toast from 'react-native-toast-message';
import ProductQrCodeCard from './ProductQrCodeCard';
import AppInput from '../../components/Input/AppInput';
import SearchableDropdown from '../../components/SearchableDropdown';
import CustomDropdown from '../../components/CustomDropdown';
import ProductBarcodeCard from './ProductBarcodeCard';
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';
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
  const [isScannerVisible, setIsScannerVisible] = useState(false);
  const [form, setForm] = useState({
    name: '',
    price: '',
    costPrice: '',
    barcode: '',
    stockQty: '',
    unit: 'PCS',
    categoryId: '',
  });

  console.log('form', form);

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
  const codeScanner = useCodeScanner({
    codeTypes: ['ean-13', 'ean-8', 'upc-a', 'upc-e', 'code-128', 'qr'],
    onCodeScanned: codes => {
      if (codes.length > 0 && codes[0].value) {
        const scannedValue = codes[0].value;
        handleInputChange('barcode', scannedValue);
        setIsScannerVisible(false);

        // TRIGGER LOOKUP HERE
        handleBarcodeLookup(scannedValue);

        Toast.show({type: 'success', text1: 'Barcode Scanned!'});
      }
    },
  });

  const device = useCameraDevice('back');

  const requestCameraPermission = async () => {
    const permission = await Camera.requestCameraPermission();
    if (permission === 'granted') {
      setIsScannerVisible(true);
    } else {
      Alert.alert(
        'Permission Denied',
        'Camera permission is required to scan barcodes.',
      );
    }
  };
  const handleBarcodeLookup = async (barcode: string) => {
    if (!barcode || barcode.length < 3) return;

    try {
      // Replace '/products/barcode/' with your actual endpoint
      const res = await axiosInstance.get(`/products/barcode/${barcode}`);

      if (res.data) {
        const p = res.data;
        // Auto-fill the form with found data
        setForm({
          name: p.name || '',
          price: p.price?.toString() || '',
          costPrice: p.costPrice?.toString() || '',
          barcode: p.barcode || barcode,
          stockQty: p.stockQty?.toString() || '0',
          unit: p.unit || 'PCS',
          categoryId: p.categoryId || '',
        });

        // Update the category UI
        if (p.category) {
          setSelectedCategory(p.category);
          setSearchQuery(p.category.name);
        }

        Toast.show({type: 'info', text1: 'Existing product loaded'});
      }
    } catch (e) {
      // If 404, we do nothing and let the user fill details manually
      console.log('Barcode not found, proceed with manual entry');
    }
  };
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
        unit: product.unit || 'PCS',
        categoryId: product.categoryId || '',
      });
    } else {
      setForm({
        name: '',
        price: '',
        costPrice: '',
        barcode: '',
        stockQty: '',
        unit: 'PCS',
        categoryId: '',
      });
      setSelectedCategory(null);
      setSearchQuery('');
    }
  }, [isVisible, product]);
  useEffect(() => {
    if (!product || categories.length === 0) return;

    if (product.categoryId) {
      const existingCat = categories.find(c => c.id === product.categoryId);

      if (existingCat) {
        setSelectedCategory(existingCat);
        setSearchQuery(existingCat.name);
      }
    }
  }, [categories, product]);
  const handleInputChange = (field: string, value: string) => {
    setForm(prev => ({...prev, [field]: value}));

    // If user finishes typing a barcode (e.g., length > 5 or 8)
    if (field === 'barcode' && value.length >= 8) {
      // Optional: Add a debounce here or a "Lookup" button
      handleBarcodeLookup(value);
    }
  };

  const generateBarcode = () => {
    const prefix = form.name
      ? form.name.substring(0, 3).toUpperCase().replace(/\s/g, 'X')
      : 'PRD';

    const randomStr = Math.random().toString(36).substring(2, 9).toUpperCase();
    const newBarcode = `${prefix}-${randomStr}`;

    handleInputChange('barcode', newBarcode);
  };
  // Inside ProductFormModal.tsx
  const handleCategorySelect = async (item: any) => {
    if (item.isNew) {
      setLoading(true); // Show loader while creating category
      try {
        const response = await axiosInstance.post('/categories', {
          name: item.name.trim(),
        });

        const newCategory = response.data; // Expected: { id: "123", name: "Category Name" }

        // Update the list so it appears in the dropdown next time
        setCategories(prev => [...prev, newCategory]);

        // Select this new category immediately
        setSelectedCategory(newCategory);
        setSearchQuery(newCategory.name);

        // CRITICAL: Update the form state with the new ID
        setForm(prev => ({
          ...prev,
          categoryId: newCategory.id || newCategory._id,
        }));

        Toast.show({type: 'success', text1: 'Category created and selected'});
      } catch (error) {
        Toast.show({type: 'error', text1: 'Failed to create category'});
        console.error(error);
      } finally {
        setLoading(false);
      }
    } else {
      // Standard selection for existing categories
      setSelectedCategory(item);
      setForm(prev => ({...prev, categoryId: item.id || item._id}));
      setSearchQuery(item.name);
    }
  };
  const handleSave = async (shouldPrint: boolean = false) => {
    if (!form.name || !form.price || !form.stockQty) {
      Toast.show({type: 'error', text1: 'Please fill required fields'});
      return;
    }
    if (!form.categoryId) {
      Toast.show({type: 'error', text1: 'Please select a category'});
      return;
    }

    setLoading(true);
    try {
      // We no longer need to check 'isCreatingNewCategory' here
      // because handleCategorySelect already handled it.

      const payload = {
        ...form,
        // Ensure prices and qty are numbers
        price: parseFloat(form.price),
        costPrice: parseFloat(form.costPrice) || 0,
        stockQty: parseInt(form.stockQty, 10),
      };

      let response;
      if (product?.id) {
        response = await axiosInstance.patch(
          `/products/${product.id}`,
          payload,
        );
        console.log('response', response);
      } else {
        response = await axiosInstance.post('/products', payload);
        console.log('response 123', response);
      }

      const savedData = response.data;
      Toast.show({
        type: 'success',
        text1: product ? 'Product updated!' : 'Product created!',
      });

      if (shouldPrint) {
        setCreatedProduct({
          ...payload,
          barcode: savedData.barcode || payload.barcode,
        });
        setShowPrintModal(true);
      } else {
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      console.log('error', error);
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
                {/* Barcode Input Group */}
                <View style={styles.barcodeRow}>
                  <View style={{flex: 1}}>
                    <AppInput
                      label="Barcode"
                      containerStyle={{flex: 1, marginBottom: 0}}
                      value={form.barcode}
                      placeholder="Enter or scan barcode"
                      onChangeText={v => handleInputChange('barcode', v)}
                      // Trigger lookup when user finishes typing

                      onBlur={() => handleBarcodeLookup(form.barcode)}
                    />
                  </View>
                  <View style={styles.buttonGroup}>
                    {/* SCAN BUTTON */}
                    <TouchableOpacity
                      style={[
                        styles.generateButton,
                        {backgroundColor: '#10b981'},
                      ]}
                      onPress={requestCameraPermission}>
                      <Text style={styles.generateButtonText}>SCAN</Text>
                    </TouchableOpacity>

                    {/* GEN BUTTON */}
                    <TouchableOpacity
                      style={styles.generateButton}
                      onPress={generateBarcode}>
                      <Text style={styles.generateButtonText}>GEN</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                {/* <View style={styles.barcodeRow}>
                  <View style={{flex: 1}}>
                    <AppInput
                      label="Barcode" // Empty label if you want to use the card's header logic
                      containerStyle={{flex: 1, marginBottom: 0}}
                      value={form.barcode}
                      placeholder="Enter barcode"
                      onChangeText={v => handleInputChange('barcode', v)}
                    />
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'flex-end',
                      gap: 5,
                    }}>
                    <TouchableOpacity
                      style={[
                        styles.generateButton,
                        {backgroundColor: '#10b981'},
                      ]} // Green for scan
                      onPress={() => setIsScannerVisible(true)}>
                      <Text style={styles.generateButtonText}>SCAN</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.generateButton}
                      onPress={generateBarcode}>
                      <Text style={styles.generateButtonText}>GEN</Text>
                    </TouchableOpacity>
                  </View>
                </View> */}

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
                <View style={{zIndex: 5000, elevation: 5}}>
                  <SearchableDropdown
                    label="Category"
                    value={searchQuery} // Shows the name in the "trigger" boxs
                    data={filteredCategories}
                    isCreatingNew={isCreatingNewCategory}
                    onChangeText={text => {
                      setSearchQuery(text);

                      // Only clear if user actually changed selection manually
                      if (selectedCategory && selectedCategory.name !== text) {
                        setSelectedCategory(null);
                        setForm(prev => ({...prev, categoryId: ''}));
                      }
                    }}
                    onSelectItem={handleCategorySelect} // This handles the API call
                  />
                </View>
              </View>

              {/* BUTTONS */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.secondaryButton, {flex: 1, marginBottom: 0}]}
                  onPress={() => handleSave(false)}
                  disabled={loading}>
                  <Text style={styles.secondaryText}>JUST CREATE</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.primaryButton, {flex: 1, marginBottom: 0}]}
                  onPress={() => handleSave(true)}
                  disabled={loading}>
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.primaryText}>SAVE & PRINT</Text>
                  )}
                </TouchableOpacity>
              </View>
              {/* <View>
                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    {flex: 1, marginBottom: 0, backgroundColor: '#ef4444'}, // Red background for delete
                  ]}
                  onPress={handleDelete}
                  disabled={loading}>
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.primaryText}>Delete</Text>
                  )}
                </TouchableOpacity>
              </View> */}
            </ScrollView>
          </KeyboardAvoidingView>
          <Modal visible={isScannerVisible} animationType="slide">
            <View style={styles.scannerContainer}>
              {device == null ? (
                <ActivityIndicator size="large" color="#fff" />
              ) : (
                <Camera
                  style={StyleSheet.absoluteFill}
                  device={device}
                  isActive={isScannerVisible}
                  codeScanner={codeScanner}
                />
              )}

              {/* Overlay UI */}
              <View style={styles.overlay}>
                <View style={styles.scanWindow} />
                <TouchableOpacity
                  style={styles.cancelScanBtn}
                  onPress={() => setIsScannerVisible(false)}>
                  <Text style={styles.cancelScanText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          <ProductBarcodeCard
            isVisible={showPrintModal}
            product={createdProduct}
            onClose={() => {
              setShowPrintModal(false);
              onSuccess();
              onClose();
            }}
          />

          {/* <ProductQrCodeCard
       isVisible={showPrintModal}
        product={createdProduct}
      onClose={() => {
          setShowPrintModal(false);
          onSuccess();
         onClose();
       }}
       /> */}

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
    backgroundColor: '#f5f5f5',
    flexGrow: 1,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-end',
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  scanWindow: {
    width: 250,
    height: 180,
    borderWidth: 2,
    borderColor: '#10b981',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  cancelScanBtn: {
    position: 'absolute',
    bottom: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#fff',
  },
  cancelScanText: {
    color: '#fff',
    fontWeight: 'bold',
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
    marginBottom: 8,
  },

  generateButton: {
    marginLeft: 8,
    padding: 14,
    backgroundColor: '#2563eb',
    borderRadius: 10,

    justifyContent: 'center',
    alignItems: 'center',
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

  buttonRow: {
    flexDirection: 'row',
    gap: 12, // Space between buttons
    marginTop: 20, // Space above the button group
    marginBottom: 30, // Bottom padding for the ScrollView
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    height: 54, // Consistent height
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2, // Subtle shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  secondaryButton: {
    backgroundColor: '#fff', // White background looks cleaner for secondary
    borderWidth: 1,
    borderColor: '#e2e8f0',
    height: 54,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  secondaryText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 14,
  },
});
