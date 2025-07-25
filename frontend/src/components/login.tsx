import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api';
import { useNotification } from '../NotificationContext';
import { refreshAuthToken } from '../api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useNotification();

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token is valid
      api.get('/api/users/me')
        .then(res => {
          if (res.data) {
            // Token is valid, handle redirect
            const authRedirect = localStorage.getItem('auth-redirect');
            if (authRedirect) {
              navigate(authRedirect);
            } else {
              navigate('/board');
            }
          }
        })
        .catch(() => {
          // Token is invalid, clear it
          localStorage.removeItem('token');
          refreshAuthToken();
        });
    }

    // Check for redirect params
    const params = new URLSearchParams(location.search);
    const redirect = params.get('redirect');
    if (redirect) {
      localStorage.setItem('auth-redirect', redirect);
    }
  }, [location.search, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/login', {
        username,
        email,
        password,
      });

      if (res.status === 200) {
        const { token, user, defaultBoardId } = res.data;
        
        // Store authentication data
        localStorage.setItem('token', token);
        localStorage.setItem('username', username);
        refreshAuthToken();

        // Store user role and plan
        if (user) {
          if (user.role) {
            localStorage.setItem('role', user.role);
          }
          if (user.plan) {
            localStorage.setItem('userPlan', user.plan);
          }
        }

        // Handle redirects in order of priority
        let authRedirect = localStorage.getItem('auth-redirect');
        // Backward compatibility: check for old 'share-redirect' key
        if (!authRedirect) {
          authRedirect = localStorage.getItem('share-redirect');
        }
        if (authRedirect) {
          localStorage.removeItem('auth-redirect');
          localStorage.removeItem('share-redirect');
          navigate(authRedirect);
          return;
        }

        // Admin redirect
        if (user && user.role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
          return;
        }

        // Regular user board redirect
        try {
          if (defaultBoardId) {
            localStorage.setItem('defaultBoardId', defaultBoardId);
            navigate(`/board/${defaultBoardId}`);
          } else {
            const boardRes = await api.get('/api/boards');
            if (boardRes.data && boardRes.data.length > 0) {
              const latestBoard = boardRes.data[0];
              localStorage.setItem('defaultBoardId', latestBoard._id);
              navigate(`/board/${latestBoard._id}`);
            } else {
              const createRes = await api.post('/api/boards', {
                name: 'My First Board',
                content: {},
              });
              const newBoard = createRes.data;
              localStorage.setItem('defaultBoardId', newBoard._id);
              navigate(`/board/${newBoard._id}`);
            }
          }
        } catch (err) {
          console.error('Error handling board redirect:', err);
          navigate('/board');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      showNotification(err.response?.data?.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 flex flex-col items-center justify-center px-4 relative">
      {/* MI-Board logo and name top left */}
      <div className="absolute top-6 left-6 flex items-center gap-3 cursor-pointer z-10" onClick={() => navigate('/')}> 
        <div className="bg-blue-600 rounded-lg p-2">
          <svg width="28" height="28" fill="none" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#2563eb"/><path d="M10 16h12M16 10v12" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
        </div>
        <span className="text-2xl font-extrabold text-white tracking-tight">MI-Board</span>
      </div>
      <form
        onSubmit={handleLogin}
        className="bg-gray-900/50 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-gray-700 w-full max-w-md"
      >
        <h2 className="text-3xl font-bold mb-6 text-white text-center">Login</h2>
        {error && (
          <div className="bg-red-500/20 backdrop-blur-md text-red-200 px-4 py-2 rounded-lg mb-4 border border-red-500/20">
            {error}
          </div>
        )}
        <div className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-800/50 backdrop-blur-md text-white px-4 py-2 rounded-lg border border-gray-600/50 focus:outline-none focus:border-blue-500/50 transition-all duration-300"
              required
            />
          </div>
          <div>
            <input
              type="email"
              placeholder="Email (optional)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-800/50 backdrop-blur-md text-white px-4 py-2 rounded-lg border border-gray-600/50 focus:outline-none focus:border-blue-500/50 transition-all duration-300"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-800/50 backdrop-blur-md text-white px-4 py-2 rounded-lg border border-gray-600/50 focus:outline-none focus:border-blue-500/50 transition-all duration-300"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600/20 hover:bg-blue-600/30 backdrop-blur-md text-white px-6 py-2.5 rounded-lg font-semibold shadow-lg shadow-blue-500/20 border border-blue-400/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Login'
            )}
          </button>
        </div>
      </form>
      <p className="text-gray-400 mt-4">
        New user?{' '}
        <button
          onClick={() => navigate('/signup')}
          className="text-blue-400 hover:text-blue-300 transition-colors"
        >
          Sign Up
        </button>
      </p>
    </div>
  );
}
