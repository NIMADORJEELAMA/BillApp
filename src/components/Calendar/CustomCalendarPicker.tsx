import React, {useState, useEffect, useMemo} from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import {Calendar} from 'react-native-calendars';

interface DateRangePickerProps {
  visible: boolean;
  onClose: () => void;
  onApply: (startDate: Date | null, endDate: Date | null) => void;
  initialStartDate?: Date | null;
  initialEndDate?: Date | null;
}

const formatDateString = (date: Date | null): string => {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  visible,
  onClose,
  onApply,
  initialStartDate = null,
  initialEndDate = null,
}) => {
  const [startString, setStartString] = useState<string>('');
  const [endString, setEndString] = useState<string>('');
  const [currentMonth, setCurrentMonth] = useState<string>(
    formatDateString(new Date()),
  );

  // Navigation overlay states: 'calendar' | 'month' | 'year'
  const [pickerMode, setPickerMode] = useState<'calendar' | 'month' | 'year'>(
    'calendar',
  );

  useEffect(() => {
    if (visible) {
      setStartString(formatDateString(initialStartDate));
      setEndString(formatDateString(initialEndDate));
      if (initialStartDate) {
        setCurrentMonth(formatDateString(initialStartDate));
      } else {
        setCurrentMonth(formatDateString(new Date()));
      }
      setPickerMode('calendar');
    }
  }, [visible, initialStartDate, initialEndDate]);

  // Extract currently viewed year and month index from currentMonth string
  const [viewedYear, viewedMonthIdx] = useMemo(() => {
    const parts = currentMonth.split('-');
    const y = parts[0] ? parseInt(parts[0], 10) : new Date().getFullYear();
    const m = parts[1] ? parseInt(parts[1], 10) - 1 : new Date().getMonth();
    return [y, m];
  }, [currentMonth]);

  // DYNAMICALLY GENERATE YEARS (-20 and +20 based on current date)
  const yearList = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    // From 20 years ago up to 20 years in the future
    for (let i = currentYear - 20; i <= currentYear + 20; i++) {
      years.push(i);
    }
    return years;
  }, [visible]); // Re-calculates accurately whenever the modal opens

  const handleDayPress = (day: any) => {
    const clickedDateStr = day.dateString;
    if (!startString || (startString && endString)) {
      setStartString(clickedDateStr);
      setEndString('');
    } else {
      if (new Date(clickedDateStr) < new Date(startString)) {
        setStartString(clickedDateStr);
        setEndString('');
      } else {
        setEndString(clickedDateStr);
      }
    }
  };

  const markedDates = useMemo(() => {
    if (!startString) return {};
    const marked: any = {};

    if (startString && !endString) {
      marked[startString] = {
        startingDay: true,
        endingDay: true,
        color: '#2563EB',
        textColor: '#FFFFFF',
      };
      return marked;
    }

    if (startString && endString) {
      let current = new Date(startString + 'T00:00:00');
      const end = new Date(endString + 'T00:00:00');

      while (current <= end) {
        const dateStr = formatDateString(current);
        if (dateStr === startString) {
          marked[dateStr] = {
            startingDay: true,
            color: '#2563EB',
            textColor: '#FFFFFF',
          };
        } else if (dateStr === endString) {
          marked[dateStr] = {
            endingDay: true,
            color: '#2563EB',
            textColor: '#FFFFFF',
          };
        } else {
          marked[dateStr] = {color: '#DBEAFE', textColor: '#1E293B'};
        }
        current.setDate(current.getDate() + 1);
      }
    }
    return marked;
  }, [startString, endString]);

  const handleApply = () => {
    const finalStart = startString ? new Date(startString + 'T00:00:00') : null;
    let finalEnd = endString ? new Date(endString + 'T23:59:59') : null;

    if (finalStart && !finalEnd) {
      finalEnd = new Date(startString + 'T23:59:59');
    }
    onApply(finalStart, finalEnd);
    onClose();
  };

  const handleClear = () => {
    setStartString('');
    setEndString('');
  };

  const updateCalendarFocus = (year: number, monthIdx: number) => {
    const paddedMonth = String(monthIdx + 1).padStart(2, '0');
    setCurrentMonth(`${year}-${paddedMonth}-01`);
    setPickerMode('calendar');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {pickerMode === 'calendar'
                ? 'Select Date Range'
                : pickerMode === 'month'
                ? 'Select Month'
                : 'Select Year'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Core Selection Area */}
          {pickerMode === 'calendar' && (
            <Calendar
              key={currentMonth}
              current={currentMonth}
              markingType={'period'}
              markedDates={markedDates}
              onDayPress={handleDayPress}
              onMonthChange={month => setCurrentMonth(month.dateString)}
              renderHeader={() => (
                <View style={styles.customHeaderContainer}>
                  <TouchableOpacity
                    style={styles.headerBadge}
                    onPress={() => setPickerMode('month')}>
                    <Text style={styles.customHeaderText}>
                      {MONTHS[viewedMonthIdx]} ▾
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.headerBadge}
                    onPress={() => setPickerMode('year')}>
                    <Text style={styles.customHeaderText}>{viewedYear} ▾</Text>
                  </TouchableOpacity>
                </View>
              )}
              theme={{
                todayTextColor: '#2563EB',
                arrowColor: '#2563EB',
                textMonthFontWeight: '700',
                textDayHeaderFontWeight: '600',
              }}
            />
          )}

          {pickerMode === 'month' && (
            <View style={styles.gridContainer}>
              {MONTHS.map((mName, index) => (
                <TouchableOpacity
                  key={mName}
                  style={[
                    styles.gridItem,
                    viewedMonthIdx === index && styles.gridItemActive,
                  ]}
                  onPress={() => updateCalendarFocus(viewedYear, index)}>
                  <Text
                    style={[
                      styles.gridItemText,
                      viewedMonthIdx === index && styles.gridItemTextActive,
                    ]}>
                    {mName.substring(0, 3)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {pickerMode === 'year' && (
            <ScrollView
              contentContainerStyle={styles.gridContainer}
              style={{maxHeight: 320}}>
              {yearList.map(year => (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.gridItem,
                    viewedYear === year && styles.gridItemActive,
                  ]}
                  onPress={() => updateCalendarFocus(year, viewedMonthIdx)}>
                  <Text
                    style={[
                      styles.gridItemText,
                      viewedYear === year && styles.gridItemTextActive,
                    ]}>
                    {year}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Footer Actions */}
          <View style={styles.footer}>
            {pickerMode === 'calendar' ? (
              <>
                <TouchableOpacity
                  style={[styles.button, styles.clearButton]}
                  onPress={handleClear}>
                  <Text style={styles.clearText}>Clear</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.applyButton]}
                  onPress={handleApply}>
                  <Text style={styles.applyText}>Apply Range</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[styles.button, styles.clearButton]}
                onPress={() => setPickerMode('calendar')}>
                <Text style={styles.clearText}>Back to Calendar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DateRangePicker;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  close: {
    fontSize: 22,
    color: '#64748B',
    padding: 4,
  },
  customHeaderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  headerBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  customHeaderText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563EB',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: 12,
    gap: 8,
  },
  gridItem: {
    width: '30%',
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    marginBottom: 4,
  },
  gridItemActive: {
    backgroundColor: '#2563EB',
  },
  gridItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
  },
  gridItemTextActive: {
    color: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#F1F5F9',
  },
  applyButton: {
    backgroundColor: '#2563EB',
  },
  clearText: {
    color: '#334155',
    fontWeight: '700',
  },
  applyText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
