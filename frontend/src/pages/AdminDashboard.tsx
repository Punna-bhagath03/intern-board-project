import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface User {
  _id: string;
  username: string;
  email?: string;
  status?: 'active' | 'pending' | 'suspended';
  role: 'user' | 'admin';
  createdAt?: string;
  lastLogin?: string;
  isOnline?: boolean;
}

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  suspended: 'bg-red-100 text-red-700',
};

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch users');
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const handleStatusChange = async (user: User, status: 'active' | 'pending' | 'suspended') => {
    setActionLoading(user._id + '-status');
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/admin/user/${user._id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => prev.map(u => u._id === user._id ? { ...u, status } : u));
    } catch (err) {
      // Optionally show error
    }
    setActionLoading(null);
  };

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col min-h-screen">
        <div className="p-6 font-bold text-xl border-b">Admin Panel</div>
        <nav className="flex-1 p-4 space-y-2">
          <a href="/admin/dashboard" className="block py-2 px-4 rounded bg-gray-100 font-semibold">Dashboard</a>
          <a href="/admin/dashboard" className="block py-2 px-4 rounded hover:bg-gray-100">Users</a>
          <a href="#" className="block py-2 px-4 rounded hover:bg-gray-100">Flagged Content</a>
          <a href="#" className="block py-2 px-4 rounded hover:bg-gray-100">Reports</a>
          <a href="#" className="block py-2 px-4 rounded hover:bg-gray-100">Settings</a>
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Recent Users Card */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Users</h2>
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="border rounded px-3 py-1 text-sm w-48"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-3 text-left">Name</th>
                    <th className="py-2 px-3 text-left">Email</th>
                    <th className="py-2 px-3 text-left">Status</th>
                    <th className="py-2 px-3 text-left">Join Date</th>
                    <th className="py-2 px-3 text-left">Last Login</th>
                    <th className="py-2 px-3 text-left">Role</th>
                    <th className="py-2 px-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-4 text-gray-400">No users found.</td></tr>
                  ) : filteredUsers.map(user => (
                    <tr key={user._id} className="border-b hover:bg-gray-50 transition">
                      <td className="py-2 px-3 font-semibold">{user.username}</td>
                      <td className="py-2 px-3">{user.email || <span className="text-gray-400 italic">N/A</span>}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${statusColors[user.status || 'active']}`}>{user.status || 'active'}</span>
                      </td>
                      <td className="py-2 px-3">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : <span className="text-gray-400 italic">N/A</span>}</td>
                      <td className="py-2 px-3">{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : <span className="text-gray-400 italic">Never</span>}</td>
                      <td className="py-2 px-3 capitalize">{user.role}</td>
                      <td className="py-2 px-3 flex flex-wrap gap-2">
                        <button
                          onClick={() => navigate(`/admin/user/${user._id}/analytics`)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded font-semibold transition"
                        >
                          View Boards
                        </button>
                        {user.status !== 'active' && (
                          <button
                            onClick={() => handleStatusChange(user, 'active')}
                            disabled={actionLoading === user._id + '-status'}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded font-semibold transition disabled:opacity-60"
                          >
                            Activate
                          </button>
                        )}
                        {user.status !== 'pending' && (
                          <button
                            onClick={() => handleStatusChange(user, 'pending')}
                            disabled={actionLoading === user._id + '-status'}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded font-semibold transition disabled:opacity-60"
                          >
                            Set Pending
                          </button>
                        )}
                        {user.status !== 'suspended' && (
                          <button
                            onClick={() => handleStatusChange(user, 'suspended')}
                            disabled={actionLoading === user._id + '-status'}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded font-semibold transition disabled:opacity-60"
                          >
                            Suspend
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Flagged Content Card (placeholder) */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Flagged Content</h2>
              <input
                type="text"
                placeholder="Search flagged content..."
                className="border rounded px-3 py-1 text-sm w-48"
                disabled
              />
            </div>
            <div className="text-gray-400 text-center py-8">No flagged content yet.</div>
          </div>
        </div>
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <span className="font-bold text-lg mb-2">Manage Users</span>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-semibold mt-2">Go</button>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <span className="font-bold text-lg mb-2">Review Boards</span>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-semibold mt-2">Go</button>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <span className="font-bold text-lg mb-2">Moderate Content</span>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-semibold mt-2">Go</button>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <span className="font-bold text-lg mb-2">Export Data</span>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-semibold mt-2">Go</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard; 