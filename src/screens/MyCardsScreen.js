import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, SafeAreaView,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { getMyCards } from '../lib/api';
import { getCardType } from '../lib/cardTypes';
import CardView from '../components/CardView';

export default function MyCardsScreen({ navigation }) {
  const { user, getToken, logout } = useAuth();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const token = await getToken();
      const data = await getMyCards(token);
      setCards(data);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, [user]);

  useEffect(() => {
    if (!user) { navigation.replace('Login'); return; }
    load();
  }, [user]);

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';

  const renderCard = ({ item: card }) => {
    const ct = getCardType(card.card_type);
    const isOpen = expanded === card.id;
    return (
      <View style={styles.cardWrapper}>
        <TouchableOpacity
          style={styles.cardRow}
          onPress={() => setExpanded(isOpen ? null : card.id)}
          activeOpacity={0.8}
        >
          <LinearGradient colors={ct.gradient} style={styles.cardAvatar}>
            <Text style={styles.cardAvatarText}>
              {card.name.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase()}
            </Text>
          </LinearGradient>
          <View style={styles.cardInfo}>
            <View style={styles.cardNameRow}>
              <Text style={styles.cardName}>{card.name}</Text>
              <View style={[styles.typeBadge, { backgroundColor: ct.color + '20' }]}>
                <Text style={[styles.typeBadgeText, { color: ct.color }]}>{ct.icon} {ct.label}</Text>
              </View>
            </View>
            {card.title && <Text style={styles.cardTitle}>{card.title}</Text>}
            {card.company && <Text style={[styles.cardCompany, { color: ct.color }]}>{card.company}</Text>}
          </View>
          <Text style={styles.chevron}>{isOpen ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {isOpen && (
          <View style={styles.expandedArea}>
            <CardView card={card} compact={false} />
            <View style={styles.expandedActions}>
              <TouchableOpacity
                style={styles.viewBtn}
                onPress={() => navigation.navigate('ViewCard', { cardId: card.id })}
              >
                <LinearGradient colors={['#6c63ff', '#a855f7']} style={styles.viewBtnInner}>
                  <Text style={styles.viewBtnText}>📤 View & Share</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => navigation.navigate('EditCard', { cardId: card.id })}
              >
                <Text style={styles.editBtnText}>✏️ Edit</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  if (loading) return (
    <SafeAreaView style={styles.center}>
      <ActivityIndicator size="large" color="#6c63ff" />
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>👋 Hi, {displayName}</Text>
            <Text style={styles.email}>{user?.email || user?.phoneNumber}</Text>
          </View>
          <TouchableOpacity onPress={() => { logout(); navigation.replace('Home'); }}>
            <Text style={styles.signOut}>Sign out</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.createBtnText}>✨ Create New Card</Text>
        </TouchableOpacity>
      </LinearGradient>

      {cards.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>🪪</Text>
          <Text style={styles.emptyTitle}>No cards yet</Text>
          <Text style={styles.emptyDesc}>Create your first card — Personal, Business, CA, or Elite.</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.emptyBtnText}>Create My Card →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={cards}
          keyExtractor={(c) => c.id.toString()}
          renderItem={renderCard}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#6c63ff" />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8ff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  greeting: { color: '#fff', fontWeight: '700', fontSize: 16 },
  email: { color: '#aaa', fontSize: 12, marginTop: 2 },
  signOut: { color: '#aaa', fontSize: 13 },
  createBtn: {
    backgroundColor: '#ffffff22',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffffff33',
  },
  createBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  list: { padding: 16, paddingBottom: 60 },
  cardWrapper: { marginBottom: 12 },
  cardRow: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  cardAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardAvatarText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  cardInfo: { flex: 1 },
  cardNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  cardName: { fontWeight: '700', fontSize: 15, color: '#111' },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  typeBadgeText: { fontSize: 11, fontWeight: '700' },
  cardTitle: { fontSize: 12, color: '#666', marginTop: 2 },
  cardCompany: { fontSize: 12, fontWeight: '600', marginTop: 1 },
  chevron: { color: '#aaa', fontSize: 12 },
  expandedArea: { marginTop: 8 },
  expandedActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  viewBtn: { flex: 2, borderRadius: 12, overflow: 'hidden' },
  viewBtnInner: { paddingVertical: 12, alignItems: 'center' },
  viewBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  editBtn: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  editBtnText: { fontWeight: '600', fontSize: 14, color: '#555' },
  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#111', marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  emptyBtn: { backgroundColor: '#6c63ff', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 14 },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
