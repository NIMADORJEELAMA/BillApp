import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Image,
  Dimensions,
  FlatList,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ImageSourcePropType,
} from 'react-native';
import GlassButton from '../GlassButton/GlassButton';
import {BlurView} from '@react-native-community/blur';

// Get screen dimensions for responsive design
const {width} = Dimensions.get('window');

// Define interface for photo example items
interface PhotoExample {
  id: string;
  image: ImageSourcePropType;
  description: string;
  tip: string;
}

// Define props for the modal component
interface PhotoUploadModalProps {
  showInfoModal: boolean;
  setShowInfoModal: (show: boolean) => void;
}
const SLIDE_WIDTH = width * 0.8;

// Example image data for the slider
const photoExamples: PhotoExample[] = [
  {
    id: '1',
    image: require('../../assets/Images_main/wallpaper_couple.jpg'), // Replace with your actual image paths
    description: 'Well-lit portrait showing your face clearly',
    tip: 'Good lighting makes a huge difference!',
  },
  {
    id: '2',
    image: require('../../assets/Images_main/wallpaper_couple.jpg'),
    description: 'Full-body photo with natural background',
    tip: 'Show your full profile in at least one photo',
  },
  {
    id: '3',
    image: require('../../assets/Images_main/wallpaper_couple.jpg'),
    description: 'Activity photo showing your interests',
    tip: 'Photos doing things you love attract like-minded people',
  },
  {
    id: '4',
    image: require('../../assets/Images_main/wallpaper_couple.jpg'),
    description: 'Clear, friendly facial expression',
    tip: 'A genuine smile goes a long way!',
  },
];

const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({
  showInfoModal,
  setShowInfoModal,
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const flatListRef = useRef<FlatList<PhotoExample> | null>(null);

  // Handle dot indicator press
  const scrollToIndex = (index: number): void => {
    setActiveIndex(index);
    flatListRef.current?.scrollToIndex({
      animated: true,
      index: index,
    });
  };

  // Render each image slide
  const renderItem = ({item}: {item: PhotoExample}): React.ReactElement => {
    return (
      <View style={styles.slideContainer}>
        <Image source={item.image} style={styles.exampleImage} />
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>{item.description}</Text>
          <Text style={styles.descriptionTip}>{item.tip}</Text>
        </View>
      </View>
    );
  };

  // Render dot indicators
  const renderDotIndicators = (): React.ReactElement => {
    return (
      <View style={styles.paginationContainer}>
        {photoExamples.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.paginationDot,
              index === activeIndex && styles.paginationDotActive,
            ]}
            onPress={() => scrollToIndex(index)}
          />
        ))}
      </View>
    );
  };

  // Handle scroll end event
  const handleScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ): void => {
    const slideIndex = Math.round(
      event.nativeEvent.contentOffset.x / SLIDE_WIDTH,
    );
    setActiveIndex(slideIndex);
  };

  return (
    <Modal
      visible={showInfoModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowInfoModal(false)}>
      <View style={styles.modalOverlay}>
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType="light" // Options: 'light', 'dark', 'xlight', 'regular', etc.
          blurAmount={1} // Adjust blur intensity (0-100)
          reducedTransparencyFallbackColor="rgba(255, 255, 255, 0.07)" // Fallback for accessibility
        />
        <View style={styles.modalContainer}>
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="light" // Options: 'light', 'dark', 'xlight', 'regular', etc.
            blurAmount={8} // Adjust blur intensity (0-100)
            reducedTransparencyFallbackColor="rgba(152, 150, 150, 0.68)" // Fallback for accessibility
          />
          <Text style={styles.modalTitle}>
            {' '}
            <Image
              source={require('../../assets/Images_main/question.png')} // adjust path as needed
              style={styles.suggestionIcon}
              resizeMode="contain"
            />{' '}
            Photo Upload Tips
          </Text>

          {/* Image slider section */}
          <View style={styles.sliderContainer}>
            <FlatList
              ref={flatListRef}
              data={photoExamples}
              renderItem={renderItem}
              keyExtractor={item => item.id}
              horizontal
              pagingEnabled={false} // disable default snapping
              snapToInterval={SLIDE_WIDTH}
              decelerationRate="fast"
              snapToAlignment="center"
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleScrollEnd}
            />

            {renderDotIndicators()}
          </View>

          <GlassButton
            text="Done"
            onPress={() => setShowInfoModal(false)}
            style={{marginTop: 16}}
            glassColor="dark"
            width={'100%'}
          />

          <GlassButton
            text="See these tips again "
            onPress={() => {
              flatListRef.current?.scrollToIndex({index: 0, animated: true});
              setActiveIndex(0);
              // setShowInfoModal(false);
            }}
            style={{marginTop: 12}}
            glassColor="light"
            width={'100%'}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(212, 203, 203, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  modalContainer: {
    width: '95%',
    maxWidth: 500,
    maxHeight: '80%',
    borderRadius: 25,
    padding: 24,
    backgroundColor: 'rgba(223, 218, 218, 0.1)', // ✅ important
    borderColor: 'rgba(223, 218, 218, 0.1)',
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    // bottom: 20,
    // position: 'absolute',
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#0F172B',
  },
  modalContent: {
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 24,
    color: '#333',
  },
  sliderContainer: {
    marginBottom: 16,
  },
  slideContainer: {
    width: width * 0.8, // Adjust based on your needs
    alignItems: 'center',
  },
  exampleImage: {
    width: width * 0.6,
    height: width * 0.4, // Square aspect ratio
    borderRadius: 12,
    marginBottom: 12,
  },
  suggestionIcon: {
    width: 18,
    height: 18,
    marginRight: 6,
  },

  descriptionContainer: {
    width: '100%',
    alignItems: 'center',
    padding: 8,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
    color: '#0F172B',
  },
  descriptionTip: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#0F172B',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

export default PhotoUploadModal;
