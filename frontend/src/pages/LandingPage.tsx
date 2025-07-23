import React from 'react';
import { useNavigate } from 'react-router-dom';

const features = [
  {
    icon: (
      <svg width="32" height="32" fill="none" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="url(#a)"/><path d="M10 16h12M16 10v12" stroke="#fff" strokeWidth="2" strokeLinecap="round"/><defs><linearGradient id="a" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse"><stop stopColor="#6366f1"/><stop offset="1" stopColor="#a21caf"/></linearGradient></defs></svg>
    ),
    title: 'Create Unlimited Boards',
    desc: 'Design beautiful digital boards with unlimited creativity based on your plan.'
  },
  {
    icon: (
      <svg width="32" height="32" fill="none" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="url(#b)"/><path d="M10 16h12M16 10v12" stroke="#fff" strokeWidth="2" strokeLinecap="round"/><defs><linearGradient id="b" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse"><stop stopColor="#2563eb"/><stop offset="1" stopColor="#06b6d4"/></linearGradient></defs></svg>
    ),
    title: 'Drag & Drop Interface',
    desc: 'Intuitive interface makes board customization effortless and enjoyable.'
  },
  {
    icon: (
      <svg width="32" height="32" fill="none" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="url(#c)"/><path d="M10 16h12M16 10v12" stroke="#fff" strokeWidth="2" strokeLinecap="round"/><defs><linearGradient id="c" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse"><stop stopColor="#f59e42"/><stop offset="1" stopColor="#f43f5e"/></linearGradient></defs></svg>
    ),
    title: 'Rich Media Support',
    desc: 'Upload images, backgrounds, and decors to bring your boards to life.'
  },
  {
    icon: (
      <svg width="32" height="32" fill="none" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="url(#d)"/><path d="M10 16h12M16 10v12" stroke="#fff" strokeWidth="2" strokeLinecap="round"/><defs><linearGradient id="d" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse"><stop stopColor="#10b981"/><stop offset="1" stopColor="#2563eb"/></linearGradient></defs></svg>
    ),
    title: 'Team Collaboration',
    desc: 'Work together seamlessly with role-based access and real-time updates.'
  },
  {
    icon: (
      <svg width="32" height="32" fill="none" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="url(#e)"/><path d="M10 16h12M16 10v12" stroke="#fff" strokeWidth="2" strokeLinecap="round"/><defs><linearGradient id="e" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse"><stop stopColor="#f43f5e"/><stop offset="1" stopColor="#6366f1"/></linearGradient></defs></svg>
    ),
    title: 'Share & Export',
    desc: 'Download, share, and reset boards with Pro and Pro+ features.'
  },
  {
    icon: (
      <svg width="32" height="32" fill="none" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="url(#f)"/><path d="M10 16h12M16 10v12" stroke="#fff" strokeWidth="2" strokeLinecap="round"/><defs><linearGradient id="f" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse"><stop stopColor="#a21caf"/><stop offset="1" stopColor="#10b981"/></linearGradient></defs></svg>
    ),
    title: 'Admin Controls',
    desc: 'Comprehensive dashboard for user management and plan approvals.'
  }
];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 flex flex-col">
      {/* Navigation */}
      <nav className="w-full flex items-center justify-between px-8 py-5 bg-transparent z-20">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 rounded-lg p-2">
            <svg width="28" height="28" fill="none" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#2563eb"/><path d="M10 16h12M16 10v12" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
          </div>
          <span className="text-2xl font-extrabold text-white tracking-tight">MI-Board</span>
        </div>
        <div className="flex items-center gap-8 text-white font-semibold text-lg">
          <button onClick={() => navigate('/#features')} className="hover:text-blue-400 transition">Features</button>
          <button onClick={() => navigate('/pricing')} className="hover:text-blue-400 transition">Pricing</button>
          <button onClick={() => navigate('/admin/dashboard')} className="hover:text-blue-400 transition">Admin</button>
          <button onClick={() => navigate('/login')} className="hover:text-blue-400 transition">Login</button>
          <button onClick={() => navigate('/signup')} className="ml-2 px-6 py-2 rounded-full bg-blue-600 text-white font-bold shadow hover:bg-blue-700 transition">Sign Up Free</button>
        </div>
      </nav>
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center flex-1 text-center px-4 pt-12 pb-20">
        <div className="mb-4">
          <span className="inline-block px-4 py-1 rounded-full bg-blue-800/20 text-blue-300 font-semibold text-sm tracking-wide mb-2">Unleash Your Creativity</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-600 text-transparent bg-clip-text">MI-Board<br />Digital Creativity</h1>
        <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-2xl mx-auto">Unleash Your Creativity. Collaborate. Share. Celebrate.<br />Your all-in-one digital whiteboard for events, education, and creative collaboration.</p>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <button onClick={() => navigate('/signup')} className="px-8 py-3 rounded-full bg-blue-600 text-white font-bold text-lg shadow hover:bg-blue-700 transition">Get Started Free</button>
          <button onClick={() => window.open('https://www.youtube.com/', '_blank')} className="px-8 py-3 rounded-full border-2 border-blue-400 text-blue-200 font-bold text-lg shadow hover:bg-blue-800 hover:text-white transition flex items-center gap-2">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M8 5v14l11-7L8 5z" fill="currentColor"/></svg> Watch Demo
          </button>
        </div>
      </section>
      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900">
        <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-600 text-transparent bg-clip-text">Powerful Features for <span className="text-white">Creative Teams</span></h2>
        <p className="text-lg text-blue-100 text-center mb-12 max-w-2xl mx-auto">Everything you need to create, collaborate, and share stunning digital boards</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {features.map((f, i) => (
            <div key={i} className="bg-gray-800/60 rounded-2xl p-8 flex flex-col items-center shadow-lg border border-gray-700 hover:scale-105 transition-transform">
              <div className="mb-4">{f.icon}</div>
              <h3 className="text-xl font-bold text-white mb-2 text-center">{f.title}</h3>
              <p className="text-blue-200 text-center">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-20 px-4 flex flex-col items-center justify-center">
        <div className="bg-gradient-to-r from-blue-700 via-purple-600 to-blue-500 rounded-2xl shadow-xl p-10 w-full max-w-2xl text-center">
          <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Ready to Create Something Amazing?</h3>
          <p className="text-lg text-blue-100 mb-8">Join thousands of creators who are already using MI-Board to bring their ideas to life</p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/signup')} className="px-8 py-3 rounded-full bg-blue-600 text-white font-bold text-lg shadow hover:bg-blue-700 transition">Start Creating Free</button>
            <button onClick={() => window.open('https://www.youtube.com/', '_blank')} className="px-8 py-3 rounded-full border-2 border-white text-white font-bold text-lg shadow hover:bg-blue-800 hover:text-white transition flex items-center gap-2">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M8 5v14l11-7L8 5z" fill="currentColor"/></svg> Schedule Demo
            </button>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="w-full py-10 px-4 bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 border-t border-gray-800 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <div className="bg-blue-600 rounded-lg p-2">
              <svg width="28" height="28" fill="none" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#2563eb"/><path d="M10 16h12M16 10v12" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
            <span className="text-xl font-extrabold text-white tracking-tight">MI-Board</span>
          </div>
          <div className="flex flex-col md:flex-row gap-8 text-blue-200 text-sm">
            <div>
              <div className="font-bold text-white mb-2">Product</div>
              <div className="flex flex-col gap-1">
                <a href="#features" className="hover:text-blue-400 transition">Features</a>
                <a href="/pricing" className="hover:text-blue-400 transition">Pricing</a>
                <a href="#" className="hover:text-blue-400 transition">Templates</a>
                <a href="#" className="hover:text-blue-400 transition">Integrations</a>
              </div>
            </div>
            <div>
              <div className="font-bold text-white mb-2">Support</div>
              <div className="flex flex-col gap-1">
                <a href="#" className="hover:text-blue-400 transition">Help Center</a>
                <a href="#" className="hover:text-blue-400 transition">Contact Us</a>
                <a href="#" className="hover:text-blue-400 transition">Privacy Policy</a>
                <a href="#" className="hover:text-blue-400 transition">Terms of Service</a>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center text-blue-300 text-xs mt-8">© {new Date().getFullYear()} MI-Board. All rights reserved. Built with <span className="text-pink-400">♥</span> for creators worldwide.</div>
      </footer>
    </div>
  );
};

export default LandingPage; 