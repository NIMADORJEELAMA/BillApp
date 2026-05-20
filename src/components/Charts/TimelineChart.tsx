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
import RefreshIcon from '../../assets/Icons/refresh-dot.svg';
import color from '../../assets/Color/color';

const {width} = Dimensions.get('window');
const CHART_HEIGHT = 60;
const PADDING = 20;
const CONTAINER_WIDTH = width - PADDING * 2;

const LineTimelineChart = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState(false); // Added error state
  const user = useSelector((state: any) => state.auth.user);

  const fetchTimeline = useCallback(
    async (isManual = false) => {
      try {
        if (isManual) setRefreshing(true);
        else setLoading(true);
        setError(false); // Reset error on new fetch

        const today = new Date().toISOString().split('T')[0];
        const response = await axiosInstance.get('/sales/timeline', {
          params: {orgId: user?.orgId, date: today},
        });
        setData(response.data);
      } catch (err) {
        console.error('Timeline Error:', err);
        setError(true); // Set error state if API fails
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

  // Safe Check: If there's an error or no data, show a fallback instead of crashing
  const hasData = timeline.length > 0 && !error;

  let fillPath = '';
  let linePath = '';
  let totalOrders = 0;

  if (hasData) {
    const maxOrders = Math.max(...timeline.map((h: any) => h.orderCount), 1);
    totalOrders = timeline.reduce(
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
    linePath = points.reduce((acc, point, i, a) => {
      if (i === 0) return `M ${point.x},${point.y}`;
      const prev = a[i - 1];
      const cp1x = prev.x + (point.x - prev.x) / 2;
      return `${acc} C ${cp1x},${prev.y} ${cp1x},${point.y} ${point.x},${point.y}`;
    }, '');

    // Now it's safe to access points because we checked if hasData is true
    fillPath = `${linePath} L ${
      points[points.length - 1].x
    },${CHART_HEIGHT} L ${points[0].x},${CHART_HEIGHT} Z`;
  }

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
                <ActivityIndicator size="small" color={color.themeBlue} />
              ) : (
                <View style={styles.refreshContent}>
                  <Text style={styles.refreshText}>Sync</Text>
                  <View style={styles.iconWrapper}>
                    <RefreshIcon
                      width={14}
                      height={14}
                      stroke={color.themeBlue}
                      strokeWidth={2.5}
                    />
                  </View>
                </View>
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

      {hasData ? (
        <>
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
        </>
      ) : (
        <View style={[styles.chartArea, styles.emptyStateContainer]}>
          <Text style={styles.emptyStateText}>
            {error ? 'Unable to load data' : 'No data available'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0f172a',
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
    backgroundColor: '#0f172a', // Matched to container color instead of white for seamless UX
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

  refreshContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshText: {
    fontSize: 11,
    color: color.themeBlue,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase', // Gives it a nice sharp UI feel
  },
  iconWrapper: {
    marginLeft: 4, // Adds breathing room between the text and the icon
    marginTop: 1, // Sometimes SVGs need a tiny nudge to optically align with text
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
  emptyStateContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#64748b',
    fontSize: 12,
    fontStyle: 'italic',
  },
});

export default LineTimelineChart;
