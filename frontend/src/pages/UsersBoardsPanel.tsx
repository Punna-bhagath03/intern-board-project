import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaArrowRight, FaArrowLeft, FaTrash, FaUser, FaUserCheck, FaUserTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

interface User {
  _id: string;
  username: string;
  role?: string;
  plan?: string;
  lastLogin?: string;
}

interface Board {
  _id: string;
  name: string;
  createdAt?: string;
  user?: string;
}

const isUserActive = (user: User) => {
  if (!user.lastLogin) return false;
  const last = new Date(user.lastLogin).getTime();
  const now = Date.now();
  return now - last < 600000;
};

const UsersBoardsPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [boardsLoading, setBoardsLoading] = useState(false);
  const [boardsError, setBoardsError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5001/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(Array.isArray(res.data) ? res.data : []);
      } catch (err: any) {
        setError('Failed to fetch users');
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

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
        const res = await axios.get(`http://localhost:5001/api/admin/user/${selectedUser._id}/boards`, {
          headers: { Authorization: `Bearer ${token}` },
        });
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
      await axios.delete(`http://localhost:5001/api/boards/${boardId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBoards(prev => prev.filter(b => b._id !== boardId));
    } catch (err) {
      alert('Failed to delete board.');
    }
  };

  // Sort users: active and recent first
  const sortedUsers = [...users].sort((a, b) => {
    const aActive = isUserActive(a);
    const bActive = isUserActive(b);
    if (aActive && !bActive) return -1;
    if (!aActive && bActive) return 1;
    const aTime = a.lastLogin ? new Date(a.lastLogin).getTime() : 0;
    const bTime = b.lastLogin ? new Date(b.lastLogin).getTime() : 0;
    return bTime - aTime;
  });

  // Filter users by search
  const filteredUsers = search.trim()
    ? sortedUsers.filter(u => u.username.toLowerCase().includes(search.toLowerCase()))
    : sortedUsers;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 text-white flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-8 py-4 bg-gray-800 border-b border-gray-700">
        <h1 className="text-3xl font-bold tracking-wide">Users boards</h1>
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
        <aside className="w-96 bg-gray-900 border-r border-gray-800 flex flex-col py-8 px-4 gap-4 min-h-full">
          <h2 className="text-2xl font-semibold mb-4">Users list</h2>
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="mb-4 border border-gray-700 bg-gray-800 text-white rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Search users"
          />
          <div className="flex flex-col gap-3 overflow-y-auto max-h-[70vh] pr-2 custom-scrollbar">
            {loading ? (
              <div className="text-blue-200">Loading...</div>
            ) : error ? (
              <div className="text-red-400">{error}</div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-gray-400">No users found.</div>
            ) : filteredUsers.map(user => (
              <button
                key={user._id}
                onClick={() => setSelectedUser(user)}
                className={`flex items-center justify-between px-4 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 focus:bg-gray-700 font-semibold text-white focus:outline-none border ${selectedUser && selectedUser._id === user._id ? 'border-blue-500' : 'border-transparent'}`}
                aria-label={`Show boards for ${user.username}`}
              >
                <span className="flex items-center gap-2">
                  <FaUser className="text-blue-400" />
                  {user.username}
                  {isUserActive(user) ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 ml-2 rounded bg-green-900 text-green-300 text-xs font-bold">
                      <FaUserCheck /> active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 ml-2 rounded bg-gray-700 text-gray-300 text-xs font-bold">
                      <FaUserTimes /> deactive
                    </span>
                  )}
                </span>
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
            <div className="w-full max-w-3xl bg-gray-900 rounded-2xl shadow-lg p-8 border border-gray-700">
              <h2 className="text-xl font-bold mb-6">Boards for <span className="text-blue-300">{selectedUser.username}</span></h2>
              {boardsLoading ? (
                <div className="text-blue-200">Loading boards...</div>
              ) : boardsError ? (
                <div className="text-red-400">{boardsError}</div>
              ) : boards.length === 0 ? (
                <div className="text-gray-400">No boards found for this user.</div>
              ) : (
                <div className="overflow-x-auto rounded-lg">
                  <table className="min-w-full text-sm bg-gray-900">
                    <thead>
                      <tr className="bg-gray-800 text-blue-300">
                        <th className="py-3 px-4 text-left">Board Name</th>
                        <th className="py-3 px-4 text-left">Created At</th>
                        <th className="py-3 px-4 text-left">Role</th>
                        <th className="py-3 px-4 text-left">Plan</th>
                        <th className="py-3 px-4 text-center">Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {boards.map(board => (
                        <tr key={board._id} className="border-b border-gray-800 hover:bg-gray-800 transition group">
                          <td className="py-3 px-4 font-semibold text-blue-200">{board.name}</td>
                          <td className="py-3 px-4">{board.createdAt ? new Date(board.createdAt).toLocaleDateString() : <span className="italic text-gray-500">N/A</span>}</td>
                          <td className="py-3 px-4 capitalize">{selectedUser.role || <span className="italic text-gray-500">N/A</span>}</td>
                          <td className="py-3 px-4 text-blue-200">{selectedUser.plan || <span className="italic text-gray-500">N/A</span>}</td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleDeleteBoard(board._id)}
                              className="inline-flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-red-400 transition"
                              aria-label={`Delete board ${board.name}`}
                            >
                              <FaTrash className="text-lg" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default UsersBoardsPanel; 