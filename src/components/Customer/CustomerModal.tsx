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
} from 'react-native';
import axiosInstance from '../../services/axiosInstance';
import Toast from 'react-native-toast-message';

const CustomerModal = ({isVisible, onClose, onSelect}) => {
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Quick Add Modal State
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const fetchCustomers = async (query = '') => {
    try {
      setLoading(true);
      const {data} = await axiosInstance.get(`/customers?search=${query}`);
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers', error);
    } finally {
      setLoading(false);
    }
  };
  const searchTimeout = useRef(null);

  const handleSearchTextChange = val => {
    setSearch(val);

    // Clear previous timeout
    // Clear previous timeout

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    // Wait 400ms after the user stops typing to call the API
    searchTimeout.current = setTimeout(() => {
      fetchCustomers(val);
    }, 400);
  };
  useEffect(() => {
    if (isVisible) {
      fetchCustomers(search);
    }
  }, [isVisible]);

  const handleCreateCustomer = async () => {
    if (!newName.trim()) return Alert.alert('Error', 'Name is required');

    try {
      setIsCreating(true);

      const payload = {
        name: newName,
        phone: newPhone?.trim() || null,
      };

      console.log('📤 CREATE CUSTOMER REQUEST');
      console.log('➡️ URL:', axiosInstance.defaults.baseURL + '/customers');
      console.log('➡️ PAYLOAD:', payload);

      const {data} = await axiosInstance.post('/customers', payload);

      console.log('✅ RESPONSE SUCCESS:', data);

      Toast.show({type: 'success', text1: 'Customer Created'});
      onSelect(data);
      closeAll();
    } catch (error: any) {
      console.log('❌ FULL ERROR:', error);

      if (error.response) {
        console.log('❌ STATUS:', error.response.status);
        console.log('❌ RESPONSE DATA:', error.response.data);
        console.log('❌ HEADERS:', error.response.headers);
      } else if (error.request) {
        console.log('❌ NO RESPONSE RECEIVED:', error.request);
      } else {
        console.log('❌ ERROR MESSAGE:', error.message);
      }

      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to create customer',
      );
    } finally {
      setIsCreating(false);
    }
  };

  const closeAll = () => {
    setIsAddModalVisible(false);
    setNewName('');
    setNewPhone('');
    setSearch('');
    onClose();
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Select Customer</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search name or phone..."
              value={search}
              onChangeText={handleSearchTextChange}
            />
            <TouchableOpacity
              style={styles.quickAddBtn}
              onPress={() => {
                setNewName(search); // Pre-fill name with search query
                setIsAddModalVisible(true);
              }}>
              <Text style={styles.quickAddBtnText}>+ New</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.walkInOption}
            onPress={() => {
              onSelect(null);
              onClose();
            }}>
            <Text style={styles.walkInText}>👤 Walk-in Customer</Text>
          </TouchableOpacity>

          {loading ? (
            <ActivityIndicator color="#6366f1" style={{marginVertical: 20}} />
          ) : (
            <FlatList
              data={customers}
              keyExtractor={item => item.id.toString()}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={styles.customerItem}
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}>
                  <View>
                    <Text style={styles.custName}>{item.name}</Text>
                    <Text style={styles.custPhone}>
                      {item.phone || 'No phone'}
                    </Text>
                  </View>
                  <Text style={styles.selectArrow}>→</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyText}>
                    No customers found for "{search}"
                  </Text>
                </View>
              }
            />
          )}
        </View>

        {/* --- Nested Quick Add Modal --- */}
        <Modal
          visible={isAddModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setIsAddModalVisible(false)}>
          <View style={styles.innerOverlay}>
            <View style={styles.addCard}>
              <Text style={styles.addTitle}>Quick Create Customer</Text>

              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.innerInput}
                placeholder="Enter customer name"
                value={newName}
                onChangeText={setNewName}
              />

              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.innerInput}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
                value={newPhone}
                onChangeText={setNewPhone}
              />

              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setIsAddModalVisible(false)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={handleCreateCustomer}
                  disabled={isCreating}>
                  {isCreating ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.saveText}>Create & Select</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
  emptyBox: {alignItems: 'center', marginTop: 30},
  emptyText: {color: '#94a3b8'},

  // Quick Add Styles
  innerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  addCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    elevation: 10,
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
