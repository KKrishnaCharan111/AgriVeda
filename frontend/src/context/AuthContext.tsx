import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (phone: string, pass: string) => Promise<User>;
  register: (data: any) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('agriveda_token'));
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProfile = async () => {
    try {
      if (localStorage.getItem('agriveda_token')) {
        const profile = await api.getMe();
        setUser(profile);
      } else {
        setUser(null);
      }
    } catch {
      localStorage.removeItem('agriveda_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const login = async (phone: string, pass: string) => {
    const res = await api.login({ phone, password: pass });
    localStorage.setItem('agriveda_token', res.access_token);
    setToken(res.access_token);
    const profile = await api.getMe();
    setUser(profile);
    return profile;
  };

  const register = async (data: any) => {
    const res = await api.register(data);
    localStorage.setItem('agriveda_token', res.access_token);
    setToken(res.access_token);
    const profile = await api.getMe();
    setUser(profile);
    return profile;
  };

  const logout = () => {
    localStorage.removeItem('agriveda_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser: fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
