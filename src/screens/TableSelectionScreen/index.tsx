import React, {useState, useEffect, useMemo} from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Dimensions,
  View,
  RefreshControl,
  Alert,
  Platform,
  Text,
  ScrollView,
} from 'react-native';

import {Div} from '../../components/common/UI';
import MainLayout from '../MainLayout';
import {tableService} from '../../services/tableService';
import CustomDropdown from '../../components/CustomDropdown';

import ProfileIcon from '../../assets/Icons/profile.svg'; // Adjust path
import SearchBar from '../../components/Searchbar';
import swiggyColors from '../../assets/Color/swiggyColor';
import {socket} from '../../services/socketService';
import Toast from 'react-native-toast-message';

const {width} = Dimensions.get('window');
const ITEM_WIDTH = (width - 40) / 2;

const TableSelectionScreen = ({navigation}: any) => {
  const [tables, setTables] = useState<any[]>([]);

  const [categories, setCategories] = useState<any[]>([
    {label: 'All Areas', value: 'ALL'},
  ]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedType, setSelectedType] = useState<'TABLE' | 'ROOM'>('TABLE');

  const loadInitialData = async () => {
    try {
      const [tableData, categoryData] = await Promise.all([
        tableService.getTables(),
        tableService.getCategories(),
      ]);

      // STORE EVERYTHING - Don't filter here!
      setTables(tableData);

      const mappedCats = categoryData.map((c: any) => ({
        label: c.name,
        value: c.id,
      }));
      setCategories([{label: 'All Areas', value: 'ALL'}, ...mappedCats]);
    } catch (error) {
      console.log('error', error);
      // Alert.alert('Error', 'Failed to fetch layout data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);
  useEffect(() => {
    // Connect socket if not connected
    if (!socket.connected) socket.connect();

    const handleUpdate = () => {
      loadInitialData(); // Re-fetch the data from API
    };

    // Listen for the same events as your Web dashboard
    socket.on('tableUpdated', handleUpdate);
    socket.on('newOrder', handleUpdate);
    socket.on('tableSwapped', handleUpdate);
    socket.on('itemStatusUpdated', data => {
      // if (data.status === 'READY') {
      //   loadInitialData();
      //   Toast.show({
      //     type: 'info',
      //     text1: ' Kitchen Update',
      //     text2: `Order for Table ${data.tableNumber} is ready!`,
      //     visibilityTime: 4000,
      //   });
      // }
    });

    return () => {
      socket.off('tableUpdated', handleUpdate);
      socket.off('newOrder', handleUpdate);
      socket.off('itemStatusUpdated', handleUpdate);
      socket.off('tableSwapped', handleUpdate);
    };
  }, []);

  const filteredTables = useMemo(() => {
    return tables.filter(t => {
      // 1. Main Toggle: Is it a Table or a Room?
      // If selectedType is 'TABLE', we want items where room is NULL.
      // If selectedType is 'ROOM', we want items where room is NOT NULL.
      const isRoomItem = t.room !== null;
      const matchesType = selectedType === 'ROOM' ? isRoomItem : !isRoomItem;

      if (!matchesType) return false;

      // 2. Search Filter
      const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());

      // 3. Category Filter
      const matchesCategory =
        selectedCategory === 'ALL' || t.category?.id === selectedCategory;

      // 4. Status Filter (Free/Busy)
      const matchesStatus =
        selectedStatus === 'ALL' || t.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [search, selectedCategory, selectedStatus, selectedType, tables]);
  const renderTable = ({item}: {item: any}) => {
    const isOccupied = item.status === 'OCCUPIED';
    const isActiveOrder = isOccupied && item.activeOrder;

    // Use category color from backend, fallback to slate if null
    const categoryColor = item.category?.color || '#64748B';

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={[styles.tableCard, isOccupied && styles.occupiedBorder]}
        onPress={() => navigation.navigate('OrderPage', {table: item})}>
        {/* Top Section: Status & Dot */}
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.statusBadge,
              {backgroundColor: isOccupied ? '#FFF1F2' : '#F0FDF4'},
            ]}>
            {/* <View
              style={[
                styles.statusDot,
                {backgroundColor: isOccupied ? '#F43F5E' : '#10B981'},
              ]}
            /> */}
            <Text
              style={[
                styles.statusText,
                {color: isOccupied ? '#F43F5E' : '#10B981'},
              ]}>
              {item.status}
            </Text>
          </View>
          {/* Order Status Tag (e.g., BILLED) */}
          {isActiveOrder && (
            <View style={styles.orderStatusTag}>
              <Text style={styles.orderStatusText}>
                {item.activeOrder.status}
              </Text>
            </View>
          )}
        </View>

        {/* Middle Section: Name & Category */}
        <View style={styles.mainInfo}>
          <Text style={styles.tableName}>{item.name}</Text>
          <View
            style={[
              styles.categoryPill,
              {backgroundColor: `${categoryColor}15`},
            ]}>
            <Text style={[styles.categoryText, {color: categoryColor}]}>
              {item.category?.name || 'Room'}
            </Text>
          </View>
        </View>

        {/* Bottom Section: Order Details or Placeholder */}
        <View style={styles.cardFooter}>
          {isActiveOrder ? (
            <View style={styles.activeDetails}>
              <View>
                <Text style={styles.waiterLabel}>Waiter</Text>
                <Text style={styles.waiterName}>
                  {item.activeOrder.waiterName || 'N/A'}
                </Text>
              </View>
              <View>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.priceText}>
                  ₹{item.activeOrder.runningTotal}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={styles.availableText}>TAP TO START ORDER</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const StatusFilters = () => {
    const statuses = [
      {label: 'All', value: 'ALL', color: '#64748B'},
      {label: 'Free', value: 'FREE', color: '#10B981'},
      {label: 'Busy', value: 'OCCUPIED', color: '#F43F5E'},
    ];

    return (
      <View style={styles.sliderTrack}>
        {statuses.map(s => {
          const isActive = selectedStatus === s.value;
          return (
            <TouchableOpacity
              key={s.value}
              activeOpacity={0.8}
              onPress={() => setSelectedStatus(s.value)}
              style={[styles.sliderTab, isActive && styles.activeTab]}>
              <Text
                style={[
                  styles.sliderText,
                  isActive && {color: s.color, fontWeight: '800'},
                ]}>
                {s.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <MainLayout
      title="Hill Top Eco Tourism"
      // subtitle="Select a table to start"
      rightComponent={
        <View>
          <TouchableOpacity
            onPress={() => navigation.navigate('ProfileScreenBms')}
            style={styles.profileCircle}>
            <ProfileIcon width={18} height={18} fill="#94A3B8" />
          </TouchableOpacity>
        </View>
      }>
      <View style={styles.headerContainer}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search..."
        />

        <View style={styles.filterBarWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
            style={{overflow: 'visible'}}>
            {/* 1. Area Dropdown */}
            <View style={styles.dropdownWrapper}>
              <CustomDropdown
                options={categories}
                selectedValue={selectedCategory}
                onSelect={setSelectedCategory}
                placeholder="Area"
              />
            </View>

            {/* 2. Table/Room Toggle (Styled as a compact pill) */}
            {/*
            <View style={styles.compactTypeSlider}>
              {['TABLE', 'ROOM'].map(type => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeTab,
                    selectedType === type && styles.activeTypeTab,
                  ]}
                  onPress={() => setSelectedType(type as any)}>
                  <Text
                    style={[
                      styles.typeTabText,
                      selectedType === type && styles.activeTypeTabText,
                    ]}>
                    {type === 'TABLE' ? 'Tables' : 'Rooms'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
*/}
            {/* 3. Status Filters */}
            <View style={styles.statusWrapper}>
              <StatusFilters />
            </View>
          </ScrollView>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#fa2c37"
          style={{marginTop: 50}}
        />
      ) : (
        <FlatList
          data={filteredTables}
          renderItem={renderTable}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Div center mt={50}>
              <Text style={{color: '#94A3B8'}}>
                No tables match your filters.
              </Text>
            </Div>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadInitialData();
              }}
            />
          }
        />
      )}
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  filterBarWrapper: {
    // height: 60, // Fixed height for the bar
    marginTop: 8,
    backgroundColor: '#FFF',
    zIndex: 5000,
    overflow: 'visible',
  },
  filterScroll: {
    paddingHorizontal: 0,
    flexDirection: 'row', // Align items horizontally
    alignItems: 'center', // Vertically center items in the bar
    gap: 12, // Modern spacing (requires RN 0.71+)
  },
  dropdownWrapper: {
    // width: 140, // Give it a fixed width so it doesn't shrink
    minWidth: 110,
    zIndex: 6000,
  },
  compactTypeSlider: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 3,
    minWidth: 120, // Fixed width for the Table/Room toggle
    // height: 40,
  },
  typeTab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTypeTab: {
    // paddingVertical: 4,
    backgroundColor: '#FFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  typeTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  activeTypeTabText: {
    color: swiggyColors.textPrimary,
    paddingVertical: 6,
  },
  statusWrapper: {
    minWidth: 200, // Ensures status filters don't compress
  },

  sliderTrack: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 2,
    height: 32,
    alignItems: 'center',
    minWidth: 160, // Ensure the status filter has enough width to force a scroll
  },
  headerContainer: {
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    paddingTop: 10,
    padding: 16,
    zIndex: 1000,
    // elevation: 4,
  },
  //
  // Table Card Adjustments
  tableCard: {
    width: ITEM_WIDTH - 14,
    margin: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    minHeight: 170,
    borderTopWidth: 1.5, // Accent line using backend category color
    // Shadow
    shadowColor: '#282C3F',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1.5,
    justifyContent: 'space-between',
    borderColor: '#10B981',
  },
  occupiedBorder: {
    borderColor: '#F43F5E20',
    borderWidth: 1.5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  orderStatusTag: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  orderStatusText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '700',
  },
  mainInfo: {
    marginVertical: 10,
  },
  tableName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1E293B',
  },
  categoryPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f3f5f7',
    paddingTop: 4,
  },
  activeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  waiterLabel: {fontSize: 9, color: '#64748B', fontWeight: '600'},
  waiterName: {fontSize: 12, color: '#1E293B', fontWeight: '700'},
  totalLabel: {
    fontSize: 9,
    color: '#64748B',
    textAlign: 'right',
    fontWeight: '600',
  },
  priceText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1E293B', // Brand Orange
    textAlign: 'right',
  },
  availableText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    textAlign: 'center',
    letterSpacing: 0.5,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1, // Takes all available space between icons
    height: '100%',
    fontSize: 15,
    color: '#1E293B',
    paddingVertical: 0, // Critical for Android vertical centering
  },
  clearButton: {
    padding: 4,
    marginLeft: 4,
  },
  profileCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9', // Light grey background
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  dropdownBox: {
    flex: 1, // 50/50 split
    zIndex: 1001, // Stays above the status slider
  },
  statusBox: {
    flex: 1, // 50/50 split
  },

  sliderTab: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: '#FFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {elevation: 2},
    }),
  },
  sliderText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  list: {
    padding: 10,
    paddingBottom: 40,
  },
});

export default TableSelectionScreen;
