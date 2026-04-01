// import React from 'react';
// import {View, Text, Image, Dimensions, StyleSheet} from 'react-native';

// const {width: screenWidth} = Dimensions.get('window');

// const ProfileGrid = ({profile}) => {
//   const numColumns = 3;
//   const spacing = 2; // Space between photos
//   const containerWidth = screenWidth * 0.9; // Reduce container width to 90%

//   const totalSpacing = spacing * (numColumns - 1);
//   const imageSize = (containerWidth - totalSpacing) / numColumns;

//   return (
//     <>
//       {profile?.photos?.length > 0 && (
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>More Photos</Text>
//           <View style={[styles.photoGrid, {width: containerWidth}]}>
//             {profile.photos?.slice(1, 10).map((photo, index) => {
//               const isLastItemInRow = (index + 1) % numColumns === 0;

//               return (
//                 <Image
//                   key={index}
//                   source={{uri: photo}}
//                   style={[
//                     styles.gridPhoto,
//                     {
//                       width: imageSize,
//                       height: imageSize,
//                       marginRight: isLastItemInRow ? 0 : spacing,
//                       marginBottom: spacing,
//                     },
//                   ]}
//                 />
//               );
//             })}
//           </View>
//         </View>
//       )}
//     </>
//   );
// };

// const styles = StyleSheet.create({
//   section: {
//     marginVertical: 16,
//     alignItems: 'center', // Center the grid in the screen
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 12,
//     paddingHorizontal: 16,
//   },
//   photoGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//   },
//   gridPhoto: {
//     backgroundColor: '#f0f0f0',
//     borderRadius: 8,
//   },
// });

// export default ProfileGrid;
import React, {useState} from 'react';
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import Modal from 'react-native-modal';
import Animated, {FadeIn} from 'react-native-reanimated';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

const {width: screenWidth} = Dimensions.get('window');

const ProfileGrid = ({profile}) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loadingImages, setLoadingImages] = useState({}); // Track loading per image

  const numColumns = Math.floor(screenWidth / 120);
  const spacing = 2;
  const containerWidth = screenWidth * 0.95;
  const totalSpacing = spacing * (numColumns - 1);
  const imageSize = (containerWidth - totalSpacing) / numColumns;

  const handleImagePress = photo => {
    setSelectedImage(photo);
    setModalVisible(true);
  };

  const closeModal = () => setModalVisible(false);

  const handleLoadEnd = index => {
    setLoadingImages(prev => ({...prev, [index]: false}));
  };

  const handleLoadStart = index => {
    setLoadingImages(prev => ({...prev, [index]: true}));
  };

  return (
    <>
      {profile?.photos?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Events/ Places</Text>
          <View style={[styles.photoGrid, {width: containerWidth}]}>
            <FlatList
              data={profile.photos.slice(1, 7)}
              numColumns={numColumns}
              key={numColumns}
              showsVerticalScrollIndicator={false}
              renderItem={({item, index}) => {
                const isLastItemInRow = (index + 1) % numColumns === 0;
                const isLoading = loadingImages[index] !== false;

                return (
                  <TouchableOpacity
                    onPress={() => handleImagePress(item)}
                    activeOpacity={0.9}>
                    <Animated.View entering={FadeIn}>
                      <View style={{position: 'relative'}}>
                        {isLoading && (
                          <SkeletonPlaceholder borderRadius={8}>
                            <SkeletonPlaceholder.Item
                              width={imageSize}
                              height={imageSize}
                              marginRight={isLastItemInRow ? 0 : spacing}
                              marginBottom={spacing}
                            />
                          </SkeletonPlaceholder>
                        )}

                        <FastImage
                          source={{uri: item}}
                          style={{
                            width: imageSize,
                            height: imageSize,
                            marginRight: isLastItemInRow ? 0 : spacing,
                            marginBottom: spacing,
                            backgroundColor: '#eee',
                            borderRadius: 8,
                            position: isLoading ? 'absolute' : 'relative',
                            opacity: isLoading ? 0 : 1,
                          }}
                          resizeMode={FastImage.resizeMode.cover}
                          onLoadStart={() => handleLoadStart(index)}
                          onLoadEnd={() => handleLoadEnd(index)}
                        />
                      </View>
                    </Animated.View>
                  </TouchableOpacity>
                );
              }}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>

          {/* Modal View for Zoom with Animation */}
          <Modal
            isVisible={isModalVisible}
            onBackdropPress={closeModal}
            style={{margin: 0}}
            backdropColor="black"
            backdropOpacity={0.9}
            animationIn="zoomIn"
            animationOut="zoomOut"
            animationInTiming={300}
            animationOutTiming={300}
            useNativeDriver={true}
            swipeDirection="down"
            onSwipeComplete={closeModal}>
            <View style={styles.modalContent}>
              <FastImage
                source={{uri: selectedImage}}
                style={styles.zoomedImage}
                resizeMode={FastImage.resizeMode.contain}
              />
            </View>
          </Modal>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  section: {
    marginVertical: 16,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    paddingHorizontal: 16,
    textAlign: 'left',
    width: '100%',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
  },
});

export default ProfileGrid;
