import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Top-right buttons */}
      <div className="absolute top-6 right-8 flex gap-4 z-10">
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-2 rounded-full bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition"
        >
          Login
        </button>
        <button
          onClick={() => navigate('/signup')}
          className="px-6 py-2 rounded-full bg-white text-blue-700 font-semibold border border-blue-600 shadow hover:bg-blue-50 transition"
        >
          Signup
        </button>
      </div>
      {/* Centered content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl md:text-6xl font-extrabold text-blue-900 mb-6 drop-shadow-lg">
          Welcome to Whiteboard Hub
        </h1>
        <p className="text-lg md:text-2xl text-blue-800 mb-8 max-w-xl mx-auto">
          Collaborate, create, and share your ideas visually. Start your journey by logging in or signing up!
        </p>
      </div>
    </div>
  );
};

export default LandingPage; 