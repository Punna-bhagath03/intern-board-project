import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaGithub, FaRedditAlien, FaYoutube, FaXTwitter } from 'react-icons/fa6';
import api from '../api';
import { useNotification } from '../NotificationContext';
// Removed unused refreshAuthToken import

const PLAN_DETAILS = [
  {
    name: 'Basic',
    price: 'Free',
    priceSuffix: '',
    features: [
      '✓ Max 2 boards',
      '✓ Max 2 decor uploads',
      '✓ Access to default decors',
      '✗ No download, share, or upload features',
      '✗ No frames section',
      '✗ No board reset',
    ],
    gradient: 'from-gray-900/50 via-gray-800/50 to-gray-900/50',
    text: 'text-blue-200',
    border: 'border-gray-700',
  },
  {
    name: 'Pro',
    price: '$18',
    priceSuffix: '/mo',
    features: [
      '✓ Max 5 boards',
      '✓ Rename boards',
      '✓ Download feature',
      '✓ 1 frame item',
      '✓ Board reset',
      '✗ No decor upload',
      '✗ No share feature',
    ],
    gradient: 'from-gray-800/50 via-gray-900/50 to-gray-800/50',
    text: 'text-blue-300',
    border: 'border-gray-700',
    highlight: true,
  },
  {
    name: 'Pro+',
    price: '$25',
    priceSuffix: '/mo',
    features: [
      '✓ Unlimited boards',
      '✓ Unlimited decor uploads',
      '✓ Download, share, upload features',
      '✓ Unlimited frames',
      '✓ Board reset',
      '✓ All features unlocked',
    ],
    gradient: 'from-blue-900/50 via-blue-700/50 to-blue-500/50',
    text: 'text-white',
    border: 'border-blue-700',
  },
];

const getPlanKey = (plan: string) => {
  if (!plan) return 'Basic';
  if (plan.toLowerCase() === 'pro+') return 'Pro+';
  if (plan.toLowerCase() === 'pro') return 'Pro';
  return 'Basic';
};

const Pricing: React.FC = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState<string>('Basic');

  // Load user data on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const res = await api.get('/api/users/me');
        if (res.data && res.data._id) {
          setUserId(res.data._id);
          setUserPlan(getPlanKey(res.data.plan));
        }
      } catch (err) {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    loadUserData();
  }, [navigate]);

  const handlePlanChange = async (plan: string) => {
    if (loading || !userId) {
      showNotification('User data not loaded. Please try again.', 'error');
      return;
    }
    if (plan === userPlan) {
      showNotification('You are already on this plan', 'info');
      return;
    }
    setLoadingPlan(plan);
    try {
      // Submit a plan change request (do not update plan immediately)
      const res = await api.post(`/api/admin/user/${userId}/plan-request`, { requestedPlan: plan });
      if (res.status === 201) {
        showNotification('Your plan change request is pending admin approval.', 'info');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to submit plan change request';
      showNotification(errorMessage, 'error');
    } finally {
      setLoadingPlan(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading user data...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold text-center mb-2">Choose Your Plan</h1>
          <button
            onClick={() => navigate('/board')}
            className="flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 backdrop-blur-md text-white px-6 py-2.5 rounded-lg font-semibold shadow-lg shadow-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-400/50 border border-blue-400/20 transition-all duration-300"
          >
            Back to Boards
          </button>
        </div>
        <p className="text-lg text-gray-300 text-center mb-12">
          Select the perfect plan for your creative journey
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {PLAN_DETAILS.map((plan) => {
            const isCurrent = getPlanKey(userPlan) === plan.name;
            let buttonText = isCurrent ? 'Current Plan' : `Get ${plan.name}`;
            return (
              <div
                key={plan.name}
                className={`flex flex-col items-center bg-gradient-to-br ${plan.gradient} backdrop-blur-md rounded-2xl p-8 shadow-lg border ${plan.border} relative group ${
                  plan.highlight ? 'ring-2 ring-blue-400/30' : ''
                }`}
              >
                <span className={`text-3xl font-extrabold mb-2 ${plan.text}`}>{plan.name}</span>
                <span className={`text-4xl font-bold mb-2 ${plan.text}`}>
                  {plan.price}
                  {plan.priceSuffix && (
                    <span className="text-xl font-normal text-gray-300">{plan.priceSuffix}</span>
                  )}
                </span>
                <div className={`h-1 w-16 ${plan.name === 'Pro+' ? 'bg-white' : 'bg-blue-400'} rounded-full mb-4`} />
                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => !isCurrent && handlePlanChange(plan.name)}
                  disabled={isCurrent || loadingPlan !== null || loading}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                    isCurrent
                      ? 'bg-gray-600 cursor-not-allowed'
                      : loadingPlan === plan.name
                      ? 'bg-blue-600/50 cursor-wait'
                      : 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700'
                  }`}
                >
                  {loadingPlan === plan.name ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Updating...</span>
                    </div>
                  ) : (
                    buttonText
                  )}
                </button>
              </div>
            );
          })}
        </div>

        <div className="text-center mb-16">
          <p className="text-gray-400 mb-4">Follow us on social media for updates and news</p>
          <div className="flex justify-center gap-6">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <FaGithub size={24} />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <FaRedditAlien size={24} />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <FaYoutube size={24} />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <FaXTwitter size={24} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing; 