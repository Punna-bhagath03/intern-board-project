import React from 'react';
import { useNavigate } from 'react-router-dom';

const ContentModeration: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 text-white relative">
      {/* Back to Dashboard button */}
      <button
        className="absolute top-6 left-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow"
        onClick={() => navigate('/admin/dashboard')}
      >
        Back to Dashboard
      </button>
      <h1 className="text-4xl font-extrabold mb-4 mt-12">Content Moderation</h1>
      <p className="text-xl text-blue-200">This feature is coming soon.</p>
    </div>
  );
};

export default ContentModeration; 