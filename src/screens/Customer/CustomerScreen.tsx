import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import {Text} from '../../components/common/UI'; // Assuming your UI text component
import MainLayout from '../../screens/MainLayout';
import axiosInstance from '../../services/axiosInstance';
import Toast from 'react-native-toast-message';
import CustomerModal from '../../components/Customer/CustomerModal';
import SearchIcon from '../../assets/Icons/search.svg'; // Adjust paths
import PlusIcon from '../../assets/Icons/plus.svg';
import EditIcon from '../../assets/Icons/edit.svg';
import DeleteIcon from '../../assets/Icons/trash.svg';
import PhoneIcon from '../../assets/Icons/phone.svg';
import SearchBar from '../../components/Searchbar';
import color from '../../assets/Color/color';

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

  const renderItem = ({item, index}) => {
    return (
      <View style={styles.card}>
        <View style={styles.avatar}>
          {/* +1 ensures the list starts at 1 instead of 0 */}
          <Text style={styles.avatarText}>{index + 1}</Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <View style={styles.phoneRow}>
            <PhoneIcon width={12} height={12} fill="#94a3b8" />
            <Text style={styles.phone}>{item.phone || 'No phone'}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => {
              setCustomerToEdit(item);
              setIsModalVisible(true);
            }}>
            <EditIcon
              width={18}
              height={18}
              fill={color.Egrey}
              color={color.dark}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => handleDelete(item.id, item.name)}>
            <DeleteIcon width={18} height={18} fill="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  return (
    <MainLayout
      title="Customers"
      subtitle={`${customers.length} total subscribers`}
      showBack>
      <View style={styles.container}>
        <View style={styles.searchWrapper}>
          <View style={{flex: 1, marginRight: 12}}>
            <SearchBar
              value={search}
              onChangeText={val => {
                setSearch(val);
                fetchCustomers(val);
              }}
              placeholder="Search by name or phone..."
              autofocus
            />
          </View>

          <View>
            <TouchableOpacity
              style={styles.addIconBtn}
              onPress={() => setIsModalVisible(true)}>
              <PlusIcon width={20} height={20} fill="#fff" color={'#fff'} />
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={customers}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onRefresh={() => fetchCustomers(search)}
          refreshing={loading}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !loading && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No customers found</Text>
              </View>
            )
          }
        />
      </View>

      <CustomerModal
        isVisible={isModalVisible}
        initialData={customerToEdit}
        startWithList={false}
        onClose={() => {
          setIsModalVisible(false);
          setCustomerToEdit(null);
        }}
        onSelect={handleModalSuccess}
      />
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f8fafc'},
  searchWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },

  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    // Soft sdfgfdd
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#2563eb',
    fontWeight: 'bold',
    fontSize: 14,
  },
  info: {flex: 1},
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phone: {
    fontSize: 13,
    color: '#64748b',
    marginLeft: 4,
  },
  actions: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 4,
  },
  iconBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  editText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
  },
  delText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ef4444',
  },
  addIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: color.themeBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 15,
  },
});

export default CustomerScreen;
