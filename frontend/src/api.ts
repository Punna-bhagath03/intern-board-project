import axios from 'axios';

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
}, (error) => {
  return Promise.reject(error);
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
    if (error.response?.status === 401) {
      // Clear invalid token and related data
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('role');
      localStorage.removeItem('avatar');
      localStorage.removeItem('defaultBoardId');
      localStorage.removeItem('userPlan');
      
      // Clear auth headers
      delete api.defaults.headers.common['Authorization'];

      // Store current path for redirect after login
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/signup') {
        localStorage.setItem('auth-redirect', currentPath);
        // Redirect to login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Add a function to check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// Add a function to get current user data
export const getCurrentUser = async () => {
  try {
    const res = await api.get('/api/users/me');
    return res.data;
  } catch (err) {
    return null;
  }
};

export default api; 