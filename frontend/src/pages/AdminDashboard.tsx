import React, { useEffect, useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaUserCheck, FaClipboardList, FaUserCog, FaFlag, FaEnvelope, FaArrowLeft, FaUser, FaEdit, FaCheck, FaTimes, FaBell } from 'react-icons/fa';
import { useNotification } from '../NotificationContext';

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

interface PlanFeature {
  text: string;
  isEnabled: boolean;
}

interface Plan {
  name: string;
  price: string;
  priceSuffix: string;
  features: PlanFeature[];
  isEditing?: boolean;
}

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [plans, setPlans] = useState<Plan[]>([
    {
      name: 'Basic',
      price: 'Free',
      priceSuffix: '',
      features: [
        { text: 'Max 2 boards', isEnabled: true },
        { text: 'Max 2 decor uploads', isEnabled: true },
        { text: 'Access to default decors', isEnabled: true },
        { text: 'No download, share, or upload features', isEnabled: false },
        { text: 'No frames section', isEnabled: false },
        { text: 'No board reset', isEnabled: false },
      ],
    },
    {
      name: 'Pro',
      price: '$18',
      priceSuffix: '/mo',
      features: [
        { text: 'Max 5 boards', isEnabled: true },
        { text: 'Rename boards', isEnabled: true },
        { text: 'Download feature', isEnabled: true },
        { text: '1 frame item', isEnabled: true },
        { text: 'Board reset', isEnabled: true },
        { text: 'No decor upload', isEnabled: false },
        { text: 'No share feature', isEnabled: false },
      ],
    },
    {
      name: 'Pro+',
      price: '$25',
      priceSuffix: '/mo',
      features: [
        { text: 'Unlimited boards', isEnabled: true },
        { text: 'Unlimited decor uploads', isEnabled: true },
        { text: 'Download, share, upload features', isEnabled: true },
        { text: 'Unlimited frames', isEnabled: true },
        { text: 'Board reset', isEnabled: true },
        { text: 'All features unlocked', isEnabled: true },
      ],
    },
  ]);
  const [planRequests, setPlanRequests] = useState<any[]>([]);
  const [showPlanRequests, setShowPlanRequests] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const url = `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/admin/users`;
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

  // Fetch pending plan change requests
  useEffect(() => {
    if (!showPlanRequests) return;
    setLoadingRequests(true);
    api.get('/api/admin/plan-requests')
      .then(res => setPlanRequests(res.data))
      .catch(() => setPlanRequests([]))
      .finally(() => setLoadingRequests(false));
  }, [showPlanRequests]);

  // Approve/reject handler
  const handlePlanRequestDecision = async (requestId: string, decision: 'approved' | 'rejected') => {
    await api.post(`/api/admin/plan-requests/${requestId}/decision`, { decision });
    setPlanRequests(reqs => reqs.filter(r => r._id !== requestId));
    showNotification(`Request ${decision === 'approved' ? 'approved' : 'rejected'}!`, decision === 'approved' ? 'success' : 'error');
  };

  const isUserActive = (user: User) => {
    if (!user.lastLogin) return false;
    const last = new Date(user.lastLogin).getTime();
    const now = Date.now();
    return now - last < 600000;
  };

  const activeUsersCount = users.filter(isUserActive).length;
  const totalUsersCount = users.length;

  const handleEditPlan = (planIndex: number) => {
    setPlans(prevPlans => prevPlans.map((plan, idx) => ({
      ...plan,
      isEditing: idx === planIndex ? !plan.isEditing : plan.isEditing,
    })));
  };

  const handleFeatureChange = (planIndex: number, featureIndex: number, newText: string) => {
    setPlans(prevPlans => prevPlans.map((plan, pIdx) => {
      if (pIdx !== planIndex) return plan;
      const newFeatures = [...plan.features];
      newFeatures[featureIndex] = {
        ...newFeatures[featureIndex],
        text: newText,
      };
      return { ...plan, features: newFeatures };
    }));
  };

  const handlePriceChange = (planIndex: number, newPrice: string) => {
    setPlans(prevPlans => prevPlans.map((plan, pIdx) => {
      if (pIdx !== planIndex) return plan;
      return { ...plan, price: newPrice };
    }));
  };

  const handleSavePlan = (planIndex: number) => {
    // Here you would typically make an API call to save the plan changes
    setPlans(prevPlans => prevPlans.map((plan, idx) => ({
      ...plan,
      isEditing: idx === planIndex ? false : plan.isEditing,
    })));
    showNotification('Plan updated successfully', 'success');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 text-white flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-8 py-4 bg-gray-800/50 backdrop-blur-md border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="text-2xl text-blue-400">
            <FaUser />
          </div>
          <span className="text-xl font-bold tracking-wide">Admin Panel</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              localStorage.removeItem('defaultBoardId');
              navigate('/board');
            }}
            className="flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 backdrop-blur-md text-white px-6 py-2.5 rounded-lg font-semibold shadow-lg shadow-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-400/50 border border-blue-400/20 transition-all duration-300"
            aria-label="Back to boards"
          >
            <FaArrowLeft />
            Back to boards
          </button>
          <button onClick={() => setShowPlanRequests(true)} className="relative">
            <FaBell size={32} color="#3b82f6" />
            {planRequests.length > 0 && <span className="absolute -top-2 -right-2 bg-red-500 border-2 border-white text-white w-4 h-4 rounded-full flex items-center justify-center"></span>}
          </button>
        </div>
      </div>
      {showPlanRequests && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative animate-pop-in">
            <button onClick={() => setShowPlanRequests(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold">&times;</button>
            <h2 className="text-2xl font-bold mb-6 text-center text-blue-700 flex items-center justify-center gap-2">
              <FaBell size={28} color="#3b82f6" /> Pending Plan Change Requests
            </h2>
            {loadingRequests ? (
              <div className="flex items-center justify-center py-8 text-blue-600 font-semibold">Loading...</div>
            ) : planRequests.length === 0 ? (
              <div className="text-gray-500 text-center py-8">No pending requests.</div>
            ) : (
              <ul className="space-y-6">
                {planRequests.map(req => (
                  <li key={req._id} className="border border-blue-100 rounded-xl p-5 bg-blue-50/40 flex flex-col gap-2 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-blue-200 text-blue-800 rounded-full px-3 py-1 font-semibold text-sm">
                        {req.user?.username || 'Unknown User'}
                      </div>
                      <div className="text-gray-500 text-xs">{req.user?.email}</div>
                    </div>
                    <div className="flex gap-4 mb-2">
                      <div className="bg-blue-600 text-white rounded px-3 py-1 text-sm font-bold shadow-sm border border-blue-700">
                        Current: <span className="font-bold">{req.user?.plan}</span>
                      </div>
                      <div className="bg-green-600 text-white rounded px-3 py-1 text-sm font-bold shadow-sm border border-green-700">
                        Requested: <span className="font-bold">{req.requestedPlan}</span>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-2 justify-end">
                      <button onClick={() => handlePlanRequestDecision(req._id, 'approved')} className="bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded font-semibold shadow transition">Approve</button>
                      <button onClick={() => handlePlanRequestDecision(req._id, 'rejected')} className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded font-semibold shadow transition">Reject</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-900/50 backdrop-blur-md border-r border-gray-700 p-6">
          <nav className="flex flex-col gap-4">
            <button onClick={() => navigate('/admin/users')} className="flex items-center gap-3 px-6 py-3.5 rounded-lg bg-gray-800/40 hover:bg-gray-700/40 focus:bg-gray-700/40 backdrop-blur-md font-semibold text-white focus:outline-none border border-gray-600/20 shadow-lg shadow-gray-900/20 transition-all duration-300">
              <FaUsers /> Users details
            </button>
            <button onClick={() => navigate('/admin/users/boards')} className="flex items-center gap-3 px-6 py-3.5 rounded-lg bg-gray-800/40 hover:bg-gray-700/40 focus:bg-gray-700/40 backdrop-blur-md font-semibold text-white focus:outline-none border border-gray-600/20 shadow-lg shadow-gray-900/20 transition-all duration-300">
              <FaClipboardList /> User boards
            </button>
            <button onClick={() => navigate('/admin/plans-roles')} className="flex items-center gap-3 px-6 py-3.5 rounded-lg bg-gray-800/40 hover:bg-gray-700/40 focus:bg-gray-700/40 backdrop-blur-md font-semibold text-white focus:outline-none border border-gray-600/20 shadow-lg shadow-gray-900/20 transition-all duration-300">
              <FaUserCog /> Plans & Roles
            </button>
            <button onClick={() => navigate('/admin/content-moderation')} className="flex items-center gap-3 px-6 py-3.5 rounded-lg bg-gray-800/40 hover:bg-gray-700/40 focus:bg-gray-700/40 backdrop-blur-md font-semibold text-white focus:outline-none border border-gray-600/20 shadow-lg shadow-gray-900/20 transition-all duration-300">
              <FaFlag /> Content Moderation
            </button>
            <button onClick={() => navigate('/admin/send-mail')} className="flex items-center gap-3 px-6 py-3.5 rounded-lg bg-gray-800/40 hover:bg-gray-700/40 focus:bg-gray-700/40 backdrop-blur-md font-semibold text-white focus:outline-none border border-gray-600/20 shadow-lg shadow-gray-900/20 transition-all duration-300">
              <FaEnvelope /> Email
            </button>
          </nav>
        </aside>
        {/* Main Content */}
        <main className="flex-1 flex flex-col gap-8 p-8">
          {/* Top Row: Active Users & Total Users */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl shadow-lg p-8 flex flex-col items-center justify-center border border-gray-700">
              <div className="text-lg font-semibold mb-2">Current active users</div>
              <div className="text-4xl font-extrabold text-blue-400 flex items-center gap-2">
                <FaUserCheck /> {loading ? <span className="text-base">Loading...</span> : activeUsersCount}
              </div>
            </div>
            <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl shadow-lg p-8 flex flex-col items-center justify-center border border-gray-700">
              <div className="text-lg font-semibold mb-2">Total users</div>
              <div className="text-4xl font-extrabold text-blue-400 flex items-center gap-2">
                <FaUsers /> {loading ? <span className="text-base">Loading...</span> : totalUsersCount}
              </div>
            </div>
          </div>
          {/* Plan Details Section */}
          <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl shadow-lg p-8 border border-gray-700">
            <div className="text-lg font-semibold mb-6 text-center">Plan details and users' current plans</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan, planIndex) => (
                <div key={plan.name} className={`flex-1 flex flex-col items-center ${
                  plan.name === 'Pro+' 
                    ? 'bg-gradient-to-br from-blue-900/50 via-blue-700/50 to-blue-500/50'
                    : plan.name === 'Pro'
                      ? 'bg-gradient-to-br from-gray-800/50 via-gray-900/50 to-gray-800/50'
                      : 'bg-gray-800/50'
                } backdrop-blur-md rounded-2xl p-8 shadow-lg border ${
                  plan.name === 'Pro+' ? 'border-blue-700' : 'border-gray-700'
                } relative group`}>
                  <button 
                    onClick={() => handleEditPlan(planIndex)}
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-blue-500/20 hover:bg-blue-500/30 text-white p-2 rounded-lg backdrop-blur-md"
                  >
                    {plan.isEditing ? <FaTimes /> : <FaEdit />}
                  </button>
                  {plan.isEditing && (
                    <button 
                      onClick={() => handleSavePlan(planIndex)}
                      className="absolute top-4 right-14 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-green-500/20 hover:bg-green-500/30 text-white p-2 rounded-lg backdrop-blur-md"
                    >
                      <FaCheck />
                    </button>
                  )}
                  <span className={`text-3xl font-extrabold mb-2 ${
                    plan.name === 'Pro+' ? 'text-white' : plan.name === 'Pro' ? 'text-blue-300' : 'text-blue-200'
                  }`}>{plan.name}</span>
                  {plan.isEditing ? (
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={plan.price}
                        onChange={(e) => handlePriceChange(planIndex, e.target.value)}
                        className="bg-gray-800/50 backdrop-blur-md text-white px-3 py-1 rounded border border-gray-600 w-24 text-center"
                      />
                      <span className="text-xl font-normal text-gray-300">{plan.priceSuffix}</span>
                    </div>
                  ) : (
                    <span className="text-4xl font-bold text-white mb-2">
                      {plan.price}<span className="text-xl font-normal">{plan.priceSuffix}</span>
                    </span>
                  )}
                  <div className={`h-1 w-16 ${plan.name === 'Pro+' ? 'bg-white' : 'bg-blue-400'} rounded-full mb-4`} />
                  <ul className={`${
                    plan.name === 'Pro+' ? 'text-blue-100' : 'text-gray-300'
                  } text-base mb-6 space-y-2 text-left w-full`}>
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex}>
                        {plan.isEditing ? (
                          <input
                            type="text"
                            value={feature.text}
                            onChange={(e) => handleFeatureChange(planIndex, featureIndex, e.target.value)}
                            className="bg-gray-800/50 backdrop-blur-md text-white px-3 py-1 rounded border border-gray-600 w-full"
                          />
                        ) : (
                          `${feature.isEnabled ? '✓' : '✗'} ${feature.text}`
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard; 