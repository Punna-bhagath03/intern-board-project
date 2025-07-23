import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api';
import { FaUser, FaArrowLeft, FaTrash } from 'react-icons/fa';

interface Board {
  _id: string;
  name: string;
  createdAt?: string;
  user: string;
}

interface User {
  _id: string;
  username: string;
  role: string;
  plan?: string;
  avatar?: string;
}

const UserBoards: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [boardsLoading, setBoardsLoading] = useState(false);
  const [boardsError, setBoardsError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/api/admin/users');
        setUsers(Array.isArray(res.data) ? res.data : []);
        
        // If userId is provided in location state, select that user
        if (location.state?.userId) {
          const user = res.data.find((u: User) => u._id === location.state.userId);
          if (user) setSelectedUser(user);
        }
      } catch (err: any) {
        setError('Failed to fetch users');
      }
      setLoading(false);
    };
    fetchUsers();
  }, [location.state?.userId]);

  useEffect(() => {
    if (!selectedUser) {
      setBoards([]);
      return;
    }
    const fetchBoards = async () => {
      setBoardsLoading(true);
      setBoardsError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await api.get(`/api/admin/user/${selectedUser._id}/boards`);
        setBoards(Array.isArray(res.data) ? res.data : []);
      } catch (err: any) {
        setBoardsError('Failed to fetch boards');
        setBoards([]);
      }
      setBoardsLoading(false);
    };
    fetchBoards();
  }, [selectedUser]);

  const handleDeleteBoard = async (boardId: string) => {
    if (!selectedUser) return;
    if (!window.confirm('Are you sure you want to delete this board? This action cannot be undone.')) return;
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/api/boards/${boardId}`);
      setBoards(prev => prev.filter(b => b._id !== boardId));
    } catch (err) {
      alert('Failed to delete board.');
    }
  };

  const getAvatarUrl = (avatar: string) => {
    return `/uploads/avatars/${avatar}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 text-white">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-8 py-4 bg-gray-800/50 backdrop-blur-md border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="text-2xl text-blue-400">
            <FaUser />
          </div>
          <span className="text-xl font-bold tracking-wide">Users' Boards</span>
        </div>
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 backdrop-blur-md text-white px-6 py-2.5 rounded-lg font-semibold shadow-lg shadow-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-400/50 border border-blue-400/20 transition-all duration-300"
        >
          <FaArrowLeft />
          Back to dashboard
        </button>
      </div>

      {/* Main Content */}
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Users List */}
          <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl shadow-lg border border-gray-700 p-6">
            <h2 className="text-lg font-semibold mb-4">Select User</h2>
            <div className="space-y-2">
              {loading ? (
                <div className="flex justify-center py-4">
                  <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : error ? (
                <div className="text-red-500 text-center py-4">{error}</div>
              ) : (
                users.map(user => (
                  <button
                    key={user._id}
                    onClick={() => setSelectedUser(user)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${
                      selectedUser?._id === user._id
                        ? 'bg-blue-600/20 text-white border border-blue-400/20'
                        : 'bg-gray-800/40 hover:bg-gray-700/40 text-gray-300 border border-gray-600/20'
                    } transition-all duration-200`}
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-700/50 flex items-center justify-center overflow-hidden">
                      {user.avatar ? (
                        <img src={getAvatarUrl(user.avatar)} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-gray-400">
                          <FaUser />
                        </div>
                      )}
                    </div>
                    <span className="font-medium">{user.username}</span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Boards List */}
          <div className="md:col-span-3">
            <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl shadow-lg border border-gray-700 p-6">
              <h2 className="text-lg font-semibold mb-4">
                {selectedUser ? `${selectedUser.username}'s Boards` : 'Select a user to view their boards'}
              </h2>
              {boardsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : boardsError ? (
                <div className="text-red-500 text-center py-8">{boardsError}</div>
              ) : !selectedUser ? (
                <div className="text-gray-400 text-center py-8">Select a user from the list to view their boards</div>
              ) : boards.length === 0 ? (
                <div className="text-gray-400 text-center py-8">No boards found for this user</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {boards.map(board => (
                    <div
                      key={board._id}
                      className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700 flex flex-col group hover:border-gray-600 transition-all duration-200"
                    >
                      <h3 className="font-semibold text-lg mb-2 text-blue-300">{board.name}</h3>
                      <div className="text-sm text-gray-400 mb-4">
                        Created: {board.createdAt ? new Date(board.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                      <div className="mt-auto flex items-center justify-between">
                        <button
                          onClick={() => navigate(`/admin/board/${board._id}`)}
                          className="bg-blue-600/20 hover:bg-blue-600/30 text-white px-4 py-2 rounded-lg text-sm font-medium border border-blue-400/20 transition-all duration-200"
                        >
                          View Board
                        </button>
                        <button
                          onClick={() => handleDeleteBoard(board._id)}
                          className="text-red-400 hover:text-red-300 p-2 rounded-lg transition-colors duration-200"
                          title="Delete board"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserBoards; 