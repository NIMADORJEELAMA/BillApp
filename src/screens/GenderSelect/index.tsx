import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../routes/navigation';
const {width} = Dimensions.get('screen');

const GenderSelection: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [selectedGender, setSelectedGender] = useState<string>('');
  const [selectedOtherOption, setSelectedOtherOption] = useState('');
  const [otherOption, setOtherOption] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownAnimations = useRef(
    ['Non-binary', 'Transgender', 'Prefer not to say'].map(
      () => new Animated.Value(0),
    ),
  ).current;
  // const handleSelection = (gender: string) => {
  //   setSelectedGender(gender);
  // };

  useEffect(() => {
    if (selectedGender === 'Others') {
      setShowDropdown(true);
      const animations = dropdownAnimations.map((anim, index) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 150,
          delay: index * 100,
          useNativeDriver: true,
        }),
      );
      Animated.stagger(50, animations).start();
    } else {
      setShowDropdown(false);
      dropdownAnimations.forEach(anim => anim.setValue(0));
    }
  }, [selectedGender]);

  const handleSelection = (gender: string) => {
    setSelectedGender(gender);
    if (gender !== 'Others') setOtherOption('');
  };

  return (
    <LinearGradient
      colors={['#ffffff', '#ffffff', '#c2bff6']}
      locations={[0, 0.9, 1]}
      start={{x: 0, y: 2}}
      end={{x: 1.5, y: 0.1}}
      style={styles.gradient}>
      <View style={styles.content}>
        <Text style={styles.title}>How do you identify yourself?</Text>
        <Text style={styles.subtitle}>
          You can change this information later
        </Text>

        {['I am a man', 'I am a woman', 'Others'].map(gender => {
          const isSelected = selectedGender === gender;

          return (
            <View key={gender}>
              <TouchableOpacity
                onPress={() => {
                  setSelectedGender(gender);
                  if (gender !== 'Others') setSelectedOtherOption('');
                }}
                style={[
                  styles.radioButton,
                  isSelected && styles.selectedButton,
                ]}>
                <View style={styles.optionRow}>
                  <Text
                    style={[
                      styles.radioText,
                      isSelected && styles.selectedText,
                    ]}>
                    {gender}
                  </Text>
                  {isSelected && (
                    <Image
                      source={require('../../assets/Icons/tick.png')}
                      style={styles.tickIcon}
                      resizeMode="contain"
                    />
                  )}
                </View>
              </TouchableOpacity>

              {/* Show dropdown if "Others" is selected */}
              {gender === 'Others' && isSelected && showDropdown && (
                <View style={styles.dropdownContainer}>
                  {['Non-binary', 'Transgender', 'Prefer not to say'].map(
                    (option, index) => {
                      const animStyle = {
                        opacity: dropdownAnimations[index],
                        transform: [
                          {
                            translateY: dropdownAnimations[index].interpolate({
                              inputRange: [0, 1],
                              outputRange: [10, 0],
                            }),
                          },
                        ],
                      };

                      const isOptionSelected = selectedOtherOption === option;

                      return (
                        <Animated.View
                          key={option}
                          style={[styles.dropdownOption, animStyle]}>
                          <TouchableOpacity
                            onPress={() => setSelectedOtherOption(option)}
                            style={[
                              styles.dropdownOption,
                              isOptionSelected && styles.dropdownOptionSelected,
                            ]}>
                            <Text
                              style={[
                                styles.dropdownText,
                                isOptionSelected && styles.dropdownTextSelected,
                              ]}>
                              {option}
                            </Text>
                            {isOptionSelected && (
                              <Image
                                source={require('../../assets/Icons/tick.png')}
                                style={styles.tickIcon}
                                resizeMode="contain"
                              />
                            )}
                          </TouchableOpacity>
                        </Animated.View>
                      );
                    },
                  )}
                </View>
              )}
            </View>
          );
        })}
      </View>
      <View style={styles.arrowContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Relation')}
          disabled={!selectedGender}
          style={[styles.arrowButton, !selectedGender && styles.arrowDisabled]}>
          <Image
            source={require('../../assets/Icons/right-arrow_white.png')} // Your arrow icon
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
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  content: {
    alignItems: 'center',
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
  radioButton: {
    width: width * 0.9,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 16,

    marginBottom: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.37)',
    borderWidth: 1,
    borderColor: 'rgba(37, 36, 36, 0.3)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.2,
    shadowRadius: 10,
    //   backdropFilter: 'blur(10px)', // won't apply directly but useful if using web
  },
  selectedButton: {
    backgroundColor: 'rgb(0, 0, 0)',
    borderColor: 'rgba(0, 0, 0, 0.6)',
  },
  radioText: {
    fontSize: 20,
    color: '#000',
    textAlign: 'left',
    width: '100%',
  },
  selectedText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 10,
  },
  tick: {
    fontSize: 20,
    color: '#fff', // Or any color depending on background
  },
  tickIcon: {
    width: 20,
    height: 20,
    marginRight: 5,
  },

  arrowContainer: {
    position: 'absolute',
    bottom: 60,
    right: 40,
  },

  arrowButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },

  arrowDisabled: {
    backgroundColor: '#aaa',
    opacity: 0.5,
  },

  arrowIcon: {
    width: 20,
    height: 20,
    tintColor: '#fff',
  },
  dropdownContainer: {
    paddingLeft: 24,
    paddingTop: 8,
  },
  dropdownOption: {
    flexDirection: 'row',

    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    marginBottom: 4,
    // marginBottom: 8,
  },
  dropdownOptionSelected: {
    backgroundColor: '#c2bff6',
    padding: 0,
  },
  dropdownText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  dropdownTextSelected: {
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default GenderSelection;
