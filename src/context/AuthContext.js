import React, { createContext, useContext, useEffect, useState } from 'react';
import { syncUser } from '../lib/api';

const AuthContext = createContext(null);

// ── Firebase is optional ─────────────────────────────────────────────────────
// App works without it (cards still load, create, share via link).
// Add your Firebase config here to enable Google / Phone login.
const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyBN4JqLThZnqsF26Ij9HrTrCjYPabax1yg',
  authDomain: 'digitalcard-81ec3.firebaseapp.com',
  projectId: 'digitalcard-81ec3',
};
// ─────────────────────────────────────────────────────────────────────────────

let _auth = null;

async function getFirebaseAuth() {
  if (_auth) return _auth;
  if (!FIREBASE_CONFIG) return null;
  try {
    const { initializeApp, getApps } = await import('firebase/app');
    const { getAuth } = await import('firebase/auth');
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
  const [firebaseReady, setFirebaseReady] = useState(false);

  useEffect(() => {
    let unsub = null;
    (async () => {
      const auth = await getFirebaseAuth();
      setFirebaseReady(!!auth);
      if (!auth) { setLoading(false); return; }
      const { onAuthStateChanged } = await import('firebase/auth');
      unsub = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const idToken = await firebaseUser.getIdToken();
            setToken(idToken);
            setUser(firebaseUser);
            await syncUser(idToken).catch(() => {});
          } catch {}
        } else {
          setUser(null);
          setToken(null);
        }
        setLoading(false);
      });
    })();
    return () => { if (unsub) unsub(); };
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
      const auth = await getFirebaseAuth();
      if (auth) {
        const { signOut } = await import('firebase/auth');
        await signOut(auth);
      }
    } catch {}
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, firebaseReady, getToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
