import React, {useCallback, useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import axiosInstance from '../../services/axiosInstance';
import {useSelector} from 'react-redux';

const {width} = Dimensions.get('window');
const PADDING = 20;
const CONTAINER_WIDTH = width - PADDING * 2;

const getDateRange = (type: string) => {
  const end = new Date();
  const start = new Date();
  if (type === 'Week') start.setDate(end.getDate() - 7);
  else if (type === 'Month') start.setMonth(end.getMonth() - 1);

  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
};
const SalesChart = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [filter, setFilter] = useState('Month');
  const user = useSelector((state: any) => state.auth.user);

  const fetchReportData = useCallback(
    async (isManual = false) => {
      try {
        if (isManual) setRefreshing(true);
        else setLoading(true);

        const {startDate, endDate} = getDateRange(filter);
        const response = await axiosInstance.get('/sales/report', {
          params: {orgId: user?.orgId, start: startDate, end: endDate},
        });

        setReportData(response.data);
      } catch (error) {
        console.error('Fetch Error:', error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [filter, user?.orgId],
  );

  useEffect(() => {
    if (user?.orgId) fetchReportData();
  }, [fetchReportData]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  const {summary, topProducts, paymentBreakdown} = reportData || {};
  const maxQty = Math.max(
    ...(topProducts?.map((p: any) => p._sum?.quantity) || [1]),
  );

  return (
    <View style={styles.container}>
      {/* Header Section */}
      {/* <View style={styles.header}>
        <View>
          <Text style={styles.title}>Revenue Overview</Text>
          <Text style={styles.subtitle}>
            Performance for this {filter.toLowerCase()}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => fetchReportData(true)}
          style={styles.refreshBadge}>
          {refreshing ? (
            <ActivityIndicator size="small" color="#6366F1" />
          ) : (
            <Text style={styles.refreshText}>Refresh</Text>
          )}
        </TouchableOpacity>
      </View> */}

      {/* Summary Cards */}
      {/* <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.summaryScroll}>
        <SummaryCard
          label="Total Revenue"
          value={`$${summary?.totalRevenue?.toLocaleString()}`}
          color="#6366F1"
        />
        <SummaryCard
          label="Avg. Order"
          value={`$${summary?.averageOrderValue?.toFixed(2)}`}
          color="#10B981"
        />
        <SummaryCard
          label="Total Sales"
          value={summary?.totalSalesCount}
          color="#F59E0B"
        />
      </ScrollView> */}

      {/* Top Products Horizontal Bars */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Products</Text>
        <TouchableOpacity
          onPress={() => fetchReportData(true)}
          style={styles.refreshBadge}>
          {refreshing ? (
            <ActivityIndicator size="small" color="#6366F1" />
          ) : (
            <Text style={styles.refreshText}>Refresh</Text>
          )}
        </TouchableOpacity>
        {topProducts?.map((item: any, index: number) => (
          <View key={index} style={styles.productRow}>
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.productQty}>{item._sum?.quantity} sold</Text>
            </View>
            <View style={styles.barBackground}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${(item._sum?.quantity / maxQty) * 100}%`,
                    backgroundColor: index === 0 ? '#6366F1' : '#C7D2FE',
                  },
                ]}
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const SummaryCard = ({label, value, color}: any) => (
  <View style={[styles.card, {borderLeftColor: color}]}>
    <Text style={styles.cardLabel}>{label}</Text>
    <Text style={[styles.cardValue, {color}]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {padding: 16, backgroundColor: '#F9FAFB'},
  loaderContainer: {height: 200, justifyContent: 'center'},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {fontSize: 20, fontWeight: '800', color: '#111827'},
  subtitle: {fontSize: 13, color: '#6B7280'},
  refreshBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
  },
  refreshText: {color: '#6366F1', fontWeight: '600', fontSize: 12},
  summaryScroll: {marginBottom: 24},
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    width: 140,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  cardLabel: {fontSize: 12, color: '#6B7280', marginBottom: 4},
  cardValue: {fontSize: 16, fontWeight: 'bold'},
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
    color: '#374151',
  },
  productRow: {marginBottom: 14},
  productInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  productName: {fontSize: 14, fontWeight: '600', color: '#1F2937', flex: 1},
  productQty: {fontSize: 12, color: '#6B7280'},
  barBackground: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {height: '100%', borderRadius: 4},
});

export default SalesChart;
