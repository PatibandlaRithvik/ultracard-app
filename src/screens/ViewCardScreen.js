import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView,
  Share, ActivityIndicator, Alert, Clipboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { getCard } from '../lib/api';
import CardView from '../components/CardView';
import { getCardType } from '../lib/cardTypes';

const CARD_URL = (id) => `https://brilliant-magic-production-644a.up.railway.app/card/${id}`;

export default function ViewCardScreen({ route, navigation }) {
  const { cardId } = route.params;
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  useEffect(() => {
    getCard(cardId)
      .then(setCard)
      .catch(() => Alert.alert('Error', 'Card not found'))
      .finally(() => setLoading(false));
  }, [cardId]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  const copyLink = async () => {
    Clipboard.setString(CARD_URL(cardId));
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    showToast('Link copied!');
  };

  const shareCard = async () => {
    try {
      await Share.share({ message: `Check out my digital card: ${CARD_URL(cardId)}` });
    } catch {}
  };

  if (loading) return (
    <SafeAreaView style={styles.center}>
      <ActivityIndicator size="large" color="#6c63ff" />
    </SafeAreaView>
  );

  if (!card) return (
    <SafeAreaView style={styles.center}>
      <Text style={{ fontSize: 40 }}>🤔</Text>
      <Text style={styles.errorText}>Card not found</Text>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.link}>← Go back</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  const ct = getCardType(card.card_type);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={ct.gradient} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Card Preview</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <CardView card={card} />

        {/* Action buttons */}
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionBtn} onPress={shareCard}>
            <Text style={styles.actionIcon}>📤</Text>
            <Text style={styles.actionLabel}>Share Link</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={copyLink}>
            <Text style={styles.actionIcon}>🔗</Text>
            <Text style={styles.actionLabel}>Copy Link</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('NearbyShare', { cardId })}
          >
            <Text style={styles.actionIcon}>📡</Text>
            <Text style={styles.actionLabel}>Ultrasonic</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('EditCard', { cardId })}
          >
            <Text style={styles.actionIcon}>✏️</Text>
            <Text style={styles.actionLabel}>Edit Card</Text>
          </TouchableOpacity>
        </View>

        {/* Link bar */}
        <View style={styles.linkBar}>
          <Text style={styles.linkUrl} numberOfLines={1}>{CARD_URL(cardId)}</Text>
          <TouchableOpacity onPress={copyLink} style={styles.copyBtn}>
            <Text style={styles.copyBtnText}>Copy</Text>
          </TouchableOpacity>
        </View>

        {/* Ultrasonic CTA */}
        <TouchableOpacity
          style={styles.sonicBtn}
          onPress={() => navigation.navigate('NearbyShare', { cardId })}
        >
          <LinearGradient colors={['#1a1a2e', '#0f3460']} style={styles.sonicBtnInner}>
            <Text style={styles.sonicBtnText}>📡 Share via Ultrasonic</Text>
            <Text style={styles.sonicBtnSub}>Hold phones close • No internet needed</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {toast !== '' && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8ff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f8ff' },
  errorText: { fontSize: 16, color: '#666', marginTop: 12 },
  link: { color: '#6c63ff', marginTop: 16, fontWeight: '600' },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 },
  backBtn: { marginBottom: 8 },
  backText: { color: '#fff', fontSize: 14, opacity: 0.8 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  content: { padding: 16, paddingBottom: 60 },
  actionGrid: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 16,
    flexWrap: 'wrap',
  },
  actionBtn: {
    flex: 1,
    minWidth: '22%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  actionIcon: { fontSize: 22, marginBottom: 4 },
  actionLabel: { fontSize: 11, fontWeight: '600', color: '#444', textAlign: 'center' },
  linkBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    gap: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  linkUrl: { flex: 1, fontSize: 12, color: '#555' },
  copyBtn: { backgroundColor: '#6c63ff', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  copyBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  sonicBtn: { borderRadius: 16, overflow: 'hidden' },
  sonicBtnInner: { padding: 20, alignItems: 'center' },
  sonicBtnText: { color: '#fff', fontWeight: '800', fontSize: 18, marginBottom: 4 },
  sonicBtnSub: { color: '#aaa', fontSize: 12 },
  toast: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  toastText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});
