import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import color from '../../assets/Color/color';
import {RootStackParamList} from '../../routes/Navigation';

const {width} = Dimensions.get('window');

const ITEM_HEIGHT = 40;
const PADDING_HEIGHT = 0;

const days = Array.from({length: 31}, (_, i) => i + 1);
const months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

// Limit to 18+ only
const currentYear = new Date().getFullYear();
const maxYear = currentYear - 18;
const years = Array.from({length: 100}, (_, i) => maxYear - i);

export default function DateBirth() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [selectedDay, setSelectedDay] = useState<number>(15);
  const [selectedMonth, setSelectedMonth] = useState<string>('Jan');
  const [selectedYear, setSelectedYear] = useState<number>(2000);

  const isDateComplete = selectedDay && selectedMonth && selectedYear;

  const formatDate = () => `${selectedDay} ${selectedMonth}, ${selectedYear}`;

  const renderPicker = (
    data: any[],
    selected: any,
    setSelected: (val: any) => void,
  ) => {
    const flatListRef = useRef<FlatList>(null);

    const onScrollEnd = (e: any) => {
      const offsetY = e.nativeEvent.contentOffset.y;
      const index = Math.round(offsetY / ITEM_HEIGHT);
      setSelected(data[index]);
    };

    return (
      <FlatList
        ref={flatListRef}
        data={data}
        keyExtractor={item => item.toString()}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={onScrollEnd}
        contentContainerStyle={{
          alignItems: 'center',
        }}
        style={{height: ITEM_HEIGHT * 3, overflow: 'hidden'}}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        initialScrollIndex={data.indexOf(selected)}
        renderItem={({item}) => {
          const isSelected = selected === item;
          return (
            <View
              style={[styles.pickerItemBox, isSelected && styles.selectedBox]}>
              <Text
                style={[
                  styles.pickerItem,
                  isSelected && styles.pickerItemSelected,
                ]}>
                {item}
              </Text>
            </View>
          );
        }}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Progress */}
      <View style={styles.progress} />
      <Text style={styles.title}>Date Of Birth</Text>

      {/* Picker Labels */}
      <View style={styles.labelsRow}>
        <Text style={styles.label}>Day</Text>
        <Text style={styles.label}>Month</Text>
        <Text style={styles.label}>Year</Text>
      </View>

      {/* Pickers */}
      <View style={styles.pickerRow}>
        <View style={styles.picker}>
          <View style={styles.highlightBox} pointerEvents="none" />

          {renderPicker(days, selectedDay, setSelectedDay)}
        </View>
        <View style={styles.picker}>
          <View style={styles.highlightBox} pointerEvents="none" />

          {renderPicker(months, selectedMonth, setSelectedMonth)}
        </View>
        <View style={styles.picker}>
          <View style={styles.highlightBox} pointerEvents="none" />

          {renderPicker(years, selectedYear, setSelectedYear)}
        </View>
      </View>

      {/* Selected Preview */}
      <Text style={styles.previewText}>Selected: {formatDate()}</Text>

      {/* Next Button */}
      <TouchableOpacity
        style={[
          styles.nextBtn,
          {backgroundColor: isDateComplete ? color.black : '#ccc'},
        ]}
        onPress={() => {
          if (isDateComplete) {
            navigation.navigate('HeightPicker'); // replace with actual screen
          }
        }}>
        <Image
          source={require('../../assets/Icons/right-arrow_white.png')}
          style={[
            styles.nextIcon,
            {tintColor: isDateComplete ? color.white : '#888'},
          ]}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: color.white,
  },
  progress: {
    height: 4,
    width: 40,
    backgroundColor: color.black,
    borderRadius: 2,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: color.black,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    color: '#555',
    width: width / 3.5,
    textAlign: 'center',
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  picker: {
    width: width / 3.2,
    height: ITEM_HEIGHT * 3, // to allow fading above/below center
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: '#1a1a1a',
    borderRadius: 12,
    overflow: 'hidden',
  },
  highlightBox: {
    position: 'absolute',
    top: ITEM_HEIGHT,
    height: ITEM_HEIGHT,
    width: '100%',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#999',
    zIndex: 10,
  },

  pickerItemBox: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedBox: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  pickerItem: {
    fontSize: 18,
    color: '#888',
  },
  pickerItemSelected: {
    color: color.black,
    fontWeight: 'bold',
    fontSize: 20,
  },
  previewText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
    color: '#444',
  },
  nextBtn: {
    backgroundColor: color.black,
    width: 50,
    height: 50,
    borderRadius: 25,
    position: 'absolute',
    bottom: 30,
    right: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextIcon: {
    width: 24,
    height: 24,
  },
});
