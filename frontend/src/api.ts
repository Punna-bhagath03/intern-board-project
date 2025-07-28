import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001',
  withCredentials: true,
  timeout: 30000, // Increased to 30 seconds for better reliability
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
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
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
    
    // Handle 404 errors for user endpoints
    if (error.response?.status === 404 && originalRequest.url?.includes('/api/users/')) {
      console.warn('User not found, clearing user data');
      // Don't redirect for user lookup failures, just log them
    }
    
    // Handle network errors
    if (!error.response && error.code === 'ECONNABORTED') {
      console.error('Request timeout');
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
  } catch {
    return null;
  }
};

export default api; 