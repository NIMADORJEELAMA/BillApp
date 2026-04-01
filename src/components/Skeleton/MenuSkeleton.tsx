import {useEffect, useRef} from 'react';
import {Animated, StyleSheet, View} from 'react-native';

const MenuSkeleton = () => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  return (
    <View style={styles.gridRow}>
      {items.map(key => (
        <Animated.View
          key={key}
          style={[
            styles.swiggyCard,
            {opacity, backgroundColor: '#E2E8F0', borderStyle: 'dashed'},
          ]}>
          {/* Mimic Veg Marker */}
          <View
            style={[
              styles.marker,
              {borderColor: '#CBD5E1', backgroundColor: '#CBD5E1'},
            ]}
          />

          {/* Mimic Text Lines */}
          <View style={{marginTop: 10}}>
            <View
              style={{
                height: 10,
                width: '80%',
                backgroundColor: '#CBD5E1',
                borderRadius: 4,
                marginBottom: 6,
              }}
            />
            <View
              style={{
                height: 10,
                width: '50%',
                backgroundColor: '#CBD5E1',
                borderRadius: 4,
              }}
            />
          </View>

          {/* Mimic Price and Button */}
          <View style={styles.cardFooter}>
            <View
              style={{
                height: 14,
                width: 40,
                backgroundColor: '#CBD5E1',
                borderRadius: 4,
                marginBottom: 8,
              }}
            />
            <View
              style={[
                styles.buttonWrapper,
                {backgroundColor: '#CBD5E1', borderRadius: 8},
              ]}
            />
          </View>
        </Animated.View>
      ))}
    </View>
  );
};

export default MenuSkeleton;

const styles = StyleSheet.create({
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between', // keep this
    paddingHorizontal: 10,
    paddingTop: 10,
  },

  swiggyCard: {
    width: '30%', // 👈 key change (3 per row)
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 10,
    marginBottom: 12,

    elevation: 2,
    shadowColor: '#f9f9f9',
    shadowOpacity: 0.08,
    shadowRadius: 2,
    shadowOffset: {width: 0, height: 2},
  },

  marker: {
    width: 14,
    height: 26,
    borderWidth: 1,
    borderRadius: 3,
  },

  cardFooter: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  buttonWrapper: {
    height: 32,
    width: 30,
  },
});
