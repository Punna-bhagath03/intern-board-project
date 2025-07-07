import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post(
        'http://localhost:5001/register',
        { username, password },
        { withCredentials: true }
      );

      if (res.status === 201) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('defaultBoardId', res.data.defaultBoardId);
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        navigate(`/board/${res.data.defaultBoardId}`);
      }
    } catch (err: any) {
      if (err.response && err.response.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Registration failed. Please try again.');
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-80"
      >
        <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
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
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Register
        </button>
      </form>
      <p className="text-sm mt-4">
        Already have an account?{' '}
        <button
          onClick={() => navigate('/login')}
          className="text-blue-500 underline hover:text-blue-700"
        >
          Sign In
        </button>
      </p>
    </div>
  );
}
