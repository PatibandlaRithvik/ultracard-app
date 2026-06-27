import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput,
  SafeAreaView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { createCard } from '../lib/api';
import { getCardType } from '../lib/cardTypes';
import CardView from '../components/CardView';

export default function CreateCardScreen({ route, navigation }) {
  const { cardType = 'personal' } = route.params || {};
  const ct = getCardType(cardType);
  const { getToken, user } = useAuth();

  const initForm = {};
  ct.fields.forEach((f) => { initForm[f.key] = ''; });
  initForm.card_type = cardType;

  const [form, setForm] = useState(initForm);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const submit = async () => {
    if (!form.name?.trim()) { Alert.alert('Required', 'Full name is required'); return; }
    setSaving(true);
    try {
      let token = null;
      if (user) token = await getToken();
      const card = await createCard(form, token);
      Alert.alert('Card Created!', 'Your card is ready to share.', [
        { text: 'View & Share', onPress: () => navigation.replace('ViewCard', { cardId: card.id }) },
      ]);
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.error || 'Failed to create card');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        {/* Header */}
        <LinearGradient colors={ct.gradient} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{ct.icon} Create {ct.label} Card</Text>
          <Text style={styles.headerSub}>{ct.description}</Text>
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          {ct.fields.map((field) => (
            <View key={field.key} style={styles.fieldGroup}>
              <Text style={styles.label}>{field.label}{field.required ? ' *' : ''}</Text>
              <TextInput
                style={[styles.input, field.multiline && styles.inputMulti]}
                placeholder={field.placeholder}
                placeholderTextColor="#bbb"
                value={form[field.key]}
                onChangeText={set(field.key)}
                keyboardType={field.type || 'default'}
                multiline={field.multiline}
                numberOfLines={field.multiline ? 3 : 1}
                autoCapitalize={field.type === 'email-address' ? 'none' : 'words'}
              />
            </View>
          ))}

          {/* Preview toggle */}
          <TouchableOpacity
            style={styles.previewBtn}
            onPress={() => setPreview((p) => !p)}
          >
            <Text style={styles.previewBtnText}>{preview ? '▲ Hide Preview' : '👁 Preview Card'}</Text>
          </TouchableOpacity>

          {preview && <CardView card={form} />}

          <TouchableOpacity
            style={[styles.submitBtn, saving && styles.submitBtnDisabled]}
            onPress={submit}
            disabled={saving}
          >
            {saving ? <ActivityIndicator color="#fff" /> : (
              <Text style={styles.submitBtnText}>✨ Create My Card</Text>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8ff' },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 },
  backBtn: { marginBottom: 12 },
  backText: { color: '#fff', fontSize: 14, opacity: 0.8 },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 4 },
  headerSub: { color: '#ffffffcc', fontSize: 13 },
  form: { padding: 20 },
  fieldGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 6 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    color: '#111',
  },
  inputMulti: { height: 90, textAlignVertical: 'top' },
  previewBtn: {
    backgroundColor: '#f0eeff',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#6c63ff33',
  },
  previewBtnText: { color: '#6c63ff', fontWeight: '600', fontSize: 14 },
  submitBtn: {
    backgroundColor: '#1a1a2e',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
