import React from 'react';
import {StyleSheet, Text, View, TouchableOpacity, Platform} from 'react-native';
import {BlurView} from '@react-native-community/blur';

// Component usage example
const GlassButton = ({
  item,
  isSelected,
  toggleSelection,
}: {
  item: {id: string; title: string};
  isSelected: boolean;
  toggleSelection: (id: string) => void;
}) => {
  // Content to display inside the button
  const buttonContent = (
    <>
      <Text style={[styles.itemText, isSelected && styles.selectedItemText]}>
        {item.title}
      </Text>
      {isSelected && (
        <View style={styles.checkmark}>
          <Text style={styles.checkmarkText}>✓</Text>
        </View>
      )}
    </>
  );

  // Render different button styles based on platform
  if (Platform.OS === 'ios') {
    return (
      <TouchableOpacity
        key={item.id}
        activeOpacity={0.8}
        style={styles.buttonWrapper}
        onPress={() => toggleSelection(item.id)}>
        <BlurView
          style={[styles.selectionItem, isSelected && styles.selectedItem]}
          blurType="light"
          blurAmount={10}
          reducedTransparencyFallbackColor="white">
          {buttonContent}
        </BlurView>
      </TouchableOpacity>
    );
  } else {
    // Android glass effect (simulated)
    return (
      <TouchableOpacity
        key={item.id}
        activeOpacity={0.8}
        style={[
          styles.buttonWrapper,
          styles.selectionItem,
          styles.androidGlassEffect,
          isSelected && styles.selectedItem,
        ]}
        onPress={() => toggleSelection(item.id)}>
        {buttonContent}
      </TouchableOpacity>
    );
  }
};

const styles = StyleSheet.create({
  buttonWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    margin: 8,
  },
  selectionItem: {
    padding: 16,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    position: 'relative',
  },
  androidGlassEffect: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedItem: {
    borderColor: 'rgba(108, 99, 255, 0.6)',
    backgroundColor: 'rgba(108, 99, 255, 0.15)',
  },
  itemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#444',
    textAlign: 'center',
  },
  selectedItemText: {
    color: '#6c63ff',
    fontWeight: '600',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#6c63ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  checkmarkText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

// Usage example:
// <GlassButton
//   item={item}
//   isSelected={selectedItems.includes(item.id)}
//   toggleSelection={toggleSelection}
// />
