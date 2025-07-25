import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api';

const JoinBoard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const jwt = localStorage.getItem('token');
    if (!token) {
      setError('No token provided.');
      setLoading(false);
      return;
    }
    if (!jwt) {
      // Not logged in, store intended path and redirect to login
      localStorage.setItem('auth-redirect', location.pathname + location.search);
      navigate('/login');
      return;
    }
    // If logged in, call /api/share/:token, get boardId, and navigate to /board/:id?shareToken=...
    api.get(`/share/${token}`)
      .then(res => {
        const { boardId, permission } = res.data;
        console.log('JoinBoard: shareToken', token, 'boardId', boardId, 'permission', permission);
        localStorage.removeItem('auth-redirect');
        navigate(`/board/${boardId}?shareToken=${token}&permission=${permission}`);
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Link expired or invalid.');
        setLoading(false);
      });
  }, [location.search, navigate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-lg font-semibold text-gray-700">Verifying link...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="text-2xl font-bold text-red-600 mb-2">{error}</div>
      <div className="text-gray-600">Please check your link or contact the board owner.</div>
    </div>
  );
};

export default JoinBoard; 