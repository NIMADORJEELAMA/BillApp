import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Text,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

const StaffModal = ({
  isOpen = true,
  onClose,
  editingUser,
  onSubmit,
  isPending,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'WAITER',
    isActive: true,
  });

  useEffect(() => {
    if (editingUser) {
      setFormData({
        name: editingUser.name || '',
        email: editingUser.email || '',
        password: '',
        role: editingUser.role || 'WAITER',
        isActive: editingUser.isActive ?? true,
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'WAITER',
        isActive: true,
      });
    }
  }, [editingUser, isOpen]);
  const ROLES = [
    {label: 'Waiter', value: 'WAITER'},
    {label: 'Admin', value: 'ADMIN'},
    {label: 'Front Office', value: 'FRONT_OFFICE'},
    {label: 'Kitchen', value: 'KITCHEN'},
  ];
  const [isRolePickerOpen, setIsRolePickerOpen] = useState(false);
  const handleChange = (field, value) => {
    setFormData(prev => ({...prev, [field]: value}));
  };
  const selectRole = value => {
    setFormData(prev => ({...prev, role: value}));
    setIsRolePickerOpen(false);
  };

  const handleFinalize = () => {
    if (!formData.name || !formData.email) {
      Alert.alert('Missing Info', 'Please fill in the name and email.');
      return;
    }
    // Password is only strictly required for new users
    if (!editingUser && !formData.password) {
      Alert.alert(
        'Password Required',
        'Please set a password for the new staff member.',
      );
      return;
    }
    onSubmit(formData);
  };

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {editingUser ? 'Edit Staff Member' : 'Add New Staff'}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <Text style={styles.closeText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>FULL NAME</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={val => handleChange('name', val)}
                placeholder="John Doe"
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>EMAIL ADDRESS</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={val => handleChange('email', val)}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="john@restaurant.com"
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, {flex: 1, marginRight: 12}]}>
                <Text style={styles.label}>PASSWORD</Text>
                <TextInput
                  style={styles.input}
                  value={formData.password}
                  onChangeText={val => handleChange('password', val)}
                  secureTextEntry
                  placeholder={editingUser ? 'Leave blank' : '••••••'}
                  placeholderTextColor="#94a3b8"
                />
              </View>
              {/* Change this: */}
              <View style={[styles.inputGroup, {flex: 1}]}>
                <Text style={styles.label}>ROLE</Text>
                <TouchableOpacity
                  style={styles.roleSelector} // Use your existing style here
                  onPress={() => setIsRolePickerOpen(true)}>
                  <Text style={styles.roleValue}>{formData.role}</Text>
                  <Text style={styles.chevron}>▼</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.label}>ACCOUNT STATUS</Text>
            <View style={styles.segmentedControl}>
              <TouchableOpacity
                onPress={() => handleChange('isActive', true)}
                style={[
                  styles.segment,
                  formData.isActive && styles.activeSegment,
                ]}>
                <Text
                  style={[
                    styles.segmentText,
                    formData.isActive && styles.activeText,
                  ]}>
                  Active
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleChange('isActive', false)}
                style={[
                  styles.segment,
                  !formData.isActive && styles.activeSegment,
                ]}>
                <Text
                  style={[
                    styles.segmentText,
                    !formData.isActive && styles.activeText,
                  ]}>
                  Disabled
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Footer Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={handleFinalize}
              style={[styles.submitBtn, isPending && styles.disabledBtn]}
              disabled={isPending}>
              {isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.submitText}>
                  {editingUser ? 'Update Details' : 'Create Staff'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
        <Modal
          visible={isRolePickerOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setIsRolePickerOpen(false)}>
          <TouchableOpacity
            style={styles.pickerOverlay}
            activeOpacity={1}
            onPress={() => setIsRolePickerOpen(false)}>
            <View style={styles.pickerSheet}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Select Role</Text>
              </View>
              {ROLES.map(item => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.pickerItem,
                    formData.role === item.value && styles.pickerItemActive,
                  ]}
                  onPress={() => selectRole(item.value)}>
                  <Text
                    style={[
                      styles.pickerItemText,
                      formData.role === item.value &&
                        styles.pickerItemTextActive,
                    ]}>
                    {item.label}
                  </Text>
                  {formData.role === item.value && (
                    <Text style={styles.check}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)', // Slightly darker, modern slate overlay
    justifyContent: 'flex-end', // Slides up from bottom like modern apps
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: '60%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -10},
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  header: {
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {fontSize: 20, fontWeight: '700', color: '#1e293b'},
  closeText: {color: '#64748b', fontSize: 16, fontWeight: '500'},
  scrollBody: {padding: 24},
  inputGroup: {marginBottom: 20},
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  input: {
    height: 50,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#334155',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  row: {flexDirection: 'row'},
  readOnlyBox: {
    height: 50,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  readOnlyText: {color: '#64748b', fontSize: 14, fontWeight: '600'},
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    padding: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeSegment: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {color: '#64748b', fontSize: 14, fontWeight: '500'},
  activeText: {color: '#6366f1', fontWeight: '700'},
  footer: {padding: 24, paddingTop: 0},
  submitBtn: {
    height: 56,
    backgroundColor: '#6366f1',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  disabledBtn: {backgroundColor: '#a5b4fc'},
  submitText: {color: 'white', fontSize: 16, fontWeight: '700'},

  ///

  roleSelector: {
    height: 50,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  roleValue: {fontSize: 16, color: '#334155', fontWeight: '500'},
  chevron: {color: '#94a3b8', fontSize: 12},

  // Picker Styles
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  pickerHeader: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  pickerTitle: {fontSize: 16, fontWeight: '700', color: '#1e293b'},
  pickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  pickerItemActive: {backgroundColor: '#f5f7ff'},
  pickerItemText: {fontSize: 16, color: '#475569'},
  pickerItemTextActive: {color: '#6366f1', fontWeight: '700'},
  check: {color: '#6366f1', fontWeight: 'bold'},
});

export default StaffModal;
