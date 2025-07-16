import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Board {
  _id: string;
  name: string;
  createdAt?: string;
}

const UserAnalytics: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    const fetchBoards = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`/api/admin/user/${id}/boards`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBoards(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch boards');
      }
      setLoading(false);
    };
    fetchBoards();
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">User Boards Analytics</h1>
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : boards.length === 0 ? (
        <div className="text-gray-500 text-center">No boards found for this user.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {boards.map(board => (
            <div
              key={board._id}
              className="bg-white rounded-lg shadow-md p-5 flex flex-col gap-2 hover:shadow-lg transition-shadow border border-gray-100"
            >
              <div className="font-semibold text-gray-800 text-sm truncate" title={board.name}>{board.name}</div>
              <div className="text-xs text-gray-500 mb-2">
                Created: {board.createdAt ? new Date(board.createdAt).toLocaleDateString() : 'N/A'}
              </div>
              <button
                onClick={() => navigate(`/admin/board/${board._id}`)}
                className="mt-auto bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded transition font-semibold shadow"
              >
                Open Board
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserAnalytics; 