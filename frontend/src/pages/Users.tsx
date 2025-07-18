import React, { useEffect, useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { FaArrowRight, FaUser, FaUserCheck, FaUserTimes } from 'react-icons/fa';

interface User {
  _id: string;
  username: string;
  email?: string;
  status?: 'active' | 'pending' | 'suspended';
  role: 'user' | 'admin';
  createdAt?: string;
  lastLogin?: string;
  isOnline?: boolean;
  plan?: string;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const url = `http://localhost:5001/api/admin/users`;
        const res = await api.get('/api/admin/users');
        setUsers(Array.isArray(res.data) ? res.data : []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch users');
        setUsers([]);
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  // Helper to determine if user is online (active)
  const isUserActive = (user: User) => {
    if (!user.lastLogin) return false;
    const last = new Date(user.lastLogin).getTime();
    const now = Date.now();
    return now - last < 600000;
  };

  // Sort: active and latest login first
  const sortedUsers = [...users].sort((a, b) => {
    const aActive = isUserActive(a);
    const bActive = isUserActive(b);
    if (aActive && !bActive) return -1;
    if (!aActive && bActive) return 1;
    const aTime = a.lastLogin ? new Date(a.lastLogin).getTime() : 0;
    const bTime = b.lastLogin ? new Date(b.lastLogin).getTime() : 0;
    return bTime - aTime;
  });

  const filteredUsers = sortedUsers.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  );
  const paginatedUsers = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 text-white flex flex-col items-center p-8">
      <div className="w-full max-w-6xl flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-center">User Detail Panel</h1>
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Back to dashboard
        </button>
      </div>
      <div className="w-full max-w-6xl bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-700">
        <div className="mb-6 flex items-center justify-between">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="border border-gray-700 bg-gray-800 text-white rounded px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Search users"
          />
        </div>
        <div className="overflow-x-auto rounded-lg">
          <table className="min-w-full text-sm bg-gray-900">
            <thead>
              <tr className="bg-gray-800 text-blue-300">
                <th className="py-3 px-4 text-left">User Name</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Plan</th>
                <th className="py-3 px-4 text-left">Last Login</th>
                <th className="py-3 px-4 text-left">Role</th>
                <th className="py-3 px-4 text-center">Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8 text-blue-200">Loading...</td></tr>
              ) : error ? (
                <tr><td colSpan={6} className="text-center py-8 text-red-400">{error}</td></tr>
              ) : paginatedUsers.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">No users found.</td></tr>
              ) : paginatedUsers.map(user => (
                <tr key={user._id} className="border-b border-gray-800 hover:bg-gray-800 transition group">
                  <td className="py-3 px-4 font-semibold flex items-center gap-2">
                    <FaUser className="text-blue-400" /> {user.username}
                  </td>
                  <td className="py-3 px-4">
                    {isUserActive(user) ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-900 text-green-300 text-xs font-bold">
                        <FaUserCheck /> active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-700 text-gray-300 text-xs font-bold">
                        <FaUserTimes /> deactive
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-blue-200">{user.plan || (user.role === 'admin' ? 'Pro+' : 'Basic')}</td>
                  <td className="py-3 px-4">{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : <span className="italic text-gray-500">Never</span>}</td>
                  <td className="py-3 px-4 capitalize">{user.role}</td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => navigate('/admin/users/boards', { state: { userId: user._id } })}
                      className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                      aria-label={`View details for ${user.username}`}
                    >
                      <FaArrowRight className="text-lg" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 text-blue-200 disabled:opacity-50"
            >
              Prev
            </button>
            <span className="px-2">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 text-blue-200 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users; 