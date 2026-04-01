import React, {useState, useMemo, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import MainLayout from '../../../src/screens/MainLayout';
import {format} from 'date-fns';

import {operationService} from '../../services/operationService';
import axiosInstance from '../../services/axiosInstance';
import Toast from 'react-native-toast-message';
import KitchenIcon from '../../assets/Icons/kitchen-room.svg';
import PettyCashModal from './PettyCashModal';
import DateTimePicker from '@react-native-community/datetimepicker';
import CustomDropdown from '../../components/CustomDropdown';
import swiggyColors from '../../assets/Color/swiggyColor';
import color from '../../assets/Color/color';

export default function AdminPettyCashScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [data, setData] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Filters
  const [selectedUserId, setSelectedUserId] = useState('ALL');
  const [dateRange, setDateRange] = useState({
    start: new Date(),
    end: new Date(),
  });

  const userOptions = useMemo(() => {
    const options = users.map(u => ({label: u.name, value: u.id}));
    return [{label: 'All Staff Members', value: 'ALL'}, ...options];
  }, [users]);
  const onDateChange = (
    event: any,
    selectedDate: Date | undefined,
    type: 'start' | 'end',
  ) => {
    // Hide pickers for Android immediately
    if (type === 'start') setShowStartPicker(false);
    else setShowEndPicker(false);

    if (selectedDate) {
      setDateRange(prev => ({...prev, [type]: selectedDate}));
    }
  };
  const loadData = async (showSpinner = true) => {
    try {
      if (showSpinner) setLoading(true);

      // 3. CHANGE: Format dates HERE for the API call
      const startDateStr = format(dateRange.start, 'yyyy-MM-dd');
      const endDateStr = format(dateRange.end, 'yyyy-MM-dd');

      const [cashRes, usersRes] = await Promise.all([
        operationService.getPettyCash(
          startDateStr,
          endDateStr,
          selectedUserId === 'ALL' ? undefined : selectedUserId,
        ),
        axiosInstance.get('/users'),
      ]);

      setData(cashRes);
      setUsers(usersRes.data);
    } catch (error) {
      Toast.show({type: 'error', text1: 'Failed to fetch petty cash'});
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  useEffect(() => {
    loadData();
  }, [dateRange, selectedUserId]);

  const handleDelete = (id: string) => {
    Alert.alert('Delete Record', 'Are you sure?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await operationService.deletePettyCash(id);
          loadData(false);
        },
      },
    ]);
  };

  const renderTableRow = ({item, index}: any) => (
    <TouchableOpacity
      style={[
        styles.tableRow,
        index % 2 === 0 ? null : {backgroundColor: '#fcfdfe'},
      ]}
      onLongPress={() => handleDelete(item.id)}>
      <View style={{flex: 1.2}}>
        <Text style={styles.cellDate}>
          {format(new Date(item.createdAt), 'dd MMM')}
        </Text>
        <Text style={styles.cellYear}>
          {format(new Date(item.createdAt), 'yyyy')}
        </Text>
      </View>

      <View style={{flex: 2}}>
        <Text style={styles.cellUser} numberOfLines={1}>
          {item.user?.name}
        </Text>
        <Text style={styles.cellReason} numberOfLines={1}>
          {item.reason}
        </Text>
      </View>

      <View style={{flex: 1, alignItems: 'flex-end'}}>
        <Text style={styles.cellAmount}>₹{item.amount.toLocaleString()}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <MainLayout title="Petty Cash" showBack>
      <View style={styles.container}>
        <View style={styles.headerMetric}>
          <View style={styles.cont_total}>
            <Text style={styles.metricLabel}>Total Advance</Text>
            <Text style={styles.metricValue}>
              ₹{data?.totalAmount?.toLocaleString() || '0'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.fabButton}
            onPress={() => setIsModalOpen(true)}>
            {/* Add Icon here */}
            <Text style={{color: '#fff', fontSize: 24, fontWeight: '300'}}>
              +
            </Text>
          </TouchableOpacity>
        </View>

        {/* 2. FILTER STRIP */}
        <View style={styles.filterStrip}>
          <View style={styles.dropdownContainer}>
            <CustomDropdown
              options={userOptions}
              selectedValue={selectedUserId}
              onSelect={setSelectedUserId}
              placeholder="All Staff"
            />
          </View>

          <View style={styles.dateRangeContainer}>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowStartPicker(true)}>
              <Text style={styles.dateInputLabel}>FROM</Text>
              <Text style={styles.dateInputValue}>
                {format(dateRange.start, 'dd/MM/yy')}
              </Text>
            </TouchableOpacity>

            <View style={styles.dateSeparator} />

            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowEndPicker(true)}>
              <Text style={styles.dateInputLabel}>TO</Text>
              <Text style={styles.dateInputValue}>
                {format(dateRange.end, 'dd/MM/yy')}
              </Text>
            </TouchableOpacity>
            {showStartPicker && (
              <DateTimePicker
                value={dateRange.start}
                mode="date"
                onChange={(e, d) => onDateChange(e, d, 'start')}
              />
            )}

            {showEndPicker && (
              <DateTimePicker
                value={dateRange.end}
                mode="date"
                minimumDate={dateRange.start} // End date can't be before start
                onChange={(e, d) => onDateChange(e, d, 'end')}
              />
            )}
          </View>
        </View>

        {/* 3. TABLE SECTION */}
        <View style={styles.tableWrapper}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.columnHeader, {flex: 1.2}]}>DATE</Text>
            <Text style={[styles.columnHeader, {flex: 2}]}>STAFF / REASON</Text>
            <Text style={[styles.columnHeader, {flex: 1, textAlign: 'right'}]}>
              AMOUNT
            </Text>
          </View>

          {loading && !refreshing ? (
            <ActivityIndicator
              size="large"
              color="#6366f1"
              style={{marginTop: 40}}
            />
          ) : (
            <FlatList
              data={data?.logs || []}
              keyExtractor={item => item.id}
              renderItem={renderTableRow}
              contentContainerStyle={{paddingBottom: 40}}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No data available</Text>
              }
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => loadData(false)}
                />
              }
            />
          )}
        </View>
      </View>
      <PettyCashModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        users={users}
        onSuccess={() => loadData(false)} // Refresh list after adding
      />
    </MainLayout>
  );
}
const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},

  // Header Metric
  headerMetric: {
    backgroundColor: swiggyColors.background,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cont_total: {
    backgroundColor: '#f1f5f9',
    padding: 8,
    borderRadius: 12,
  },
  metricLabel: {
    color: swiggyColors.textPrimary,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  metricValue: {
    color: color.black,
    fontSize: 20,
    fontWeight: '800',
    marginTop: 1,
  },
  fabButton: {
    backgroundColor: color.black,
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },

  // Filter Strip
  filterStrip: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
    zIndex: 10,
  },
  dropdownContainer: {flex: 1.5},
  dateRangeContainer: {
    flex: 2,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  dateInput: {flex: 1, alignItems: 'center', paddingVertical: 4},
  dateInputLabel: {fontSize: 8, color: '#94a3b8', fontWeight: '700'},
  dateInputValue: {fontSize: 11, color: '#1e293b', fontWeight: '600'},
  dateSeparator: {width: 1, height: '60%', backgroundColor: '#e2e8f0'},

  // Table Structure
  tableWrapper: {flex: 1},
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f1f5f9',
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
  },
  columnHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    alignItems: 'center',
  },

  // Cell Styles
  cellDate: {fontSize: 13, fontWeight: '600', color: '#1e293b'},
  cellYear: {fontSize: 10, color: '#94a3b8'},
  cellUser: {fontSize: 13, fontWeight: '600', color: '#1e293b'},
  cellReason: {fontSize: 12, color: '#64748b', marginTop: 2},
  cellAmount: {fontSize: 15, fontWeight: '700', color: '#0f172a'},

  emptyText: {textAlign: 'center', marginTop: 40, color: '#94a3b8'},
});
