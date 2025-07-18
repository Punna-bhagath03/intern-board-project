import axios from 'axios';

// Global notification callback (set by NotificationProvider)
let notify: ((msg: string, type?: string) => void) | null = null;
export const setGlobalNotify = (fn: typeof notify) => { notify = fn; };

const api = axios.create({
  baseURL: 'http://localhost:5001',
});

// Attach token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Global response interceptor for session invalidation
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403) &&
      (error.response.data?.message?.toLowerCase().includes('session expired') ||
        error.response.data?.message?.toLowerCase().includes('invalid token'))
    ) {
      // Clear all auth data
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('role');
      localStorage.removeItem('avatar');
      localStorage.removeItem('defaultBoardId');
      // Show custom notification and redirect after delay
      if (notify) {
        notify('Your access has changed or your session expired. You have been securely logged out. Please log in again.', 'error');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2500);
      } else {
        window.alert('Your session has expired or your access was changed. Please log in again.');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api; 