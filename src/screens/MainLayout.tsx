import React from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import {Text} from './../components/common/UI';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import BackIcon from '../assets/Icons/left-arrow.svg'; // Adjust path

interface MainLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string | React.ReactNode;
  showBack?: boolean;
  leftComponent?: React.ReactNode; // For Drawer or custom back
  rightComponent?: React.ReactNode; // For Cart, Profile, <etc styleName={}></etc>
  statusBarColor?: string;
  barStyle?: 'dark-content' | 'light-content';
}

const MainLayout = ({
  children,
  title,
  subtitle,
  showBack,
  leftComponent,
  rightComponent,
  statusBarColor = '#fff', // Default color
  barStyle = 'dark-content',
}: MainLayoutProps) => {
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.container}>
      {isFocused && (
        <StatusBar
          barStyle={barStyle}
          backgroundColor={statusBarColor}
          animated={true}
        />
      )}

      <View style={[styles.header, {paddingTop: insets.top + 4}]}>
        <View style={styles.headerTopRow}>
          {/* LEFT SECTION */}
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

          {/* CENTER SECTION */}
          <View style={styles.centerSection}>
            <Text style={styles.headerTitle}>{title}</Text>

            {/* Logic to handle both text and components */}
            {subtitle && (
              <View style={{marginTop: 2}}>
                {typeof subtitle === 'string' ? (
                  <Text style={styles.headerSubtitle}>{subtitle}</Text>
                ) : (
                  subtitle
                )}
              </View>
            )}
          </View>
          {/* <View style={styles.centerSection}>
            <Text style={styles.headerTitle}>{title}</Text>

            {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
          </View> */}

          {/* RIGHT SECTION */}
          <View style={[styles.sideSection, {alignItems: 'flex-end'}]}>
            {rightComponent}
          </View>
        </View>
      </View>

      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F4F7F8', elevation: 20},
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {elevation: 4},
    }),
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sideSection: {
    width: 45, // Fixed width keeps title centered
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
  backIcon: {fontSize: 22, fontWeight: 'bold', color: '#fa2c37'},
  headerTitle: {fontSize: 20, fontWeight: '800', color: '#121212'},
  headerSubtitle: {
    fontSize: 10,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
  },
  content: {flex: 1},
});

export default MainLayout;
