import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Linking, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getCardType } from '../lib/cardTypes';

function Avatar({ name, color }) {
  const initials = name
    ? name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
    : '?';
  return (
    <LinearGradient colors={[color + 'cc', color + '66']} style={styles.avatar}>
      <Text style={styles.avatarText}>{initials}</Text>
    </LinearGradient>
  );
}

function ContactRow({ icon, value, onPress }) {
  if (!value) return null;
  return (
    <TouchableOpacity style={styles.contactRow} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.contactIcon}>{icon}</Text>
      <Text style={styles.contactValue} numberOfLines={1}>{value}</Text>
    </TouchableOpacity>
  );
}

export default function CardView({ card, compact = false }) {
  if (!card) return null;
  const ct = getCardType(card.card_type);

  const open = (url) => { if (url) Linking.openURL(url).catch(() => {}); };

  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      {/* Color band top */}
      <LinearGradient colors={ct.gradient} style={styles.band} />

      {/* Badge */}
      <View style={[styles.badge, { backgroundColor: ct.color + '22', borderColor: ct.color + '55' }]}>
        <Text style={[styles.badgeText, { color: ct.color }]}>{ct.icon} {ct.label}</Text>
      </View>

      {/* Avatar + Name */}
      <View style={styles.header}>
        <Avatar name={card.name} color={ct.color} />
        <View style={styles.headerText}>
          <Text style={styles.name}>{card.name || 'Untitled Card'}</Text>
          {card.tagline && <Text style={[styles.tagline, { color: ct.color }]}>{card.tagline}</Text>}
          {card.title && <Text style={styles.title}>{card.title}</Text>}
          {card.company && <Text style={[styles.company, { color: ct.color }]}>{card.company}</Text>}
          {card.firm_name && <Text style={[styles.company, { color: ct.color }]}>{card.firm_name}</Text>}
        </View>
      </View>

      {!compact && (
        <>
          {card.bio && (
            <View style={styles.bioBox}>
              <Text style={styles.bio}>{card.bio}</Text>
            </View>
          )}
          {card.specialization && (
            <View style={styles.bioBox}>
              <Text style={styles.bioLabel}>Specialization</Text>
              <Text style={styles.bio}>{card.specialization}</Text>
            </View>
          )}
          {card.services && (
            <View style={styles.bioBox}>
              <Text style={styles.bioLabel}>Services</Text>
              <Text style={styles.bio}>{card.services}</Text>
            </View>
          )}

          <View style={styles.divider} />

          <ContactRow icon="📞" value={card.phone} onPress={() => open(`tel:${card.phone}`)} />
          <ContactRow icon="💬" value={card.whatsapp && `WhatsApp: ${card.whatsapp}`} onPress={() => open(`https://wa.me/${card.whatsapp?.replace(/\D/g,'')}`)} />
          <ContactRow icon="✉️" value={card.email} onPress={() => open(`mailto:${card.email}`)} />
          <ContactRow icon="💼" value={card.linkedin} onPress={() => open(card.linkedin)} />
          <ContactRow icon="🌐" value={card.website} onPress={() => open(card.website)} />
          <ContactRow icon="📸" value={card.instagram && `Instagram: ${card.instagram}`} onPress={() => open(`https://instagram.com/${card.instagram?.replace('@','')}`)} />
          <ContactRow icon="🐦" value={card.twitter && `X: ${card.twitter}`} onPress={() => open(`https://x.com/${card.twitter?.replace('@','')}`)} />
          <ContactRow icon="📍" value={card.location} onPress={() => open(`https://maps.google.com/?q=${card.location}`)} />
          {card.membership_no && <ContactRow icon="🏛️" value={`Membership: ${card.membership_no}`} onPress={null} />}
          {card.department && <ContactRow icon="🏢" value={card.department} onPress={null} />}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    marginVertical: 8,
  },
  cardCompact: { marginVertical: 4 },
  band: { height: 6 },
  badge: {
    alignSelf: 'flex-start',
    margin: 14,
    marginBottom: 0,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeText: { fontSize: 11, fontWeight: '700' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 18 },
  headerText: { flex: 1 },
  name: { fontSize: 18, fontWeight: '800', color: '#111', marginBottom: 2 },
  tagline: { fontSize: 12, fontStyle: 'italic', marginBottom: 2 },
  title: { fontSize: 13, color: '#555', marginBottom: 1 },
  company: { fontSize: 13, fontWeight: '600' },
  bioBox: { marginHorizontal: 16, marginBottom: 10 },
  bioLabel: { fontSize: 11, color: '#888', fontWeight: '600', marginBottom: 2, textTransform: 'uppercase' },
  bio: { fontSize: 13, color: '#444', lineHeight: 18 },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 8, marginHorizontal: 16 },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    gap: 12,
  },
  contactIcon: { fontSize: 18, width: 28, textAlign: 'center' },
  contactValue: { fontSize: 14, color: '#222', flex: 1 },
});
