import React, {useState, useEffect, useCallback, useRef} from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import axiosInstance from '../../services/axiosInstance';
import Toast from 'react-native-toast-message';
import {useSelector} from 'react-redux';

const CustomerItem = React.memo(({item, onSelect}) => (
  <TouchableOpacity style={styles.customerItem} onPress={() => onSelect(item)}>
    <View>
      <Text style={styles.custName}>{item.name}</Text>
      <Text style={styles.custPhone}>{item.phone || 'No phone'}</Text>
    </View>
    <Text style={styles.selectArrow}>→</Text>
  </TouchableOpacity>
));

const CustomerModal = ({isVisible, onClose, onSelect, initialData}) => {
  const user = useSelector(state => state.auth.user);
  const orgId = user?.orgId;

  // View State: 'list' or 'form'
  const [viewMode, setViewMode] = useState('list');
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({name: '', phone: ''});
  const [isSaving, setIsSaving] = useState(false);

  const searchTimeout = useRef(null);

  // Sync mode and data when initialData changes
  useEffect(() => {
    if (initialData && isVisible) {
      setFormData({
        name: initialData.name,
        phone: initialData.phone || '',
      });
      setViewMode('form');
    } else {
      setViewMode('list');
    }
  }, [initialData, isVisible]);

  const fetchCustomers = useCallback(async (query = '') => {
    try {
      setLoading(true);
      const {data} = await axiosInstance.get(`/customers`, {
        params: {search: query},
      });
      setCustomers(data.data || []);
    } catch (error) {
      console.error('Error fetching customers', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isVisible || viewMode === 'form') return;
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(() => fetchCustomers(search), 400);
    return () => clearTimeout(searchTimeout.current);
  }, [search, isVisible, viewMode, fetchCustomers]);

  const handleResetAndClose = () => {
    setFormData({name: '', phone: ''});
    setSearch('');
    setViewMode('list');
    onClose();
  };

  const handleSaveCustomer = async () => {
    if (!formData.name.trim()) return Alert.alert('Error', 'Name is required');

    try {
      setIsSaving(true);
      const payload = {...formData, orgId};
      let response;

      if (initialData?.id) {
        response = await axiosInstance.put(
          `/customers/${initialData.id}`,
          payload,
        );
        Toast.show({type: 'success', text1: 'Customer Updated'});
      } else {
        response = await axiosInstance.post('/customers', payload);
        Toast.show({type: 'success', text1: 'Customer Created'});
      }

      onSelect(response.data);
      handleResetAndClose();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Action failed');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent
      onRequestClose={handleResetAndClose}>
      <View style={styles.overlay}>
        {viewMode === 'list' ? (
          /* --- LIST VIEW --- */
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Select Customer</Text>
              <TouchableOpacity onPress={handleResetAndClose} hitSlop={10}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search name or phone..."
                value={search}
                onChangeText={setSearch}
              />
              <TouchableOpacity
                style={styles.quickAddBtn}
                onPress={() => {
                  setFormData({name: search, phone: ''});
                  setViewMode('form');
                }}>
                <Text style={styles.quickAddBtnText}>+ New</Text>
              </TouchableOpacity>
            </View>

            {!search && (
              <TouchableOpacity
                style={styles.walkInOption}
                onPress={() => {
                  onSelect(null);
                  onClose();
                }}>
                <Text style={styles.walkInText}>👤 Walk-in Customer</Text>
              </TouchableOpacity>
            )}

            {loading && customers.length === 0 ? (
              <ActivityIndicator color="#6366f1" style={{marginVertical: 20}} />
            ) : (
              <FlatList
                data={customers}
                keyExtractor={item => item.id.toString()}
                renderItem={({item}) => (
                  <CustomerItem
                    item={item}
                    onSelect={selected => {
                      onSelect(selected);
                      onClose();
                    }}
                  />
                )}
                keyboardShouldPersistTaps="handled"
                ListEmptyComponent={
                  !loading && (
                    <Text style={styles.emptyText}>No customers found</Text>
                  )
                }
              />
            )}
          </View>
        ) : (
          /* --- FORM VIEW (CREATE/EDIT) --- */
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.innerOverlay}>
            <View style={styles.addCard}>
              <Text style={styles.addTitle}>
                {initialData ? 'Edit Customer' : 'Quick Create'}
              </Text>

              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.innerInput}
                value={formData.name}
                onChangeText={name => setFormData(p => ({...p, name}))}
              />

              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.innerInput}
                keyboardType="phone-pad"
                value={formData.phone}
                onChangeText={phone => setFormData(p => ({...p, phone}))}
              />

              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() =>
                    initialData ? handleResetAndClose() : setViewMode('list')
                  }>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={handleSaveCustomer}
                  disabled={isSaving}>
                  {isSaving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.saveText}>
                      {initialData ? 'Update' : 'Create & Select'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  innerOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {fontSize: 18, fontWeight: '800', color: '#1e293b'},
  closeBtn: {fontSize: 22, color: '#94a3b8'},
  searchContainer: {flexDirection: 'row', gap: 10, marginBottom: 15},
  searchInput: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  quickAddBtn: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickAddBtnText: {color: '#fff', fontWeight: '700'},
  walkInOption: {
    padding: 15,
    backgroundColor: '#f5f3ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd6fe',
    marginBottom: 15,
    alignItems: 'center',
  },
  walkInText: {fontWeight: '700', color: '#6366f1'},
  customerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  custName: {fontSize: 15, fontWeight: '700', color: '#1e293b'},
  custPhone: {fontSize: 13, color: '#64748b'},
  selectArrow: {fontSize: 18, color: '#cbd5e1'},
  emptyText: {color: '#94a3b8', textAlign: 'center', marginTop: 20},
  addCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  addTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 6,
    marginLeft: 4,
  },
  innerInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  btnRow: {flexDirection: 'row', gap: 12, marginTop: 10},
  cancelBtn: {flex: 1, padding: 16, alignItems: 'center'},
  cancelText: {fontWeight: '700', color: '#94a3b8'},
  saveBtn: {
    flex: 2,
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {fontWeight: '800', color: '#fff'},
});

export default CustomerModal;
