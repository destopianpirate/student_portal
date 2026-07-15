import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const NotificationContext = createContext();
export const useNotifications = () => useContext(NotificationContext);

let notifIdCounter = 0;

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('notification_history') || '[]');
    } catch { return []; }
  });

  useEffect(() => {
    try {
      localStorage.setItem('notification_history', JSON.stringify(history.slice(0, 100)));
    } catch { /* ignore */ }
  }, [history]);

  const addNotification = useCallback((type, title, message, action) => {
    const id = ++notifIdCounter;
    const notif = {
      id,
      type, // 'info' | 'success' | 'warning' | 'error' | 'achievement'
      title,
      message,
      action, // optional { label, onClick }
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [notif, ...prev]);
    setHistory(prev => [notif, ...prev].slice(0, 100));

    // Auto-dismiss toast after 5 seconds
    if (type !== 'error') {
      setTimeout(() => {
        dismissNotification(id);
      }, 5000);
    }
    return id;
  }, []);

  const dismissNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const markAsRead = useCallback((id) => {
    setHistory(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setHistory(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem('notification_history');
  }, []);

  const unreadCount = history.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications, // active toasts
      history, // full history
      unreadCount,
      addNotification,
      dismissNotification,
      markAsRead,
      markAllRead,
      clearHistory,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
