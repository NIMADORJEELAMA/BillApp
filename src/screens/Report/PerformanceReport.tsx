import React, {useState, useMemo, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import MainLayout from '../../../src/screens/MainLayout';
import {format} from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';

// Assuming these are your existing project imports
import swiggyColors from '../../assets/Color/swiggyColor';
import color from '../../assets/Color/color';
import {operationService} from '../../services/operationService';

export default function AdminPerformanceReportScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<any>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Filters
  const [dateRange, setDateRange] = useState({
    start: new Date(2026, 2, 1), // March 1st, 2026 as per your sample
    end: new Date(2026, 2, 16),
  });

  const onDateChange = (
    event: any,
    selectedDate: Date | undefined,
    type: 'start' | 'end',
  ) => {
    if (type === 'start') setShowStartPicker(false);
    else setShowEndPicker(false);

    if (selectedDate) {
      setDateRange(prev => ({...prev, [type]: selectedDate}));
    }
  };

  const loadData = async (showSpinner = true) => {
    try {
      if (showSpinner) setLoading(true);

      const startDateStr = format(dateRange.start, 'yyyy-MM-dd');
      const endDateStr = format(dateRange.end, 'yyyy-MM-dd');

      // Replace with your actual service call:
      const res = await operationService.getPerformanceReport(
        startDateStr,
        endDateStr,
      );

      setData(res);
    } catch (error) {
      Toast.show({type: 'error', text1: 'Failed to fetch report'});
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const renderItemRow = ({item, index}: any) => (
    <View
      style={[
        styles.tableRow,
        index % 2 === 0 ? null : {backgroundColor: '#fcfdfe'},
      ]}>
      <View style={{flex: 2}}>
        <Text style={styles.cellItemName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.cellCategory}>{item.category}</Text>
      </View>
      <View style={{flex: 0.8, alignItems: 'center'}}>
        <Text style={styles.cellQty}>x{item.quantity}</Text>
      </View>
      <View style={{flex: 1.2, alignItems: 'flex-end'}}>
        <Text style={styles.cellAmount}>₹{item.revenue.toLocaleString()}</Text>
      </View>
    </View>
  );
  const renderPeakHours = () => {
    if (!data?.peakHours) return null;

    const maxOrders = Math.max(...data.peakHours);

    return (
      <View style={styles.peakHourContainer}>
        <Text style={styles.sectionTitle}>Orders by Hour (24h)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.barChartRow}>
            {data.peakHours.map((count: number, hour: number) => (
              <View key={hour} style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: maxOrders > 0 ? (count / maxOrders) * 40 : 2,
                      backgroundColor:
                        count === maxOrders && maxOrders > 0
                          ? '#6366f1'
                          : '#cbd5e1',
                    },
                  ]}
                />
                <Text style={styles.barLabel}>{hour}h</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  return (
    <MainLayout title="Sales Performance" showBack>
      <View style={styles.container}>
        {/* 1. METRIC HEADER (Using your layout style) */}
        <View style={styles.headerMetric}>
          <View style={styles.cont_total}>
            <Text style={styles.metricLabel}>Total Revenue</Text>
            <Text style={styles.metricValue}>
              ₹{data?.summary?.totalRevenue?.toLocaleString() || '0'}
            </Text>
          </View>
          <View style={[styles.cont_total, {backgroundColor: '#ecfdf5'}]}>
            <Text style={[styles.metricLabel, {color: '#059669'}]}>Orders</Text>
            <Text style={[styles.metricValue, {color: '#059669'}]}>
              {data?.summary?.orderCount || '0'}
            </Text>
          </View>
        </View>

        {/* 2. FILTER STRIP */}
        <View style={styles.filterStrip}>
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
          </View>

          {/* Payment Briefing */}
          <View style={styles.paymentBrief}>
            <Text style={styles.miniLabel}>
              CASH: ₹{data?.paymentReconciliation?.cash}
            </Text>
            <Text style={styles.miniLabel}>
              ONLINE: ₹{data?.paymentReconciliation?.online}
            </Text>
          </View>
        </View>
        {renderPeakHours()}

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
            minimumDate={dateRange.start}
            onChange={(e, d) => onDateChange(e, d, 'end')}
          />
        )}

        {/* 3. TABLE SECTION */}
        <View style={styles.tableWrapper}>
          <View style={styles.tableHeader}>
            <Text style={[styles.columnHeader, {flex: 2}]}>
              ITEM & CATEGORY
            </Text>
            <Text
              style={[styles.columnHeader, {flex: 0.8, textAlign: 'center'}]}>
              QTY
            </Text>
            <Text
              style={[styles.columnHeader, {flex: 1.2, textAlign: 'right'}]}>
              REVENUE
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
              data={data?.topSellingItems || []}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderItemRow}
              contentContainerStyle={{paddingBottom: 40}}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  No sales data for this period
                </Text>
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
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  headerMetric: {
    backgroundColor: swiggyColors.background,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
  },
  cont_total: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 12,
  },
  metricLabel: {
    color: swiggyColors.textPrimary,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  metricValue: {
    color: color.black,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  peakHourContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  barChartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 60,
    gap: 8,
    paddingRight: 16,
  },
  barWrapper: {
    alignItems: 'center',
    width: 25,
  },
  bar: {
    width: 12,
    borderRadius: 4,
    minHeight: 2,
  },
  barLabel: {
    fontSize: 8,
    color: '#94a3b8',
    marginTop: 4,
  },
  filterStrip: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    gap: 8,
  },
  dateRangeContainer: {
    flex: 1.5,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  paymentBrief: {
    flex: 1,
    justifyContent: 'center',
  },
  miniLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748b',
    textAlign: 'right',
  },
  dateInput: {flex: 1, alignItems: 'center', paddingVertical: 4},
  dateInputLabel: {fontSize: 8, color: '#94a3b8', fontWeight: '700'},
  dateInputValue: {fontSize: 11, color: '#1e293b', fontWeight: '600'},
  dateSeparator: {
    width: 1,
    height: '60%',
    backgroundColor: '#e2e8f0',
    alignSelf: 'center',
  },
  tableWrapper: {flex: 1},
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f1f5f9',
  },
  columnHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    alignItems: 'center',
  },
  cellItemName: {fontSize: 13, fontWeight: '600', color: '#1e293b'},
  cellCategory: {fontSize: 10, color: '#94a3b8', textTransform: 'uppercase'},
  cellQty: {fontSize: 13, fontWeight: '700', color: '#6366f1'},
  cellAmount: {fontSize: 14, fontWeight: '700', color: '#0f172a'},
  emptyText: {textAlign: 'center', marginTop: 40, color: '#94a3b8'},
});
