import './App.css';
import Whiteboard from './components/whiteboard';
import Signup from './components/signup';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './components/login';
import React, { useEffect, useState, useRef } from 'react';
import FramesSection from './components/FramesSection';
import JoinBoard from './components/JoinBoard';
import LandingPage from './pages/LandingPage';
import AdminDashboard from './pages/AdminDashboard';
import UserAnalytics from './pages/UserAnalytics';
import AdminBoardView from './pages/AdminBoardView';
import Users from './pages/Users';
import UsersBoardsPanel from './pages/UsersBoardsPanel';
import PlansRoles from './pages/PlansRoles';
import api from './api';
import { useNotification } from './NotificationContext';
import BoardRedirector from './components/BoardRedirector';

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
  const token = localStorage.getItem('token');
  const location = useLocation();
  const [checked, setChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const { showNotification } = useNotification();
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const hasRedirected = useRef(false);

  useEffect(() => {
    let ignore = false;
    if (!token) {
      setChecked(true);
      setIsAdmin(null);
      return;
    }
    if (adminOnly) {
      api.get('/api/users/me')
        .then(res => {
          if (!ignore) {
            setIsAdmin(res.data.role === 'admin');
            setChecked(true);
          }
        })
        .catch(() => {
          if (!ignore) {
            setIsAdmin(false);
            setChecked(true);
          }
        });
    } else {
      setChecked(true);
      setIsAdmin(null);
    }
    return () => { ignore = true; };
  }, [token, adminOnly, location.pathname]);

  useEffect(() => {
    if (
      adminOnly &&
      checked &&
      isAdmin === false &&
      !hasRedirected.current
    ) {
      hasRedirected.current = true;
      showNotification('You no longer have admin access. Redirected to your boards.', 'error');
      const defaultBoardId = localStorage.getItem('defaultBoardId');
      setRedirectPath(defaultBoardId ? `/board/${defaultBoardId}` : '/board');
    }
  }, [adminOnly, checked, isAdmin, showNotification]);

  if (!token) {
    const redirect = location.pathname + location.search;
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirect)}`} replace />;
  }
  if (adminOnly) {
    if (!checked) return null; // or a spinner
    if (redirectPath) {
      return <Navigate to={redirectPath} replace />;
    }
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
        <Route path="/board" element={<ProtectedRoute><BoardRedirector /></ProtectedRoute>} />
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
        <Route path="/admin/plans-roles" element={
          <ProtectedRoute adminOnly={true}>
            <PlansRoles />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
export default App;
