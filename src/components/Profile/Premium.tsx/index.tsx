// import React, {useRef, useState, useEffect} from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   Dimensions,
//   ImageSourcePropType,
// } from 'react-native';
// import PremiumAdCard from '../PremiumAdCard';

// const {width} = Dimensions.get('window');

// interface AdItem {
//   id: string;
//   title: string;
//   description: string;
//   icon: ImageSourcePropType;
//   background: ImageSourcePropType;
// }

// const premiumAds: AdItem[] = [
//   {
//     id: '1',
//     title: 'See Who Likes You',
//     description: 'Instantly see who swiped right on you',
//     icon: require('../../../assets/Icons/image.png'),
//     background: require('../../../assets/Images_main/wallpaper_couple.jpg'),
//   },
//   {
//     id: '2',
//     title: 'Boost Your Profile',
//     description: 'Be the top profile in your area for 30 minutes',
//     icon: require('../../../assets/Icons/image.png'),
//     background: require('../../../assets/Images_main/wallpaper_couple.jpg'),
//   },
//   {
//     id: '3',
//     title: 'Unlimited Swipes',
//     description: 'Swipe right as much as you like',
//     icon: require('../../../assets/Icons/image.png'),
//     background: require('../../../assets/Images_main/wallpaper_couple.jpg'),
//   },
// ];

// export default function Premium() {
//   const flatListRef = useRef<FlatList>(null);
//   const [activeIndex, setActiveIndex] = useState(0);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       const nextIndex = (activeIndex + 1) % premiumAds.length;
//       setActiveIndex(nextIndex);
//       flatListRef.current?.scrollToIndex({index: nextIndex, animated: true});
//     }, 4000); // Change slide every 4 seconds

//     return () => clearInterval(interval);
//   }, [activeIndex]);

//   return (
//     <View style={styles.container}>
//       <Text style={styles.heading}>Upgrade to Premium</Text>

//       <FlatList
//         ref={flatListRef}
//         data={premiumAds}
//         keyExtractor={item => item.id}
//         horizontal
//         pagingEnabled
//         onMomentumScrollEnd={event => {
//           const index = Math.round(
//             event.nativeEvent.contentOffset.x / (width - 64),
//           );
//           setActiveIndex(index);
//         }}
//         showsHorizontalScrollIndicator={false}
//         contentContainerStyle={{paddingHorizontal: 16}}
//         renderItem={({item}) => (
//           <View style={styles.cardContainer}>
//             <PremiumAdCard
//               title={item.title}
//               description={item.description}
//               icon={item.icon}
//               background={item.background}
//               onPress={() => console.log(item.title)}
//             />
//             <View style={styles.pagination}>
//               {premiumAds.map((_, i) => (
//                 <View
//                   key={i}
//                   style={[
//                     styles.dotIndex,
//                     {
//                       opacity: i === activeIndex ? 1 : 0.3,
//                       width: i === activeIndex ? 16 : 8,
//                     },
//                   ]}
//                 />
//               ))}
//             </View>
//           </View>
//         )}
//       />

//       <View style={styles.pagination}>
//         {premiumAds.map((_, i) => (
//           <View
//             key={i}
//             style={[
//               styles.dotIndex,
//               {
//                 opacity: i === activeIndex ? 1 : 0.3,
//                 width: i === activeIndex ? 16 : 8,
//               },
//             ]}
//           />
//         ))}
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     paddingTop: 48,
//   },
//   heading: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#fa2c37',
//     paddingHorizontal: 16,
//     marginBottom: 16,
//   },
//   cardContainer: {
//     width: width - 64,
//     marginHorizontal: 8,
//   },
//   pagination: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     marginTop: 16,
//   },
//   dotIndex: {
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: '#fa2c37',
//     marginHorizontal: 4,
//     // transition: 'all 0.3s ease-in-out',
//   },
// });

import React, {useRef, useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  ImageSourcePropType,
  ViewToken,
} from 'react-native';
import PremiumAdCard from '../PremiumAdCard';

const {width} = Dimensions.get('window');

interface AdItem {
  id: string;
  title: string;
  description: string;
  icon: ImageSourcePropType;
  background: ImageSourcePropType;
}

const premiumAds: AdItem[] = [
  {
    id: '1',
    title: 'See Who Likes You',
    description: 'Instantly see who swiped right on you',
    icon: require('../../../assets/Icons/image.png'),
    background: require('../../../assets/Images_main/wallpaper_couple.jpg'),
  },
  {
    id: '2',
    title: 'Boost Your Profile',
    description: 'Be the top profile in your area for 30 minutes',
    icon: require('../../../assets/Icons/image.png'),
    background: require('../../../assets/Images_main/wallpaper_couple.jpg'),
  },
  {
    id: '3',
    title: 'Unlimited Swipes',
    description: 'Swipe right as much as you like',
    icon: require('../../../assets/Icons/image.png'),
    background: require('../../../assets/Images_main/wallpaper_couple.jpg'),
  },
];

export default function Premium() {
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Optional: Auto scroll
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     const nextIndex = (activeIndex + 1) % premiumAds.length;
  //     setActiveIndex(nextIndex);
  //     flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
  //   }, 4000);
  //   return () => clearInterval(interval);
  // }, [activeIndex]);

  const onViewRef = useRef(({viewableItems}: {viewableItems: ViewToken[]}) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index || 0);
    }
  });

  const viewConfigRef = useRef({viewAreaCoveragePercentThreshold: 40});

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={premiumAds}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewRef.current}
        viewabilityConfig={viewConfigRef.current}
        renderItem={({item}) => (
          <View style={styles.cardContainer}>
            <PremiumAdCard
              title={item.title}
              description={item.description}
              icon={item.icon}
              background={item.background}
              onPress={() => console.log(item.title)}
            />
          </View>
        )}
      />

      {/* Pagination Dots Outside the Card */}
      <View style={styles.pagination}>
        {premiumAds.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, {opacity: index === activeIndex ? 1 : 0.3}]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  cardContainer: {
    width: width - 45,
    marginHorizontal: 8,
    borderRadius: 16,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4,
    backgroundColor: '#fa2c37',
  },
});
