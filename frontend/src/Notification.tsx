import React from 'react';
import { useNotification } from './NotificationContext';

const notificationStyles: Record<string, string> = {
  info: 'bg-blue-500 text-white',
  success: 'bg-green-500 text-white',
  error: 'bg-red-600 text-white',
  warning: 'bg-yellow-500 text-gray-900',
};

const Notification: React.FC = () => {
  const { notification, clearNotification } = useNotification();

  if (!notification) return null;

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg flex items-center gap-4 ${notificationStyles[notification.type]}`}
      style={{ minWidth: 320, maxWidth: '90vw' }}
      role="alert"
    >
      <span className="flex-1 font-semibold">{notification.message}</span>
      <button
        className="ml-4 text-lg font-bold focus:outline-none"
        onClick={clearNotification}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
};

export default Notification; 