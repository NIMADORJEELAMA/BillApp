import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

const SearchableDropdown = ({
  data = [],
  value,
  onChange,
  placeholder = 'Select an option',
  searchPlaceholder = 'Search...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Find the selected item's name to display
  const selectedItem = data.find(item => item.id === value);

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    return data.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [data, searchQuery]);

  const handleSelect = id => {
    onChange(id);
    setIsOpen(false);
    setSearchQuery(''); // Reset search after selection
  };

  return (
    <View style={styles.container}>
      {/* Dropdown Toggle Button */}
      <TouchableOpacity
        style={styles.selector}
        activeOpacity={0.8}
        onPress={() => setIsOpen(!isOpen)}>
        <Text
          style={[styles.selectorText, !selectedItem && styles.placeholder]}>
          {selectedItem ? selectedItem.name : placeholder}
        </Text>
        <Text style={styles.arrow}>{isOpen ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {/* Dropdown Content */}
      {isOpen && (
        <View style={styles.dropdownArea}>
          <TextInput
            style={styles.searchInput}
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
          />

          <ScrollView
            style={styles.listArea}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled">
            {filteredData.length > 0 ? (
              filteredData.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.item,
                    value === item.id && styles.itemSelected,
                  ]}
                  onPress={() => handleSelect(item.id)}>
                  <Text
                    style={[
                      styles.itemText,
                      value === item.id && styles.itemTextSelected,
                    ]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noResults}>No results found</Text>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    zIndex: 1, // Helps if you switch to absolute positioning later
  },
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f8fafc',
  },
  selectorText: {
    fontSize: 15,
    color: '#1e293b',
  },
  placeholder: {
    color: '#94a3b8',
  },
  arrow: {
    color: '#64748b',
    fontSize: 12,
  },
  dropdownArea: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  searchInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    padding: 12,
    fontSize: 14,
    color: '#1e293b',
    backgroundColor: '#f8fafc',
  },
  listArea: {
    maxHeight: 200,
  },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  itemSelected: {
    backgroundColor: '#eff6ff',
  },
  itemText: {
    fontSize: 14,
    color: '#334155',
  },
  itemTextSelected: {
    color: '#2563eb', // Adjust to match your ;ohkhf
    fontWeight: '600',
  },
  noResults: {
    padding: 12,
    textAlign: 'center',
    color: '#94a3b8',
    fontStyle: 'italic',
  },
});

export default SearchableDropdown;
