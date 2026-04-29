import React, {useCallback, useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import axiosInstance from '../../services/axiosInstance';
import {useSelector} from 'react-redux';
import Svg, {Path, Defs, LinearGradient, Stop} from 'react-native-svg';

const {width} = Dimensions.get('window');
const CHART_HEIGHT = 60;
const PADDING = 20;
const CONTAINER_WIDTH = width - PADDING * 2;

const LineTimelineChart = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<any>(null);
  const user = useSelector((state: any) => state.auth.user);

  const fetchTimeline = useCallback(
    async (isManual = false) => {
      try {
        if (isManual) setRefreshing(true);
        else setLoading(true);

        const today = new Date().toISOString().split('T')[0];
        const response = await axiosInstance.get('/sales/timeline', {
          params: {orgId: user?.orgId, date: today},
        });
        setData(response.data);
      } catch (error) {
        console.error('Timeline Error:', error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user?.orgId],
  );

  useEffect(() => {
    if (user?.orgId) fetchTimeline();
  }, [fetchTimeline]);

  if (loading)
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color="#6366f1" />
      </View>
    );

  const timeline = data?.timeline || [];
  const maxOrders = Math.max(...timeline.map((h: any) => h.orderCount), 1);
  const totalOrders = timeline.reduce(
    (acc: number, curr: any) => acc + curr.orderCount,
    0,
  );

  // Generate SVG Points
  const points = timeline.map((item: any, index: number) => {
    const x = (index / (timeline.length - 1)) * (CONTAINER_WIDTH - 40);
    const y = CHART_HEIGHT - (item.orderCount / maxOrders) * CHART_HEIGHT;
    return {x, y};
  });

  // Create Bezier Path
  const linePath = points.reduce((acc, point, i, a) => {
    if (i === 0) return `M ${point.x},${point.y}`;
    const prev = a[i - 1];
    const cp1x = prev.x + (point.x - prev.x) / 2;
    return `${acc} C ${cp1x},${prev.y} ${cp1x},${point.y} ${point.x},${point.y}`;
  }, '');

  const fillPath = `${linePath} L ${
    points[points.length - 1].x
  },${CHART_HEIGHT} L ${points[0].x},${CHART_HEIGHT} Z`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{flex: 1}}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Order Velocity</Text>
            <TouchableOpacity
              onPress={() => fetchTimeline(true)}
              disabled={refreshing}
              style={styles.refreshBtn}>
              {refreshing ? (
                <ActivityIndicator size="small" color="#818cf8" />
              ) : (
                <Text style={styles.refreshText}>Sync</Text>
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>Real-time performance</Text>
        </View>
        <View style={styles.statsRight}>
          <Text style={styles.totalValue}>{totalOrders}</Text>
          <Text style={styles.totalLabel}>ORDERS</Text>
        </View>
      </View>

      <View style={styles.chartArea}>
        <Svg height={CHART_HEIGHT} width={CONTAINER_WIDTH - 40}>
          <Defs>
            <LinearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#6366f1" stopOpacity="0.4" />
              <Stop offset="1" stopColor="#6366f1" stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Path d={fillPath} fill="url(#gradient)" />
          <Path
            d={linePath}
            fill="none"
            stroke="#818cf8"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </Svg>
      </View>

      <View style={styles.xAxis}>
        {['00h', '06h', '12h', '18h', '23h'].map((label, i) => (
          <Text key={i} style={styles.xLabel}>
            {label}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0f172a', // Even deeper dark blue
    borderRadius: 24,
    padding: PADDING,
    width: CONTAINER_WIDTH,
    alignSelf: 'center',
    marginVertical: 10,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#6366f1',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  center: {
    height: 140,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  refreshBtn: {
    marginLeft: 10,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  refreshText: {
    fontSize: 10,
    color: '#818cf8',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  statsRight: {
    alignItems: 'flex-end',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  totalLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748b',
    letterSpacing: 1,
  },
  chartArea: {
    height: CHART_HEIGHT,
    width: '100%',
    marginTop: 10,
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  xLabel: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '600',
  },
});

export default LineTimelineChart;
