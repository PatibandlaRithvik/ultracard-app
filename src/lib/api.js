import axios from 'axios';

export const API_BASE = 'https://brilliant-magic-production-644a.up.railway.app';

const api = axios.create({ baseURL: API_BASE, timeout: 10000 });

export async function getCard(id) {
  const { data } = await api.get(`/api/cards/${id}`);
  return data;
}

export async function getMyCards(token) {
  const { data } = await api.get('/api/my-cards', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return Array.isArray(data) ? data : [];
}

export async function createCard(cardData, token) {
  const { data } = await api.post('/api/cards', cardData, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  return data;
}

export async function updateCard(id, cardData, token) {
  const { data } = await api.put(`/api/cards/${id}`, cardData, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  return data;
}

export async function syncUser(token) {
  const { data } = await api.post('/api/auth/sync', {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

export async function createSonicSession(cardId, token) {
  const { data } = await api.post('/api/sonic/register', { cardId }, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  return data;
}

export default api;
