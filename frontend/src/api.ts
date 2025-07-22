import axios from 'axios';

// Global notification callback (set by NotificationProvider)
let notify: ((msg: string, type?: string) => void) | null = null;
export const setGlobalNotify = (fn: typeof notify) => { notify = fn; };

const api = axios.create({
  baseURL: 'http://localhost:5001',
  withCredentials: true
});

// Add a function to refresh the token
export const refreshAuthToken = () => {
  const token = localStorage.getItem('token');
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Initialize auth header
refreshAuthToken();

// Attach token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Global response interceptor for session invalidation and plan updates
api.interceptors.response.use(
  (response) => {
    // Check for plan updates in response
    if (response.data?.user?.plan) {
      localStorage.setItem('userPlan', response.data.user.plan);
    }
    return response;
  },
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      const errorMessage = error.response.data?.message || '';
      const isSessionExpired = errorMessage.toLowerCase().includes('session expired') ||
        errorMessage.toLowerCase().includes('invalid token');

      if (isSessionExpired) {
        // Clear all auth data
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        localStorage.removeItem('avatar');
        localStorage.removeItem('defaultBoardId');
        localStorage.removeItem('userPlan');
        delete api.defaults.headers.common['Authorization'];

        // Store the current path for redirect after login
        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && currentPath !== '/signup') {
          localStorage.setItem('auth-redirect', currentPath);
        }

        // Show notification and redirect
        if (notify) {
          notify('Your session has expired. Please log in again.', 'error');
          setTimeout(() => {
            window.location.href = '/login';
          }, 1500);
        } else {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api; 