import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import {Text} from './UI';

const {width} = Dimensions.get('window');

interface ImageSliderProps {
  images: string[];
  initialIndex?: number;
  height?: number;
  autoSlide?: boolean;
  autoSlideInterval?: number;
  onIndexChange?: (index: number) => void;
}

const ImageSlider: React.FC<ImageSliderProps> = ({
  images,
  initialIndex = 0,
  height = 300,
  autoSlide = false,
  autoSlideInterval = 3000,
  onIndexChange,
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(initialIndex);
  const scrollViewRef = useRef<ScrollView>(null);
  const autoSlideTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (
      scrollViewRef.current &&
      initialIndex >= 0 &&
      initialIndex < images.length
    ) {
      // Use a small timeout to ensure the ScrollView is fully mounted
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: initialIndex * width,
          animated: false,
        });
        setActiveIndex(initialIndex);
      }, 100);
    }
  }, [initialIndex, images.length]);

  useEffect(() => {
    // Clear any existing timer when autoSlide or interval changes
    if (autoSlideTimerRef.current) {
      clearInterval(autoSlideTimerRef.current);
      autoSlideTimerRef.current = null;
    }

    // Set up auto slide if enabled
    if (autoSlide && images.length > 1) {
      autoSlideTimerRef.current = setInterval(() => {
        const nextIndex = (activeIndex + 1) % images.length;
        scrollToIndex(nextIndex);
      }, autoSlideInterval);
    }

    // Clean up on unmount
    return () => {
      if (autoSlideTimerRef.current) {
        clearInterval(autoSlideTimerRef.current);
      }
    };
  }, [autoSlide, autoSlideInterval, activeIndex, images.length]);

  // Handle scroll event to update active index
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    if (slideIndex !== activeIndex) {
      setActiveIndex(slideIndex);
      onIndexChange?.(slideIndex);
    }
  };

  const handleScrollBeginDrag = () => {
    if (autoSlideTimerRef.current) {
      clearInterval(autoSlideTimerRef.current);
      autoSlideTimerRef.current = null;
    }
  };

  const handleScrollEndDrag = () => {
    if (autoSlide && images.length > 1 && !autoSlideTimerRef.current) {
      autoSlideTimerRef.current = setInterval(() => {
        const nextIndex = (activeIndex + 1) % images.length;
        scrollToIndex(nextIndex);
      }, autoSlideInterval);
    }
  };

  // Scroll to specific index
  const scrollToIndex = (index: number) => {
    if (index >= 0 && index < images.length) {
      scrollViewRef.current?.scrollTo({
        x: index * width,
        animated: true,
      });
      setActiveIndex(index);
      onIndexChange?.(index);
    }
  };

  return (
    <View style={[styles.container, {height}]}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        style={styles.scrollView}>
        {images.map((image, index) => (
          <View key={index} style={styles.slide}>
            <Image
              source={{uri: image}}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        ))}
      </ScrollView>
      {/* Pagination dots */}
      <View style={styles.pagination}>
        {images.map((_, index) => (
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

      <View style={styles.navButtonsContainer}>
        {/* <TouchableOpacity
          style={[
            styles.navButton,
            activeIndex === 0 && styles.navButtonDisabled,
          ]}
          disabled={activeIndex === 0}
          onPress={() => scrollToIndex(activeIndex - 1)}>
          <Text style={styles.navButtonText}>{'<'}</Text>
        </TouchableOpacity> */}

        {/* <Text style={styles.pageIndicator}>{`${activeIndex + 1} / ${
          images.length
        }`}</Text> */}

        {/* <TouchableOpacity
          style={[
            styles.navButton,
            activeIndex === images.length - 1 && styles.navButtonDisabled,
          ]}
          disabled={activeIndex === images.length - 1}
          onPress={() => scrollToIndex(activeIndex + 1)}>
          <Text style={styles.navButtonText}>{'>'}</Text>
        </TouchableOpacity> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  scrollView: {
    width: '100%',
    height: '100%',
  },
  slide: {
    width,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    alignItems: 'center',
    bottom: 10,
    alignSelf: 'center',
  },
  paginationDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginHorizontal: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  paginationDotActive: {
    backgroundColor: 'white',
    width: 8,
    height: 8,
  },
  navButtonsContainer: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 10,
    bottom: 50,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  pageIndicator: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
});

export default ImageSlider;
