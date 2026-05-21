import React, {useState, useEffect, useCallback, useMemo} from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Platform,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import MainLayout from '../../../src/screens/MainLayout';
import axiosInstance from '../../services/axiosInstance';
import {connectAndPrint} from '../../services/PrinterService';
import Toast from 'react-native-toast-message';
import ReceiptViewModal from '../../components/Printer/ReceiptViewModal';
import DateRangePicker from '../../components/Calendar/CustomCalendarPicker';
import SearchBar from '../../components/Searchbar';
import CalendarIcon from '../../assets/Icons/calendar-week.svg';
import color from '../../assets/Color/color';

// Static layout component declared globally to prevent unnecessary mounting/re-creations
const ListEmptyComponent = () => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyText}>No matching sales found</Text>
  </View>
);

// Reusable Custom Debounce Hook
function useDebounce(value: any, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// Optimized, Modern Card Item Component using React.memo
const SaleItem = React.memo(({item, onPress}: any) => {
  const isCash = item.paymentMode === 'CASH';
  const isUpi = item.paymentMode === 'UPI' || item.paymentMode === 'ONLINE';
  const date = new Date(item.createdAt);

  return (
    <TouchableOpacity
      activeOpacity={0.6}
      onPress={() => onPress(item)}
      style={styles.saleCard}>
      <View style={styles.cardMain}>
        <View style={styles.cardLeftContent}>
          <Text style={styles.billNumber}>Bill #{item.billNumber}</Text>
          <Text style={styles.cashierName}>
            By {item.user?.name || 'Admin'}
          </Text>
          <Text style={styles.dateText}>
            {date.toLocaleDateString()} •{' '}
            {date.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>

        <View style={styles.cardRightContent}>
          <Text style={styles.finalAmt}>
            ₹{parseFloat(item.finalAmount || 0).toFixed(2)}
          </Text>

          <View
            style={[
              styles.payBadge,
              {
                backgroundColor: isCash
                  ? '#F0F9FF' // Soft light blue
                  : isUpi
                  ? '#F0FDF4' // Soft mint green
                  : '#F5F5F5', // Soft gray
              },
            ]}>
            <Text
              style={[
                styles.payText,
                {
                  color: isCash ? '#0284C7' : isUpi ? '#16A34A' : '#525252',
                },
              ]}>
              {item.paymentMode}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

export default function SalesListScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sales, setSales] = useState<any[]>([]);

  // Filter Management States
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState<'start' | 'end' | null>(null);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedSale, setSelectedSale] = useState<any>(null);

  // Apply Predefined Default Range: Last 7 Days
  useEffect(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);
    oneWeekAgo.setHours(0, 0, 0, 0);

    setStartDate(oneWeekAgo);
    setEndDate(today);
  }, []);

  const debouncedSearch = useDebounce(searchQuery, 400);
  const debouncedStartDate = useDebounce(startDate, 400);
  const debouncedEndDate = useDebounce(endDate, 400);

  // Structural parameters for API Filtering
  const filters = useMemo(() => {
    return {
      ...(debouncedSearch && {search: debouncedSearch}),
      ...(debouncedStartDate && {startDate: debouncedStartDate.toISOString()}),
      ...(debouncedEndDate && {endDate: debouncedEndDate.toISOString()}),
    };
  }, [debouncedSearch, debouncedStartDate, debouncedEndDate]);

  const fetchSales = useCallback(
    async (showSpinner = true) => {
      try {
        if (showSpinner) setLoading(true);

        const response = await axiosInstance.get('/sales', {
          params: filters,
        });

        setSales(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        Toast.show({type: 'error', text1: 'Failed to load sales'});
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [filters],
  );

  useEffect(() => {
    fetchSales(true);
  }, [fetchSales]);

  const formatDisplayDate = (date: Date | null): string => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const onDateChange = useCallback(
    (event: any, selectedDate?: Date) => {
      if (Platform.OS === 'android') setShowPicker(null);
      if (event.type === 'set' && selectedDate) {
        if (showPicker === 'start') setStartDate(selectedDate);
        else if (showPicker === 'end') setEndDate(selectedDate);
      }
    },
    [showPicker],
  );

  const openBill = useCallback((sale: any) => {
    setSelectedSale(sale);
    setViewModalVisible(true);
  }, []);

  const handlePrintFromModal = useCallback(async () => {
    if (!selectedSale) return;
    try {
      connectAndPrint(selectedSale);
      Toast.show({type: 'success', text1: 'Printing Receipt...'});
    } catch (error) {
      Toast.show({type: 'error', text1: 'Print failed. Check connection.'});
    }
  }, [selectedSale]);

  // Aggregate Metrics Summary
  const stats = useMemo(() => {
    return sales.reduce(
      (acc, curr) => {
        acc.total += parseFloat(curr.finalAmount || 0);
        acc.count += 1;
        return acc;
      },
      {total: 0, count: 0},
    );
  }, [sales]);

  const renderSaleItem = useCallback(
    ({item}: {item: any}) => {
      return <SaleItem item={item} onPress={openBill} />;
    },
    [openBill],
  );

  return (
    <MainLayout title="Sales History" showBack>
      <View style={styles.container}>
        {/* Header Content with Filter iuguyfwewe */}
        <View style={styles.headerFilter}>
          <SearchBar
            placeholder="Search Bill # or Cashier..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          <View style={styles.dateRangeContainer}>
            <TouchableOpacity
              style={styles.calendarIconBtn}
              onPress={() => setCalendarVisible(true)}>
              <View style={styles.pickerContent}>
                <CalendarIcon
                  width={20}
                  height={20}
                  stroke={color.grey || '#64748B'}
                  strokeWidth={2}
                />
                <Text style={styles.dateText}>
                  {startDate && endDate
                    ? `${formatDisplayDate(startDate)}  –  ${formatDisplayDate(
                        endDate,
                      )}`
                    : startDate
                    ? `${formatDisplayDate(startDate)}`
                    : 'Select Date Range'}
                </Text>
              </View>
            </TouchableOpacity>

            {(startDate || endDate) && (
              <TouchableOpacity
                style={styles.resetBtn}
                onPress={() => {
                  setStartDate(null);
                  setEndDate(null);
                }}>
                <Text style={styles.resetBtnText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Quick Stats Metric Bar */}
          <View style={styles.statsRow}>
            <Text style={styles.statsText}>Showing {stats.count} bills</Text>
            <Text style={styles.totalRevenue}>
              Total:{' '}
              <Text style={styles.revenueAmount}>
                ₹
                {stats.total.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
            </Text>
          </View>
        </View>

        {showPicker && (
          <DateTimePicker
            value={(showPicker === 'start' ? startDate : endDate) || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
          />
        )}

        <DateRangePicker
          visible={calendarVisible}
          onClose={() => setCalendarVisible(false)}
          initialStartDate={startDate}
          initialEndDate={endDate}
          onApply={(start, end) => {
            setStartDate(start);
            setEndDate(end);
          }}
        />

        {/* Sales Dynamic List Layer */}
        <FlatList
          data={sales}
          keyExtractor={item =>
            item.id?.toString() || item.billNumber?.toString()
          }
          renderItem={renderSaleItem}
          contentContainerStyle={styles.listPadding}
          initialNumToRender={10}
          maxToRenderPerBatch={12}
          removeClippedSubviews={Platform.OS === 'android'}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchSales(false)}
              tintColor="#2563EB"
              colors={['#2563EB']}
            />
          }
          ListEmptyComponent={
            loading ? (
              <ActivityIndicator
                size="small"
                color="#2563EB"
                style={{marginTop: 32}}
              />
            ) : (
              ListEmptyComponent
            )
          }
        />
      </View>
      <ReceiptViewModal
        isVisible={viewModalVisible}
        onClose={() => setViewModalVisible(false)}
        sale={selectedSale}
        onPrint={handlePrintFromModal}
      />
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f3f3',
  },
  headerFilter: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.03,
    shadowRadius: 8,
  },
  dateRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    width: '100%',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  calendarIconBtn: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
  },
  pickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
  },
  resetBtn: {
    paddingLeft: 10,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetBtnText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    alignItems: 'center',
  },
  statsText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  totalRevenue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
  revenueAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  listPadding: {
    padding: 16,
    paddingBottom: 32,
  },
  saleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  cardMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLeftContent: {
    flex: 1,
    alignItems: 'flex-start',
  },
  cardRightContent: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingLeft: 12,
  },
  billNumber: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  cashierName: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 6,
  },
  dateTextComponent: {
    fontSize: 11,
    color: '#94A3B8',
  },
  finalAmt: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  payBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 64,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },
});
