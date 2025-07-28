import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await api.post(
        '/register',
        { username, email, password },
        { withCredentials: true }
      );

      if (res.status === 201) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('defaultBoardId', res.data.defaultBoardId);
        // api instance handles token automatically
        navigate(`/board/${res.data.defaultBoardId}`);
      }
    } catch (error: unknown) {
      console.error('Registration error:', error);
      setError('Registration failed. Please try again.');
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
        onSubmit={handleSubmit}
        className="bg-gray-900/50 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-gray-700 w-full max-w-md"
      >
        <h2 className="text-3xl font-bold mb-6 text-white text-center">Sign Up</h2>
        {error && <div className="bg-red-500/20 backdrop-blur-md text-red-200 px-4 py-2 rounded-lg mb-4 border border-red-500/20">{error}</div>}
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
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-800/50 backdrop-blur-md text-white px-4 py-2 rounded-lg border border-gray-600/50 focus:outline-none focus:border-blue-500/50 transition-all duration-300"
              required
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
            className="w-full bg-blue-600/20 hover:bg-blue-600/30 backdrop-blur-md text-white px-6 py-2.5 rounded-lg font-semibold shadow-lg shadow-blue-500/20 border border-blue-400/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            Register
          </button>
        </div>
      </form>
      <p className="text-gray-400 mt-4">
        Already have an account?{' '}
        <button
          onClick={() => navigate('/login')}
          className="text-blue-400 hover:text-blue-300 transition-colors"
        >
          Sign In
        </button>
      </p>
    </div>
  );
}
