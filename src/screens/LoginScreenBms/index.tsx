import React, {useState, useCallback} from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  Text,
  ScrollView,
  Image, // Added for UI stability
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native'; // Ensure fields reset on logout
import {Div} from '../../components/common/UI';
import {authService} from '../../services/authService';
import {setToken, setUser} from '../../redux/slices/authSlice';
import {useDispatch} from 'react-redux';
import {saveToken, saveUser} from '../../utils/storage';
import EyeOpen from '../../assets/Icons/eye_open.svg';
import EyeClosed from '../../assets/Icons/eye_closed.svg';
import {useNotifications} from '../../hooks/useNotifications';
import DeviceInfo from 'react-native-device-info';

const LoginScreenBms = () => {
  const version = DeviceInfo.getVersion();
  // Get the build number (e.g., "15" - useful for internal tracking)
  const buildNumber = DeviceInfo.getBuildNumber();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});

  const dispatch = useDispatch();
  const {registerDevice} = useNotifications(false);

  // Clears the form when navigating back to login (Logout scenario)
  useFocusEffect(
    useCallback(() => {
      setEmail('');
      setPassword('');
      setErrors({});
    }, []),
  );

  const validate = () => {
    let valid = true;
    let newErrors: any = {};
    if (!email.includes('@')) {
      newErrors.email = 'Enter a valid resort email';
      valid = false;
    }
    if (password.length < 4) {
      newErrors.password = 'Password is too short';
      valid = false;
    }
    setErrors(newErrors);
    return valid;
  };

  const handleLogin = async () => {
    setErrors({});
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await authService.login({email, password});

      const token = response?.access_token;
      const userData = response?.user;

      if (token) {
        await saveToken(token);
        await saveUser(userData);
        dispatch(setToken(token));
        dispatch(setUser(userData));
        setTimeout(async () => {
          await registerDevice();
        }, 500);
      }
    } catch (error: any) {
      const status = error.response?.status;

      if (status === 401) {
        setErrors({general: 'Invalid email or password.'});
      } else {
        setErrors({general: 'Network error. Please try again later.'});
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scrollGrow}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Div style={styles.inner}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Image
                  source={require('../../assets/images/logo11.jpg')} // Update this path!
                  style={styles.logoImage}
                  resizeMode="cover"
                />
              </View>
              <Text style={styles.title}>Gairigaon</Text>
              <Text style={styles.subtitle}>Hill Top Eco Tourism</Text>
            </View>

            {/* Form */}
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Welcome Back</Text>
              <Text style={styles.formSubtitle}>
                Sign in to manage your floor
              </Text>

              {/* Email */}
              <View style={styles.inputGroup}>
                <Text
                  style={[styles.label, errors.email && {color: '#EF4444'}]}>
                  EMAIL
                </Text>
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder="name@hilltop.com"
                  placeholderTextColor="#94A3B8"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                {errors.email && (
                  <Text style={styles.errorSubText}>{errors.email}</Text>
                )}
              </View>

              {/* Password */}
              <View style={styles.inputGroup}>
                <Text
                  style={[styles.label, errors.password && {color: '#EF4444'}]}>
                  PASSWORD
                </Text>
                <View
                  style={[
                    styles.passwordWrapper,
                    errors.password && styles.inputError,
                  ]}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="••••••"
                    placeholderTextColor="#94A3B8"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeBtn}>
                    {showPassword ? (
                      <EyeOpen width={20} height={20} fill="#94A3B8" />
                    ) : (
                      <EyeClosed width={20} height={20} fill="#94A3B8" />
                    )}
                  </TouchableOpacity>
                </View>
                {errors.password && (
                  <Text style={styles.errorSubText}>{errors.password}</Text>
                )}
              </View>

              {errors.general && (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorBannerText}>{errors.general}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.loginButton, loading && styles.disabledButton]}
                onPress={handleLogin}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.loginButtonText}>Login</Text>
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.footerText}>
              Build {version} •{' '}
              <Text style={styles.statusOnline}>System Active</Text>
            </Text>
          </Div>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F8FAFC'},
  flex: {flex: 1},
  scrollGrow: {
    flexGrow: 1,
    //  justifyContent: 'center'
  },
  inner: {
    padding: 24,
    flex: 1,
    justifyContent: 'center', // Move centering here
    minHeight: '100%',
  },
  header: {alignItems: 'center', marginBottom: 32},
  logoCircle: {
    width: 80,
    height: 80,
    backgroundColor: '#FFF',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  logoEmoji: {fontSize: 40},
  logoContainer: {
    // Keeps the logo centered and slightly raised
    marginBottom: 10,
    // Add shadow (iOS) and elevation (Android) for depth
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoImage: {
    // Sets the specific size of the logo
    width: 80, // Adjust as needed
    height: 80, // Adjust as needed

    // Creates the PERFECT CIRCLE
    // Note: borderRadius MUST be exactly HALF of width/height
    borderRadius: 40,

    // Creates a nice border around the circle
    borderWidth: 2,
    borderColor: '#E5E7EB', // Slate 200 (gray)

    backgroundColor: 'white', // Keeps the image clean if it has transparency
  },
  title: {fontSize: 32, fontWeight: '900', color: '#1E293B'},
  subtitle: {
    fontSize: 12,
    color: '#94A3B8',
    letterSpacing: 3,
    fontWeight: '700',
  },
  formCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    minHeight: 400, // Give the card a minimum height so it doesn't "pop" in
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 20,
  },
  formTitle: {fontSize: 22, fontWeight: '800', color: '#1E293B'},
  formSubtitle: {fontSize: 14, color: '#64748B', marginBottom: 24},
  inputGroup: {marginBottom: 16},
  label: {fontSize: 10, fontWeight: '800', color: '#94A3B8', marginBottom: 8},
  input: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: '#1E293B',
  },
  inputError: {borderColor: '#EF4444', backgroundColor: '#FEF2F2'},
  errorSubText: {
    color: '#EF4444',
    fontSize: 10,
    marginTop: 4,
    fontWeight: '600',
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  errorBannerText: {
    color: '#991B1B',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  eyeBtn: {paddingRight: 16},
  loginButton: {
    backgroundColor: '#FC8019',
    paddingVertical: 18,
    borderRadius: 12,
    marginTop: 24,
    alignItems: 'center',
    elevation: 5,
  },
  loginButtonText: {color: '#FFF', fontSize: 16, fontWeight: '800'},
  disabledButton: {opacity: 0.6},
  footerText: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 32,
  },
  statusOnline: {color: '#10B981', fontWeight: '800'},
});

export default LoginScreenBms;
