import React, { useEffect, useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaSearch, FaArrowLeft, FaUserCheck, FaUserTimes } from 'react-icons/fa';

interface User {
  _id: string;
  username: string;
  email?: string;
  status?: 'active' | 'pending' | 'suspended';
  role: 'user' | 'admin';
  lastLogin?: string;
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
        // Removed unused token and url variables
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

  const isUserActive = (user: User) => {
    if (!user.lastLogin) return false;
    const last = new Date(user.lastLogin).getTime();
    const now = Date.now();
    return now - last < 600000;
  };

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 text-white">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-8 py-4 bg-gray-800/50 backdrop-blur-md border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="text-2xl text-blue-400">
            <FaUser />
          </div>
          <span className="text-xl font-bold tracking-wide">Users</span>
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
        <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl shadow-lg border border-gray-700 overflow-hidden">
          {/* Search Bar */}
          <div className="p-6 border-b border-gray-700">
            <div className="relative max-w-md">
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-gray-800/50 backdrop-blur-md text-white px-4 py-2 pl-10 rounded-lg border border-gray-600/50 focus:outline-none focus:border-blue-500/50 transition-all duration-300"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <FaSearch />
              </div>
            </div>
          </div>

          {/* Users Table */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="text-red-500 text-center p-8">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-800/50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-blue-300">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-blue-300">Username</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-blue-300">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-blue-300">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-blue-300">Last Login</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {paginatedUsers.map(user => (
                    <tr key={user._id} className="group hover:bg-gray-800/30 transition-colors duration-200">
                      <td className="px-6 py-4">
                        {isUserActive(user) ? (
                          <div className="flex items-center gap-2 text-green-400">
                            <FaUserCheck />
                            <span>Active</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-gray-400">
                            <FaUserTimes />
                            <span>Inactive</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium">{user.username}</td>
                      <td className="px-6 py-4 text-gray-300">{user.email || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          user.role === 'admin' 
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/20' 
                            : 'bg-gray-700/20 text-gray-300 border border-gray-600/20'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {user.lastLogin 
                          ? new Date(user.lastLogin).toLocaleString()
                          : 'Never'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 p-4 border-t border-gray-700">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setPage(i + 1)}
                  className={`px-3 py-1 rounded ${
                    page === i + 1
                      ? 'bg-blue-600/20 text-white border border-blue-400/20'
                      : 'bg-gray-800/50 text-gray-400 border border-gray-700 hover:bg-gray-700/50'
                  } transition-all duration-200`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Users; 