import './App.css';
import Whiteboard from './components/whiteboard';
import Signup from './components/signup';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './components/login';
import React from 'react';
import FramesSection from './components/FramesSection';
import JoinBoard from './components/JoinBoard';
import LandingPage from './pages/LandingPage';
import AdminDashboard from './pages/AdminDashboard';
import UserAnalytics from './pages/UserAnalytics';
import AdminBoardView from './pages/AdminBoardView';
import Users from './pages/Users';
import UsersBoardsPanel from './pages/UsersBoardsPanel';

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const location = useLocation();
  if (!token) {
    // Use the full current path and search as the redirect param
    const redirect = location.pathname + location.search;
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirect)}`} replace />;
  }
  if (adminOnly && role !== 'admin') {
    // Not an admin, redirect to default board or 403 page
    const defaultBoardId = localStorage.getItem('defaultBoardId');
    return <Navigate to={defaultBoardId ? `/board/${defaultBoardId}` : '/board'} replace />;
  }
  return <>{children}</>;
}

function LandingOrRedirect() {
  const token = localStorage.getItem('token');
  const defaultBoardId = localStorage.getItem('defaultBoardId');
  const location = useLocation();
  // If already on an admin route, don't redirect
  if (location.pathname.startsWith('/admin')) {
    return null; // Let the admin route render
  }
  if (token) {
    return <Navigate to={defaultBoardId ? `/board/${defaultBoardId}` : '/board'} replace />;
  }
  return <LandingPage />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingOrRedirect />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/board/:id" element={
          <ProtectedRoute>
            <Whiteboard />
          </ProtectedRoute>
        } />
        <Route path="/join" element={<JoinBoard />} />
        {/* Admin routes */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute adminOnly={true}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/user/:id/analytics" element={
          <ProtectedRoute adminOnly={true}>
            <UserAnalytics />
          </ProtectedRoute>
        } />
        <Route path="/admin/board/:boardId" element={
          <ProtectedRoute adminOnly={true}>
            <AdminBoardView />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute adminOnly={true}>
            <Users />
          </ProtectedRoute>
        } />
        <Route path="/admin/users/boards" element={
          <ProtectedRoute adminOnly={true}>
            <UsersBoardsPanel />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
export default App;
