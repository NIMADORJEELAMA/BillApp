import React from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
// Import LinearGradient
import LinearGradient from 'react-native-linear-gradient';
import {Text} from './../components/common/UI';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import BackIcon from '../assets/Icons/left-arrow.svg';

interface MainLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showBack?: boolean;
  leftComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
  statusBarColor?: string;
  barStyle?: 'dark-content' | 'light-content';
  // Added a prop to toggle gradient if you don't want it everywhere
  useGradient?: boolean;
}

const MainLayout = ({
  children,
  title,
  subtitle,
  showBack,
  leftComponent,
  rightComponent,
  statusBarColor = 'transparent', // Changed to transparent for gradient flow
  barStyle = 'dark-content',
  useGradient = true,
}: MainLayoutProps) => {
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // The Content Wrapper
  const ContainerView = useGradient ? LinearGradient : View;

  // Gradient Props (Taken from your ProfileScreen)
  const gradientProps = useGradient
    ? {
        colors: ['#ffffff', '#ffffff', '#c2bff6'],
        locations: [0, 0.9, 1] as number[],
        start: {x: 0, y: 2},
        end: {x: 1.5, y: 0.1},
        style: styles.container,
      }
    : {style: styles.container};

  return (
    <LinearGradient
      colors={['#ffffff', '#ffffff', '#c2bff6']}
      locations={[0, 0.9, 1]}
      start={{x: 0, y: 2}}
      end={{x: 1.5, y: 0.1}}
      style={styles.container} // Make sure this is flex: 1
    >
      {isFocused && (
        <StatusBar
          barStyle={barStyle}
          backgroundColor={statusBarColor}
          translucent={true} // Allows gradient to show under status bar on Android
          animated={true}
        />
      )}

      {/* Header Area */}
      <View style={[styles.header, {paddingTop: insets.top + 4}]}>
        <View style={styles.headerTopRow}>
          <View style={styles.sideSection}>
            {leftComponent ? (
              leftComponent
            ) : showBack ? (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.iconButton}>
                <BackIcon height={14} />
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={styles.centerSection}>
            <Text style={styles.headerTitle}>{title}</Text>
            {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
          </View>

          <View style={[styles.sideSection, {alignItems: 'flex-end'}]}>
            {rightComponent}
          </View>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>{children}</View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#F4F7F8', // Fallback color
  },
  header: {
    // To make the header look seamless, we remove background color
    // or keep it white if you want a distinct top bar
    // backgroundColor: '#ffffff',
    paddingHorizontal: 15,
    paddingBottom: 12,
    // ...Platform.select({
    //   ios: {
    //     shadowColor: '#000',
    //     shadowOffset: {width: 0, height: 2},
    //     shadowOpacity: 0.1,
    //     shadowRadius: 4,
    //   },
    //   android: {elevation: 4},
    // }),
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sideSection: {
    width: 45,
    justifyContent: 'center',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9F9F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {fontSize: 20, fontWeight: '800', color: '#121212'},
  headerSubtitle: {
    fontSize: 10,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

export default MainLayout;
