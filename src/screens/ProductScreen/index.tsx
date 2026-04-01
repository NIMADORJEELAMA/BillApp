import React, {useState} from 'react';
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
} from 'react-native';
import MainLayout from '../../../src/screens/MainLayout';
import axiosInstance from '../../services/axiosInstance';
import Toast from 'react-native-toast-message';
import color from '../../assets/Color/color';
import swiggyColors from '../../assets/Color/swiggyColor';
import ProductListScreen from './ProductListScreen';

export default function ProductScreen({navigation}: any) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    price: '',
    costPrice: '',
    barcode: '',
    stockQty: '',
    unit: 'KG', // Default unit
  });

  const handleInputChange = (field: string, value: string) => {
    setForm(prev => ({...prev, [field]: value}));
  };

  const handleCreate = async () => {
    // Basic Validation
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

      await axiosInstance.post('/products', payload);

      Toast.show({type: 'success', text1: 'Product created successfully!'});
      navigation.goBack(); // Return to list
    } catch (error: any) {
      console.error(error);
      Toast.show({
        type: 'error',
        text1: 'Failed to create product',
        text2: error.response?.data?.message || 'Server Error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout title="Add New Product" showBack>
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
              <Text style={styles.label}>Initial Stock *</Text>
              <TextInput
                style={styles.input}
                placeholder="100"
                keyboardType="number-pad"
                value={form.stockQty}
                onChangeText={v => handleInputChange('stockQty', v)}
              />
            </View>
            <View style={[styles.inputGroup, {flex: 1, marginLeft: 12}]}>
              <Text style={styles.label}>Unit (e.g. KG, PCS)</Text>
              <TextInput
                style={styles.input}
                placeholder="KG"
                autoCapitalize="characters"
                value={form.unit}
                onChangeText={v => handleInputChange('unit', v)}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && {opacity: 0.7}]}
            onPress={handleCreate}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>CREATE PRODUCT</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
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
  submitButton: {
    backgroundColor: color.black,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    elevation: 2,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
