import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ImageBackground,
  Pressable,
} from 'react-native';

interface PremiumAdCardProps {
  title: string;
  description: string;
  icon: any;
  background: any;
  // activeIndex: number;
  // totalCount: number;
  onPress: () => void;
}

const PremiumAdCard: React.FC<PremiumAdCardProps> = ({
  title,
  description,
  icon,
  background,
  // activeIndex,
  // totalCount,
  onPress,
}) => {
  return (
    <Pressable style={styles.cardWrapper} onPress={onPress}>
      <ImageBackground
        source={background}
        style={styles.card}
        imageStyle={{borderRadius: 16}}
        resizeMode="cover">
        <View style={styles.overlay} />
        <View style={styles.content}>
          <View style={styles.iconWrapper}>
            <Image source={icon} style={styles.icon} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
      </ImageBackground>
    </Pressable>
  );
};

export default PremiumAdCard;

const styles = StyleSheet.create({
  cardWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  card: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)', // Optional dark overlay
    borderRadius: 16,
  },
  content: {
    alignItems: 'center',
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    width: 36,
    height: 36,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#eee',
    textAlign: 'center',
    marginTop: 6,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fa2c37',
    marginHorizontal: 4,
    // transition: 'all 0.3s ease-in-out',
  },
});
