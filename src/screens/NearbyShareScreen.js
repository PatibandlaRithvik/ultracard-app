import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView,
  Alert, ActivityIndicator, FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../context/AuthContext';
import { createSonicSession, API_BASE } from '../lib/api';

// Ultrasonic channels: 15 frequencies 17600–19750 Hz (150 Hz spacing)
const FREQ_BASE = 17600;
const FREQ_STEP = 150;
const NUM_CHANNELS = 15;
const CHANNELS = Array.from({ length: NUM_CHANNELS }, (_, i) => FREQ_BASE + i * FREQ_STEP);
const DETECTION_THRESHOLD = -52; // dBFS

function freqToChannel(freq) {
  const idx = Math.round((freq - FREQ_BASE) / FREQ_STEP);
  return idx >= 0 && idx < NUM_CHANNELS ? idx : -1;
}

export default function NearbyShareScreen({ route, navigation }) {
  const { cardId } = route.params || {};
  const { user, getToken } = useAuth();

  const [mode, setMode] = useState('idle'); // idle | share | receive | privacy | detected
  const [myCards, setMyCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(cardId || null);
  const [pairingCode, setPairingCode] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [nearbyPeople, setNearbyPeople] = useState([]);
  const [allowed, setAllowed] = useState({});
  const [sharing, setSharing] = useState(false);
  const soundRef = useRef(null);
  const eventSourceRef = useRef(null);

  // Generate pairing code
  const genCode = () => Math.random().toString(36).substring(2, 6).toUpperCase();

  // Privacy fields
  const PRIVACY_FIELDS = [
    { key: 'phone', label: 'Phone', icon: '📞' },
    { key: 'whatsapp', label: 'WhatsApp', icon: '💬' },
    { key: 'email', label: 'Email', icon: '✉️' },
    { key: 'linkedin', label: 'LinkedIn', icon: '💼' },
    { key: 'instagram', label: 'Instagram', icon: '📸' },
    { key: 'twitter', label: 'X / Twitter', icon: '🐦' },
    { key: 'website', label: 'Website', icon: '🌐' },
    { key: 'location', label: 'Location', icon: '📍' },
    { key: 'bio', label: 'Bio', icon: '✍️' },
  ];

  useEffect(() => {
    return () => {
      stopAll();
    };
  }, []);

  const stopAll = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync().catch(() => {});
      await soundRef.current.unloadAsync().catch(() => {});
      soundRef.current = null;
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  };

  const requestMicPermission = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Microphone access is required for ultrasonic sharing.');
      return false;
    }
    return true;
  };

  const startSharing = async () => {
    if (!selectedCard) { Alert.alert('Select Card', 'Choose which card to share'); return; }
    const hasMic = await requestMicPermission();
    if (!hasMic) return;
    setMode('privacy');
    // Pre-fill all privacy fields as allowed
    const init = {};
    PRIVACY_FIELDS.forEach((f) => { init[f.key] = true; });
    setAllowed(init);
  };

  const activateSharing = async () => {
    setSharing(true);
    const code = genCode();
    setPairingCode(code);

    try {
      let token = null;
      if (user) token = await getToken();

      // Register sonic session with backend
      const allowedFields = Object.keys(allowed).filter(k => allowed[k]);
      const { sessionId: sid, frequency } = await createSonicSession(selectedCard, token);
      setSessionId(sid);

      // Play ultrasonic tone
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: true });
      const { sound } = await Audio.Sound.createAsync(
        { uri: `${API_BASE}/api/sonic/tone/${frequency || 18000}` },
        { shouldPlay: true, isLooping: true, volume: 1.0 }
      );
      soundRef.current = sound;

      setMode('share');

      // Listen for connections via SSE
      const es = new EventSource(`${API_BASE}/api/sonic/${sid}/stream`);
      eventSourceRef.current = es;
      es.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (data.type === 'connected') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setMode('detected');
          stopAll();
        }
      };
      es.onerror = () => {};
    } catch (err) {
      Alert.alert('Error', 'Failed to start ultrasonic sharing. Make sure you are signed in.');
      setMode('idle');
    } finally {
      setSharing(false);
    }
  };

  const stopSharing = async () => {
    await stopAll();
    setMode('idle');
    setPairingCode('');
    setNearbyPeople([]);
  };

  const toggleField = (key) => setAllowed((a) => ({ ...a, [key]: !a[key] }));

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#1a1a2e', '#0f3460']} style={styles.header}>
        <TouchableOpacity onPress={() => { stopAll(); navigation.goBack(); }} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📡 Ultrasonic Share</Text>
        <Text style={styles.headerSub}>Hold phones within 15 cm</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>

        {/* IDLE: choose mode */}
        {mode === 'idle' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How do you want to share?</Text>

            <TouchableOpacity style={styles.modeCard} onPress={startSharing}>
              <LinearGradient colors={['#6c63ff', '#a855f7']} style={styles.modeCardInner}>
                <Text style={styles.modeIcon}>📤</Text>
                <Text style={styles.modeTitle}>Share My Card</Text>
                <Text style={styles.modeSub}>Send your card to someone nearby</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modeCard}
              onPress={() => setMode('receive')}
            >
              <LinearGradient colors={['#0369a1', '#0ea5e9']} style={styles.modeCardInner}>
                <Text style={styles.modeIcon}>📥</Text>
                <Text style={styles.modeTitle}>Receive a Card</Text>
                <Text style={styles.modeSub}>Accept a card from someone nearby</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>How it works</Text>
              <Text style={styles.infoText}>
                Both people tap their button. Your phone emits an inaudible ultrasonic signal (18–20 kHz).
                The other phone detects it and shows your name. They tap Accept.
                {'\n\n'}Works without internet. Card details sync when you go online.
              </Text>
            </View>
          </View>
        )}

        {/* PRIVACY: choose what to share */}
        {mode === 'privacy' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Privacy Settings</Text>
            <Text style={styles.sectionSub}>Choose what the recipient will see</Text>
            <Text style={styles.alwaysNote}>Name, title, and company are always included.</Text>

            {PRIVACY_FIELDS.map((f) => (
              <TouchableOpacity
                key={f.key}
                style={styles.privacyRow}
                onPress={() => toggleField(f.key)}
              >
                <Text style={styles.privacyIcon}>{f.icon}</Text>
                <Text style={styles.privacyLabel}>{f.label}</Text>
                <View style={[styles.toggle, allowed[f.key] && styles.toggleOn]}>
                  <View style={[styles.toggleThumb, allowed[f.key] && styles.toggleThumbOn]} />
                </View>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[styles.activateBtn, sharing && { opacity: 0.6 }]}
              onPress={activateSharing}
              disabled={sharing}
            >
              {sharing ? <ActivityIndicator color="#fff" /> : (
                <Text style={styles.activateBtnText}>📡 Start Sharing</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setMode('idle')} style={styles.cancelLink}>
              <Text style={styles.cancelLinkText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* SHARING: emitting signal */}
        {mode === 'share' && (
          <View style={styles.section}>
            <View style={styles.pulseBox}>
              <View style={styles.pulseOuter}>
                <View style={styles.pulseMid}>
                  <View style={styles.pulseInner}>
                    <Text style={styles.pulseIcon}>📡</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.pulseLabel}>Emitting ultrasonic signal...</Text>
            </View>

            <View style={styles.codeCard}>
              <Text style={styles.codeLabel}>Your pairing code</Text>
              <Text style={styles.codeValue}>{pairingCode}</Text>
              <Text style={styles.codeSub}>Tell this to the other person so they can accept your card</Text>
            </View>

            <TouchableOpacity style={styles.stopBtn} onPress={stopSharing}>
              <Text style={styles.stopBtnText}>⏹ Stop Sharing</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* RECEIVE MODE */}
        {mode === 'receive' && (
          <View style={styles.section}>
            <View style={styles.pulseBox}>
              <View style={[styles.pulseOuter, { borderColor: '#0369a155' }]}>
                <View style={[styles.pulseMid, { borderColor: '#0369a133' }]}>
                  <View style={[styles.pulseInner, { backgroundColor: '#0369a1' }]}>
                    <Text style={styles.pulseIcon}>👂</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.pulseLabel}>Listening for nearby cards...</Text>
            </View>

            {nearbyPeople.length > 0 && (
              <View>
                <Text style={styles.nearbyTitle}>Nearby Cards</Text>
                {nearbyPeople.map((p) => (
                  <TouchableOpacity
                    key={p.sessionId}
                    style={styles.nearbyCard}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      setMode('idle');
                      navigation.navigate('ViewCard', { cardId: p.cardId });
                    }}
                  >
                    <View style={styles.nearbyAvatar}>
                      <Text style={styles.nearbyAvatarText}>
                        {p.name?.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.nearbyInfo}>
                      <Text style={styles.nearbyName}>{p.name}</Text>
                      <Text style={styles.nearbyCard2}>{p.cardType} Card · Code: {p.code}</Text>
                      <Text style={styles.nearbySignal}>🟢 Very Close</Text>
                    </View>
                    <TouchableOpacity style={styles.acceptBtn}>
                      <Text style={styles.acceptBtnText}>Accept</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {nearbyPeople.length === 0 && (
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  Ask the other person to tap "Share My Card" on their phone.
                  Their name will appear here automatically.
                </Text>
              </View>
            )}

            <TouchableOpacity style={styles.stopBtn} onPress={() => setMode('idle')}>
              <Text style={styles.stopBtnText}>⏹ Stop Listening</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* DETECTED: connection made */}
        {mode === 'detected' && (
          <View style={styles.section}>
            <View style={styles.successBox}>
              <Text style={styles.successIcon}>🎉</Text>
              <Text style={styles.successTitle}>Connected!</Text>
              <Text style={styles.successSub}>
                Your card has been shared successfully.
                The recipient will see full details when they come online.
              </Text>
            </View>
            <TouchableOpacity style={styles.doneBtn} onPress={() => setMode('idle')}>
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8ff' },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 },
  backBtn: { marginBottom: 8 },
  backText: { color: '#fff', fontSize: 14, opacity: 0.8 },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 4 },
  headerSub: { color: '#aaa', fontSize: 13 },
  content: { padding: 20, paddingBottom: 60 },
  section: {},
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#111', marginBottom: 4 },
  sectionSub: { fontSize: 14, color: '#666', marginBottom: 16 },
  alwaysNote: { fontSize: 12, color: '#888', marginBottom: 16, fontStyle: 'italic' },
  modeCard: { borderRadius: 16, overflow: 'hidden', marginBottom: 14 },
  modeCardInner: { padding: 24, alignItems: 'center' },
  modeIcon: { fontSize: 36, marginBottom: 8 },
  modeTitle: { color: '#fff', fontWeight: '800', fontSize: 20, marginBottom: 4 },
  modeSub: { color: '#ffffffcc', fontSize: 13 },
  infoBox: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoTitle: { fontWeight: '700', fontSize: 14, color: '#111', marginBottom: 8 },
  infoText: { fontSize: 13, color: '#666', lineHeight: 20 },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    gap: 12,
  },
  privacyIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  privacyLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: '#111' },
  toggle: { width: 48, height: 26, borderRadius: 13, backgroundColor: '#ddd', justifyContent: 'center', padding: 2 },
  toggleOn: { backgroundColor: '#6c63ff' },
  toggleThumb: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff' },
  toggleThumbOn: { alignSelf: 'flex-end' },
  activateBtn: {
    backgroundColor: '#1a1a2e',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  activateBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  cancelLink: { alignItems: 'center', marginTop: 14 },
  cancelLinkText: { color: '#888', fontSize: 14 },
  pulseBox: { alignItems: 'center', marginVertical: 32 },
  pulseOuter: { width: 160, height: 160, borderRadius: 80, borderWidth: 2, borderColor: '#6c63ff55', alignItems: 'center', justifyContent: 'center' },
  pulseMid: { width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderColor: '#6c63ff33', alignItems: 'center', justifyContent: 'center' },
  pulseInner: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#6c63ff', alignItems: 'center', justifyContent: 'center' },
  pulseIcon: { fontSize: 32 },
  pulseLabel: { marginTop: 20, fontSize: 15, color: '#666', fontWeight: '600' },
  codeCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  codeLabel: { fontSize: 13, color: '#888', fontWeight: '600', marginBottom: 8 },
  codeValue: { fontSize: 48, fontWeight: '900', color: '#1a1a2e', letterSpacing: 8, marginBottom: 12 },
  codeSub: { fontSize: 13, color: '#999', textAlign: 'center', lineHeight: 18 },
  stopBtn: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#ff4444',
  },
  stopBtnText: { color: '#ff4444', fontWeight: '700', fontSize: 15 },
  nearbyTitle: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 12 },
  nearbyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  nearbyAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#6c63ff', alignItems: 'center', justifyContent: 'center' },
  nearbyAvatarText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  nearbyInfo: { flex: 1 },
  nearbyName: { fontWeight: '700', fontSize: 15, color: '#111' },
  nearbyCard2: { fontSize: 12, color: '#888', marginTop: 2 },
  nearbySignal: { fontSize: 12, marginTop: 2 },
  acceptBtn: { backgroundColor: '#6c63ff', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  acceptBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  successBox: { alignItems: 'center', padding: 40 },
  successIcon: { fontSize: 64, marginBottom: 16 },
  successTitle: { fontSize: 28, fontWeight: '900', color: '#111', marginBottom: 12 },
  successSub: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 22 },
  doneBtn: {
    backgroundColor: '#6c63ff',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  doneBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
