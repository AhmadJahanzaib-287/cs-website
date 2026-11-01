import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // App load hote hi check karein ke kya admin pehle se logged in hai
  useEffect(() => {
    checkLoggedInUser();
  }, []);

  useEffect(() => {
    if (!user) return undefined;

    let timeoutId;
    let active = true;
    const expireSession = () => {
      API.post('/auth/logout').catch((error) => console.error('Session timeout logout failed:', error));
      setUser(null);
    };
    const resetTimeout = (duration) => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(expireSession, duration);
    };

    const activityEvents = ['pointerdown', 'keydown', 'scroll', 'touchstart'];
    let timeoutDuration = 120 * 60 * 1000;
    const handleActivity = () => resetTimeout(timeoutDuration);
    const handleSettingsUpdate = (event) => {
      const minutes = Number(event.detail?.sessionTimeoutMinutes);
      if (Number.isFinite(minutes) && minutes > 0) {
        timeoutDuration = minutes * 60 * 1000;
        resetTimeout(timeoutDuration);
      }
    };
    activityEvents.forEach((eventName) => window.addEventListener(eventName, handleActivity, { passive: true }));
    window.addEventListener('portal-settings-updated', handleSettingsUpdate);
    resetTimeout(timeoutDuration);

    API.get('/settings')
      .then(({ data }) => {
        if (!active || !data.success) return;
        const minutes = Number(data.data?.sessionTimeoutMinutes);
        if (Number.isFinite(minutes) && minutes > 0) {
          timeoutDuration = minutes * 60 * 1000;
          resetTimeout(timeoutDuration);
        }
      })
      .catch((error) => console.error('Could not load admin session timeout:', error));

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
      activityEvents.forEach((eventName) => window.removeEventListener(eventName, handleActivity));
      window.removeEventListener('portal-settings-updated', handleSettingsUpdate);
    };
  }, [user?.id]);

  const checkLoggedInUser = async () => {
    try {
      const { data } = await API.get('/auth/me');
      if (data.success) {
        setUser(data.user);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Login Handler
  const loginUser = async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    if (data.success) {
      setUser(data.user);
    }
    return data;
  };

  // Logout Handler
  const logoutUser = async () => {
    try {
      await API.post('/auth/logout');
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const updateUser = (updates) => {
    setUser((currentUser) => currentUser ? { ...currentUser, ...updates } : currentUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logoutUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);