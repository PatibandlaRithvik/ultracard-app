import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';

const CARD_TYPES = [
  { id: 'personal', label: 'Personal', icon: '👤', color: '#6c63ff', desc: 'Social & personal networking' },
  { id: 'business', label: 'Business', icon: '💼', color: '#0369a1', desc: 'Professional work card' },
  { id: 'ca', label: 'CA / Pro', icon: '⚖️', color: '#15803d', desc: 'CA & professional services' },
  { id: 'elite', label: 'Elite', icon: '⭐', color: '#b45309', desc: 'Premium executive card' },
];

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.header}>
        <Text style={styles.logo}>digital<Text style={styles.accent}>card</Text></Text>
        <Text style={styles.tagline}>Premium identity. Always live.</Text>
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Auth CTA */}
        {!user ? (
          <TouchableOpacity style={styles.authBanner} onPress={() => navigation.navigate('Login')}>
            <LinearGradient colors={['#6c63ff', '#a855f7']} style={styles.authBannerInner}>
              <Text style={styles.authBannerTitle}>Sign in to save your cards</Text>
              <Text style={styles.authBannerSub}>Google or Phone OTP → free forever</Text>
              <Text style={styles.authBannerArrow}>Sign In →</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.myCardsBanner} onPress={() => navigation.navigate('MyCards')}>
            <Text style={styles.myCardsText}>👋 Hi, {user.displayName || user.email?.split('@')[0]}</Text>
            <Text style={styles.myCardsLink}>View My Cards →</Text>
          </TouchableOpacity>
        )}

        {/* Create card section */}
        <Text style={styles.sectionTitle}>Create a Card</Text>
        <Text style={styles.sectionSub}>Choose the type that fits your purpose</Text>

        <View style={styles.grid}>
          {CARD_TYPES.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={styles.typeCard}
              onPress={() => navigation.navigate('CreateCard', { cardType: type.id })}
              activeOpacity={0.85}
            >
              <View style={[styles.typeIcon, { backgroundColor: type.color + '18' }]}>
                <Text style={styles.typeIconText}>{type.icon}</Text>
              </View>
              <Text style={[styles.typeLabel, { color: type.color }]}>{type.label}</Text>
              <Text style={styles.typeDesc}>{type.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Features */}
        <Text style={styles.sectionTitle}>How it works</Text>
        {[
          { icon: '📡', title: 'Ultrasonic Share', desc: 'Tap share → hold phones close → card transferred. No QR, no Bluetooth.' },
          { icon: '🔄', title: 'Always Updated', desc: 'You update once — everyone who has your card sees the new details automatically.' },
          { icon: '🔒', title: 'Privacy First', desc: 'Choose exactly which fields to share before sending. Nothing leaves without your permission.' },
          { icon: '💾', title: 'Works Offline', desc: 'Basic card saved offline. Premium card syncs when you get internet.' },
        ].map((f) => (
          <View key={f.icon} style={styles.featureRow}>
            <Text style={styles.featureIcon}>{f.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomBtn} onPress={() => navigation.navigate('NearbyShare')}>
          <Text style={styles.bottomBtnText}>📡 Share via Ultrasonic</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8ff' },
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 28 },
  logo: { fontSize: 28, fontWeight: '800', color: '#fff' },
  accent: { color: '#6c63ff' },
  tagline: { color: '#aaa', fontSize: 13, marginTop: 4 },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 100 },
  authBanner: { borderRadius: 16, overflow: 'hidden', marginBottom: 24 },
  authBannerInner: { padding: 20 },
  authBannerTitle: { color: '#fff', fontWeight: '800', fontSize: 18 },
  authBannerSub: { color: '#ffffffcc', fontSize: 13, marginTop: 4 },
  authBannerArrow: { color: '#fff', fontWeight: '700', marginTop: 14, fontSize: 15 },
  myCardsBanner: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  myCardsText: { fontWeight: '700', fontSize: 15, color: '#111' },
  myCardsLink: { color: '#6c63ff', fontWeight: '600', fontSize: 13 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#111', marginBottom: 4, marginTop: 8 },
  sectionSub: { fontSize: 13, color: '#777', marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 28 },
  typeCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  typeIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  typeIconText: { fontSize: 22 },
  typeLabel: { fontWeight: '800', fontSize: 15, marginBottom: 4 },
  typeDesc: { fontSize: 12, color: '#888', lineHeight: 16 },
  featureRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  featureIcon: { fontSize: 24, marginTop: 2 },
  featureTitle: { fontWeight: '700', fontSize: 14, color: '#111', marginBottom: 4 },
  featureDesc: { fontSize: 12, color: '#777', lineHeight: 18 },
  bottomBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    padding: 16,
    paddingBottom: 28,
  },
  bottomBtn: {
    backgroundColor: '#1a1a2e',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  bottomBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
