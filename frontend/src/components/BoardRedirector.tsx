import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const BoardRedirector: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const defaultBoardId = localStorage.getItem('defaultBoardId');
    if (defaultBoardId) {
      navigate(`/board/${defaultBoardId}`, { replace: true });
      return;
    }
    // Try to fetch the user's boards and pick the first one
    api.get('/api/boards')
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          localStorage.setItem('defaultBoardId', res.data[0]._id);
          navigate(`/board/${res.data[0]._id}`, { replace: true });
        } else {
          setLoading(false);
        }
      })
      .catch(() => {
        setError('Could not load your boards.');
        setLoading(false);
      });
  }, [navigate]);

  const handleCreateBoard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/api/boards', { name: 'My First Board', content: {} });
      if (res.data && res.data._id) {
        localStorage.setItem('defaultBoardId', res.data._id);
        navigate(`/board/${res.data._id}`, { replace: true });
      } else {
        setError('Failed to create a new board.');
        setLoading(false);
      }
    } catch {
      setError('Failed to create a new board.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-lg font-semibold text-gray-700">Loading your boards...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="text-2xl font-bold text-blue-700 mb-2">No boards found</div>
      <div className="text-gray-600 mb-4">You don't have any boards yet. Create your first board to get started!</div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <button
        onClick={handleCreateBoard}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold shadow"
        disabled={loading}
      >
        {loading ? 'Creating...' : 'Create My First Board'}
      </button>
    </div>
  );
};

export default BoardRedirector; 