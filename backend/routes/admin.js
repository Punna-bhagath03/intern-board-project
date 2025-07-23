const express = require('express');
const User = require('../models/User');
const Board = require('../models/Board');
const mongoose = require('mongoose');
const { sendMail } = require('../utils/mailer');
const jwt = require('jsonwebtoken');
const PlanChangeRequest = require('../models/PlanChangeRequest');

// Auth middleware (copy from index.js or import if refactored)
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
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
      plan: u.plan,
      createdAt: u.createdAt,
      lastLogin: u.lastLogin,
      loginHistory: u.loginHistory || [],
      isOnline: false,
    }));
    res.json(userList);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// 2. PUT /api/admin/user/:id/promote — Set user's role to "admin"
router.put('/user/:id/promote', authenticateToken, isAdminMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: 'admin' }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User promoted to admin', user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to promote user' });
  }
});

// 3. PUT /api/admin/user/:id/demote — Set user's role to "user"
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
router.put('/user/:id/plan-role', authenticateToken, async (req, res) => {
  const { plan, role } = req.body;
  const validPlans = ['Basic', 'Pro', 'Pro+'];
  const validRoles = ['user', 'admin'];
  const update = {};
  let shouldInvalidate = false;

  try {
    // Validate user ID
    if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid user ID provided' });
    }

    // Get the requesting user
    const requestingUser = await User.findById(req.user.userId);
    if (!requestingUser) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Get the user to update
    const userToUpdate = await User.findById(req.params.id);
    if (!userToUpdate) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check permissions
    const isAdmin = requestingUser.role === 'admin';
    const isOwnUpdate = req.user.userId === req.params.id;

    // Handle role updates (admin only)
    if (role !== undefined) {
      if (!isAdmin) {
        return res.status(403).json({ message: 'Only administrators can change user roles' });
      }
      if (!validRoles.includes(role)) {
        return res.status(400).json({ message: 'Invalid role specified' });
      }
      update.role = role;
      shouldInvalidate = true;
    }

    // Handle plan updates (self or admin)
    if (plan !== undefined) {
      if (!isOwnUpdate && !isAdmin) {
        return res.status(403).json({ message: 'You can only change your own plan' });
      }
      if (!validPlans.includes(plan)) {
        return res.status(400).json({ message: 'Invalid plan specified' });
      }

      // Don't allow changing to the same plan
      if (plan === userToUpdate.plan) {
        return res.status(400).json({ message: 'User is already on this plan' });
      }

      update.plan = plan;
      shouldInvalidate = true;

      // Send email notification for plan update
      if (userToUpdate.email) {
        try {
          await sendMail({
            to: userToUpdate.email,
            subject: 'Your Plan Has Been Updated',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #3b82f6;">Plan Update Notification</h2>
                <p>Hi ${userToUpdate.username},</p>
                <p>Your plan has been updated to <strong>${plan}</strong>.</p>
                <p>You now have access to all features included in the ${plan} plan.</p>
                <p style="color: #666;">This is an automated notification. Please do not reply to this email.</p>
              </div>
            `
          });
        } catch (emailErr) {
          console.error('Failed to send plan update email:', emailErr);
          // Don't fail the request if email fails
        }
      }
    }

    // Ensure at least one update is requested
    if (Object.keys(update).length === 0) {
      return res.status(400).json({ message: 'No valid updates requested' });
    }

    // Apply the updates
    if (shouldInvalidate) {
      update.$inc = { tokenVersion: 1 };
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, select: '-password' }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'Failed to update user' });
    }

    let newToken = null;
    if (shouldInvalidate && req.user.userId === req.params.id) {
      // Issue a new JWT for the user
      newToken = jwt.sign(
        { userId: userToUpdate._id, role: userToUpdate.role, tokenVersion: userToUpdate.tokenVersion },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
    }
    res.json({
      message: 'User updated successfully',
      user: updatedUser,
      requiresReload: shouldInvalidate,
      token: newToken, // <-- include new token if applicable
    });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ 
      message: 'Failed to update user',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// USER: Submit a plan change request
router.post('/user/:id/plan-request', authenticateToken, async (req, res) => {
  const { requestedPlan } = req.body;
  const validPlans = ['Basic', 'Pro', 'Pro+'];
  if (!validPlans.includes(requestedPlan)) {
    return res.status(400).json({ message: 'Invalid plan requested' });
  }
  if (req.user.userId !== req.params.id) {
    return res.status(403).json({ message: 'You can only request a plan change for your own account' });
  }
  try {
    // Only one pending request per user
    const existing = await PlanChangeRequest.findOne({ user: req.user.userId, status: 'pending' });
    if (existing) {
      return res.status(400).json({ message: 'You already have a pending plan change request' });
    }
    const request = new PlanChangeRequest({ user: req.user.userId, requestedPlan });
    await request.save();
    res.status(201).json({ message: 'Plan change request submitted', request });
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit plan change request' });
  }
});

// ADMIN: List all pending plan change requests
router.get('/plan-requests', authenticateToken, isAdminMiddleware, async (req, res) => {
  try {
    const requests = await PlanChangeRequest.find({ status: 'pending' }).populate('user', 'username email plan');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch plan change requests' });
  }
});

// ADMIN: Approve or reject a plan change request
router.post('/plan-requests/:requestId/decision', authenticateToken, isAdminMiddleware, async (req, res) => {
  const { decision, reason } = req.body; // decision: 'approved' or 'rejected'
  if (!['approved', 'rejected'].includes(decision)) {
    return res.status(400).json({ message: 'Invalid decision' });
  }
  try {
    const request = await PlanChangeRequest.findById(req.params.requestId).populate('user');
    if (!request || request.status !== 'pending') {
      return res.status(404).json({ message: 'Plan change request not found or already processed' });
    }
    request.status = decision;
    request.reviewedAt = new Date();
    request.reviewedBy = req.user.userId;
    request.reason = reason || '';
    await request.save();
    if (decision === 'approved') {
      // Update user's plan
      request.user.plan = request.requestedPlan;
      await request.user.save();
      // Optionally notify user (email or in-app)
    }
    res.json({ message: `Request ${decision}`, request });
  } catch (err) {
    res.status(500).json({ message: 'Failed to process plan change request' });
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

// POST /api/admin/send-mail — Send a custom email via admin panel
router.post('/send-mail', authenticateToken, isAdminMiddleware, async (req, res) => {
  const { to, subject, message } = req.body;
  if (!to || !subject || !message) {
    return res.status(400).json({ message: 'to, subject, and message are required' });
  }
  // Check if the 'to' email exists in the User collection and is not null
  const user = await User.findOne({ email: to });
  if (!user || !user.email) {
    return res.status(400).json({ message: 'Recipient email does not exist in the system.' });
  }
  try {
    await sendMail({ to, subject, html: message });
    res.json({ message: 'Email sent successfully' });
  } catch (err) {
    console.error('Failed to send email:', err);
    res.status(500).json({ message: 'Failed to send email', error: err.message });
  }
});

module.exports = { router, isAdminMiddleware }; 