import React, { useEffect, useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaUserCheck, FaClipboardList, FaUserCog, FaFlag, FaEnvelope, FaArrowLeft, FaUser } from 'react-icons/fa';

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

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const url = 'http://localhost:5001/api/admin/users';
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

  const activeUsersCount = users.filter(isUserActive).length;
  const totalUsersCount = users.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 text-white flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-8 py-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <FaUser className="text-2xl text-blue-400" />
          <span className="text-xl font-bold tracking-wide">Admin Panel</span>
        </div>
        <button
          onClick={() => {
            const boardId = localStorage.getItem('defaultBoardId');
            if (boardId) {
              navigate(`/board/${boardId}`);
            } else {
              navigate('/board');
            }
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Back to boards"
        >
          <FaArrowLeft />
          Back to boards
        </button>
      </div>
      <div className="flex flex-1">
      {/* Sidebar */}
        <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col py-8 px-4 gap-4 min-h-full">
          <nav className="flex flex-col gap-4">
            <button onClick={() => navigate('/admin/users')} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-900 hover:bg-gray-700 focus:bg-gray-700 font-semibold text-white focus:outline-none">
              <FaUsers /> Users details
            </button>
            <button onClick={() => navigate('/admin/users/boards')} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-900 hover:bg-gray-700 focus:bg-gray-700 font-semibold text-white focus:outline-none">
              <FaClipboardList /> User boards
            </button>
            <button onClick={() => navigate('/admin/plans-roles')} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-900 hover:bg-gray-700 focus:bg-gray-700 font-semibold text-white focus:outline-none">
              <FaUserCog /> Plans & Roles
            </button>
            <button onClick={() => navigate('/admin/users')} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-900 hover:bg-gray-700 focus:bg-gray-700 font-semibold text-white focus:outline-none">
              <FaFlag /> Flagged content
            </button>
            <button onClick={() => navigate('/admin/users')} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-900 hover:bg-gray-700 focus:bg-gray-700 font-semibold text-white focus:outline-none">
              <FaEnvelope /> Email
            </button>
        </nav>
      </aside>
      {/* Main Content */}
        <main className="flex-1 flex flex-col gap-8 p-8">
          {/* Top Row: Active Users & Total Users */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-gray-900 rounded-2xl shadow-lg p-8 flex flex-col items-center justify-center border border-gray-700">
              <div className="text-lg font-semibold mb-2">Current active users</div>
              <div className="text-4xl font-extrabold text-blue-400 flex items-center gap-2">
                <FaUserCheck className="text-3xl" />
                {loading ? <span className="text-base">Loading...</span> : activeUsersCount}
            </div>
            </div>
            <div className="bg-gray-900 rounded-2xl shadow-lg p-8 flex flex-col items-center justify-center border border-gray-700">
              <div className="text-lg font-semibold mb-2">Total users</div>
              <div className="text-4xl font-extrabold text-blue-400 flex items-center gap-2">
                <FaUsers className="text-3xl" />
                {loading ? <span className="text-base">Loading...</span> : totalUsersCount}
          </div>
            </div>
          </div>
          {/* Plan Details Section */}
          <div className="bg-gray-900 rounded-2xl shadow-lg p-8 border border-gray-700">
            <div className="text-lg font-semibold mb-6 text-center">Plan details and users' current plans</div>
            <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
              <div className="flex-1 flex flex-col items-center bg-gray-800 rounded-xl p-6 shadow hover:shadow-xl transition">
                <span className="text-2xl font-bold text-blue-300 mb-2">Basic</span>
                <span className="text-gray-400">(coming soon)</span>
        </div>
              <div className="flex-1 flex flex-col items-center bg-gray-800 rounded-xl p-6 shadow hover:shadow-xl transition">
                <span className="text-2xl font-bold text-blue-400 mb-2">Pro</span>
                <span className="text-gray-400">(coming soon)</span>
          </div>
              <div className="flex-1 flex flex-col items-center bg-gray-800 rounded-xl p-6 shadow hover:shadow-xl transition">
                <span className="text-2xl font-bold text-blue-500 mb-2">Pro+</span>
                <span className="text-gray-400">(coming soon)</span>
          </div>
          </div>
          </div>
        </main>
        </div>
    </div>
  );
};

export default AdminDashboard; 