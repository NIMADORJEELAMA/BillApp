import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../routes/Navigation';

const ITEM_HEIGHT = 50; // Adjust based on your design
const heightOptions = [
  '150 cm',
  '160 cm',
  '170 cm',
  '180 cm',
  '190 cm',
  '150 cm',
  '160 cm',
  '170 cm',
  '180 cm',
  '190 cm',
  '150 cm',
  '160 cm',
  '170 cm',
  '180 cm',
  '190 cm',
]; // Sample height options
const color = {black: '#000', white: '#fff'}; // Sample color

export default function HeightScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [selectedHeight, setSelectedHeight] = useState(heightOptions[2]);
  const flatListRef = useRef<FlatList>(null);

  const onScrollEnd = (e: any) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    setSelectedHeight(heightOptions[index]);
  };

  // To keep the selected item centered
  const handleViewableItemsChanged = ({viewableItems}: any) => {
    // if (viewableItems && viewableItems.length > 0) {
    //   const index = viewableItems[0].index;
    //   setSelectedHeight(heightOptions[index]);
    // }
  };

  return (
    <View style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progress} />

      {/* Title */}
      <Text style={styles.title}>How tall{'\n'}are you?</Text>

      {/* Height Picker */}
      <View style={styles.pickerWrapper}>
        <View style={styles.highlightBox} pointerEvents="none" />

        <FlatList
          ref={flatListRef}
          data={heightOptions}
          keyExtractor={item => item}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          onMomentumScrollEnd={onScrollEnd}
          onViewableItemsChanged={handleViewableItemsChanged}
          viewabilityConfig={{itemVisiblePercentThreshold: 50}} // Trigger viewable items when 50% visible
          contentContainerStyle={{
            paddingTop: ITEM_HEIGHT,
            paddingBottom: ITEM_HEIGHT,
          }}
          style={{height: ITEM_HEIGHT * 3, overflow: 'hidden'}}
          getItemLayout={(_, index) => ({
            length: ITEM_HEIGHT,
            offset: ITEM_HEIGHT * index,
            index,
          })}
          initialScrollIndex={2} // Starting index for the selected height
          renderItem={({item}) => {
            const isSelected = item === selectedHeight;
            return (
              <View style={styles.itemBox}>
                <Text
                  style={[
                    styles.itemText,
                    isSelected && styles.itemTextSelected,
                  ]}>
                  {item}
                </Text>
              </View>
            );
          }}
        />
      </View>

      {/* Next Button */}
      <TouchableOpacity
        style={[
          styles.nextBtn,
          {
            backgroundColor: color.black, // Change color when firstName is empty
          },
        ]}
        onPress={() => {
          if (selectedHeight) {
            // Only navigate if firstName is not empty
            navigation.navigate('DateBirth'); // Replace with your actual screen name
          }
        }}
        // Disable the button if firstName is empty
      >
        <Image
          source={require('../../assets/Icons/right-arrow_white.png')}
          style={[
            styles.nextIcon,
            // Change icon color when button is disabled
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
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 30,
    color: '#000',
  },
  pickerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: ITEM_HEIGHT * 3,
    marginBottom: 20,
  },
  highlightBox: {
    position: 'absolute',
    top: ITEM_HEIGHT,
    height: ITEM_HEIGHT,
    width: '100%',
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemBox: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 18,
    color: '#bbb',
  },
  itemTextSelected: {
    color: 'white',
    fontWeight: 'bold',
    backgroundColor: 'black',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
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
