import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
  Alert, SafeAreaView, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getAuth, GoogleAuthProvider, signInWithCredential, PhoneAuthProvider, RecaptchaVerifier } from 'firebase/auth';

export default function LoginScreen({ navigation }) {
  const [tab, setTab] = useState('google');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // phone | otp
  const [verificationId, setVerificationId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    Alert.alert(
      'Google Sign-In',
      'Google Sign-In requires native Firebase setup. Please configure your Firebase project and add google-services.json to enable this feature.\n\nFor now, use Phone OTP login.',
      [{ text: 'OK' }]
    );
  };

  const sendOtp = async () => {
    if (!phone.trim()) { Alert.alert('Error', 'Enter your phone number'); return; }
    Alert.alert(
      'Phone OTP',
      'Phone authentication requires native Firebase configuration.\n\nTo enable: add google-services.json and configure @react-native-firebase/auth.',
      [{ text: 'OK' }]
    );
  };

  const verifyOtp = async () => {
    if (!otp.trim()) { Alert.alert('Error', 'Enter the OTP'); return; }
    Alert.alert('Coming Soon', 'OTP verification will be ready after native Firebase setup.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={StyleSheet.absoluteFill} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.inner}>
        {/* Logo */}
        <View style={styles.logoBox}>
          <Text style={styles.logo}>digital<Text style={styles.logoAccent}>card</Text></Text>
          <Text style={styles.logoSub}>Your premium identity, always updated</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          {/* Tabs */}
          <View style={styles.tabs}>
            {['google', 'phone'].map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.tab, tab === t && styles.tabActive]}
                onPress={() => { setTab(t); setStep('phone'); }}
              >
                <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                  {t === 'google' ? '🔵 Google' : '📱 Phone'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {tab === 'google' ? (
            <View style={styles.section}>
              <Text style={styles.hint}>Sign in with your Google account</Text>
              <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleSignIn} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : (
                  <Text style={styles.googleBtnText}>🔵  Sign in with Google</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.section}>
              {step === 'phone' ? (
                <>
                  <Text style={styles.hint}>Enter your mobile number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="+91 98765 43210"
                    placeholderTextColor="#999"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    autoFocus
                  />
                  <TouchableOpacity style={styles.primaryBtn} onPress={sendOtp} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : (
                      <Text style={styles.primaryBtnText}>Send OTP →</Text>
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.hint}>Enter the 6-digit OTP sent to {phone}</Text>
                  <TextInput
                    style={[styles.input, styles.otpInput]}
                    placeholder="• • • • • •"
                    placeholderTextColor="#999"
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                    maxLength={6}
                    autoFocus
                  />
                  <TouchableOpacity style={styles.primaryBtn} onPress={verifyOtp} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : (
                      <Text style={styles.primaryBtnText}>Verify →</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setStep('phone')}>
                    <Text style={styles.backLink}>← Change number</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        </View>

        <Text style={styles.footer}>By signing in, you agree to our Terms & Privacy Policy</Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, justifyContent: 'center', padding: 24 },
  logoBox: { alignItems: 'center', marginBottom: 32 },
  logo: { fontSize: 32, fontWeight: '800', color: '#fff' },
  logoAccent: { color: '#6c63ff' },
  logoSub: { color: '#aaa', fontSize: 14, marginTop: 6 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  tab: { flex: 1, paddingVertical: 16, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#6c63ff' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#999' },
  tabTextActive: { color: '#6c63ff' },
  section: { padding: 24 },
  hint: { fontSize: 14, color: '#666', marginBottom: 16, textAlign: 'center' },
  input: {
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111',
    marginBottom: 16,
    backgroundColor: '#fafafa',
  },
  otpInput: { textAlign: 'center', fontSize: 24, letterSpacing: 8 },
  googleBtn: {
    backgroundColor: '#4285F4',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  googleBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  primaryBtn: {
    backgroundColor: '#6c63ff',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  backLink: { color: '#6c63ff', textAlign: 'center', fontSize: 14 },
  footer: { color: '#666', fontSize: 12, textAlign: 'center', marginTop: 24 },
});
