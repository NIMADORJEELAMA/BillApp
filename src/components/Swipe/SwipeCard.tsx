import React, {useState} from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import {GestureDetector, Gesture} from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import color from '../../assets/Color/color';
import LocationIcon from '../../assets/Icons/location-point-svgrepo-com.svg';
import ProfileGrid from './ProfileGrid';
import {DatingScreen} from '../../screens/TableSelectionScreen/DatingScreen';
import IconButton from '../Dating/IconButton';

const {width, height} = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.25;
const CARD_HEIGHT = height * 0.62;

const numColumns = 3;
const spacing = 2; // minimum space between photos

const imageSize = (width - spacing * (numColumns - 1)) / numColumns;
const BUTTONS = [
  {id: 1, iconName: 'home', text: 'home', color: '#DDDDDD'},
  {id: 2, iconName: 'star', text: 'Pass', color: '#DDDDDD'},
  {id: 3, iconName: 'star', text: 'Super Like', color: '#DDDDDD'},
  {id: 4, iconName: 'star', text: 'Profile', color: '#DDDDDD'},
  {id: 5, iconName: 'comment', text: 'Message', color: '#DDDDDD'},
];

interface Profile {
  uri: string;
  name: string;
  age: number;
  bio?: string;
  distance?: string;
  photos: string[];
  interests: string[];
  job?: string;
  education?: string;
  location?: string;
}

interface SwipeCardProps {
  profile: Profile;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  isTop?: boolean;
}

const SwipeCard: React.FC<SwipeCardProps> = ({
  profile,
  onSwipeLeft,
  onSwipeRight,
  isTop = true,
}) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const translateX = useSharedValue(0);
  const rotateZ = useSharedValue(0);
  const scale = useSharedValue(isTop ? 1 : 0.95);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10]) // Only activate when horizontal movement exceeds 10px
    .failOffsetY([-20, 20]) // Fail if vertical movement exceeds 20px first
    .onUpdate(e => {
      translateX.value = e.translationX;
      rotateZ.value = e.translationX / 15;
    })
    .onEnd(() => {
      if (translateX.value > SWIPE_THRESHOLD) {
        runOnJS(onSwipeRight)();
        translateX.value = withSpring(width * 1.5, {damping: 15});
        rotateZ.value = withSpring(30, {damping: 15});
      } else if (translateX.value < -SWIPE_THRESHOLD) {
        runOnJS(onSwipeLeft)();
        translateX.value = withSpring(-width * 1.5, {damping: 15});
        rotateZ.value = withSpring(-30, {damping: 15});
      } else {
        translateX.value = withSpring(0, {damping: 20, stiffness: 200});
        rotateZ.value = withSpring(0, {damping: 20, stiffness: 200});
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      Math.abs(translateX.value),
      [0, SWIPE_THRESHOLD],
      [1, 0.8],
      Extrapolate.CLAMP,
    );

    return {
      transform: [
        {translateX: translateX.value},
        {rotateZ: `${rotateZ.value}deg`},
        {scale: scale.value},
      ],
      opacity,
    };
  });

  const likeIndicatorStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD / 2, SWIPE_THRESHOLD],
      [0, 0.5, 1],
      Extrapolate.CLAMP,
    );
    const scale = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD / 2, SWIPE_THRESHOLD],
      [0.8, 1, 1.2],
      Extrapolate.CLAMP,
    );

    return {
      opacity,
      transform: [{scale}],
    };
  });

  const handlePress = (text: string) => {};
  const passIndicatorStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, -SWIPE_THRESHOLD / 2, 0],
      [1, 0.5, 0],
      Extrapolate.CLAMP,
    );
    const scale = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, -SWIPE_THRESHOLD / 2, 0],
      [1.2, 1, 0.8],
      Extrapolate.CLAMP,
    );

    return {
      opacity,
      transform: [{scale}],
    };
  });

  const nextPhoto = () => {
    setCurrentPhotoIndex(prev => (prev + 1) % profile.photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex(
      prev => (prev - 1 + profile.photos.length) % profile.photos.length,
    );
  };

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.cardContainer, animatedStyle]}>
        <ScrollView style={styles.card} showsVerticalScrollIndicator={false}>
          {/* Main Photo Section */}
          <View style={styles.mainPhotoContainer}>
            <Image
              source={{uri: profile.photos[currentPhotoIndex] || profile.uri}}
              style={styles.mainImage}
            />

            {/* Photo Navigation Dots */}
            <View style={styles.photoDots}>
              {profile.photos?.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    currentPhotoIndex === index && styles.activeDot,
                  ]}
                />
              ))}
            </View>

            {/* Photo Navigation Areas */}
            <View style={styles.photoNavigation}>
              <View style={styles.navArea} onTouchEnd={prevPhoto} />
              <View style={styles.navArea} onTouchEnd={nextPhoto} />
            </View>

            {/* Gradient Overlay */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.05)', 'rgba(0,0,0,0.3)']}
              style={styles.gradientOverlay}
            />

            {/* Like/Pass Indicators */}
            <Animated.View style={[styles.likeIndicator, likeIndicatorStyle]}>
              <View style={[styles.indicatorBorder, {borderColor: '#4CAF50'}]}>
                <Text style={styles.likeText}>LIKE</Text>
              </View>
            </Animated.View>

            <Animated.View style={[styles.passIndicator, passIndicatorStyle]}>
              <View style={[styles.indicatorBorder, {borderColor: '#FF5722'}]}>
                <Text style={styles.passText}>PASS</Text>
              </View>
            </Animated.View>

            {/* Basic Info Overlay */}
            <View style={styles.basicInfoOverlay}>
              <View style={styles.nameAgeRow}>
                <Text style={styles.name}>{profile.name}</Text>
                <Text style={styles.age}>{profile.age}</Text>
              </View>

              <View style={styles.distanceRow}>
                <LocationIcon height={16} width={16} />
                <Text style={styles.distance}>
                  {profile.distance + ' miles away' || '2 miles away'}
                </Text>
              </View>
            </View>
          </View>

          {/* Detailed Information Sections */}

          <View style={styles.detailsContainer}>
            {/* About Section */}
            {profile.bio && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>About {profile.name}</Text>
                <Text style={styles.bioText}>{profile.bio}</Text>
              </View>
            )}

            <View style={styles.subContainer}>
              <Text style={styles.title}>About Me</Text>
              <View style={styles.buttonContainer}>
                {BUTTONS.map(btn => (
                  <IconButton
                    key={btn.id}
                    iconName={btn.iconName}
                    text={btn.text}
                    onPress={() => handlePress(btn.text)}
                    style={[styles.buttonStyle, {backgroundColor: btn.color}]}
                  />
                ))}
              </View>
            </View>

            {/* More Photos Grid */}

            {/* {profile?.photos?.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>More Photos</Text>
                <View style={styles.photoGrid}>
                  {profile.photos?.slice(1, 10).map((photo, index) => {
                    const isLastItemInRow = (index + 1) % numColumns === 0;

                    return (
                      <Image
                        key={index}
                        source={{uri: photo}}
                        style={[
                          styles.gridPhoto,
                          isLastItemInRow && styles.lastPhotoInRow, // Remove right margin for last photo in the row
                        ]}
                      />
                    );
                  })}
                </View>
              </View>
            )} */}
            <View>
              <ProfileGrid
                profile={profile} // Replace with actual image
              />
            </View>

            {/* Basic Info Cards */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Basic Info</Text>
              <View style={styles.infoCards}>
                {profile.job && (
                  <View style={styles.infoCard}>
                    <Text style={styles.infoIcon}>💼</Text>
                    <Text style={styles.infoText}>{profile.job}</Text>
                  </View>
                )}
                {profile.education && (
                  <View style={styles.infoCard}>
                    <Text style={styles.infoIcon}>🎓</Text>
                    <Text style={styles.infoText}>{profile.education}</Text>
                  </View>
                )}
                {profile.location && (
                  <View style={styles.infoCard}>
                    <Text style={styles.infoIcon}>📍</Text>
                    <Text style={styles.infoText}>{profile.location}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Interests Section */}
            {profile.interests && profile.interests.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Interests</Text>
                <View style={styles.interestsContainer}>
                  {profile.interests.map((interest, index) => (
                    <View key={index} style={styles.interestTag}>
                      <Text style={styles.interestText}>{interest}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Lifestyle Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Lifestyle</Text>
              <View style={styles.lifestyleGrid}>
                <View style={styles.lifestyleItem}>
                  <Text style={styles.lifestyleIcon}>🚭</Text>
                  <Text style={styles.lifestyleLabel}>Non-smoker</Text>
                </View>
                <View style={styles.lifestyleItem}>
                  <Text style={styles.lifestyleIcon}>🍷</Text>
                  <Text style={styles.lifestyleLabel}>Social drinker</Text>
                </View>
                <View style={styles.lifestyleItem}>
                  <Text style={styles.lifestyleIcon}>🏃‍♀️</Text>
                  <Text style={styles.lifestyleLabel}>Active</Text>
                </View>
                <View style={styles.lifestyleItem}>
                  <Text style={styles.lifestyleIcon}>🐕</Text>
                  <Text style={styles.lifestyleLabel}>Dog lover</Text>
                </View>
              </View>
            </View>

            {/* Looking For Section */}
            <View style={[styles.section, styles.lastSection]}>
              <Text style={styles.sectionTitle}>Looking For</Text>
              <Text style={styles.lookingForText}>
                Someone who shares similar interests and values, enjoys good
                conversations, and is ready for a meaningful connection. Let's
                explore the world together!
              </Text>
            </View>
          </View>
        </ScrollView>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    position: 'absolute',
    width: width - 14,
    height: CARD_HEIGHT,
    alignSelf: 'center',
  },
  card: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  mainPhotoContainer: {
    height: height * 0.62,
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    // borderRadius: 20,
  },
  photoDots: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeDot: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  photoNavigation: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  navArea: {
    flex: 1,
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '25%',
  },
  likeIndicator: {
    position: 'absolute',
    top: 60,
    right: 32,
  },
  passIndicator: {
    position: 'absolute',
    top: 60,
    left: 32,
  },
  indicatorBorder: {
    borderWidth: 4,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  likeText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#4CAF50',
  },
  passText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FF5722',
  },
  basicInfoOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,

    // backdropFilter: 'blur(10px)',
  },
  nameAgeRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  name: {
    fontSize: 30,
    fontWeight: '700',
    color: color.white,
    marginRight: 8,
  },
  age: {
    fontSize: 20,
    fontWeight: '400',
    color: color.white,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // distance: {
  //   marginLeft: 5, // spacing between icon and text
  //   fontSize: 14,
  //   color: '#333',
  // },

  distance: {
    fontSize: 16,
    fontWeight: '500',
    color: color.white,
    marginLeft: 6,
  },
  detailsContainer: {
    padding: 4,
  },
  section: {
    marginBottom: 24,
    backgroundColor: 'green',
  },
  lastSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  bioText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
  },
  subContainer: {
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 20,
    // marginBottom: 12,
    fontWeight: 'bold',
    // marginLeft: 16,
    paddingHorizontal: 26,
    marginTop: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap', // allows wrapping to new row
    // justifyContent: 'center',
    padding: 16,
    // backgroundColor: 'yellow',
  },
  buttonStyle: {
    margin: 6,
    // minWidth: 110, // control minimum width
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridPhoto: {
    width: imageSize,
    height: imageSize,
    marginBottom: spacing,
    marginRight: spacing, // Add spacing between photos
  },
  // This style will be used to remove right margin for photos at end of each row
  lastPhotoInRow: {
    marginRight: 0,
  },

  infoCards: {
    gap: 12,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#555',
    fontWeight: '500',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2196f3',
  },
  interestText: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '500',
  },
  lifestyleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  lifestyleItem: {
    alignItems: 'center',
    width: (width - 100) / 2,
  },
  lifestyleIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  lifestyleLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  lookingForText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
    fontStyle: 'italic',
  },
});

export default SwipeCard;
