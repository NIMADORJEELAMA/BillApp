import React, {useCallback, useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  Text,
  ActivityIndicator,
} from 'react-native';
import axiosInstance from '../../services/axiosInstance';
import {useSelector} from 'react-redux';

const {width} = Dimensions.get('window');
const CHART_HEIGHT = 100; // Increased for better visibility
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
  const [reportData, setReportData] = useState<any>(null);
  const [filter, setFilter] = useState('Month');
  const user = useSelector((state: any) => state.auth.user);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const {startDate, endDate} = getDateRange(filter);

      const response = await axiosInstance.get('/sales/report', {
        params: {
          orgId: user?.orgId,
          start: startDate,
          end: endDate,
        },
      });

      const data = response.data;
      console.log('data', data);

      // Extract and format data for the chart
      setReportData({
        summary: data.summary || {totalRevenue: 0, totalSalesCount: 0},
        topProducts: data.topProducts || [],
        paymentBreakdown: data.paymentBreakdown || [],
      });
    } catch (error) {
      console.error('Fetch Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.orgId) {
      fetchReportData();
    }
  }, [filter, user?.orgId]);

  if (loading) {
    return (
      <View style={[styles.chartContainer, styles.loader]}>
        <ActivityIndicator size="large" color="#fa2c37" />
      </View>
    );
  }

  const products = reportData?.topProducts || [];
  const summary = reportData?.summary || {totalRevenue: 0};

  // Calculate maxQuantity safely
  const maxQuantity =
    products.length > 0
      ? Math.max(...products.map((p: any) => p._sum?.quantity || 0), 1)
      : 1;

  return (
    <View style={styles.chartContainer}>
      <View style={styles.chartHeader}>
        <View>
          <Text style={styles.chartTitle}>Top 5 Products</Text>
          <Text style={styles.chartSubtitle}>Based on quantity sold</Text>
        </View>
        <Text style={styles.totalSales}>
          ${summary.totalRevenue?.toLocaleString()}
        </Text>
      </View>

      {products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.axisLabel}>No sales data available</Text>
        </View>
      ) : (
        <View style={styles.chartArea}>
          {/* Y-Axis Labels */}
          <View style={styles.yAxis}>
            <Text style={styles.axisLabel}>{Math.round(maxQuantity)}</Text>
            <Text style={styles.axisLabel}>{Math.round(maxQuantity / 2)}</Text>
            <Text style={styles.axisLabel}>0</Text>
          </View>

          <View style={styles.barChart}>
            {products.map((item: any, index: number) => {
              const qty = item._sum?.quantity || 0;
              const barHeight = (qty / maxQuantity) * (CHART_HEIGHT - 40);

              return (
                <View key={index} style={styles.barColumn}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: Math.max(barHeight, 10),
                        backgroundColor: index === 0 ? '#4F46E5' : '#E0E7FF',
                      },
                    ]}>
                    <Text
                      style={[
                        styles.barValue,
                        index !== 0 && {color: '#4F46E5'},
                      ]}>
                      {qty}
                    </Text>
                  </View>
                  <Text numberOfLines={1} style={styles.xAxisLabel}>
                    {item.name || 'N/A'}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: PADDING,
    width: CONTAINER_WIDTH,
    alignSelf: 'center',
    marginVertical: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 10,
    minHeight: 220,
  },
  loader: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  chartSubtitle: {
    fontSize: 11,
    color: '#6B7280',
  },
  totalSales: {
    fontSize: 20,
    fontWeight: '800',
    color: '#4F46E5',
  },
  chartArea: {
    flexDirection: 'row',
    height: CHART_HEIGHT,
    marginTop: 10,
  },
  emptyContainer: {
    height: CHART_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  yAxis: {
    justifyContent: 'space-between',
    paddingBottom: 20,
    marginRight: 8,
    width: 30,
  },
  axisLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'right',
  },
  barChart: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    paddingBottom: 2,
  },
  barColumn: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
    marginHorizontal: 4,
  },
  bar: {
    width: '80%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    justifyContent: 'center',
  },
  barValue: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 2,
  },
  xAxisLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 6,
    textAlign: 'center',
  },
});

export default SalesChart;
