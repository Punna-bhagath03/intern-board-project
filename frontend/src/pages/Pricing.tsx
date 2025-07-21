import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaGithub, FaRedditAlien, FaYoutube, FaXTwitter } from 'react-icons/fa6';
import api from '../api';
import { useNotification } from '../NotificationContext';

const PLAN_DETAILS = [
  {
    name: 'Basic',
    price: 'Free',
    priceSuffix: '',
    features: [
      '✓ Max 2 boards',
      '✓ Max 2 decor uploads',
      '✗ No download, share, or upload features',
      '✗ No frames section',
      '✓ Access to default decors',
      '✗ No board reset',
    ],
    gradient: 'from-gray-900 via-gray-800 to-gray-900',
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
      '✗ No decor upload',
      '✗ No share feature',
      '✓ Board reset',
    ],
    gradient: 'from-gray-800 via-gray-900 to-gray-800',
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
    gradient: 'from-blue-900 via-blue-700 to-blue-500',
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

const planApiValue = (plan: string) => {
  if (plan === 'Pro+') return 'Pro+';
  if (plan === 'Pro') return 'Pro';
  return 'Basic';
};

const Pricing: React.FC = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [userPlan, setUserPlan] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  // Fetch user info (plan and id)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    api.get('http://localhost:5001/api/users/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (res.data && res.data.plan) {
          setUserPlan(getPlanKey(res.data.plan));
        } else if (res.data && res.data.role) {
          setUserPlan(res.data.role === 'admin' ? 'Pro+' : 'Basic');
        } else {
          setUserPlan('Basic');
        }
        if (res.data && res.data._id) {
          setUserId(res.data._id);
        } else {
          // fallback: fetch boards and get user from there
          api.get('http://localhost:5001/api/boards', {
            headers: { Authorization: `Bearer ${token}` },
          }).then(r => {
            if (r.data && r.data.length > 0 && r.data[0].user) {
              setUserId(r.data[0].user);
            }
          });
        }
      })
      .catch(() => setUserPlan('Basic'));
  }, []);

  // Plan change handler
  const handlePlanChange = async (plan: string) => {
    if (!userId) return;
    setLoadingPlan(plan);
    try {
      await api.patch(`/api/users/${userId}`, { plan: planApiValue(plan) });
      setUserPlan(plan);
      showNotification(`Your plan has been updated to ${plan}.`, 'success');
      // Redirect to user's boards after short delay
      setTimeout(() => {
        const defaultBoardId = localStorage.getItem('defaultBoardId');
        if (defaultBoardId) {
          navigate(`/board/${defaultBoardId}`);
        } else {
          navigate('/board');
        }
      }, 1200);
    } catch (err: any) {
      showNotification('Failed to update plan. Please try again.', 'error');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center py-12 px-4">
      <h1 className="text-4xl font-extrabold text-white mb-2 mt-4">Pricing</h1>
      <p className="text-lg text-gray-300 mb-10">Choose the plan that works for you</p>
      <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch w-full max-w-5xl">
        {PLAN_DETAILS.map((plan, idx) => {
          const isCurrent = getPlanKey(userPlan) === plan.name;
          let buttonText = 'Get ' + plan.name;
          if (isCurrent) buttonText = 'Current';
          return (
            <div
              key={plan.name}
              className={`flex-1 flex flex-col items-center rounded-2xl p-8 shadow-lg border ${plan.border} max-w-xs min-w-[260px] bg-gradient-to-br ${plan.gradient} ${plan.highlight ? 'ring-2 ring-blue-400' : ''}`}
            >
              <span className={`text-3xl font-extrabold mb-2 ${plan.text}`}>{plan.name}</span>
              <span className={`text-4xl font-bold mb-2 ${plan.text}`}>{plan.price} {plan.priceSuffix && <span className="text-lg font-medium text-gray-300">{plan.priceSuffix}</span>}</span>
              <div className={`h-1 w-16 ${plan.name === 'Pro+' ? 'bg-white' : 'bg-blue-400'} rounded-full mb-4`} />
              <ul className={`${plan.text.includes('white') ? 'text-blue-100' : 'text-gray-300'} text-base mb-6 space-y-2 text-left w-full`}>
                {plan.features.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
              <button
                className={`px-6 py-2 rounded-lg font-semibold shadow w-full mt-auto ${isCurrent ? 'bg-blue-500 text-white opacity-60 cursor-not-allowed' : plan.name === 'Pro+' ? 'bg-white text-blue-700 border border-blue-700 hover:bg-blue-100' : plan.name === 'Pro' ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-700 text-blue-200 hover:bg-gray-800'} transition flex items-center justify-center`}
                disabled={isCurrent || loadingPlan === plan.name}
                onClick={() => handlePlanChange(plan.name)}
              >
                {loadingPlan === plan.name ? (
                  <span className="inline-block w-5 h-5 border-2 border-white border-t-blue-500 rounded-full animate-spin align-middle mr-2" />
                ) : null}
                {buttonText}
              </button>
            </div>
          );
        })}
      </div>
      <div className="mt-12 text-center">
        <span className="text-gray-400 text-sm">All plans are for individual users. Team plans coming soon.</span>
      </div>
      {/* Footer */}
      <footer className="w-full mt-16 pt-10 pb-6 border-t border-gray-800 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-start md:justify-between gap-10 px-4">
          {/* Contact & Social */}
          <div className="flex flex-col gap-4 min-w-[180px]">
            <div className="text-gray-200 font-semibold text-lg mb-1">hi@whiteboardhub.com</div>
            <div className="flex gap-4 text-2xl text-gray-400">
              <a href="#" className="hover:text-blue-400 transition" aria-label="X"><FaXTwitter /></a>
              <a href="#" className="hover:text-blue-400 transition" aria-label="GitHub"><FaGithub /></a>
              <a href="#" className="hover:text-blue-400 transition" aria-label="Reddit"><FaRedditAlien /></a>
              <a href="#" className="hover:text-blue-400 transition" aria-label="YouTube"><FaYoutube /></a>
            </div>
          </div>
          {/* Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 flex-1">
            <div>
              <div className="text-gray-200 font-semibold mb-2">Product</div>
              <ul className="space-y-1 text-gray-400">
                <li><a href="/" className="hover:text-blue-400 transition">Home</a></li>
                <li><a href="/pricing" className="hover:text-blue-400 transition">Pricing</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Features</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Enterprise</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Downloads</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Students</a></li>
              </ul>
            </div>
            <div>
              <div className="text-gray-200 font-semibold mb-2">Resources</div>
              <ul className="space-y-1 text-gray-400">
                <li><a href="#" className="hover:text-blue-400 transition">Docs</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Blog</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Forum</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Changelog</a></li>
              </ul>
            </div>
            <div>
              <div className="text-gray-200 font-semibold mb-2">Company</div>
              <ul className="space-y-1 text-gray-400">
                <li><a href="#" className="hover:text-blue-400 transition">Whiteboard Hub</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Careers</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Community</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Customers</a></li>
              </ul>
            </div>
            <div>
              <div className="text-gray-200 font-semibold mb-2">Legal</div>
              <ul className="space-y-1 text-gray-400">
                <li><a href="#" className="hover:text-blue-400 transition">Terms</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Security</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Privacy</a></li>
              </ul>
            </div>
          </div>
          {/* Language & Cert */}
          <div className="flex flex-col gap-4 min-w-[180px] items-end">
            <select className="bg-gray-900 border border-gray-700 text-gray-300 rounded px-3 py-2 text-sm focus:outline-none">
              <option>English</option>
            </select>
            <div className="flex gap-2 mt-2">
              <button className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-gray-400 text-lg" title="Light mode">💻</button>
              <button className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-gray-400 text-lg" title="Dark mode">🌙</button>
            </div>
            <div className="mt-6">
              <span className="inline-flex items-center gap-2 bg-gray-800 border border-gray-700 rounded px-3 py-1 text-gray-400 text-xs"><span role="img" aria-label="shield">🛡️</span> SOC 2 Certified</span>
            </div>
          </div>
        </div>
        <div className="mt-10 text-center text-gray-500 text-sm">© {new Date().getFullYear()} Made by Whiteboard Hub</div>
      </footer>
    </div>
  );
};

export default Pricing; 