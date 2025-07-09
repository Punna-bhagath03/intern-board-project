import './App.css';
import Whiteboard from './components/whiteboard';
import Signup from './components/signup';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './components/login';
import { useEffect } from 'react';
import React from 'react';
import FramesSection from './components/FramesSection';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

function RedirectOnStart() {
  const token = localStorage.getItem('token');
  // If token exists, redirect to /board/:id (need to get id from localStorage or backend)
  const defaultBoardId = localStorage.getItem('defaultBoardId');
  if (token && defaultBoardId) {
    return <Navigate to={`/board/${defaultBoardId}`} replace />;
  }
  return <Navigate to="/signup" replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RedirectOnStart />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/board/:id" element={
          <ProtectedRoute>
            <Whiteboard />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/signup" replace />} />
      </Routes>
    </Router>
  );
}
export default App;
