import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { syncUser } from '../lib/api';

const AuthContext = createContext(null);

// Firebase config — replace with your project's values
const FIREBASE_CONFIG = {
  apiKey: 'YOUR_FIREBASE_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
};

let firebaseAuth = null;

function initFirebase() {
  if (firebaseAuth) return firebaseAuth;
  const app = getApps().length ? getApps()[0] : initializeApp(FIREBASE_CONFIG);
  firebaseAuth = getAuth(app);
  return firebaseAuth;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let auth;
    try {
      auth = initFirebase();
    } catch {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const idToken = await firebaseUser.getIdToken();
        setToken(idToken);
        setUser(firebaseUser);
        try { await syncUser(idToken); } catch {}
      } else {
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const getToken = async () => {
    if (!user) return null;
    const idToken = await user.getIdToken(true);
    setToken(idToken);
    return idToken;
  };

  const logout = () => {
    try {
      const auth = initFirebase();
      signOut(auth);
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, getToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
