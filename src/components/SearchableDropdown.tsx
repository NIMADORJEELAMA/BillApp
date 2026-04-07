import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  SafeAreaView,
  Platform,
} from 'react-native';

interface SearchableDropdownProps {
  label: string;
  value: string; // The selected name to display in the input drf
  onChangeText: (text: string) => void;
  data: any[];
  onSelectItem: (item: any) => void;
  isCreatingNew: boolean;
}

export default function SearchableDropdown({
  label,
  value,
  onChangeText,
  data,
  onSelectItem,
  isCreatingNew,
}: SearchableDropdownProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleSelect = (item: any) => {
    onSelectItem(item);
    setIsModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      {/* Clickable Trigger: Looks like an input, but opens the Modal */}
      <TouchableOpacity
        style={styles.trigger}
        onPress={() => setIsModalVisible(true)}>
        <Text style={[styles.triggerText, !value && {color: '#94a3b8'}]}>
          {value || `Select ${label.toLowerCase()}`}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}>
        <SafeAreaView style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select {label}</Text>
            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
              <Text style={styles.closeButton}>Cancel</Text>
            </TouchableOpacity>
          </View>

          {/* Search Input inside Modal */}
          <View style={styles.searchSection}>
            <TextInput
              style={styles.modalInput}
              placeholder="Search or type new..."
              value={value}
              onChangeText={onChangeText}
              autoFocus={true}
            />
          </View>

          {/* List of Items: This will scroll perfectly now */}
          <ScrollView
            keyboardShouldPersistTaps="always"
            style={styles.scrollView}>
            {data.length === 0 && !isCreatingNew ? (
              <View style={styles.noResults}>
                <Text style={styles.noResultsText}>No results found</Text>
              </View>
            ) : (
              data.map(item => (
                <TouchableOpacity
                  key={item.id || item._id}
                  style={styles.dropdownItem}
                  onPress={() => handleSelect(item)}>
                  <Text style={styles.itemText}>{item.name}</Text>
                </TouchableOpacity>
              ))
            )}

            {isCreatingNew && value.length > 0 && (
              <TouchableOpacity
                style={styles.createItemContainer}
                onPress={() => handleSelect({name: value, isNew: true})}>
                <Text style={styles.createItemText}>+ Create "{value}"</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {marginBottom: 16},
  label: {fontSize: 12, fontWeight: '700', marginBottom: 6, color: '#475569'},
  trigger: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 14,
  },
  triggerText: {fontSize: 15, color: '#1e293b'},
  modalContainer: {flex: 1, backgroundColor: '#fff'},
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {fontSize: 18, fontWeight: '700', color: '#1e293b'},
  closeButton: {color: '#2563eb', fontWeight: '600'},
  searchSection: {padding: 16},
  modalInput: {
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  scrollView: {flex: 1},
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  itemText: {fontSize: 16, color: '#1e293b'},
  createItemContainer: {
    padding: 16,
    backgroundColor: '#eff6ff',
    margin: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  createItemText: {color: '#2563eb', fontWeight: '700'},
  noResults: {padding: 40, alignItems: 'center'},
  noResultsText: {color: '#94a3b8'},
});
