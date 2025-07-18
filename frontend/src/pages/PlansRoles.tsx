import React, { useEffect, useState } from 'react';
import api from '../api';
import { FaUser, FaUserCheck, FaUserTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

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
      const token = localStorage.getItem('token');
      const { role, plan } = editState[id];
      const res = await api.put(`/api/admin/user/${id}/plan-role`, { role, plan });
      setUsers(prev => prev.map(u => u._id === id ? { ...u, ...res.data.user } : u));
      setEditState(prev => { const copy = { ...prev }; delete copy[id]; return copy; });
    } catch (err) {
      alert('Failed to update user');
      setEditState(prev => ({ ...prev, [id]: { ...prev[id], loading: false } }));
    }
  };

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
    u.username.toLowerCase().includes(search.toLowerCase())
  );
  const paginatedUsers = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 text-white flex flex-col items-center p-8">
      <div className="w-full max-w-6xl flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-center">Plans & Roles</h1>
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
                <th className="py-3 px-4 text-left">username</th>
                <th className="py-3 px-4 text-left">status</th>
                <th className="py-3 px-4 text-left">Role</th>
                <th className="py-3 px-4 text-left">Plan</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="text-center py-8 text-blue-200">Loading...</td></tr>
              ) : error ? (
                <tr><td colSpan={4} className="text-center py-8 text-red-400">{error}</td></tr>
              ) : paginatedUsers.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8 text-gray-400">No users found.</td></tr>
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
                  <td className="py-3 px-4 capitalize">
                    {currentUserRole === 'admin' ? (
                      <select
                        value={editState[user._id]?.role ?? user.role}
                        onChange={e => handleEditChange(user._id, 'role', e.target.value)}
                        className="bg-gray-800 text-white rounded px-2 py-1 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        disabled={editState[user._id]?.loading}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      user.role
                    )}
                  </td>
                  <td className="py-3 px-4 text-blue-200">
                    {currentUserRole === 'admin' ? (
                      <>
                        <select
                          value={editState[user._id]?.plan ?? user.plan ?? (user.role === 'admin' ? 'Pro+' : 'Basic')}
                          onChange={e => handleEditChange(user._id, 'plan', e.target.value)}
                          className="bg-gray-800 text-white rounded px-2 py-1 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          disabled={editState[user._id]?.loading}
                        >
                          <option value="Basic">Basic</option>
                          <option value="Pro">Pro</option>
                          <option value="Pro+">Pro+</option>
                        </select>
                        {editState[user._id] &&
                          (editState[user._id]?.role !== user.role || (editState[user._id]?.plan ?? (user.role === 'admin' ? 'Pro+' : 'Basic')) !== (user.plan ?? (user.role === 'admin' ? 'Pro+' : 'Basic')))
                          && (
                            <button
                              onClick={() => handleSave(user._id)}
                              className="ml-2 px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white font-semibold disabled:opacity-50"
                              disabled={editState[user._id]?.loading}
                            >
                              {editState[user._id]?.loading ? <span className='inline-block w-4 h-4 border-2 border-white border-t-blue-500 rounded-full animate-spin align-middle' /> : 'Save'}
                            </button>
                          )
                        }
                      </>
                    ) : (
                      user.plan || (user.role === 'admin' ? 'Pro+' : 'Basic')
                    )}
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

export default PlansRoles; 