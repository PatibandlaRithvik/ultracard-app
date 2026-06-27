import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { syncUser } from '../lib/api';

const AuthContext = createContext(null);

const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyBN4JqLThZnqsF26Ij9HrTrCjYPabax1yg',
  authDomain: 'digitalcard-81ec3.firebaseapp.com',
  projectId: 'digitalcard-81ec3',
};

let _auth = null;

function getFirebaseAuth() {
  if (_auth) return _auth;
  try {
    const app = getApps().length ? getApps()[0] : initializeApp(FIREBASE_CONFIG);
    _auth = getAuth(app);
    return _auth;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) { setLoading(false); return; }
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          setToken(idToken);
          setUser(firebaseUser);
          syncUser(idToken).catch(() => {});
        } catch {}
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
    try {
      const idToken = await user.getIdToken(true);
      setToken(idToken);
      return idToken;
    } catch { return null; }
  };

  const logout = async () => {
    try {
      const auth = getFirebaseAuth();
      if (auth) await signOut(auth);
    } catch {}
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, getToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
