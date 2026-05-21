import React, {useState, useMemo, useRef, useEffect} from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  Platform,
  Keyboard,
  BackHandler,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  interpolate,
  Extrapolate,
  runOnJS,
} from 'react-native-reanimated';
import {useNavigation} from '@react-navigation/native';
import SearchIcon from '../assets/Icons/search.svg';

const FIXED_HEADER_HEIGHT = 80;
const STATUSBAR = Platform.OS === 'ios' ? 50 : 20;

const SEARCHABLE_PAGES = [
  {
    id: '1',
    title: 'Create Sales',
    subtitle: 'Transactions',
    screen: 'SalesScreen',
  },
  {
    id: '2',
    title: 'Sales History',
    subtitle: 'View sales history',
    screen: 'SalesListScreen',
  },
  {
    id: '3',
    title: 'Bulk Upload',
    subtitle: 'Add multiple items',
    screen: 'BulkProductScreen',
  },
  {
    id: '4',
    title: 'Bulk Print',
    subtitle: 'Print multiple labels',
    screen: 'BulkPrintScreen',
  },
  {
    id: '5',
    title: 'Customers',
    subtitle: 'Manage customers',
    screen: 'CustomerScreen',
  },
  {
    id: '6',
    title: 'Reports',
    subtitle: 'Sales and analytics',
    screen: 'SalesReportScreen',
  },
  {id: '7', title: 'Staff', subtitle: 'Manage employees', screen: 'Staff'},
  {
    id: '8',
    title: 'Supplier',
    subtitle: 'Manage suppliers',
    screen: 'Supplier',
  },
  {id: '9', title: 'Purchase', subtitle: 'Purchase orders', screen: 'Purchase'},
  {
    id: '10',
    title: 'Product List',
    subtitle: 'View and manage products',
    screen: 'ProductListScreen',
  },
  {
    id: '11',
    title: 'Printer Settings',
    subtitle: 'Configure printer options',
    screen: 'PrinterSettings',
  },
];

const ExpandableSearch = () => {
  const [isActive, setIsActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation();
  const inputRef = useRef(null);

  // Animation controller: 0 = resting state, 1 = expanded state
  const expandProgress = useSharedValue(0);

  // Handle hardware back button on Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (isActive) {
          closeSearch();
          return true;
        }
        return false;
      },
    );
    return () => backHandler.remove();
  }, [isActive]);

  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) return SEARCHABLE_PAGES;
    return SEARCHABLE_PAGES.filter(
      item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery]);

  const openSearch = () => {
    setIsActive(true);
    // Smooth easing out animation
    expandProgress.value = withTiming(1, {
      duration: 350,
      easing: Easing.out(Easing.poly(4)),
    });
  };

  const closeSearch = () => {
    Keyboard.dismiss();
    // Smooth easing in animation
    expandProgress.value = withTiming(
      0,
      {duration: 300, easing: Easing.in(Easing.poly(4))},
      finished => {
        if (finished) {
          runOnJS(setIsActive)(false);
          runOnJS(setSearchQuery)('');
        }
      },
    );
  };

  const handleNavigate = screen => {
    closeSearch();
    navigation.navigate(screen);
  };

  // 🔥 Animations
  const overlayStyle = useAnimatedStyle(() => ({
    opacity: expandProgress.value,
  }));

  const cancelBtnStyle = useAnimatedStyle(() => ({
    width: interpolate(
      expandProgress.value,
      [0, 1],
      [0, 70],
      Extrapolate.CLAMP,
    ),
    opacity: expandProgress.value,
    transform: [
      {
        translateX: interpolate(
          expandProgress.value,
          [0, 1],
          [20, 0],
          Extrapolate.CLAMP,
        ),
      },
    ],
  }));

  const listStyle = useAnimatedStyle(() => ({
    opacity: expandProgress.value,
    transform: [
      {
        translateY: interpolate(
          expandProgress.value,
          [0, 1],
          [20, 0],
          Extrapolate.CLAMP,
        ),
      },
    ],
  }));

  return (
    <View style={styles.wrapper} pointerEvents={isActive ? 'auto' : 'box-none'}>
      {/* 1. Animated Full Screen Background underneath the header */}
      <Animated.View
        style={[styles.fullscreenOverlay, overlayStyle]}
        pointerEvents={isActive ? 'auto' : 'none'}
      />

      {/* 2. The Header (Replaces your original header) */}
      <View style={styles.header}>
        <View style={styles.searchRow}>
          {/* Search Input */}
          <View style={styles.searchBar}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Search..."
              placeholderTextColor="#999"
              onFocus={openSearch}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Cancel Button (Slides out smoothly to push the search bar) */}
          <Animated.View style={[styles.cancelBtnContainer, cancelBtnStyle]}>
            <TouchableOpacity onPress={closeSearch} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>

      {/* 3. The Search Results List */}
      {isActive && (
        <Animated.View style={[styles.listContainer, listStyle]}>
          <FlatList
            data={filteredResults}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles.resultItem}
                onPress={() => handleNavigate(item.screen)}>
                {/* SVG Icon inserted here */}
                <SearchIcon
                  width={24}
                  height={24}
                  color="#555"
                  style={styles.itemIcon}
                />

                {/* Wrapped text container */}
                <View style={styles.textContainer}>
                  <Text style={styles.resultTitle}>{item.title}</Text>
                  <Text style={styles.resultSubtitle}>{item.subtitle}</Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No results found</Text>
            }
          />
        </Animated.View>
      )}
    </View>
  );
};

export default ExpandableSearch;

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    elevation: 1000, // 🔥 ADD THIS: Forces Android to render this above the ScrollView
  },
  fullscreenOverlay: {
    position: 'absolute',
    top: FIXED_HEADER_HEIGHT + STATUSBAR,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F8F9FB',
  },
  header: {
    height: FIXED_HEADER_HEIGHT + STATUSBAR,
    paddingTop: STATUSBAR,
    paddingHorizontal: 10,
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
    elevation: 30, // Keeps your original header shadow
    zIndex: 30,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  searchBar: {
    flex: 1, // This allows the bar to compress automatically when the cancel button appears
    height: 45,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E7FF',
    paddingHorizontal: 15,
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1E293B',
  },
  cancelBtnContainer: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  cancelBtn: {
    paddingLeft: 10,
    height: 45,
    justifyContent: 'center',
  },
  cancelText: {
    color: '#6366F1',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  // resultItem: {
  //   backgroundColor: '#fff',
  //   padding: 10,
  //   borderRadius: 12,
  //   marginBottom: 10,
  //   shadowColor: '#000',
  //   shadowOffset: {width: 0, height: 1},
  //   shadowOpacity: 0.05,
  //   shadowRadius: 2,
  //   elevation: 1,
  // },
  resultItem: {
    flexDirection: 'row', // Places the SVG and text side-by-side
    alignItems: 'center', // Vertically centers the SVG with the text block
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemIcon: {
    marginRight: 16, // Space between SVG and text
  },
  textContainer: {
    flex: 1, // Allows text to take up remaining width
    flexDirection: 'column', // Stacks title and subtitle vertically
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  resultSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 40,
    fontSize: 16,
  },
});
