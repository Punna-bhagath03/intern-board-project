import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaGithub, FaRedditAlien, FaYoutube, FaXTwitter } from 'react-icons/fa6';
import api from '../api';
import { useNotification } from '../NotificationContext';
import { refreshAuthToken } from '../api';

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
  const [userPlan, setUserPlan] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication and fetch user data
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        // Ensure token is in headers
        refreshAuthToken();
        
        const res = await api.get('/api/users/me');
        if (res.data) {
          setIsAuthenticated(true);
          setUserPlan(getPlanKey(res.data.plan));
          setUserId(res.data._id);
          localStorage.setItem('userPlan', res.data.plan);
        }
      } catch (err) {
        console.error('Failed to fetch user info:', err);
        setIsAuthenticated(false);
        localStorage.removeItem('token');
        refreshAuthToken();
      }
    };

    checkAuth();
  }, []);

  const handlePlanChange = async (plan: string) => {
    if (!isAuthenticated || !userId) {
      // Store current URL and intended plan
      localStorage.setItem('auth-redirect', '/pricing');
      localStorage.setItem('intended-plan', plan);
      showNotification('Please log in to change your plan', 'info');
      navigate('/login');
      return;
    }

    setLoadingPlan(plan);
    try {
      // Ensure token is fresh
      refreshAuthToken();

      // Update the plan
      const res = await api.put(`/api/admin/user/${userId}/plan-role`, {
        plan,
        role: undefined
      });

      if (res.data.requiresReload) {
        // Update local state
        setUserPlan(plan);
        localStorage.setItem('userPlan', plan);
        showNotification(`Successfully upgraded to ${plan} plan!`, 'success');

        // Get or create a board
        try {
          const boardsRes = await api.get('/api/boards');
          let boardId;

          if (boardsRes.data && boardsRes.data.length > 0) {
            const latestBoard = boardsRes.data[0];
            boardId = latestBoard._id;
          } else {
            const newBoardRes = await api.post('/api/boards', {
              name: 'My First Board',
              content: {}
            });
            boardId = newBoardRes.data._id;
          }

          // Update board ID and redirect
          localStorage.setItem('defaultBoardId', boardId);
          navigate(`/board/${boardId}`);
        } catch (boardErr) {
          console.error('Error handling board redirect:', boardErr);
          navigate('/board');
        }
      }
    } catch (err: any) {
      console.error('Failed to update plan:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update plan. Please try again.';
      showNotification(errorMessage, 'error');

      // Handle authentication errors
      if (err.response?.status === 401 || err.response?.status === 403) {
        setIsAuthenticated(false);
        localStorage.removeItem('token');
        refreshAuthToken();
        
        // Store redirect info and navigate to login
        localStorage.setItem('auth-redirect', '/pricing');
        localStorage.setItem('intended-plan', plan);
        navigate('/login');
      }
    } finally {
      setLoadingPlan(null);
    }
  };

  // Check for intended plan after authentication
  useEffect(() => {
    if (isAuthenticated && userId) {
      const intendedPlan = localStorage.getItem('intended-plan');
      if (intendedPlan) {
        localStorage.removeItem('intended-plan');
        handlePlanChange(intendedPlan);
      }
    }
  }, [isAuthenticated, userId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-extrabold text-center mb-2">Choose Your Plan</h1>
        <p className="text-lg text-gray-300 text-center mb-12">
          Select the perfect plan for your creative journey
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {PLAN_DETAILS.map((plan, idx) => {
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
                <ul className={`${plan.text.includes('white') ? 'text-blue-100' : 'text-gray-300'} text-base mb-6 space-y-2 text-left w-full`}>
                  {plan.features.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
                <button
                  onClick={() => !isCurrent && handlePlanChange(plan.name)}
                  disabled={isCurrent || loadingPlan !== null}
                  className={`w-full ${
                    isCurrent
                      ? 'bg-green-500/20 text-white border-green-400/20'
                      : plan.name === 'Pro+'
                        ? 'bg-white/20 hover:bg-white/30 text-white border-white/20'
                        : 'bg-blue-500/20 hover:bg-blue-500/30 text-white border-blue-400/20'
                  } backdrop-blur-md px-6 py-2.5 rounded-lg font-semibold shadow-lg transition-all duration-300 border ${
                    isCurrent ? 'cursor-default' : 'hover:scale-105'
                  } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
                >
                  {loadingPlan === plan.name ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    buttonText
                  )}
                </button>
              </div>
            );
          })}
        </div>

        <div className="text-center mb-16">
          <p className="text-gray-400 text-sm">
            All plans include basic features. Upgrade anytime to unlock more capabilities.
          </p>
        </div>

        <footer className="border-t border-gray-800 pt-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <p className="text-gray-400">hi@whiteboardhub.com</p>
              <div className="flex gap-4 mt-4">
                <a href="#" className="text-gray-400 hover:text-blue-400 transition">
                  <FaXTwitter />
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition">
                  <FaGithub />
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition">
                  <FaRedditAlien />
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition">
                  <FaYoutube />
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition">Enterprise</a></li>
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition">Security</a></li>
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition">Customer Stories</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition">Tutorials</a></li>
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition">Support</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition">Press</a></li>
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="text-center text-gray-400 text-sm py-8 border-t border-gray-800">
            © {new Date().getFullYear()} Whiteboard Hub. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Pricing; 