import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

// Define your RootStackParamList type here
type RootStackParamList = {
  Name: undefined;
  MultipleSelect: undefined;
  NextScreen: undefined;
  // Add other screens as needed
};

interface SelectionItem {
  id: string;
  title: string;
}

const SAMPLE_DATA: SelectionItem[] = [
  {id: '1', title: 'Long-Term Relationship'},
  {id: '2', title: 'Short-Term Relationship'},
  {id: '3', title: 'Friendship'},
  {id: '4', title: 'Hangout'},
  {id: '5', title: 'Open Relationship'},
  {id: '6', title: 'Someone to vibe'},
  {id: '7', title: 'Travelling Partner'},
  {id: '8', title: 'Partner in crime'},
  {id: '9', title: 'Nature'},
  {id: '10', title: 'Technology'},
];

const MultipleSelection: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const toggleSelection = (id: string): void => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  return (
    <LinearGradient
      colors={['#ffffff', '#ffffff', '#c2bff6']}
      locations={[0, 0.9, 1]}
      start={{x: 0, y: 2}}
      end={{x: 1.5, y: 0.1}}
      style={styles.gradient}>
      <View style={styles.content}>
        <Text style={styles.title}>What are you looking for?</Text>
        <Text style={styles.subtitle}>Choose the option(s) that suits you</Text>

        <ScrollView style={styles.scrollContainer}>
          <View style={styles.selectionGrid}>
            {SAMPLE_DATA.map(item => {
              const isSelected = selectedItems.includes(item.id);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.selectionItem,
                    isSelected && styles.selectedItem,
                  ]}
                  onPress={() => toggleSelection(item.id)}>
                  <Text
                    style={[
                      styles.itemText,
                      isSelected && styles.selectedItemText,
                    ]}>
                    {item.title}
                  </Text>
                  {isSelected && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>
      <View style={styles.arrowContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate('AddPhotoList')}
          disabled={selectedItems.length === 0}
          style={[
            styles.arrowButton,
            selectedItems.length === 0 && styles.arrowDisabled,
          ]}>
          <Image
            source={require('../../assets/Icons/right-arrow_white.png')}
            style={styles.arrowIcon}
          />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 30,
    fontWeight: '600',
    marginBottom: 10,
    color: '#000',
    textAlign: 'left',
    width: '100%',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 40,
    color: '#666',
    textAlign: 'left',
    width: '100%',
  },
  scrollContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  selectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  selectionItem: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedItem: {
    backgroundColor: '#111',
    borderColor: '#5a52d9',
  },
  itemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    textAlign: 'center',
  },
  selectedItemText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  checkmark: {
    position: 'absolute',
    top: 20,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#111',
    fontSize: 12,
    fontWeight: 'bold',
  },
  arrowContainer: {
    alignItems: 'center',
    paddingBottom: 0,
    position: 'absolute',
    bottom: 40,
    right: 20,
  },
  arrowButton: {
    backgroundColor: '#111',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 3},
  },
  arrowDisabled: {
    backgroundColor: '#c0c0c0',
    elevation: 1,
    shadowOpacity: 0.1,
  },
  arrowIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
});

export default MultipleSelection;
