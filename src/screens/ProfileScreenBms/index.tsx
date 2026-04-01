import React from 'react';
import {StyleSheet, View, ScrollView} from 'react-native';
import {useSelector} from 'react-redux';
import MainLayout from '../MainLayout';
import {Text, Div} from '../../components/common/UI';
import ProfileIcon from '../../assets/Icons/profile.svg';
import GlassButton from '../../components/GlassButton/GlassButton';
import useLogout from '../../hooks/useLogout';
import color from '../../assets/Color/color';

const ProfileScreen = () => {
  // Grab user data from Redux
  const user = useSelector((state: any) => state.auth.user);
  const handleLogout = useLogout();

  return (
    <MainLayout title="Profile" showBack={true}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Avatar Placeholder with Initial */}
        <Div style={styles.avatarSection}>
          <Div style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </Div>
          <Text style={styles.userName}>{user?.name || 'User Name'}</Text>
          <Text style={styles.userRole}>{user?.role || 'Staff'}</Text>
        </Div>

        {/* Data Card */}
        <Div style={styles.infoCard}>
          <Text style={styles.cardHeader}>Personal Details</Text>

          <View style={styles.row}>
            <Text style={styles.label}>FULL NAME</Text>
            <Text style={styles.value}>{user?.name}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>EMAIL</Text>
            <Text style={styles.value}>{user?.email}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>SYSTEM ID</Text>
            <Text style={styles.value}>
              {user?.id?.substring(0, 8).toUpperCase()}
            </Text>
          </View>
        </Div>

        {/* System Status */}

        <View>
          <GlassButton
            text="Log Out"
            onPress={handleLogout}
            style={{marginTop: 16}}
            glassColor="dark"
            width={'100%'}
          />
        </View>
        <Div style={styles.statusBox}>
          <ProfileIcon width={18} height={18} fill="#10B981" />
          <Text style={styles.statusText}>Active Session • {user?.role}</Text>
        </Div>
      </ScrollView>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  scrollContent: {padding: 20},
  avatarSection: {alignItems: 'center', marginBottom: 30},
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: color.dark, // Match your login button
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarInitial: {fontSize: 36, color: '#FFF', fontWeight: '900'},
  userName: {fontSize: 24, fontWeight: '800', color: '#1E293B'},
  userRole: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '700',
    letterSpacing: 1.5,
  },

  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  cardHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: color.dark,
    marginBottom: 20,
    letterSpacing: 1,
  },
  row: {marginBottom: 20},
  label: {fontSize: 10, color: '#94A3B8', fontWeight: '800', marginBottom: 4},
  value: {fontSize: 16, color: '#1E293B', fontWeight: '600'},

  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    backgroundColor: '#F1F5F9',
    padding: 12,
    borderRadius: 12,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#64748B',
    fontWeight: '700',
  },
});

export default ProfileScreen;
