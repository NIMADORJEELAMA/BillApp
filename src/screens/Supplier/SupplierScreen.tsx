import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ListRenderItem,
} from 'react-native';
import {useNavigation, NavigationProp} from '@react-navigation/native';
import Toast from 'react-native-toast-message';

// Components & Assets
import {Text} from '../../components/common/UI';
import MainLayout from '../../screens/MainLayout';
import SearchBar from '../../components/Searchbar';
import SupplierModal from './SupplierModal';
import axiosInstance from '../../services/axiosInstance';
import color from '../../assets/Color/color';

// Icons
import PlusIcon from '../../assets/Icons/plus.svg';
import EditIcon from '../../assets/Icons/edit.svg';
import DeleteIcon from '../../assets/Icons/trash.svg';
import PhoneIcon from '../../assets/Icons/phone.svg';

// --- TypeScript Interfaces ---
export interface Supplier {
  id: string | number;
  name: string;
  contactName?: string;
  phone?: string;
}

// Update this to match your actual navigation param list
type RootStackParamList = {
  SupplierDetails: {supplier: Supplier};
};

const SupplierScreen: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [supplierToEdit, setSupplierToEdit] = useState<Supplier | null>(null);

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const fetchSuppliers = useCallback(async (query: string = '') => {
    setLoading(true);
    try {
      const {data} = await axiosInstance.get('/suppliers', {
        params: {search: query},
      });
      setSuppliers(data.data || []);
    } catch (error) {
      Toast.show({type: 'error', text1: 'Failed to fetch suppliers'});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleModalSuccess = (supplier: Supplier) => {
    setSuppliers(prev => {
      const exists = prev.find(s => s.id === supplier.id);
      if (exists) {
        return prev.map(s => (s.id === supplier.id ? supplier : s));
      }
      return [supplier, ...prev];
    });
    setSupplierToEdit(null);
    setIsModalVisible(false);
  };

  const handleDelete = (id: string | number, name: string) => {
    Alert.alert('Delete Supplier', `Are you sure you want to delete ${name}?`, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await axiosInstance.delete(`/suppliers/${id}`);
            setSuppliers(prev => prev.filter(s => s.id !== id));
            Toast.show({type: 'success', text1: 'Supplier deleted'});
          } catch (error) {
            Alert.alert('Error', 'Could not delete supplier');
          }
        },
      },
    ]);
  };

  const renderItem: ListRenderItem<Supplier> = ({item, index}) => {
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() =>
          navigation.navigate('SupplierDetails', {supplier: item})
        }>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{index + 1}</Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          {item.contactName && (
            <Text style={styles.contactName}>{item.contactName}</Text>
          )}
          <View style={styles.phoneRow}>
            <PhoneIcon width={12} height={12} fill="#94a3b8" />
            <Text style={styles.phone}>{item.phone || 'No phone'}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.iconBtn}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
            onPress={() => {
              setSupplierToEdit(item);
              setIsModalVisible(true);
            }}>
            <EditIcon
              width={18}
              height={18}
              fill={color.Egrey || '#94a3b8'}
              color={color.dark || '#1e293b'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBtn}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
            onPress={() => handleDelete(item.id, item.name)}>
            <DeleteIcon width={18} height={18} fill="#ef4444" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <MainLayout
      title="Suppliers"
      subtitle={`${suppliers.length} total suppliers`}
      showBack>
      <View style={styles.container}>
        <View style={styles.searchWrapper}>
          <View style={styles.searchContainer}>
            <SearchBar
              value={search}
              onChangeText={(val: string) => {
                setSearch(val);
                fetchSuppliers(val);
              }}
              placeholder="Search by name or phone..."
              autofocus
            />
          </View>

          <View style={styles.addButtonContainer}>
            <TouchableOpacity
              style={styles.addIconBtn}
              activeOpacity={0.8}
              onPress={() => {
                setSupplierToEdit(null);
                setIsModalVisible(true);
              }}>
              <PlusIcon width={20} height={20} fill="#fff" color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={suppliers}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onRefresh={() => fetchSuppliers(search)}
          refreshing={loading}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No suppliers found</Text>
              </View>
            ) : null
          }
        />
      </View>

      <SupplierModal
        isVisible={isModalVisible}
        initialData={supplierToEdit}
        onClose={() => {
          setIsModalVisible(false);
          setSupplierToEdit(null);
        }}
        onSelect={handleModalSuccess}
      />
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 12, // Native gap support for spacing between search and button
  },
  searchContainer: {
    flex: 0.8, // Exactly 80% split
  },
  addButtonContainer: {
    flex: 0.2, // Exactly 20% split
  },
  addIconBtn: {
    width: '100%',
    height: 48, // Matched typical standard input height
    borderRadius: 12,
    backgroundColor: '#2563eb', // Standard primary blue
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 15,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  contactName: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 4,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phone: {
    fontSize: 13,
    color: '#64748b',
    marginLeft: 6,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    padding: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 15,
    fontWeight: '500',
  },
});

export default SupplierScreen;
