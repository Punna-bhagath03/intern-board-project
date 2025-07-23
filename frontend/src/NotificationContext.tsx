import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export type NotificationType = 'info' | 'success' | 'error' | 'warning';

interface Notification {
  message: string;
  type: NotificationType;
}

interface NotificationContextProps {
  notification: Notification | null;
  showNotification: (message: string, type?: NotificationType) => void;
  clearNotification: () => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notification, setNotification] = useState<Notification | null>(null);

  const showNotification = (message: string, type: NotificationType = 'info') => {
    setNotification({ message, type });
    // Auto-clear notification after 5 seconds
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  const clearNotification = () => setNotification(null);

  return (
    <NotificationContext.Provider value={{ notification, showNotification, clearNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within a NotificationProvider');
  return context;
}; 