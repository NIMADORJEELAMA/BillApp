import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {Text} from '../../components/common/UI'; // Adjust path based on your project
import axiosInstance from '../../services/axiosInstance';
import Toast from 'react-native-toast-message';
import color from '../../assets/Color/color'; // Assuming this exists

const SupplierModal = ({isVisible, initialData, onClose, onSelect}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contactName: '',
    phone: '',
    email: '',
    address: '',
    gstNumber: '',
  });
  const [errors, setErrors] = useState({});

  // Populate or reset form when modal opens/closes or initialData changes
  useEffect(() => {
    if (isVisible) {
      if (initialData) {
        setFormData({
          name: initialData.name || '',
          contactName: initialData.contactName || '',
          phone: initialData.phone || '',
          email: initialData.email || '',
          address: initialData.address || '',
          gstNumber: initialData.gstNumber || '',
        });
      } else {
        setFormData({
          name: '',
          contactName: '',
          phone: '',
          email: '',
          address: '',
          gstNumber: '',
        });
      }
      setErrors({});
    }
  }, [isVisible, initialData]);

  const handleChange = (field, value) => {
    setFormData(prev => ({...prev, [field]: value}));
    // Clear error for this field when user types
    if (errors[field]) {
      setErrors(prev => ({...prev, [field]: null}));
    }
  };

  const validate = () => {
    let isValid = true;
    let newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Supplier name is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      let response;
      if (initialData?.id) {
        // Update existing supplier
        response = await axiosInstance.patch(
          `/suppliers/${initialData.id}`,
          formData,
        );
        Toast.show({type: 'success', text1: 'Supplier updated successfully'});
      } else {
        // Create new supplier
        response = await axiosInstance.post('/suppliers', formData);
        Toast.show({type: 'success', text1: 'Supplier created successfully'});
      }

      // Pass the updated/created supplier back to the parent screen
      if (onSelect) {
        // Handle variations in how your backend might return data (e.g., response.data.data vs response.data)
        const savedSupplier = response.data.data || response.data;
        onSelect(savedSupplier);
      }

      onClose();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Something went wrong';
      Toast.show({type: 'error', text1: 'Error', text2: errorMsg});
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>
                {initialData ? 'Edit Supplier' : 'New Supplier'}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Form sghjghjk*/}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Company/Supplier Name *</Text>
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  value={formData.name}
                  onChangeText={val => handleChange('name', val)}
                  placeholder="e.g. ABC Distributors"
                  placeholderTextColor="#94a3b8"
                />
                {errors.name && (
                  <Text style={styles.errorText}>{errors.name}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Contact Person</Text>
                <TextInput
                  style={styles.input}
                  value={formData.contactName}
                  onChangeText={val => handleChange('contactName', val)}
                  placeholder="e.g. John Doe"
                  placeholderTextColor="#94a3b8"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  value={formData.phone}
                  onChangeText={val => handleChange('phone', val)}
                  placeholder="e.g. 9876543210"
                  keyboardType="phone-pad"
                  placeholderTextColor="#94a3b8"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={val => handleChange('email', val)}
                  placeholder="e.g. contact@supplier.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#94a3b8"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>GST Number</Text>
                <TextInput
                  style={styles.input}
                  value={formData.gstNumber}
                  onChangeText={val => handleChange('gstNumber', val)}
                  placeholder="e.g. 22AAAAA0000A1Z5"
                  autoCapitalize="characters"
                  placeholderTextColor="#94a3b8"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Address</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.address}
                  onChangeText={val => handleChange('address', val)}
                  placeholder="Supplier's full address"
                  multiline={true}
                  numberOfLines={3}
                  textAlignVertical="top"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </ScrollView>

            {/* Footer / Actions */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.btn, styles.cancelBtn]}
                onPress={onClose}
                disabled={loading}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, styles.saveBtn]}
                onPress={handleSubmit}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>
                    {initialData ? 'Update' : 'Save'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  closeBtn: {
    padding: 4,
  },
  closeText: {
    fontSize: 20,
    color: '#64748b',
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1e293b',
    backgroundColor: '#f8fafc',
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  textArea: {
    minHeight: 80,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 12,
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: '#f1f5f9',
  },
  cancelBtnText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 15,
  },
  saveBtn: {
    backgroundColor: color.themeBlue || '#2563eb', // Fallback if themeBlue is undefined
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});

export default SupplierModal;
