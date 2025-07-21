import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaGithub, FaRedditAlien, FaYoutube, FaXTwitter } from 'react-icons/fa6';

const plans = [
  {
    name: 'Hobby',
    price: 'Free',
    description: 'Includes',
    features: [
      'Pro two-week trial',
      'Limited agent requests',
      'Limited tab completions',
    ],
    button: <button className="bg-white text-gray-900 px-6 py-2 rounded-lg font-semibold shadow border border-gray-300 hover:bg-gray-100 transition">Download</button>,
    secondary: <button className="bg-gray-800 text-white px-6 py-2 rounded-lg font-semibold shadow border border-gray-700 hover:bg-gray-900 transition">Others</button>,
    gradient: 'from-gray-900 via-gray-800 to-gray-900',
    text: 'text-blue-200',
    border: 'border-gray-700',
  },
  {
    name: 'Pro',
    price: '$20',
    priceSuffix: '/mo',
    description: 'Everything in Hobby, plus',
    features: [
      'Extended limits on agent',
      'Unlimited tab completions',
      'Access to Background Agents',
      'Access to Bug Bot',
      'Access to maximum context windows',
    ],
    button: <button className="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-blue-600 transition">Get Pro</button>,
    secondary: <a href="#" className="text-blue-300 underline ml-2">More info</a>,
    gradient: 'from-gray-800 via-gray-900 to-gray-800',
    text: 'text-blue-300',
    border: 'border-gray-700',
    highlight: true,
  },
  {
    name: 'Ultra',
    price: '$200',
    priceSuffix: '/mo',
    description: 'Everything in Pro, plus',
    features: [
      '20x usage on all OpenAI, Claude, Gemini models',
      'Priority access to new features',
    ],
    button: <button className="bg-white text-blue-700 px-6 py-2 rounded-lg font-semibold shadow border border-blue-700 hover:bg-blue-100 transition">Get Ultra</button>,
    gradient: 'from-blue-900 via-blue-700 to-blue-500',
    text: 'text-white',
    border: 'border-blue-700',
  },
];

const Pricing: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-black flex flex-col items-center py-12 px-4">
      <h1 className="text-4xl font-extrabold text-white mb-2 mt-4">Pricing</h1>
      <p className="text-lg text-gray-300 mb-10">Choose the plan that works for you</p>
      <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch w-full max-w-5xl">
        {plans.map((plan, idx) => (
          <div
            key={plan.name}
            className={`flex-1 flex flex-col items-center rounded-2xl p-8 shadow-lg border ${plan.border} max-w-xs min-w-[260px] bg-gradient-to-br ${plan.gradient} ${plan.highlight ? 'ring-2 ring-blue-400' : ''}`}
          >
            <span className={`text-3xl font-extrabold mb-2 ${plan.text}`}>{plan.name}</span>
            <span className={`text-4xl font-bold mb-2 ${plan.text}`}>{plan.price} {plan.priceSuffix && <span className="text-lg font-medium text-gray-300">{plan.priceSuffix}</span>}</span>
            <div className={`h-1 w-16 ${plan.name === 'Ultra' ? 'bg-white' : 'bg-blue-400'} rounded-full mb-4`} />
            <div className="text-gray-300 text-base mb-6 space-y-2 text-left w-full">
              <div className="mb-2 font-semibold">{plan.description}</div>
              <ul className="space-y-1">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-green-400 font-bold">✓</span> <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex gap-2 w-full justify-center mt-auto">
              {plan.button}
              {plan.secondary}
            </div>
          </div>
        ))}
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