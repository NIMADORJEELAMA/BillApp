import React from 'react';
import {View, Text} from 'react-native';
import ProfileGrid from '../../components/Swipe/ProfileGrid';
import {DatingScreen} from '../TableSelectionScreen/DatingScreen';

const Notification = profile => {
  const yourStoriesArray = [
    {
      uri: 'https://as1.ftcdn.net/jpg/04/49/44/96/1000_F_449449660_HmB8Nw3ncDySx6f7WblM0n0C28fx2wzK.jpg',
      name: 'Georgina',
      age: '24',
      distance: '1',
      photos: [
        'https://i.pinimg.com/originals/63/51/82/6351820cfbad19ff7c2adcf31be60663.jpg',
        'https://i.pinimg.com/originals/63/51/82/6351820cfbad19ff7c2adcf31be60663.jpg',
        'https://i.pinimg.com/originals/63/51/82/6351820cfbad19ff7c2adcf31be60663.jpg',
        'https://i.pinimg.com/originals/63/51/82/6351820cfbad19ff7c2adcf31be60663.jpg',
        'https://i.pinimg.com/originals/63/51/82/6351820cfbad19ff7c2adcf31be60663.jpg',
        'https://i.pinimg.com/originals/63/51/82/6351820cfbad19ff7c2adcf31be60663.jpg',

        'https://i.pinimg.com/originals/63/51/82/6351820cfbad19ff7c2adcf31be60663.jpg',

        'https://i.pinimg.com/originals/63/51/82/6351820cfbad19ff7c2adcf31be60663.jpg',
      ],
    },
    {
      uri: 'https://th.bing.com/th/id/OIP.IAebAUaiHPWaVFdxpL_2WwHaJ2?w=1196&h=1592&rs=1&pid=ImgDetMain',
      name: 'Georgina',
      age: '24',
      distance: '2',
      photos: [
        'https://i.pinimg.com/originals/63/51/82/6351820cfbad19ff7c2adcf31be60663.jpg',
        'https://i.pinimg.com/originals/63/51/82/6351820cfbad19ff7c2adcf31be60663.jpg',
        'https://i.pinimg.com/originals/63/51/82/6351820cfbad19ff7c2adcf31be60663.jpg',
        'https://i.pinimg.com/originals/63/51/82/6351820cfbad19ff7c2adcf31be60663.jpg',
        'https://i.pinimg.com/originals/63/51/82/6351820cfbad19ff7c2adcf31be60663.jpg',
      ],
    },
    {
      uri: 'https://as1.ftcdn.net/jpg/04/49/44/96/1000_F_449449660_HmB8Nw3ncDySx6f7WblM0n0C28fx2wzK.jpg',
      name: 'Georgina',
      age: '24',
      distance: '3',
      photos: [
        'https://i.pinimg.com/originals/63/51/82/6351820cfbad19ff7c2adcf31be60663.jpg',
        'https://i.pinimg.com/originals/63/51/82/6351820cfbad19ff7c2adcf31be60663.jpg',
        'https://i.pinimg.com/originals/63/51/82/6351820cfbad19ff7c2adcf31be60663.jpg',
        'https://i.pinimg.com/originals/63/51/82/6351820cfbad19ff7c2adcf31be60663.jpg',
        'https://i.pinimg.com/originals/63/51/82/6351820cfbad19ff7c2adcf31be60663.jpg',
        'https://i.pinimg.com/originals/63/51/82/6351820cfbad19ff7c2adcf31be60663.jpg',

        'https://i.pinimg.com/originals/63/51/82/6351820cfbad19ff7c2adcf31be60663.jpg',

        'https://i.pinimg.com/originals/63/51/82/6351820cfbad19ff7c2adcf31be60663.jpg',
        'https://i.pinimg.com/originals/63/51/82/6351820cfbad19ff7c2adcf31be60663.jpg',
      ],
    },
    // {uri: '../../assets/Images_main/wallpaper_couple.jpg'},
    // {uri: '../../assets/Images_main/wallpaper_couple.jpg'},
  ];
  return (
    <View>
      <Text>Notificationcfsdf</Text>

      {yourStoriesArray.map((profile, index) => (
        <ProfileGrid
          key={index}
          profile={profile} // Replace with actual image
        />
      ))}
    </View>
  );
};

export default Notification;
