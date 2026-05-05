import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiLogin, apiRegister, apiGetMe, apiDevAdminLogin } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === 'admin';

  // Restore token on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('jwt');
        if (stored) {
          setToken(stored);
        } else {
          if (__DEV__) {
            const devAuth = await apiDevAdminLogin();
            if (devAuth?.token) {
              setToken(devAuth.token);
              setUser(devAuth.user || null);
              await AsyncStorage.setItem('jwt', devAuth.token);
            }
          }
          setLoading(false);
        }
      } catch {
        setLoading(false);
      }
    })();
  }, []);

  // Fetch user profile when token changes
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        await AsyncStorage.setItem('jwt', token);
        const data = await apiGetMe();
        setUser(data.user);
      } catch {
        await AsyncStorage.removeItem('jwt');
        setToken(null);
        setUser(null);
      }
      setLoading(false);
    })();
  }, [token]);

  const login = async (email, password) => {
    const data = await apiLogin(email, password);
    if (data.token) {
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  const register = async (name, email, password) => {
    const data = await apiRegister(name, email, password);
    if (data.token) {
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  const logout = async () => {
    await AsyncStorage.removeItem('jwt');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAdmin, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
