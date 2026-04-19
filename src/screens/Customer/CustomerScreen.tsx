import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Text,
} from 'react-native';
import MainLayout from '../../screens/MainLayout';
import axiosInstance from '../../services/axiosInstance';
import Toast from 'react-native-toast-message';
import CustomerModal from '../../components/Customer/CustomerModal';

const CustomerScreen = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState(null);

  const fetchCustomers = useCallback(async (query = '') => {
    setLoading(true);
    try {
      const {data} = await axiosInstance.get('/customers', {
        params: {search: query},
      });
      setCustomers(data.data || []);
    } catch (error) {
      Toast.show({type: 'error', text1: 'Failed to fetch customers'});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Handle Create or Update success from Modal
  const handleModalSuccess = customer => {
    setCustomers(prev => {
      const exists = prev.find(c => c.id === customer.id);
      if (exists) {
        return prev.map(c => (c.id === customer.id ? customer : c));
      }
      return [customer, ...prev];
    });
    setCustomerToEdit(null);
  };

  const handleDelete = (id, name) => {
    Alert.alert('Delete Customer', `Are you sure you want to delete ${name}?`, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await axiosInstance.delete(`/customers/${id}`);
            setCustomers(prev => prev.filter(c => c.id !== id));
            Toast.show({type: 'success', text1: 'Customer deleted'});
          } catch (error) {
            Alert.alert('Error', 'Could not delete customer');
          }
        },
      },
    ]);
  };

  const renderItem = ({item}) => (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.phone}>{item.phone || 'No phone'}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.editBtn]}
          onPress={() => {
            setCustomerToEdit(item);
            setIsModalVisible(true);
          }}>
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={() => handleDelete(item.id, item.name)}>
          <Text style={styles.deleteBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <MainLayout
      title="Customers"
      subtitle={`${customers.length} total`}
      showBack>
      <View style={styles.container}>
        <View style={styles.searchWrapper}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or phone..."
            value={search}
            onChangeText={val => {
              setSearch(val);
              fetchCustomers(val);
            }}
          />
        </View>

        <FlatList
          data={customers}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onRefresh={() => fetchCustomers(search)}
          refreshing={loading}
          ListEmptyComponent={
            !loading && <Text style={styles.emptyText}>No customers found</Text>
          }
        />
      </View>

      <CustomerModal
        isVisible={isModalVisible}
        initialData={customerToEdit}
        onClose={() => {
          setIsModalVisible(false);
          setCustomerToEdit(null);
        }}
        onSelect={handleModalSuccess}
      />
    </MainLayout>
  );
};

// ... Styles remain mostly the same

const styles = StyleSheet.create({
  container: {flex: 1},
  searchWrapper: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    backgroundColor: '#F4F7F8',
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
  },
  listContent: {padding: 15, paddingBottom: 100},
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // Minimal shadow for clean look
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  info: {flex: 1},
  name: {fontSize: 16, fontWeight: '700', color: '#121212'},
  phone: {fontSize: 13, color: '#666', marginTop: 2},
  actions: {flexDirection: 'row', gap: 8},
  actionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  editBtn: {backgroundColor: '#f1f5f9'},
  editBtnText: {color: '#475569', fontWeight: '600', fontSize: 13},
  deleteBtn: {backgroundColor: '#fef2f2'},
  deleteBtnText: {color: '#ef4444', fontWeight: '600', fontSize: 13},
  emptyText: {textAlign: 'center', marginTop: 40, color: '#888'},
});

export default CustomerScreen;
