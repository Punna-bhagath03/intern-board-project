import React, { useEffect, useState } from 'react';
import api from '../api';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaTrash, FaUser, FaArrowRight } from 'react-icons/fa';

interface User {
  _id: string;
  username: string;
}

interface Board {
  _id: string;
  name: string;
}

const UserBoards: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [boardsLoading, setBoardsLoading] = useState(false);
  const [boardsError, setBoardsError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/api/admin/users');
        setUsers(Array.isArray(res.data) ? res.data : []);
        // If coming from a direct link, select the user by id
        if (id) {
          const found = res.data.find((u: User) => u._id === id);
          if (found) setSelectedUser(found);
        }
      } catch (err: any) {
        setError('Failed to fetch users');
      }
      setLoading(false);
    };
    fetchUsers();
  }, [id]);

  useEffect(() => {
    if (!selectedUser) return;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 text-white flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-8 py-4 bg-gray-800 border-b border-gray-700">
        <h1 className="text-2xl font-bold tracking-wide">Users boards</h1>
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <FaArrowLeft />
          Back to dashboard
        </button>
      </div>
      <div className="flex flex-1">
        {/* Users List Sidebar */}
        <aside className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col py-8 px-4 gap-4 min-h-full">
          <h2 className="text-xl font-semibold mb-4">Users list</h2>
          <div className="flex flex-col gap-2">
            {loading ? (
              <div className="text-blue-200">Loading...</div>
            ) : error ? (
              <div className="text-red-400">{error}</div>
            ) : users.length === 0 ? (
              <div className="text-gray-400">No users found.</div>
            ) : users.map(user => (
              <button
                key={user._id}
                onClick={() => setSelectedUser(user)}
                className={`flex items-center justify-between px-4 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 focus:bg-gray-700 font-semibold text-white focus:outline-none border ${selectedUser && selectedUser._id === user._id ? 'border-blue-500' : 'border-transparent'}`}
                aria-label={`Show boards for ${user.username}`}
              >
                <span className="flex items-center gap-2"><FaUser className="text-blue-400" /> {user.username}</span>
                <FaArrowRight className="text-lg" />
              </button>
            ))}
          </div>
        </aside>
        {/* Boards List */}
        <main className="flex-1 flex flex-col items-center justify-center p-8">
          {!selectedUser ? (
            <div className="text-blue-200 text-lg">Select a user to view their boards.</div>
          ) : (
            <div className="w-full max-w-2xl bg-gray-900 rounded-2xl shadow-lg p-8 border border-gray-700">
              <h2 className="text-xl font-bold mb-6">Boards for <span className="text-blue-300">{selectedUser.username}</span></h2>
              {boardsLoading ? (
                <div className="text-blue-200">Loading boards...</div>
              ) : boardsError ? (
                <div className="text-red-400">{boardsError}</div>
              ) : boards.length === 0 ? (
                <div className="text-gray-400">No boards found for this user.</div>
              ) : (
                <ul className="space-y-4">
                  {boards.map(board => (
                    <li key={board._id} className="flex items-center justify-between bg-gray-800 rounded-lg p-4 shadow hover:shadow-xl transition">
                      <span className="font-semibold text-lg text-blue-200">{board.name}</span>
                      <button
                        onClick={() => handleDeleteBoard(board._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold shadow focus:outline-none focus:ring-2 focus:ring-red-400"
                        aria-label={`Delete board ${board.name}`}
                      >
                        <FaTrash className="text-lg" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default UserBoards; 