import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('medwizard_token'));
  const [portalMode, setPortalMode] = useState('ADMIN'); // 'ADMIN' | 'SUPER_ADMIN' | 'DOCTOR'
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [loading, setLoading] = useState(true);

  // Restore session
  useEffect(() => {
    async function loadSession() {
      const storedToken = localStorage.getItem('medwizard_token');
      if (storedToken) {
        try {
          const profile = await api.getMe();
          setUser(profile);
          setMustChangePassword(profile.must_change_password);
          if (profile.role === 'SUPER_ADMIN') {
            setPortalMode('SUPER_ADMIN');
          } else if (profile.role === 'DOCTOR') {
            setPortalMode('DOCTOR');
          } else {
            setPortalMode('ADMIN');
          }
        } catch (err) {
          console.warn('Session expired or invalid:', err);
          localStorage.removeItem('medwizard_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    }
    loadSession();
  }, []);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    localStorage.setItem('medwizard_token', res.token);
    setToken(res.token);
    setUser(res.user);
    setMustChangePassword(res.must_change_password);

    if (res.user.role === 'SUPER_ADMIN') {
      setPortalMode('SUPER_ADMIN');
    } else if (res.user.role === 'DOCTOR') {
      setPortalMode('DOCTOR');
    } else {
      setPortalMode('ADMIN');
    }
    return res;
  };

  const quickDemoLogin = async (roleKey) => {
    let email = 'admin@medwizard.health';
    let password = 'Admin123!';

    if (roleKey === 'super_admin') {
      email = 'superadmin@medwizard.health';
      password = 'SuperAdmin123!';
    } else if (roleKey === 'doctor') {
      email = 'eleanor.vance@medwizard.health';
      password = 'DoctorPass123!';
    } else if (roleKey === 'doctor_temp') {
      email = 'marcus.chen@medwizard.health';
      password = 'TempDr2026!';
    }

    return login(email, password);
  };

  const logout = () => {
    localStorage.removeItem('medwizard_token');
    setToken(null);
    setUser(null);
    setMustChangePassword(false);
    setPortalMode('ADMIN');
  };

  const changePassword = async (currentPass, newPass) => {
    const res = await api.changePassword(currentPass, newPass);
    if (res.token) {
      localStorage.setItem('medwizard_token', res.token);
      setToken(res.token);
    }
    if (res.user) {
      setUser(res.user);
    }
    setMustChangePassword(false);
    return res;
  };

  const value = {
    user,
    token,
    portalMode,
    setPortalMode,
    mustChangePassword,
    setMustChangePassword,
    loading,
    login,
    quickDemoLogin,
    logout,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
