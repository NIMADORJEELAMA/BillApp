import React, {useState, useMemo, useEffect} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Text,
  Alert,
  RefreshControl,
} from 'react-native';
import MainLayout from '../../screens/MainLayout';
import {usersService} from '../../services/usersService';
import StaffModal from './StaffModal';
import SearchBar from '../../components/Searchbar';

const StaffScreen = () => {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fetchStaff = async (isRefreshingCall = false) => {
    try {
      if (isRefreshingCall) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const res = await usersService.getUsers();
      setUsers(res);
    } catch (error) {
      console.error('Error loading staff:', error);
      Alert.alert('Error', 'Failed to load staff members');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    fetchStaff(true);
  }, []);
  useEffect(() => {
    fetchStaff();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(
      u =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, users]);

  const handleOpenModal = (user = null) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleSubmit = async formData => {
    try {
      setIsSubmitting(true);
      if (selectedUser) {
        // Update Logic
        await usersService.updateUser(selectedUser.id, formData);
      } else {
        // Create Logic
        await usersService.createUser(formData);
      }
      setIsModalOpen(false);
      fetchStaff(); // Refresh list
    } catch (error) {
      Alert.alert('Error', 'Action failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id, name) => {
    Alert.alert('', `Are you sure you want to remove ${name}?`, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await usersService.deleteUser(id);
            fetchStaff();
          } catch (e) {
            Alert.alert('Error', 'Could not delete user');
          }
        },
      },
    ]);
  };

  const getInitials = name => {
    return name
      ? name
          .split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase()
          .substring(0, 2)
      : '??';
  };

  const renderStaffItem = ({item}) => (
    <View style={styles.row}>
      <View style={styles.employeeCol}>
        <View style={{flex: 1}}>
          <Text style={styles.nameText} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.emailText} numberOfLines={1}>
            {item.email}
          </Text>
        </View>
      </View>

      <View style={styles.roleCol}>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{item.role?.replace('_', ' ')}</Text>
        </View>
      </View>

      <View style={styles.statusCol}>
        <View
          style={[
            styles.statusDot,
            {backgroundColor: item.isActive ? '#10b981' : '#cbd5e1'},
          ]}
        />
        <Text
          style={[
            styles.statusText,
            {color: item.isActive ? '#059669' : '#64748b'},
          ]}>
          {item.isActive ? 'Active' : 'Off'}
        </Text>
      </View>

      <View style={styles.actionCol}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleOpenModal(item)}>
          <Text style={{color: '#6366f1', fontWeight: 'bold'}}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleDelete(item.id, item.name)}>
          <Text style={{color: '#ef4444', fontWeight: 'bold'}}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <MainLayout
      title="Staff"
      subtitle={`${users.length} members total`}
      showBack
      rightComponent={''}>
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <View style={styles.searchInput}>
            <SearchBar
              value={search}
              onChangeText={setSearch}
              placeholder="Search..."
            />
          </View>
          <View style={styles.addContainer}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => handleOpenModal()}>
              <Text style={{color: 'white', fontSize: 20, fontWeight: 'bold'}}>
                +
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator color="#6366f1" style={{marginTop: 50}} />
        ) : (
          <FlatList
            data={filteredUsers}
            keyExtractor={item => item.id.toString()}
            renderItem={renderStaffItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#6366f1']} // Android color
                tintColor="#6366f1" // iOS color
              />
            }
            ListEmptyComponent={
              <Text style={styles.emptyText}>No employees found.</Text>
            }
          />
        )}
      </View>

      <StaffModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingUser={selectedUser}
        onSubmit={handleSubmit}
        isPending={isSubmitting}
      />
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, paddingHorizontal: 16},
  searchContainer: {
    marginTop: 6,
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
  },
  searchInput: {width: '86%'},
  addContainer: {
    width: '14%',
    alignContent: 'center',
    // backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#6366f1',
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {paddingBottom: 40},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#f1f1f1',
  },
  employeeCol: {flex: 3, flexDirection: 'row', alignItems: 'center'},
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {fontSize: 14, fontWeight: 'bold', color: '#6366f1'},
  nameText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  emailText: {fontSize: 12, color: '#64748b'},
  roleCol: {flex: 1.5, alignItems: 'flex-start'},
  roleBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
  },
  statusCol: {flex: 1.5, flexDirection: 'row', alignItems: 'center'},
  statusDot: {width: 8, height: 8, borderRadius: 4, marginRight: 6},
  statusText: {fontSize: 12, fontWeight: '600'},
  actionCol: {
    flex: 1.2,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  actionBtn: {padding: 4},
  emptyText: {textAlign: 'center', marginTop: 40, color: '#94a3b8'},
});

export default StaffScreen;
