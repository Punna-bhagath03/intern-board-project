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
        setBoards(Array.isArray(res.data) ? res.data : []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch boards');
        setBoards([]);
      }
      setLoading(false);
    };
    fetchBoards();
  }, [id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-blue-50 p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-8 text-center">User Boards Analytics</h1>
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : boards.length === 0 ? (
        <div className="text-gray-500 text-center">No boards found for this user.</div>
      ) : (
        <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {boards.map(board => (
            <div
              key={board._id}
              className="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-3 hover:shadow-2xl transition-shadow border border-gray-100 min-h-[160px]"
            >
              <div className="font-semibold text-lg text-gray-800 truncate" title={board.name}>{board.name}</div>
              <div className="text-xs text-gray-500 mb-2">
                Created: {board.createdAt ? new Date(board.createdAt).toLocaleDateString() : 'N/A'}
              </div>
              <button
                onClick={() => navigate(`/admin/board/${board._id}`)}
                className="mt-auto bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded transition font-semibold shadow self-start"
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