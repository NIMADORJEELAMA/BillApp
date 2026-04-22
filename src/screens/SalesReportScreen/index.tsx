import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';

import MainLayout from '../../screens/MainLayout';
import {BarChart, PieChart} from 'react-native-gifted-charts';
import axiosInstance from '../../services/axiosInstance';
import {useSelector} from 'react-redux';
const getDateRange = (type: string) => {
  const end = new Date();
  const start = new Date();

  if (type === 'Week') {
    start.setDate(end.getDate() - 7);
  } else if (type === 'Month') {
    start.setMonth(end.getMonth() - 1);
  }
  // 'Today' stays as is (start = end)

  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
};
const SalesReportScreen = () => {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);
  const [filter, setFilter] = useState('Today');
  const user = useSelector(state => state.auth.user);
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

      const colors = ['#4CAF50', '#2196F3', '#FF9800', '#F44336'];
      const formattedPayment =
        data.paymentBreakdown?.map((item: any, index: number) => ({
          value: Number(item._sum?.finalAmount || 0),
          text: item.paymentMode,
          color: colors[index % colors.length],
          label: item.paymentMode,
          _sum: item._sum,
        })) || [];

      const formattedProducts =
        data.topProducts?.map((p: any) => ({
          value: Number(p._sum?.quantity || 0),
          label: p.name ? p.name.substring(0, 5) : 'N/A',
          frontColor: '#fa2c37',
        })) || [];

      setReportData({
        summary: data.summary || {totalRevenue: 0, totalSalesCount: 0},
        paymentBreakdown: formattedPayment,
        topProducts: formattedProducts,
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
  if (loading)
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#fa2c37" />
      </View>
    );

  return (
    <MainLayout
      title="Sales Analytics"
      showBack
      subtitle="Real-time performance">
      <View style={styles.filterRow}>
        {['Today', 'Week', 'Month'].map(item => (
          <TouchableOpacity
            key={item}
            onPress={() => setFilter(item)}
            style={[
              styles.filterTab,
              filter === item && styles.activeFilterTab,
            ]}>
            <Text
              style={[
                styles.filterText,
                filter === item && styles.activeFilterText,
              ]}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        <View style={styles.kpiRow}>
          <View style={[styles.kpiCard, {borderLeftColor: '#fa2c37'}]}>
            <Text style={styles.kpiLabel}>Revenue</Text>
            <Text style={styles.kpiValue}>
              ₹{reportData.summary.totalRevenue.toLocaleString()}
            </Text>
          </View>
          <View style={[styles.kpiCard, {borderLeftColor: '#2196F3'}]}>
            <Text style={styles.kpiLabel}>Orders</Text>
            <Text style={styles.kpiValue}>
              {reportData.summary.totalSalesCount}
            </Text>
          </View>
        </View>

        {/* Sales Chart Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Top Selling Items</Text>
          <View style={styles.chartContainer}>
            <BarChart
              data={reportData.topProducts}
              barWidth={35}
              noOfSections={3}
              barBorderRadius={4}
              frontColor="#fa2c37"
              yAxisThickness={0}
              xAxisThickness={0}
              hideRules
              labelTextStyle={{color: '#888', fontSize: 10}}
            />
          </View>
        </View>

        {/* Payment Breakdown Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Payment Methods</Text>
          <View style={styles.row}>
            <PieChart
              data={reportData.paymentBreakdown.map((i: any) => ({
                value: i._sum.finalAmount,
                color: i.color,
              }))}
              donut
              radius={70}
              innerRadius={50}
              innerCircleColor={'#fff'}
            />
            <View style={styles.legendContainer}>
              {reportData.paymentBreakdown.map((item: any, index: number) => (
                <View key={index} style={styles.legendItem}>
                  <View style={[styles.dot, {backgroundColor: item.color}]} />
                  <Text style={styles.legendText}>{item.text}: </Text>
                  <Text style={styles.legendAmount}>
                    ₹{item._sum.finalAmount}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={{height: 40}} />
      </ScrollView>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  loader: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  filterRow: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#E8EDF0',
    borderRadius: 10,
    padding: 4,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeFilterTab: {
    backgroundColor: '#fff',
    elevation: 2,
  },
  filterText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  activeFilterText: {
    color: '#fa2c37',
  },
  scrollContainer: {padding: 15},
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  kpiCard: {
    backgroundColor: '#fff',
    width: '48%',
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  kpiLabel: {fontSize: 12, color: '#888', fontWeight: '600'},
  kpiValue: {fontSize: 18, fontWeight: 'bold', color: '#121212', marginTop: 5},
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
  },
  chartContainer: {alignItems: 'center', justifyContent: 'center'},
  row: {flexDirection: 'row', alignItems: 'center'},
  legendContainer: {marginLeft: 20, flex: 1},
  legendItem: {flexDirection: 'row', alignItems: 'center', marginBottom: 10},
  dot: {width: 10, height: 10, borderRadius: 5, marginRight: 8},
  legendText: {fontSize: 13, color: '#666'},
  legendAmount: {fontSize: 13, fontWeight: '700', color: '#121212'},
});

export default SalesReportScreen;
