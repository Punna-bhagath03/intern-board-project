import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { NotificationProvider } from './NotificationContext';
import Notification from './Notification';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NotificationProvider>
      <Notification />
      <App />
    </NotificationProvider>
  </StrictMode>
);
