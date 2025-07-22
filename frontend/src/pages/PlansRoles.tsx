import React, { useEffect, useState } from 'react';
import api from '../api';
import { FaUser, FaArrowLeft, FaSearch, FaCheck, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../NotificationContext';

interface User {
  _id: string;
  username: string;
  role: 'user' | 'admin';
  lastLogin?: string;
  plan?: string;
}

const PlansRoles: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;
  const navigate = useNavigate();
  const [currentUserRole, setCurrentUserRole] = useState<string>('');
  const [editState, setEditState] = useState<{[id: string]: {role: string, plan: string, loading: boolean}}>(() => ({}));
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/api/admin/users');
        setUsers(Array.isArray(res.data) ? res.data : []);
      } catch (err: any) {
        setError('Failed to fetch users');
        setUsers([]);
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    // Fetch current user role
    const token = localStorage.getItem('token');
    if (!token) return;
    api.get('http://localhost:5001/api/users/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (res.data && res.data.role) setCurrentUserRole(res.data.role);
      })
      .catch(() => setCurrentUserRole(''));
  }, []);

  const handleEditChange = (id: string, field: 'role' | 'plan', value: string) => {
    setEditState(prev => ({
      ...prev,
      [id]: {
        role: field === 'role' ? value : prev[id]?.role ?? users.find(u => u._id === id)?.role ?? 'user',
        plan: field === 'plan' ? value : prev[id]?.plan ?? users.find(u => u._id === id)?.plan ?? 'Basic',
        loading: false
      }
    }));
  };

  const handleSave = async (id: string) => {
    setEditState(prev => ({ ...prev, [id]: { ...prev[id], loading: true } }));
    try {
      const { role, plan } = editState[id];
      const res = await api.put(`/api/admin/user/${id}/plan-role`, { role, plan });
      
      if (res.data.requiresReload) {
        showNotification('User updated successfully. The user will need to refresh their page.', 'success');
      }
      
      setUsers(prev => prev.map(u => u._id === id ? { ...u, ...res.data.user } : u));
      setEditState(prev => { const copy = { ...prev }; delete copy[id]; return copy; });
    } catch (err) {
      showNotification('Failed to update user', 'error');
      setEditState(prev => ({ ...prev, [id]: { ...prev[id], loading: false } }));
    }
  };

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
    u.username.toLowerCase().includes(search.toLowerCase())
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
          <span className="text-xl font-bold tracking-wide">Plans & Roles</span>
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
                    <th className="px-6 py-4 text-left text-sm font-semibold text-blue-300">Username</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-blue-300">Current Role</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-blue-300">Current Plan</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-blue-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {paginatedUsers.map(user => (
                    <tr key={user._id} className="group hover:bg-gray-800/30 transition-colors duration-200">
                      <td className="px-6 py-4 font-medium">{user.username}</td>
                      <td className="px-6 py-4">
                        {currentUserRole === 'admin' ? (
                          <select
                            value={editState[user._id]?.role ?? user.role}
                            onChange={e => handleEditChange(user._id, 'role', e.target.value)}
                            className="bg-gray-800/50 backdrop-blur-md text-white px-3 py-1.5 rounded-lg border border-gray-600/50 focus:outline-none focus:border-blue-500/50 transition-all duration-200"
                            disabled={editState[user._id]?.loading}
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : (
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            user.role === 'admin' 
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/20' 
                              : 'bg-gray-700/20 text-gray-300 border border-gray-600/20'
                          }`}>
                            {user.role}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {currentUserRole === 'admin' ? (
                          <select
                            value={editState[user._id]?.plan ?? user.plan ?? (user.role === 'admin' ? 'Pro+' : 'Basic')}
                            onChange={e => handleEditChange(user._id, 'plan', e.target.value)}
                            className="bg-gray-800/50 backdrop-blur-md text-white px-3 py-1.5 rounded-lg border border-gray-600/50 focus:outline-none focus:border-blue-500/50 transition-all duration-200"
                            disabled={editState[user._id]?.loading}
                          >
                            <option value="Basic">Basic</option>
                            <option value="Pro">Pro</option>
                            <option value="Pro+">Pro+</option>
                          </select>
                        ) : (
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            user.plan === 'Pro+' 
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/20'
                              : user.plan === 'Pro'
                                ? 'bg-blue-400/20 text-blue-200 border border-blue-400/20'
                                : 'bg-gray-700/20 text-gray-300 border border-gray-600/20'
                          }`}>
                            {user.plan ?? (user.role === 'admin' ? 'Pro+' : 'Basic')}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editState[user._id] &&
                          (editState[user._id]?.role !== user.role || 
                           editState[user._id]?.plan !== (user.plan ?? (user.role === 'admin' ? 'Pro+' : 'Basic'))) && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleSave(user._id)}
                              className="bg-green-500/20 hover:bg-green-500/30 text-white px-4 py-1.5 rounded-lg text-sm font-medium border border-green-400/20 transition-all duration-200 flex items-center gap-2"
                              disabled={editState[user._id]?.loading}
                            >
                              {editState[user._id]?.loading ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <FaCheck />
                              )}
                              Save
                            </button>
                            <button
                              onClick={() => {
                                const newEditState = { ...editState };
                                delete newEditState[user._id];
                                setEditState(newEditState);
                              }}
                              className="bg-red-500/20 hover:bg-red-500/30 text-white px-4 py-1.5 rounded-lg text-sm font-medium border border-red-400/20 transition-all duration-200 flex items-center gap-2"
                            >
                              <FaTimes />
                              Cancel
                            </button>
                          </div>
                        )}
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

export default PlansRoles; 