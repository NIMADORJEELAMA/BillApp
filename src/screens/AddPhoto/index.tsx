import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  Alert,
  Modal,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import LinearGradient from 'react-native-linear-gradient';
import color from '../../assets/Color/color';
import GlassButton from '../../components/GlassButton/GlassButton';

const {width} = Dimensions.get('screen');
const IMAGE_SIZE = width / 3 - 20;
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../routes/navigation';
import CustomButton from '../../components/CustomButton';
import CustomButtonSocial from '../../components/CustomButtonSocial';
import PhotoUploadModal from '../../components/Modals/PhotoUploadModal';
import ImageUploadModal from '../../components/Modals/ImageUploadModal';
const AddPhoto = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [images, setImages] = useState<string[]>([]);
  const [showPickerModal, setShowPickerModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  const handleAddImage = () => {
    setShowPickerModal(true);
  };

  // const handleAddImage = () => {
  //   Alert.alert('Add Photo', 'Choose a method', [
  //     {
  //       text: 'Take Photo',
  //       onPress: async () => {
  //         try {
  //           const image = await ImagePicker.openCamera({
  //             mediaType: 'photo',
  //             cropping: false,
  //           });
  //           setImages(prev => [...prev, image.path]);
  //         } catch (error) {
  //           console.log('Camera cancelled or failed', error);
  //         }
  //       },
  //     },
  //     {
  //       text: 'Choose from Gallery',
  //       onPress: async () => {
  //         try {
  //           const result = await ImagePicker.openPicker({
  //             multiple: true,
  //             maxFiles: 6 - images.length,
  //             mediaType: 'photo',
  //           });
  //           const newUris = result.map(img => img.path);
  //           setImages(prev => [...prev, ...newUris]);
  //         } catch (error) {
  //           console.log('Gallery picking cancelled or failed', error);
  //         }
  //       },
  //     },
  //     {text: 'Cancel', style: 'cancel'},
  //   ]);
  // };

  const handleRemoveImage = (index: number) => {
    Alert.alert('Remove Image', 'Are you sure?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Remove',
        onPress: () => {
          setImages(images.filter((_, i) => i !== index));
        },
      },
    ]);
  };

  const renderItem = ({item, index}: {item: string; index: number}) => (
    <View style={styles.imageWrapper}>
      <Image source={{uri: item}} style={styles.image} />
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveImage(index)}>
        <Text style={styles.removeText}>×</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient
      colors={['#ffffff', '#ffffff', '#c2bff6']}
      locations={[0, 0.9, 1]}
      start={{x: 0, y: 2}}
      end={{x: 1.5, y: 0.1}}
      style={styles.gradient}>
      <View style={styles.container}>
        <View style={styles.subcontainer}>
          <Text style={styles.title}>Add your first 2 photos</Text>
          <Text style={styles.subtitle}>
            A profile with 3 or more photos is 6x more likely to get matched!
          </Text>
          <View
            style={{
              paddingVertical: 14,

              alignItems: 'center',
            }}>
            <FlatList
              data={[...images, ...Array(6 - images.length).fill(null)]}
              renderItem={({item, index}) =>
                item ? (
                  renderItem({item, index})
                ) : (
                  <TouchableOpacity
                    onPress={handleAddImage}
                    style={styles.addImage}>
                    <Text style={styles.addText}>+</Text>
                  </TouchableOpacity>
                )
              }
              keyExtractor={(_, i) => i.toString()}
              numColumns={3}
              contentContainerStyle={styles.grid}
            />
          </View>
          <TouchableOpacity onPress={() => setShowInfoModal(true)}>
            <Text style={styles.suggestion}>
              <Image
                source={require('../../assets/Images_main/question.png')} // adjust path as needed
                style={styles.suggestionIcon}
                resizeMode="contain"
              />
              Need help choosing the right photos?
            </Text>
          </TouchableOpacity>
          {/* Photo tips */}

          <PhotoUploadModal
            showInfoModal={showInfoModal}
            setShowInfoModal={setShowInfoModal}
          />

          <ImageUploadModal
            showPickerModal={showPickerModal}
            setShowPickerModal={setShowPickerModal}
            onImageSelected={(imagePath: string) => {
              setImages(prev => [...prev, imagePath]);
            }}
          />
          {/* <Modal
          visible={showPickerModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowPickerModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Add Photo</Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={async () => {
                  setShowPickerModal(false);
                  try {
                    const image = await ImagePicker.openCamera({
                      mediaType: 'photo',
                    });
                    setImages(prev => [...prev, image.path]);
                  } catch (err) {
                    console.log('Camera cancelled or failed', err);
                  }
                }}>
                <Text style={styles.modalButtonText}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={async () => {
                  setShowPickerModal(false);
                  try {
                    const result = await ImagePicker.openPicker({
                      multiple: true,
                      maxFiles: 6 - images.length,
                      mediaType: 'photo',
                    });
                    const newUris = result.map(img => img.path);
                    setImages(prev => [...prev, ...newUris]);
                  } catch (err) {
                    console.log('Gallery cancelled or failed', err);
                  }
                }}>
                <Text style={styles.modalButtonText}>Choose from Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowPickerModal(false)}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal> */}
          <View style={styles.footer}>
            <GlassButton
              text="Finish"
              // icon={images.appleIcon}
              onPress={() => navigation.navigate('Main')}
              style={{marginTop: 16}}
              glassColor="dark"
              width={'100%'}
            />
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    // marginTop: 60,
    // paddingTop: 80,
    // paddingHorizontal: 20,
    // width: '100%',
    // backgroundColor: 'yellow',
  },
  container: {
    flex: 1,
    // backgroundColor: 'green',
    width: '100%',
    alignContent: 'center',
    alignItems: 'center',
  },
  subcontainer: {
    flex: 1,
    // backgroundColor: 'blue',
    width: '95%',
    marginTop: 60,
  },
  title: {fontSize: 30, fontWeight: '600', marginBottom: 10},
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 20,
    color: color.grey,
  },
  grid: {gap: 10},
  imageWrapper: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    margin: 4,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  removeButton: {
    position: 'absolute',
    top: -6,
    right: -3,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    paddingHorizontal: 5,
  },
  removeText: {color: '#fff', fontSize: 16},
  // addImage: {
  //   width: IMAGE_SIZE,
  //   height: IMAGE_SIZE,
  //   backgroundColor: '#eee',
  //   borderRadius: 12,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   margin: 5,
  // },
  // addText: {fontSize: 36, color: '#999'},

  addImage: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    // height: 150,
    backgroundColor: '#f3f3f3',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    marginHorizontal: 3,
    marginTop: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1, // for Android shadow
  },
  addText: {
    fontSize: 28,
    color: '#888',
    fontWeight: '300',
  },

  ////Modal

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
  modalButton: {
    width: '100%',
    paddingVertical: 12,
    backgroundColor: '#6C63FF',
    borderRadius: 10,
    marginBottom: 10,
  },
  modalButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
  modalCancel: {
    marginTop: 10,
    fontSize: 16,
    color: '#888',
  },

  //

  suggestion: {
    fontSize: 14,
    color: color.black,
    marginBottom: 10,
    marginTop: 10,
    textAlign: 'left',
    fontWeight: 'bold',
    // backgroundColor: 'purple',
    width: '100%',
  },
  suggestionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },

  suggestionIcon: {
    width: 18,
    height: 18,
    marginRight: 6,
  },

  modalContent: {
    fontSize: 14,
    color: '#333',
    marginBottom: 20,
    lineHeight: 20,
    textAlign: 'left',
  },

  footer: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
});

export default AddPhoto;
