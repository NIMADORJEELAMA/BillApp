import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Dimensions,
  View,
  RefreshControl,
  Alert,
} from 'react-native';
import {Text, Div} from '../../components/common/UI';
import MainLayout from '../../screens/MainLayout'; // Adjust path
import {tableService} from '../../services/tableService';

const {width} = Dimensions.get('window');
const ITEM_WIDTH = (width - 40) / 2; // Adjusted for grid spacing

const RoomSelectionScreen = ({navigation}: any) => {
  const [tables, setTables] = useState<any[]>([]);
  const [filteredTables, setFilteredTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTables = async () => {
    try {
      const data = await tableService.getTables();
      // Logic: Only show tables where roomId is null
      const floorTables = data.filter((t: any) => t.room !== null);
      setTables(floorTables);
      setFilteredTables(floorTables);
    } catch (error) {
      // Alert.alert('Error', 'Failed to fetch table layout');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTables();
  }, []);

  const handleSearch = (text: string) => {
    const filtered = tables.filter(t =>
      t.name.toLowerCase().includes(text.toLowerCase()),
    );
    setFilteredTables(filtered);
  };

  const renderTable = ({item}: {item: any}) => {
    const isOccupied = item.status === 'OCCUPIED';
    return (
      <TouchableOpacity
        style={[
          styles.tableCard,
          {backgroundColor: isOccupied ? '#FFF2F2' : '#F2FFF6'},
          isOccupied && styles.occupiedBorder,
        ]}
        onPress={() => navigation.navigate('OrderPage', {table: item})}>
        <View
          style={[
            styles.dot,
            {backgroundColor: isOccupied ? '#fa2c37' : '#2ECC71'},
          ]}
        />
        <Text style={styles.tableName}>{item.name}</Text>

        {isOccupied && item.activeOrder ? (
          <Div style={styles.orderBadge}>
            <Text style={styles.priceText}>
              ₹{item.activeOrder.runningTotal}
            </Text>
            <Text style={styles.itemText}>
              {item.activeOrder.itemCount} Items
            </Text>
          </Div>
        ) : (
          <Text style={styles.availableText}>TAP TO OPEN</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <MainLayout title="Floor Map" subtitle="Select a table to start">
      <View style={styles.searchWrapper}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search tables..."
          placeholderTextColor="#999"
          onChangeText={handleSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#fa2c37"
          style={{marginTop: 50}}
        />
      ) : (
        <FlatList
          data={filteredTables}
          renderItem={renderTable}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadTables();
              }}
            />
          }
        />
      )}
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  searchWrapper: {padding: 20},
  searchInput: {
    backgroundColor: '#FFF',
    height: 50,
    borderRadius: 15,
    paddingHorizontal: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  list: {paddingHorizontal: 10, paddingBottom: 40},
  tableCard: {
    width: ITEM_WIDTH - 20,
    margin: 10,
    borderRadius: 24,
    padding: 20,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  occupiedBorder: {borderWidth: 1.5, borderColor: '#fa2c3720'},
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    position: 'absolute',
    top: 15,
    right: 15,
  },
  tableName: {fontSize: 20, fontWeight: '900', color: '#1A1A1A'},
  availableText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2ECC71',
    letterSpacing: 1,
  },
  orderBadge: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: 10,
  },
  priceText: {fontSize: 18, fontWeight: '900', color: '#fa2c37'},
  itemText: {fontSize: 12, color: '#666', fontWeight: '600'},
});

export default RoomSelectionScreen;
