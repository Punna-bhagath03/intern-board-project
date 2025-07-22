import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const BoardRedirector: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const redirectToBoard = async () => {
      try {
        // First try to use defaultBoardId from localStorage
        const defaultBoardId = localStorage.getItem('defaultBoardId');
        if (defaultBoardId) {
          try {
            // Verify the board exists and is accessible
            await api.get(`/api/boards/${defaultBoardId}`);
            navigate(`/board/${defaultBoardId}`);
            return;
          } catch (err) {
            // Board not found or not accessible, remove from localStorage
            localStorage.removeItem('defaultBoardId');
            // Continue to fetch user's boards
          }
        }

        // If no valid defaultBoardId, fetch user's boards
        const res = await api.get('/api/boards');
        if (res.data && res.data.length > 0) {
          // Use the first board as default
          const firstBoard = res.data[0];
          localStorage.setItem('defaultBoardId', firstBoard._id);
          navigate(`/board/${firstBoard._id}`);
        } else {
          // No boards exist, create a new one
          const createRes = await api.post('/api/boards', {
            name: 'My First Board',
            content: {},
          });
          const newBoard = createRes.data;
          localStorage.setItem('defaultBoardId', newBoard._id);
          navigate(`/board/${newBoard._id}`);
        }
      } catch (err) {
        console.error('Error in board redirection:', err);
        // Handle any errors - could redirect to an error page or show a message
        navigate('/');
      }
    };

    redirectToBoard();
  }, [navigate]);

  return <div>Redirecting to your board...</div>;
};

export default BoardRedirector; 