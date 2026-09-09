import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('nss_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchCurrentUser = async () => {
    try {
      const data = await api.get('/auth/me');
      if (data.success && data.user) {
        const fullUser = {
          ...data.user,
          name: data.user.profile?.full_name || data.user.user_id,
          nss_id: data.user.profile?.nss_id || data.user.user_id,
          profile_photo: data.user.profile?.profile_photo || ''
        };
        setUser(fullUser);
        localStorage.setItem('nss_user', JSON.stringify(fullUser));
      }
    } catch (err) {
      console.warn('Session expired or unauthenticated');
      logout();
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const data = await api.get('/notifications');
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {}
  };

  useEffect(() => {
    const token = localStorage.getItem('nss_token');
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user?.user_id]);

  const login = async (userIdOrEmail, password, rememberMe = false) => {
    const data = await api.post('/auth/login', { userIdOrEmail, password, rememberMe });
    if (data.success) {
      localStorage.setItem('nss_token', data.token);
      localStorage.setItem('nss_user', JSON.stringify(data.user));
      setUser(data.user);
      showToast(`Welcome back, ${data.user.name}!`, 'success');
      return data.user;
    }
    throw new Error(data.message || 'Login failed');
  };

  const logout = () => {
    localStorage.removeItem('nss_token');
    localStorage.removeItem('nss_user');
    setUser(null);
    showToast('Logged out successfully.', 'info');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        fetchCurrentUser,
        toast,
        showToast,
        notifications,
        unreadCount,
        fetchNotifications
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
