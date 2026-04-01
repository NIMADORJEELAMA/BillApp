// import React, {useState, useRef, useEffect} from 'react';
// import {
//   View,
//   Modal,
//   TouchableWithoutFeedback,
//   StyleSheet,
//   Dimensions,
//   Image,
//   Text,
//   Pressable,
// } from 'react-native';

// const {width, height} = Dimensions.get('window');
// const STORY_DURATION = 5000; // 5 seconds

// const StoryViewer = ({stories = ['1'], visible, onClose}) => {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const timer = useRef(null);

//   useEffect(() => {
//     if (visible && stories.length > 0) {
//       startTimer();
//     }
//     return () => clearTimer();
//   }, [visible, currentIndex]);

//   const clearTimer = () => {
//     if (timer.current) {
//       clearTimeout(timer.current);
//       timer.current = null;
//     }
//   };

//   const startTimer = () => {
//     clearTimer();
//     timer.current = setTimeout(() => {
//       handleNext();
//     }, STORY_DURATION);
//   };

//   const handleNext = () => {
//     if (currentIndex < stories.length - 1) {
//       setCurrentIndex(currentIndex + 1);
//     } else {
//       onClose();
//     }
//   };

//   const handlePrev = () => {
//     if (currentIndex > 0) {
//       setCurrentIndex(currentIndex - 1);
//     } else {
//       onClose();
//     }
//   };

//   const handleTap = evt => {
//     const x = evt.nativeEvent.locationX;
//     if (x < width / 2) {
//       handlePrev();
//     } else {
//       handleNext();
//     }
//   };

//   if (!visible || stories.length === 0) return null;

//   return (
//     <Modal visible={visible} animationType="fade">
//       <TouchableWithoutFeedback onPress={handleTap}>
//         <View style={styles.container}>
//           <View style={styles.progressContainer}>
//             {stories.map((_, index) => (
//               <View
//                 key={index}
//                 style={[
//                   styles.progressBar,
//                   {
//                     flex: 1,
//                     backgroundColor:
//                       index < currentIndex
//                         ? 'white'
//                         : index === currentIndex
//                         ? 'white'
//                         : 'rgba(255,255,255,0.4)',
//                   },
//                 ]}
//               />
//             ))}
//           </View>

//           {stories[currentIndex] && (
//             <Image
//               source={{uri: stories[currentIndex].uri}}
//               style={styles.image}
//             />
//           )}

//           <Pressable onPress={onClose} style={styles.closeButton}>
//             <Text style={{color: 'white', fontSize: 16}}>✕</Text>
//           </Pressable>
//         </View>
//       </TouchableWithoutFeedback>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: 'black',
//   },
//   progressContainer: {
//     flexDirection: 'row',
//     position: 'absolute',
//     top: 40,
//     left: 10,
//     right: 10,
//     height: 3,
//     zIndex: 10,
//   },
//   progressBar: {
//     height: '100%',
//     marginHorizontal: 2,
//     borderRadius: 2,
//   },
//   image: {
//     width,
//     height,
//     resizeMode: 'cover',
//   },
//   closeButton: {
//     position: 'absolute',
//     top: 40,
//     right: 20,
//     backgroundColor: 'rgba(0,0,0,0.6)',
//     padding: 8,
//     borderRadius: 20,
//   },
// });

// export default StoryViewer;

import React, {useState, useEffect, useRef} from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableWithoutFeedback,
  Pressable,
} from 'react-native';
import {StoryItem} from '../types';

const {width, height} = Dimensions.get('window');
const DEFAULT_DURATION = 5000;

interface StoryViewerProps {
  stories: StoryItem[];
  visible: boolean;
  onClose: () => void;
}

const StoryViewer: React.FC<StoryViewerProps> = ({
  stories,
  visible,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const timer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (visible) {
      startTimer();
    }
    return () => clearTimer();
  }, [visible, currentIndex]);

  const startTimer = () => {
    clearTimer();
    timer.current = setTimeout(() => {
      handleNext();
    }, stories[currentIndex]?.duration || DEFAULT_DURATION);
  };

  const clearTimer = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      onClose();
    }
  };

  const handleTap = (e: any) => {
    const x = e.nativeEvent.locationX;
    x < width / 2 ? handlePrev() : handleNext();
  };

  if (!visible || stories.length === 0) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent={false}>
      <TouchableWithoutFeedback onPress={handleTap}>
        <View style={styles.container}>
          {/* Progress bar */}
          <View style={styles.progressContainer}>
            {stories.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.progressBar,
                  {
                    flex: 1,
                    backgroundColor:
                      i < currentIndex
                        ? 'white'
                        : i === currentIndex
                        ? 'white'
                        : 'rgba(255,255,255,0.4)',
                  },
                ]}
              />
            ))}
          </View>

          <Image
            source={{uri: stories[currentIndex].uri}}
            style={styles.image}
          />

          {/* Close button */}
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={{color: 'white', fontSize: 18}}>✕</Text>
          </Pressable>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  progressContainer: {
    flexDirection: 'row',
    position: 'absolute',
    top: 40,
    left: 10,
    right: 10,
    height: 3,
    zIndex: 10,
  },
  progressBar: {
    height: '100%',
    marginHorizontal: 2,
    borderRadius: 2,
  },
  image: {
    width,
    height,
    resizeMode: 'cover',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 20,
  },
});

export default StoryViewer;
