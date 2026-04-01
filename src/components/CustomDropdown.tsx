import React, {useState, useRef} from 'react';
import {StyleSheet, TouchableOpacity, Animated, Text} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';
import {Div} from './common/UI';
import ArrowDownIcon from '../assets/Icons/chevrondown.svg'; // Adjust path

interface DropdownOption {
  label: string;
  value: any;
}

interface CustomDropdownProps {
  label?: string;
  options: DropdownOption[];
  selectedValue: any;
  onSelect: (value: any) => void;
  placeholder?: string;
}

const CustomDropdown = ({
  label,
  options,
  selectedValue,
  onSelect,
  placeholder = 'Select Option',
}: CustomDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Animation for arrow and list expansion
  const animatedValue = useRef(new Animated.Value(0)).current;

  const toggleDropdown = () => {
    Animated.spring(animatedValue, {
      toValue: isOpen ? 0 : 1,
      useNativeDriver: true,
      friction: 8,
    }).start();
    setIsOpen(!isOpen);
  };

  const rotation = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const selectedOption = options.find(opt => opt.value === selectedValue);

  const handleSelect = (value: any) => {
    onSelect(value);
    toggleDropdown();
  };

  return (
    <Div style={{zIndex: 2000}}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        activeOpacity={0.9}
        style={[styles.trigger, isOpen && styles.triggerActive]}
        onPress={toggleDropdown}>
        <Text
          style={[styles.triggerText, !selectedOption && {color: '#64748B'}]}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Animated.Text
          style={[styles.arrow, {transform: [{rotate: rotation}]}]}>
          <ArrowDownIcon width={12} height={12} fill="#64748B" />
        </Animated.Text>
      </TouchableOpacity>

      {isOpen && (
        <Div style={styles.dropdownList}>
          <FlatList
            data={options}
            keyExtractor={item => item.value.toString()}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
            scrollEnabled={options.length > 5}
            style={{maxHeight: 250}}
            renderItem={({item}) => (
              <TouchableOpacity
                activeOpacity={0.7}
                style={[
                  styles.optionItem,
                  item.value === selectedValue && styles.selectedOption,
                ]}
                onPress={() => handleSelect(item.value)}>
                <Text
                  style={[
                    styles.optionText,
                    item.value === selectedValue && styles.selectedOptionText,
                  ]}>
                  {item.label}
                </Text>
                {/* {item.value === selectedValue && (
                  <Div style={styles.activeDot} />
                )} */}
              </TouchableOpacity>
            )}
          />
        </Div>
      )}
    </Div>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 4,
    fontWeight: '800',
    color: '#64748B',

    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  trigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#f1f5f9',
    // Soft shadow
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  triggerActive: {
    borderColor: '#f7f7f7',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  triggerText: {fontSize: 12, color: '#1e293b', fontWeight: '700'},
  arrow: {fontSize: 14, color: '#333', fontWeight: 'bold'},
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 9999, // Highest in the app
    elevation: 6,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderColor: '#f7f7f7',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  optionItem: {
    padding: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  selectedOption: {
    backgroundColor: '#ececec',
  },
  optionText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    paddingVertical: 3,
  },
  selectedOptionText: {color: '#000', fontWeight: '700'},
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#000',
  },
});

export default CustomDropdown;
