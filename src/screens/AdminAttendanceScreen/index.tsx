import React, {useState, useMemo, useEffect} from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Text,
  RefreshControl,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import MainLayout from '../../../src/screens/MainLayout';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isWeekend,
  addMonths, // Add this
  subMonths,
  isToday,
} from 'date-fns';
import Toast from 'react-native-toast-message';
import {Svg, Path} from 'react-native-svg';
import {operationService} from '../../services/operationService';
import axiosInstance from '../../services/axiosInstance';
import swiggyColors from '../../assets/Color/swiggyColor';

const COLUMN_WIDTH = 55;
const NAME_COLUMN_WIDTH = 130;

const CheckIcon = () => (
  <Svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#10b981"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round">
    <Path d="M20 6L9 17l-5-5" />
  </Svg>
);

export default function AdminAttendanceScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [users, setUsers] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const horizontalScrollRef = React.useRef<ScrollView>(null);
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({start, end});
  }, [currentDate]);
  useEffect(() => {
    const today = new Date();
    // Only auto-scroll if we are looking at the current month/year
    if (
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    ) {
      const dayOfMonth = today.getDate();
      // Calculate offset: (day - 1) * COLUMN_WIDTH
      // We subtract a bit more or center it so today isn't hidden at the very edge
      const offset = Math.max(0, (dayOfMonth - 2) * COLUMN_WIDTH);

      // Small delay to ensure the layout has rendered
      setTimeout(() => {
        horizontalScrollRef.current?.scrollTo({x: offset, animated: true});
      }, 500);
    }
  }, [currentDate]);
  const attendanceMap = useMemo(() => {
    const map = new Set<string>();
    attendanceData?.logs?.forEach((log: any) => {
      map.add(`${log.userId}-${log.date}`);
    });
    return map;
  }, [attendanceData]);

  useEffect(() => {
    loadData();
    // Socket listener here...
  }, [currentDate]);

  const loadData = async (showSpinner = true) => {
    try {
      if (showSpinner) setLoading(true);
      const [usersRes, attendanceRes] = await Promise.all([
        axiosInstance.get('/users'),
        operationService.getMonthlyAttendance(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
        ),
      ]);
      setUsers(usersRes.data.filter((u: any) => u.isActive));
      setAttendanceData(attendanceRes);
    } catch (error) {
      Toast.show({type: 'error', text1: 'Failed to load data'});
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <MainLayout title="Attendance">
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </MainLayout>
    );
  }
  const onChange = (event: any, selectedDate?: Date) => {
    // On Android, the picker closes itself. On iOS, it stays open.
    setShowPicker(Platform.OS === 'ios');

    if (selectedDate) {
      setCurrentDate(selectedDate);
    }
  };
  return (
    <MainLayout
      title="Attendance"
      // subtitle={format(currentDate, 'MMMM yyyy')}
      showBack>
      <View style={styles.container}>
        <View style={styles.dateSelector}>
          <TouchableOpacity
            onPress={() => setCurrentDate(subMonths(currentDate, 1))}>
            <Text style={styles.navText}>Prev</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowPicker(true)}
            style={styles.monthDisplay}>
            <Text style={styles.monthText}>
              {format(currentDate, 'MMMM yyyy')} ▾
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setCurrentDate(addMonths(currentDate, 1))}>
            <Text style={styles.navText}>Next</Text>
          </TouchableOpacity>
        </View>

        {showPicker && (
          <DateTimePicker
            value={currentDate}
            mode="date"
            display="default"
            onChange={onChange}
          />
        )}
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadData(false);
              }}
            />
          }>
          <View style={styles.tableWrapper}>
            {/* LEFT FIXED STAFF COLUMN */}
            <View style={styles.fixedColumn}>
              <View style={[styles.cell, styles.headerCell, styles.nameColumn]}>
                <Text style={styles.headerLabel}>STAFF</Text>
              </View>

              {users.map(user => (
                <View key={user.id} style={[styles.cell, styles.nameColumn]}>
                  <Text numberOfLines={2} style={styles.nameText}>
                    {user.name}
                  </Text>
                </View>
              ))}
            </View>

            {/* RIGHT SCROLLABLE GRID */}
            <ScrollView
              ref={horizontalScrollRef}
              horizontal
              showsHorizontalScrollIndicator>
              <View>
                {/* HEADER ROW */}
                <View style={styles.tableRow}>
                  {calendarDays.map(day => {
                    // Correctly check if THIS specific column is today
                    const isDayToday = isToday(day);

                    return (
                      <View
                        key={day.toString()}
                        style={[
                          styles.cell,
                          styles.headerCell,
                          isWeekend(day) && styles.weekendHeader,
                          isDayToday && {
                            backgroundColor: '#dbeafe',
                            borderBottomWidth: 3,
                            borderBottomColor: '#2563eb',
                          },
                        ]}>
                        <Text
                          style={[
                            styles.dayText,
                            isDayToday && {
                              color: '#2563eb',
                              fontWeight: 'bold',
                            },
                          ]}>
                          {format(day, 'EEE').toUpperCase()}
                        </Text>
                        <Text
                          style={[
                            styles.dateText,
                            isDayToday && {color: '#2563eb'},
                          ]}>
                          {format(day, 'dd')}
                        </Text>
                      </View>
                    );
                  })}

                  <View
                    style={[
                      styles.cell,
                      styles.headerCell,
                      styles.totalColumn,
                    ]}>
                    <Text style={styles.headerLabel}>TOTAL</Text>
                  </View>
                </View>

                {/* BODY ROWS */}
                {users.map(user => {
                  const totalPresent = attendanceData?.summary?.[user.id] || 0;

                  return (
                    <View key={user.id} style={styles.tableRow}>
                      {calendarDays.map(day => {
                        const dateStr = format(day, 'yyyy-MM-dd');

                        const isPresent = attendanceMap.has(
                          `${user.id}-${dateStr}`,
                        );

                        return (
                          <TouchableOpacity
                            key={dateStr}
                            style={[
                              styles.cell,
                              isWeekend(day) && styles.weekendCell,
                              isPresent && styles.presentCell,
                            ]}
                            onPress={() =>
                              operationService
                                .markAttendance(user.id, dateStr)
                                .then(() => {
                                  // 1. Show the success toast
                                  Toast.show({
                                    type: 'success',
                                    text1: 'Attendance Updated',
                                    text2: `Status changed for ${user.name}`,
                                    visibilityTime: 1000,
                                    props: {
                                      backgroundColor: swiggyColors.veg,
                                    },
                                  });
                                  // 2. Refresh the data
                                  loadData(false);
                                })
                                .catch(err => {
                                  // Optional: Specific error handling for the toggle
                                  Toast.show({
                                    type: 'error',
                                    text1: 'Update Failed',
                                    text2: 'Could not update attendance status',
                                  });
                                })
                            }>
                            {isPresent ? (
                              <CheckIcon />
                            ) : (
                              <View style={styles.emptyCircle} />
                            )}
                          </TouchableOpacity>
                        );
                      })}

                      <View style={[styles.cell, styles.totalColumn]}>
                        <Text style={styles.totalText}>{totalPresent}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </ScrollView>
      </View>

      <View style={styles.footer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, {backgroundColor: '#10b981'}]} />
          <Text style={styles.legendLabel}>PRESENT</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, {backgroundColor: '#e2e8f0'}]} />
          <Text style={styles.legendLabel}>ABSENT</Text>
        </View>
      </View>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  loaderContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  tableWrapper: {flexDirection: 'row', backgroundColor: '#fff'},
  fixedColumn: {
    width: NAME_COLUMN_WIDTH,
    backgroundColor: '#fff',
    zIndex: 10,
    elevation: 4, // Shadow for Android
    borderRightWidth: 1,
    borderColor: '#e2e8f0',
  },
  tableRow: {flexDirection: 'row'},
  cell: {
    width: COLUMN_WIDTH,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
  },
  headerCell: {height: 70, backgroundColor: '#f8fafc'},
  nameColumn: {
    width: NAME_COLUMN_WIDTH,
    alignItems: 'flex-start',
    paddingLeft: 12,
    borderRightWidth: 1,
  },
  totalColumn: {width: 60, backgroundColor: '#eff6ff'},
  nameText: {fontSize: 13, fontWeight: '700', color: '#334155'},
  headerLabel: {fontSize: 10, fontWeight: '800', color: '#94a3b8'},
  dayText: {fontSize: 9, color: '#64748b'},
  dateText: {fontSize: 15, fontWeight: 'bold', color: '#1e293b'},
  weekendHeader: {backgroundColor: '#f1f5f9'},
  weekendCell: {backgroundColor: '#fbfcfd'},
  presentCell: {backgroundColor: '#f0fdf4'},
  emptyCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  totalText: {fontWeight: '800', color: '#2563eb'},
  footer: {
    flexDirection: 'row',
    padding: 15,
    borderTopWidth: 1,
    borderColor: '#e2e8f0',
  },
  legendItem: {flexDirection: 'row', alignItems: 'center', marginRight: 20},
  legendDot: {width: 10, height: 10, borderRadius: 5, marginRight: 6},
  legendLabel: {fontSize: 10, fontWeight: 'bold', color: '#94a3b8'},
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
  },
  monthDisplay: {
    paddingHorizontal: 20,
    paddingVertical: 5,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  monthText: {
    fontWeight: 'bold',
    color: '#1e293b',
  },
  navText: {
    color: '#2563eb',
    fontWeight: '600',
  },
});
