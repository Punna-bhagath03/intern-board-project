const express = require('express');
const User = require('../models/User');
const Board = require('../models/Board');
const mongoose = require('mongoose');

// Auth middleware (copy from index.js or import if refactored)
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  const jwt = require('jsonwebtoken');
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
}

// isAdmin middleware
function isAdminMiddleware(req, res, next) {
  // req.user is set by authenticateToken
  User.findById(req.user.userId).then(user => {
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  }).catch(() => res.status(500).json({ message: 'Server error' }));
}

const router = express.Router();

// 1. GET /api/admin/users — Return a list of all users (excluding passwords)
router.get('/users', authenticateToken, isAdminMiddleware, async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    // Only include relevant fields for admin dashboard
    const userList = users.map(u => ({
      _id: u._id,
      username: u.username,
      email: u.email || '',
      status: u.status || 'active',
      role: u.role,
      plan: u.plan, // <-- Add this line
      createdAt: u.createdAt,
      lastLogin: u.lastLogin,
      loginHistory: u.loginHistory || [],
      isOnline: false, // Placeholder for future session tracking
    }));
    res.json(userList);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// 2. PUT /api/admin/user/:id/promote — Set user’s role to "admin"
router.put('/user/:id/promote', authenticateToken, isAdminMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: 'admin' }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User promoted to admin', user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to promote user' });
  }
});

// 3. PUT /api/admin/user/:id/demote — Set user’s role to "user"
router.put('/user/:id/demote', authenticateToken, isAdminMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: 'user' }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User demoted to user', user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to demote user' });
  }
});

// New: PUT /api/admin/user/:id/status — Change user status
router.put('/user/:id/status', authenticateToken, isAdminMiddleware, async (req, res) => {
  const { status } = req.body;
  if (!['active', 'pending', 'suspended'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: `User status updated to ${status}`, user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user status' });
  }
});

// PUT /api/admin/user/:id/plan-role — Update user's plan and/or role
router.put('/user/:id/plan-role', authenticateToken, isAdminMiddleware, async (req, res) => {
  const { plan, role } = req.body;
  const validPlans = ['Basic', 'Pro', 'Pro+'];
  const validRoles = ['user', 'admin'];
  const update = {};
  if (plan) {
    if (!validPlans.includes(plan)) return res.status(400).json({ message: 'Invalid plan' });
    update.plan = plan;
  }
  if (role) {
    if (!validRoles.includes(role)) return res.status(400).json({ message: 'Invalid role' });
    update.role = role;
  }
  if (!plan && !role) return res.status(400).json({ message: 'No plan or role provided' });
  try {
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true, select: '-password' });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User updated', user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user', error: err.message });
  }
});

// 4. DELETE /api/admin/user/:id — Delete the user and all of their boards
router.delete('/user/:id', authenticateToken, isAdminMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await Board.deleteMany({ user: req.params.id });
    res.json({ message: 'User and boards deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

// 5. GET /api/admin/user/:id/boards — Return all boards owned by the user or where they are a collaborator
router.get('/user/:id/boards', authenticateToken, isAdminMiddleware, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    const userId = new mongoose.Types.ObjectId(req.params.id);
    console.log('Fetching boards for userId:', userId);
    const boards = await Board.find({
      $or: [
        { user: userId },
        { 'collaborators.userId': userId }
      ]
    });
    res.json(boards);
  } catch (err) {
    console.error('Error fetching boards for user:', req.params.id, err);
    res.status(500).json({ message: 'Failed to fetch boards', error: err.message, stack: err.stack });
  }
});

// GET /api/admin/user/:id/decors — Return all decors owned by the user
router.get('/user/:id/decors', authenticateToken, isAdminMiddleware, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    const Decor = require('../models/Decor');
    const userId = mongoose.Types.ObjectId(req.params.id);
    const decors = await Decor.find({ user: userId });
    res.json(decors);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch decors' });
  }
});

module.exports = { router, isAdminMiddleware }; 