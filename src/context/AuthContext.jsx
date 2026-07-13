import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { loginUser, registerUser, getUserProfile } from '../services/authService';

const AuthContext = createContext(null);
const STORAGE_KEY = 'farmconnect_session';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Restore session on first load.
  // TODO(backend): swap localStorage for validating a real JWT/session
  // cookie against the server (e.g. GET /auth/me).
  useEffect(() => {
    const restore = async () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const { userId } = JSON.parse(raw);
          const profile = await getUserProfile(userId);
          setUser(profile);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      } finally {
        setInitializing(false);
      }
    };
    restore();
  }, []);

  const login = useCallback(async (email, password) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const { user: loggedInUser, token } = await loginUser({ email, password });
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ userId: loggedInUser.id, token }));
      setUser(loggedInUser);
      return loggedInUser;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const register = useCallback(async (formData) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const { user: newUser, token } = await registerUser(formData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ userId: newUser.id, token }));
      setUser(newUser);
      return newUser;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const profile = await getUserProfile(user.id);
    setUser(profile);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        initializing,
        authLoading,
        authError,
        setAuthError,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
