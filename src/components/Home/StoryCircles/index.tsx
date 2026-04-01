import React from 'react';
import {
  View,
  ScrollView,
  Image,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

interface Story {
  id: string;
  username: string;
  avatar: string;
  hasStory: boolean;
  isViewed: boolean;
}

interface StoryCirclesProps {
  stories: Story[];
  onStoryPress: (story: Story) => void;
}

const StoryCircles: React.FC<StoryCirclesProps> = ({stories, onStoryPress}) => {
  const renderStoryItem = (item: Story) => (
    <TouchableOpacity
      key={item.id}
      style={styles.storyContainer}
      onPress={() => onStoryPress(item)}
      activeOpacity={0.7}>
      <View
        style={[
          styles.avatarContainer,
          item.hasStory && !item.isViewed && styles.unviewedRing,
          item.hasStory && item.isViewed && styles.viewedRing,
        ]}>
        <Image source={{uri: item.avatar}} style={styles.avatar} />
      </View>
      <Text style={styles.username} numberOfLines={1}>
        {item.username}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        decelerationRate="fast">
        {stories.map(renderStoryItem)}
      </ScrollView>
    </View>
  );
};

// Example usage component
const StoryCirclesExample: React.FC = () => {
  const sampleStories: Story[] = [
    {
      id: '1',
      username: 'your_story',
      avatar:
        'https://images.unsplash.com/photo-1494790108755-2616b612b977?w=150&h=150&fit=crop&crop=face',
      hasStory: false,
      isViewed: false,
    },
    {
      id: '2',
      username: 'john_doe',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      hasStory: true,
      isViewed: false,
    },
    {
      id: '3',
      username: 'jane_smith',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      hasStory: true,
      isViewed: true,
    },
    {
      id: '4',
      username: 'alex_wilson',
      avatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      hasStory: true,
      isViewed: false,
    },
    {
      id: '5',
      username: 'sarah_connor',
      avatar:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      hasStory: true,
      isViewed: true,
    },
    {
      id: '6',
      username: 'mike_johnson',
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      hasStory: true,
      isViewed: false,
    },
    {
      id: '7',
      username: 'emma_davis',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
      hasStory: true,
      isViewed: false,
    },
  ];

  const handleStoryPress = (story: Story) => {
    // Handle story press - navigate to story viewer
  };

  return (
    <View style={styles.exampleContainer}>
      <StoryCircles stories={sampleStories} onStoryPress={handleStoryPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // backgroundColor: '#ffffff',
    paddingVertical: 12,
    // borderBottomWidth: 0.5,
    // borderBottomColor: '#dbdbdb',
  },
  scrollContainer: {
    paddingHorizontal: 8,
  },
  storyContainer: {
    alignItems: 'center',
    marginHorizontal: 8,
    width: 70,
  },
  avatarContainer: {
    width: 66,
    height: 66,
    borderRadius: 33,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  unviewedRing: {
    // background:
    //   'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
    // For React Native, we'll use a solid color approximation
    backgroundColor: '#e6683c',
    borderWidth: 2,
    borderColor: '#e6683c',
  },
  viewedRing: {
    borderWidth: 2,
    borderColor: '#c7c7c7',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  username: {
    fontSize: 12,
    color: '#262626',
    textAlign: 'center',
    fontWeight: '400',
    maxWidth: 70,
  },
  exampleContainer: {
    // flex: 1,
    // backgroundColor: '#ffffff',
    // paddingTop: 50,
  },
});

export default StoryCirclesExample;
