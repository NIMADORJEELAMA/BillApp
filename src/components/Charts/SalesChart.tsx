import React from 'react';
import {StyleSheet, View, Dimensions, Platform, Text} from 'react-native';

const {width} = Dimensions.get('window');
const CHART_HEIGHT = 100;
const PADDING = 20;
const CHART_WIDTH = width - PADDING * 4; // Account for container padding

const SalesChart = () => {
  // Demo Data (Sales amounts per month)
  const salesData = [
    {month: 'Jan', amount: 3500},
    {month: 'Feb', amount: 2800},
    {month: 'Mar', amount: 4900},
    {month: 'Apr', amount: 4100},
    {month: 'May', amount: 5600},
    {month: 'Jun', amount: 3200},
  ];

  // Helper function to calculate height based on the maximum value
  const maxSales = Math.max(...salesData.map(d => d.amount));

  return (
    <View style={styles.chartContainer}>
      <View style={styles.chartHeader}>
        <View>
          <Text style={styles.chartTitle}>Monthly Sales Performance</Text>
          <Text style={styles.chartSubtitle}>Q1 - Q2 Total Revenues</Text>
        </View>
        <Text style={styles.totalSales}>$24.1K</Text>
      </View>

      <View style={styles.chartArea}>
        {/* Y-Axis Label (Placeholder) */}
        <View style={styles.yAxis}>
          <Text style={styles.axisLabel}>{`$${(maxSales / 1000).toFixed(
            1,
          )}K`}</Text>
          <Text style={styles.axisLabel}>{`$${(maxSales / 2 / 1000).toFixed(
            1,
          )}K`}</Text>
          <Text style={styles.axisLabel}>$0</Text>
        </View>

        {/* Bar Chart Area */}
        <View style={styles.barChart}>
          {salesData.map((data, index) => {
            const barHeight = (data.amount / maxSales) * (CHART_HEIGHT - 60); // Subtracting labels height
            return (
              <View key={index} style={styles.barColumn}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      // Highlight the highest sales month
                      backgroundColor:
                        data.amount === maxSales ? '#4F46E5' : '#E0E7FF',
                    },
                  ]}>
                  <Text style={styles.barValue}>{`${(
                    data.amount / 1000
                  ).toFixed(1)}K`}</Text>
                </View>
                <Text style={styles.xAxisLabel}>{data.month}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: PADDING,
    width: CHART_WIDTH + PADDING * 2, // Account for its own padding
    alignSelf: 'center',
    marginBottom: 20,
    // Add shadow
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {elevation: 4},
    }),
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937', // Dark gray
  },
  chartSubtitle: {
    fontSize: 12,
    color: '#6B7280', // Lighter gray
    marginTop: 2,
  },
  totalSales: {
    fontSize: 22,
    fontWeight: '800',
    color: '#4F46E5', // Indigo
  },
  chartArea: {
    flexDirection: 'row',
    height: CHART_HEIGHT,
  },
  yAxis: {
    justifyContent: 'space-between',
    paddingBottom: 25, // Align with bars
    marginRight: 10,
    width: 35,
  },
  axisLabel: {
    fontSize: 10,
    color: '#9CA3AF', // Gray
    textAlign: 'right',
  },
  barChart: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end', // Bars rise from the bottom
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB', // Light gray grid lines
    paddingBottom: 5,
  },
  barColumn: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: CHART_WIDTH / 8, // Adjust bar width
  },
  bar: {
    width: '100%',
    backgroundColor: '#E0E7FF', // Light indigo
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    justifyContent: 'flex-start', // Position label inside top of bar
    paddingTop: 5,
  },
  barValue: {
    fontSize: 9,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  xAxisLabel: {
    fontSize: 12,
    color: '#6B7280', // Gray
    marginTop: 8,
    textAlign: 'center',
  },
});

export default SalesChart;
