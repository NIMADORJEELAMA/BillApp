import React, {useState, useEffect, useMemo} from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  SafeAreaView,
} from 'react-native';
import {Calendar} from 'react-native-calendars';
import {BarChart, PieChart} from 'react-native-gifted-charts';
import {useSelector} from 'react-redux';
import MainLayout from '../../screens/MainLayout';
import axiosInstance from '../../services/axiosInstance';
import color from '../../assets/Color/color';

const getDateRange = (type: string) => {
  const end = new Date();
  const start = new Date();

  if (type === 'Week') {
    start.setDate(end.getDate() - 7);
  } else if (type === 'Month') {
    start.setMonth(end.getMonth() - 1);
  }

  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
};

const SalesReportScreen = () => {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any>({
    summary: {totalRevenue: 0, totalSalesCount: 0},
    paymentBreakdown: [],
    topProducts: [],
    allItemsSold: [],
    categoryBreakdown: [],
  });

  const [filter, setFilter] = useState('Today');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customRange, setCustomRange] = useState({start: '', end: ''});

  // Controls calendar viewport anchor page jumps
  const [visibleCalendarDate, setVisibleCalendarDate] = useState(
    new Date().toISOString().split('T')[0],
  );

  const user = useSelector((state: any) => state.auth.user);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      let startDate = '';
      let endDate = '';

      if (filter === 'Custom' && customRange.start && customRange.end) {
        startDate = customRange.start;
        endDate = customRange.end;
      } else {
        const dates = getDateRange(filter);
        startDate = dates.startDate;
        endDate = dates.endDate;
      }

      const response = await axiosInstance.get('/sales/report', {
        params: {
          orgId: user?.orgId,
          start: startDate,
          end: endDate,
        },
      });

      const data = response.data;
      const colors = [
        '#4CAF50',
        '#2196F3',
        '#FF9800',
        '#F44336',
        '#9C27B0',
        '#009688',
      ];

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
          frontColor: color.themeBlue,
        })) || [];

      setReportData({
        summary: data.summary || {totalRevenue: 0, totalSalesCount: 0},
        paymentBreakdown: formattedPayment,
        topProducts: formattedProducts,
        allItemsSold: data.allItemsSold || [],
        categoryBreakdown: data.categoryBreakdown || [],
      });
    } catch (error) {
      console.error('Fetch Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.orgId && filter !== 'Custom') {
      fetchReportData();
    }
  }, [filter, user?.orgId]);

  const handleDayPress = (day: any) => {
    if (!customRange.start || (customRange.start && customRange.end)) {
      setCustomRange({start: day.dateString, end: ''});
    } else {
      if (new Date(day.dateString) < new Date(customRange.start)) {
        setCustomRange({start: day.dateString, end: ''});
      } else {
        setCustomRange({...customRange, end: day.dateString});
      }
    }
  };

  const applyCustomFilter = () => {
    if (customRange.start && customRange.end) {
      setFilter('Custom');
      setIsModalOpen(false);
      fetchReportData();
    }
  };

  const getMarkedDates = () => {
    const marked: any = {};
    if (customRange.start) {
      marked[customRange.start] = {
        startingDay: true,
        color: color.themeBlue,
        textColor: 'white',
      };
    }
    if (customRange.end) {
      marked[customRange.end] = {
        endingDay: true,
        color: color.themeBlue,
        textColor: 'white',
      };

      let start = new Date(customRange.start);
      const end = new Date(customRange.end);
      while (start < end) {
        start.setDate(start.getDate() + 1);
        const dayString = start.toISOString().split('T')[0];
        if (dayString !== customRange.end) {
          marked[dayString] = {
            color: color.themeBlue + '33',
            textColor: color.themeBlue,
          };
        }
      }
    }
    return marked;
  };

  const currentCalendarYear = useMemo(
    () => visibleCalendarDate.split('-')[0],
    [visibleCalendarDate],
  );

  if (loading && !isModalOpen) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={color.themeBlue} />
      </View>
    );
  }

  const getFilterLabel = () => {
    if (filter === 'Custom' && customRange.start && customRange.end) {
      return `${customRange.start} to ${customRange.end}`;
    }
    return filter;
  };

  // Find max volume to build clean proportional UI bar charts for category rows
  const maxCategoryVolume =
    reportData.categoryBreakdown.reduce(
      (max: number, c: any) => (c.revenue > max ? c.revenue : max),
      0,
    ) || 1;

  return (
    <MainLayout
      title="Sales Analytics"
      showBack
      subtitle="Real-time performance">
      {/* Period Selection Trigger Header */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={styles.dropdownSelector}
          onPress={() => setIsModalOpen(true)}>
          <Text style={styles.dropdownSelectorText}>
            Period: {getFilterLabel()}
          </Text>
          <Text style={styles.dropdownArrow}>▼</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        {/* KPI Summary Cards */}
        <View style={styles.kpiRow}>
          <View style={[styles.kpiCard, {borderLeftColor: color.themeBlue}]}>
            <Text style={styles.kpiLabel}>Revenue</Text>
            <Text style={styles.kpiValue}>
              ₹{reportData.summary.totalRevenue.toLocaleString()}
            </Text>
          </View>
          <View style={[styles.kpiCard, {borderLeftColor: '#2196F3'}]}>
            <Text style={styles.kpiLabel}>Orders</Text>
            <Text style={styles.kpiValue3}>
              {reportData.summary.totalSalesCount}
            </Text>
          </View>
        </View>

        {/* Visual Bar Chart: Top Items */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Top Selling Items (Chart)</Text>
          <View style={styles.chartContainer}>
            {reportData.topProducts.length > 0 ? (
              <BarChart
                data={reportData.topProducts}
                barWidth={35}
                noOfSections={3}
                barBorderRadius={4}
                frontColor={color.themeBlue}
                yAxisThickness={0}
                xAxisThickness={0}
                hideRules
              />
            ) : (
              <Text style={styles.emptyText}>
                No product data for this period
              </Text>
            )}
          </View>
        </View>

        {/* Categories Sold Breakdown Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Sales by Category</Text>

          {/* Add ScrollView Here */}
          <ScrollView
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={true}>
            {reportData.categoryBreakdown.length > 0 ? (
              reportData.categoryBreakdown.map((item: any, idx: number) => {
                const percentageWidth =
                  (item.revenue / maxCategoryVolume) * 100;
                return (
                  <View key={idx} style={styles.categoryRow}>
                    {/* ... keeping your existing category meta row and progress bar ... */}
                    <View style={styles.categoryMetaRow}>
                      <Text style={styles.categoryNameText}>{item.name}</Text>
                      <Text style={styles.categoryVolumeText}>
                        {item.quantity} units •{' '}
                        <Text style={styles.boldText}>
                          ₹{Number(item.revenue).toLocaleString()}
                        </Text>
                      </Text>
                    </View>
                    <View style={styles.progressTrackBar}>
                      <View
                        style={[
                          styles.progressFillBar,
                          {width: `${percentageWidth}%`},
                        ]}
                      />
                    </View>
                  </View>
                );
              })
            ) : (
              <Text style={styles.emptyText}>
                No category distribution datasets available
              </Text>
            )}
          </ScrollView>
        </View>

        {/* Payment Distribution Matrix */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Payment Methods</Text>
          {reportData.paymentBreakdown.length > 0 ? (
            <View style={styles.row}>
              {(() => {
                const totalAmount = reportData.paymentBreakdown.reduce(
                  (sum: number, item: any) =>
                    sum + Number(item._sum?.finalAmount || 0),
                  0,
                );
                if (totalAmount === 0) {
                  return (
                    <View style={styles.emptyChartContainer}>
                      <View style={styles.placeholderPie} />
                      <Text style={styles.emptyText}>
                        No revenue recorded for this period
                      </Text>
                    </View>
                  );
                }
                return (
                  <>
                    <PieChart
                      data={reportData.paymentBreakdown.map((i: any) => ({
                        value: Number(i._sum?.finalAmount || 0),
                        color: i.color,
                      }))}
                      donut
                      radius={70}
                      innerRadius={50}
                      innerCircleColor={'#fff'}
                    />
                    <View style={styles.legendContainer}>
                      {reportData.paymentBreakdown.map(
                        (item: any, index: number) => (
                          <View key={index} style={styles.legendItem}>
                            <View
                              style={[
                                styles.dot,
                                {backgroundColor: item.color},
                              ]}
                            />
                            <View style={{flex: 1}}>
                              <Text style={styles.legendText} numberOfLines={1}>
                                {item.text}
                              </Text>
                              <Text style={styles.legendAmount}>
                                ₹
                                {Number(
                                  item._sum?.finalAmount || 0,
                                ).toLocaleString()}
                              </Text>
                            </View>
                          </View>
                        ),
                      )}
                    </View>
                  </>
                );
              })()}
            </View>
          ) : (
            <Text style={styles.emptyText}>
              No transaction records available
            </Text>
          )}
        </View>

        {/* Comprehensive Items Sold (Ranked Hierarchically at Top) */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Complete Product Performance</Text>

          {/* Keep Headers Fixed Outside the ScrollView */}
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableHeaderCell, {flex: 2}]}>
              Product Name
            </Text>
            <Text style={[styles.tableHeaderCell, {textAlign: 'center'}]}>
              Qty
            </Text>
            <Text style={[styles.tableHeaderCell, {textAlign: 'right'}]}>
              Revenue
            </Text>
          </View>

          {/* Add ScrollView Here for the Data Rows */}
          <ScrollView
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={true}>
            {reportData.allItemsSold.length > 0 ? (
              reportData.allItemsSold.map((product: any, idx: number) => (
                <View
                  key={idx}
                  style={[
                    styles.tableDataRow,
                    idx % 2 === 1 && styles.tableRowAlternated,
                  ]}>
                  <View style={{flex: 2}}>
                    <Text style={styles.productItemNameText} numberOfLines={1}>
                      {product.name}
                    </Text>
                    <Text style={styles.productItemCategorySubtext}>
                      {product.categoryName}
                    </Text>
                  </View>
                  <Text style={styles.productQtyTableCell}>
                    {product.totalQuantitySold}
                  </Text>
                  <Text style={styles.productRevenueTableCell}>
                    ₹{Number(product.totalRevenueGenerated).toLocaleString()}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>
                No items documented within selected timelines
              </Text>
            )}
          </ScrollView>
        </View>

        <View style={{height: 40}} />
      </ScrollView>

      {/* Modern Filter Options Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.modalContent}>
            <Text style={styles.modalHeader}>Select Date Range</Text>

            <View style={styles.presetContainer}>
              {['Today', 'Week', 'Month'].map(item => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.presetButton,
                    filter === item && styles.presetActiveButton,
                  ]}
                  onPress={() => {
                    setFilter(item);
                    setIsModalOpen(false);
                  }}>
                  <Text
                    style={[
                      styles.presetButtonText,
                      filter === item && styles.presetActiveButtonText,
                    ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Quick Navigation Shortcut Elements */}
            <View style={styles.quickYearHeaderRow}>
              <Text style={styles.subSectionTitle}>Custom Range Selection</Text>
              <View style={styles.shortcutScrollWrapper}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {[
                    '2026',
                    '2025',
                    '2022',
                    '2020',
                    '2015',
                    '2010',
                    '2005',
                    '2000',
                  ].map(yr => (
                    <TouchableOpacity
                      key={yr}
                      style={[
                        styles.modalYearChip,
                        currentCalendarYear === yr &&
                          styles.modalActiveYearChip,
                      ]}
                      onPress={() => setVisibleCalendarDate(`${yr}-01-01`)}>
                      <Text
                        style={[
                          styles.modalYearChipText,
                          currentCalendarYear === yr &&
                            styles.modalActiveYearChipText,
                        ]}>
                        {yr}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <Calendar
              enableSwipeMonths={true}
              current={visibleCalendarDate}
              onMonthChange={month => setVisibleCalendarDate(month.dateString)}
              maxDate={new Date().toISOString().split('T')[0]}
              onDayPress={handleDayPress}
              markingType={'period'}
              markedDates={getMarkedDates()}
              theme={{
                todayTextColor: color.themeBlue,
                arrowColor: color.themeBlue,
                textMonthFontWeight: 'bold',
              }}
            />

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsModalOpen(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={!customRange.start || !customRange.end}
                style={[
                  styles.applyButton,
                  (!customRange.start || !customRange.end) &&
                    styles.applyButtonDisabled,
                ]}
                onPress={applyCustomFilter}>
                <Text style={styles.applyButtonText}>Apply Range</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  loader: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  filterContainer: {paddingHorizontal: 15, marginTop: 10},
  dropdownSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  dropdownSelectorText: {fontSize: 14, fontWeight: '600', color: '#333'},
  dropdownArrow: {fontSize: 12, color: '#888'},
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
  kpiValue3: {fontSize: 18, fontWeight: 'bold', color: '#121212', marginTop: 5},
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    maxHeight: 400,
    overflow: 'hidden',

    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginBottom: 15,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  emptyChartContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  placeholderPie: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 10,
    borderColor: '#f0f2f5',
    marginBottom: 15,
  },
  row: {flexDirection: 'row', alignItems: 'center'},
  legendContainer: {marginLeft: 15, flex: 1},
  legendItem: {flexDirection: 'row', alignItems: 'center', marginBottom: 12},
  dot: {width: 10, height: 10, borderRadius: 5, marginRight: 8, marginTop: 2},
  legendText: {fontSize: 12, color: '#777', textTransform: 'capitalize'},
  legendAmount: {fontSize: 13, fontWeight: '700', color: '#121212'},
  emptyText: {
    color: '#aaa',
    fontSize: 13,
    textAlign: 'center',
    marginVertical: 10,
  },
  boldText: {fontWeight: '700', color: '#121212'},

  // Category Layout Metrics
  categoryRow: {marginBottom: 14},
  categoryMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  categoryNameText: {fontSize: 13, fontWeight: '600', color: '#444'},
  categoryVolumeText: {fontSize: 12, color: '#888'},
  progressTrackBar: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFillBar: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 3,
  },

  // Grid / Table Structure Styles
  tableHeaderRow: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 5,
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  tableDataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 6,
  },
  tableRowAlternated: {backgroundColor: '#F8FAFC'},
  productItemNameText: {fontSize: 13, fontWeight: '700', color: '#1E293B'},
  productItemCategorySubtext: {fontSize: 11, color: '#94A3B8', marginTop: 1},
  productQtyTableCell: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
  },
  productRevenueTableCell: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'right',
  },

  // Modal Sheet Components
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '95%',
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 15,
    textAlign: 'center',
  },
  presetContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  presetButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#f0f2f5',
    marginHorizontal: 4,
    alignItems: 'center',
  },
  presetActiveButton: {backgroundColor: color.themeBlue},
  presetButtonText: {fontSize: 14, color: '#555', fontWeight: '600'},
  presetActiveButtonText: {color: '#fff'},
  subSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
    marginTop: 5,
  },
  quickYearHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  shortcutScrollWrapper: {width: '55%'},
  modalYearChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    marginRight: 6,
  },
  modalActiveYearChip: {backgroundColor: color.themeBlue},
  modalYearChipText: {fontSize: 11, fontWeight: '700', color: '#475569'},
  modalActiveYearChipText: {color: '#FFF'},

  modalActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 10,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    alignItems: 'center',
    borderRadius: 10,
    marginRight: 10,
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {color: '#666', fontWeight: '600', fontSize: 14},
  applyButton: {
    flex: 2,
    padding: 14,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: color.themeBlue,
  },
  applyButtonDisabled: {backgroundColor: '#cccccc'},
  applyButtonText: {color: '#fff', fontWeight: '600', fontSize: 14},
});

export default SalesReportScreen;
