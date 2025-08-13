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
    
    console.log('JoinBoard: Processing share link', { 
      token: token ? `${token.substring(0, 10)}...` : null,
      pathname: location.pathname,
      search: location.search 
    });
    
    if (!token) {
      setError('No token provided.');
      setLoading(false);
      return;
    }

    const jwt = localStorage.getItem('token');
    
    if (!jwt) {
      // Not logged in → store path and send to login; allow signup path to honor same redirect
      const currentPath = location.pathname + location.search;
      localStorage.setItem('auth-redirect', currentPath);
      navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    // If logged in, verify the share token and navigate to board
    const verifyShareToken = async () => {
      try {
        console.log('Verifying share token:', token);
        const res = await api.get(`/api/share/${token}`);
        const { boardId, permission } = res.data;
        console.log('JoinBoard: shareToken', token, 'boardId', boardId, 'permission', permission);
        
        // Clear any stored redirect since we're successfully joining
        localStorage.removeItem('auth-redirect');
        
        // Navigate to the board with share token
        navigate(`/board/${boardId}?shareToken=${token}&permission=${permission}`);
      } catch (error: unknown) {
        console.error('Failed to join board:', error);
        setError('Failed to join board. Please try again.');
        setLoading(false);
      }
    };

    verifyShareToken();
  }, [location.search, navigate, location.pathname]);

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