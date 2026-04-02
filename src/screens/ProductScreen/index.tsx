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

  const initialForm = {
    name: '',
    price: '',
    costPrice: '',
    barcode: '',
    stockQty: '',
    unit: 'KG',
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
    if (!form.name || !form.price || !form.stockQty) {
      Toast.show({type: 'error', text1: 'Please fill all required fields'});
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        costPrice: parseFloat(form.costPrice) || 0,
        stockQty: parseInt(form.stockQty, 10),
      };

      let response;
      if (product?._id) {
        // EDIT MODE
        response = await axiosInstance.put(`/products/${product._id}`, payload);
      } else {
        // CREATE MODE
        response = await axiosInstance.post('/products', payload);
      }

      const savedData = response.data;
      Toast.show({
        type: 'success',
        text1: product ? 'Product updated!' : 'Product created!',
      });

      if (shouldPrint) {
        setCreatedProduct({
          name: form.name,
          price: form.price,
          barcode: form.barcode || savedData.barcode,
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
        text2: error.response?.data?.message || 'Server Error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={isVisible} animationType="slide" onRequestClose={onClose}>
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
});
