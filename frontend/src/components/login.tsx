import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post('http://localhost:5001/login', {
        username,
        password,
      });
      if (res.status === 200) {
        const token = res.data.token;
        localStorage.setItem('token', token);
        localStorage.setItem('username', username);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        // Fetch user's latest board
        try {
          const latestRes = await axios.get('http://localhost:5001/api/boards/latest', {
          headers: { Authorization: `Bearer ${token}` },
        });
          const latestBoard = latestRes.data;
          localStorage.setItem('defaultBoardId', latestBoard._id);
          navigate(`/board/${latestBoard._id}`);
        } catch (err) {
          // No boards: create a new default board for this user
          const createRes = await axios.post('http://localhost:5001/api/boards', {
            name: 'My First Board',
            content: {},
          }, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const newBoard = createRes.data;
          localStorage.setItem('defaultBoardId', newBoard._id);
          navigate(`/board/${newBoard._id}`);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded shadow-md w-80"
      >
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
        >
          Login
        </button>
      </form>
      <p className="text-sm mt-4">
        New user?{' '}
        <button
          onClick={() => navigate('/signup')}
          className="text-blue-500 underline hover:text-blue-700"
        >
          Sign Up
        </button>
      </p>
    </div>
  );
}
