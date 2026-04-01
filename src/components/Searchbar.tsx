import React from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import SearchIcon from '../assets/Icons/search.svg'; // Adjust path
import ClearIcon from '../assets/Icons/closeIcon.svg'; // Adjust path

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: ViewStyle;
}

const SearchBar = ({
  value,
  onChangeText,
  placeholder = 'Search...',
  style,
}: SearchBarProps) => {
  return (
    <View style={[styles.container, style]}>
      <SearchIcon
        width={18}
        height={18}
        stroke="#94A3B8"
        style={styles.searchIcon}
      />

      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        value={value}
        onChangeText={onChangeText}
        autoCorrect={false}
        spellCheck={false}
      />

      {value.length > 0 && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onChangeText('')}
          style={styles.clearButton}>
          <ClearIcon width={20} height={20} fill="#94A3B8" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: '#1E293B',
    paddingVertical: 0, // Fixes vertical alignment on Android
  },
  clearButton: {
    padding: 6,
    marginLeft: 4,
  },
});

export default SearchBar;
