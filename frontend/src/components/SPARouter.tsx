import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const SPARouter: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Handle direct URL access for share links
    if (location.pathname === '/join' && location.search) {
      console.log('SPARouter: Detected share link access', location.search);
      // The JoinBoard component will handle this
      return;
    }

    // Handle other direct URL access
    const storedUrl = sessionStorage.getItem('originalUrl');
    if (storedUrl) {
      console.log('SPARouter: Restoring stored URL', storedUrl);
      sessionStorage.removeItem('originalUrl');
      navigate(storedUrl, { replace: true });
    }
  }, [location, navigate]);

  return null; // This component doesn't render anything
};

export default SPARouter; 