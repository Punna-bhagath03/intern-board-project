const express = require('express');
const jwt = require('jsonwebtoken');
const Board = require('../models/Board');
const { BoardArchive } = require('../models/Board');
const Decor = require('../models/Decor');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const ShareLink = require('../models/ShareLink');
const crypto = require('crypto');
const { sendMail } = require('../utils/mailer');
const User = require('../models/User');

const router = express.Router();

// JWT authentication middleware
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

// GET /boards - get all boards for the authenticated user
router.get('/boards', authenticateToken, async (req, res) => {
  try {
    const boards = await Board.find({ user: req.user.userId });
    res.json(boards);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /boards/latest - get the latest board for the authenticated user
router.get('/boards/latest', authenticateToken, async (req, res) => {
  try {
    const board = await Board.findOne({ user: req.user.userId }).sort({ createdAt: -1 });
    if (!board) return res.status(404).json({ message: 'No boards found' });
    res.json(board);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /boards - create a new board
router.post('/boards', authenticateToken, async (req, res) => {
  const { name, content } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Name is required.' });
  }
  try {
    const user = await User.findById(req.user.userId);
    if (user) {
      if (user.plan === 'Basic') {
        const boardCount = await Board.countDocuments({ user: user._id });
        if (boardCount >= 2) {
          return res.status(403).json({ message: 'Basic plan users can only create up to 2 boards.' });
        }
      } else if (user.plan === 'Pro') {
        const boardCount = await Board.countDocuments({ user: user._id });
        if (boardCount >= 5) {
          return res.status(403).json({ message: 'Pro plan users can only create up to 5 boards.' });
        }
      }
    }
    const board = new Board({
      user: req.user.userId,
      name,
      content
    });
    await board.save();

    // Send email notification if user has email
    if (user && user.email) {
      try {
        await sendMail({
          to: user.email,
          subject: 'New Board Created',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #3b82f6;">New Board Created!</h2>
              <p>Hi ${user.username},</p>
              <p>A new board named <strong>${name}</strong> has been created for you.</p>
              <p>You can access your board by logging into your account.</p>
              <p style="color: #666;">This is an automated notification. Please do not reply to this email.</p>
            </div>
          `
        });
      } catch (emailErr) {
        console.error('Failed to send email notification:', emailErr);
        // Don't fail the request if email fails
      }
    }

    res.status(201).json(board);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /boards/:id - get a single board by id
router.get('/boards/:id', authenticateToken, async (req, res) => {
  try {
    const boardId = req.params.id;
    const userId = req.user.userId;
    const shareToken = req.headers['x-share-token'];
    console.log('GET /boards/:id', { boardId, userId, shareToken });
    // Try owner access
    let board = await Board.findOne({ _id: boardId, user: userId });
    if (board) {
      console.log('Access: owner', { boardId, userId });
      return res.json(board);
    }
    // Try collaborator access
    board = await Board.findOne({ _id: boardId, 'collaborators.userId': userId });
    if (board) {
      console.log('Access: collaborator', { boardId, userId });
      return res.json(board);
    }
    // Try share token access
    if (shareToken) {
      const ShareLink = require('../models/ShareLink');
      const shareLink = await ShareLink.findOne({ token: shareToken, boardId });
      console.log('ShareLink found:', !!shareLink, shareLink);
      if (shareLink && shareLink.expiresAt > new Date()) {
        board = await Board.findById(boardId);
        if (board) {
          // If permission is 'edit' and user is logged in, add as collaborator if not already
          if (shareLink.permission === 'edit' && userId) {
            const alreadyCollaborator = board.collaborators.some(
              (c) => c.userId.toString() === userId
            );
            if (!alreadyCollaborator) {
              board.collaborators.push({ userId, permission: 'edit' });
              await board.save();
              console.log('Added as collaborator', { boardId, userId });
            }
          }
          console.log('Access: share token', { boardId, userId });
          return res.json(board);
        }
      }
    }
    console.log('Access denied', { boardId, userId, shareToken });
    return res.status(404).json({ message: 'Board not found' });
  } catch (err) {
    console.error('Error in /api/boards/:id', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /boards/:id - update board content
router.put('/boards/:id', authenticateToken, async (req, res) => {
  const { content, name } = req.body;
  if (!content && !name) {
    return res.status(400).json({ message: 'Content or name is required.' });
  }
  try {
    const updateFields = {};
    if (content) updateFields.content = content;
    if (name) updateFields.name = name;
    // Allow owner or collaborator with edit permission
    const board = await Board.findOneAndUpdate(
      {
        _id: req.params.id,
        $or: [
          { user: req.user.userId },
          { 'collaborators.userId': req.user.userId, 'collaborators.permission': 'edit' }
        ]
      },
      updateFields,
      { new: true }
    );
    if (!board) return res.status(404).json({ message: 'Board not found' });
    res.json(board);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /boards/:id - delete a board
router.delete('/boards/:id', authenticateToken, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) return res.status(404).json({ error: "Board not found" });

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Allow if owner or admin
    if (board.user.toString() !== req.user.userId && (!user || user.role !== 'admin')) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Get board owner's info for notification
    const boardOwner = await User.findById(board.user);
    
    await Board.findByIdAndDelete(req.params.id);

    // Send email notification to board owner
    if (boardOwner && boardOwner.email) {
      try {
        await sendMail({
          to: boardOwner.email,
          subject: 'Board Deleted',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #ef4444;">Board Deleted</h2>
              <p>Hi ${boardOwner.username},</p>
              <p>Your board <strong>${board.name}</strong> has been deleted.</p>
              ${user._id.toString() !== board.user.toString() ? 
                `<p>This action was performed by an administrator.</p>` : 
                ''
              }
              <p style="color: #666;">This is an automated notification. Please do not reply to this email.</p>
            </div>
          `
        });
      } catch (emailErr) {
        console.error('Failed to send email notification:', emailErr);
        // Don't fail the request if email fails
      }
    }

    res.status(200).json({ message: "Board deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// POST /boards/:id/archive - archive the current state of a board
router.post('/boards/:id/archive', authenticateToken, async (req, res) => {
  try {
    const board = await Board.findOne({ _id: req.params.id, user: req.user.userId });
    if (!board) return res.status(404).json({ message: 'Board not found' });
    // Create archive
    const archive = new BoardArchive({
      user: req.user.userId,
      boardId: board._id,
      name: board.name,
      content: board.content
    });
    await archive.save();
    res.status(201).json({ message: 'Board archived' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * POST /boards/:boardId/share
 * Auth required. Body: { permission: 'view' | 'edit', expiresIn: number, expiresUnit: 'minutes' | 'hours' | 'days' }
 * Generates a secure, random token, creates a ShareLink, returns the link.
 */
router.post('/boards/:boardId/share', authenticateToken, async (req, res) => {
  const { permission, expiresIn, expiresUnit } = req.body;
  const { boardId } = req.params;
  if (!['view', 'edit'].includes(permission)) {
    return res.status(400).json({ message: 'Invalid permission' });
  }
  if (!expiresIn || !['minutes', 'hours', 'days'].includes(expiresUnit)) {
    return res.status(400).json({ message: 'Invalid expiry' });
  }
  // Check board ownership or edit rights
  const board = await Board.findById(boardId);
  if (!board) return res.status(404).json({ message: 'Board not found' });
  if (board.user.toString() !== req.user.userId) {
    return res.status(403).json({ message: 'Only the board owner can create share links' });
  }
  // Calculate expiry
  let ms = expiresIn * 60000; // default minutes
  if (expiresUnit === 'hours') ms = expiresIn * 60 * 60000;
  if (expiresUnit === 'days') ms = expiresIn * 24 * 60 * 60000;
  const expiresAt = new Date(Date.now() + ms);
  // Generate secure token
  const token = crypto.randomBytes(32).toString('hex');
  // Save share link
  const shareLink = new ShareLink({
    token,
    boardId,
    permission,
    createdBy: req.user.userId,
    expiresAt,
  });
  await shareLink.save();
  res.status(201).json({
    link: `${req.protocol}://${req.get('host')}/api/share/${token}`,
    token,
    expiresAt,
    permission,
  });
});

/**
 * GET /share/:token
 * No auth required. Returns board info if token is valid and not expired, with permission.
 */
router.get('/share/:token', async (req, res) => {
  const { token } = req.params;
  const shareLink = await ShareLink.findOne({ token });
  if (!shareLink) return res.status(404).json({ message: 'Invalid or expired link' });
  if (shareLink.expiresAt < new Date()) {
    await ShareLink.deleteOne({ _id: shareLink._id }); // Clean up expired
    return res.status(410).json({ message: 'Link expired' });
  }
  // Return board info and permission
  const board = await Board.findById(shareLink.boardId);
  if (!board) return res.status(404).json({ message: 'Board not found' });
  res.json({
    boardId: board._id,
    name: board.name,
    content: board.content,
    permission: shareLink.permission,
    expiresAt: shareLink.expiresAt,
  });
});

/**
 * DELETE /share/:token
 * Auth required (must be creator or board owner). Revokes (deletes) the share link.
 */
router.delete('/share/:token', authenticateToken, async (req, res) => {
  const { token } = req.params;
  const shareLink = await ShareLink.findOne({ token });
  if (!shareLink) return res.status(404).json({ message: 'Link not found' });
  // Only creator or board owner can delete
  const board = await Board.findById(shareLink.boardId);
  if (!board) return res.status(404).json({ message: 'Board not found' });
  if (
    shareLink.createdBy.toString() !== req.user.userId &&
    board.user.toString() !== req.user.userId
  ) {
    return res.status(403).json({ message: 'Not authorized to revoke this link' });
  }
  await ShareLink.deleteOne({ _id: shareLink._id });
  res.json({ message: 'Share link revoked' });
});

// Multer setup for decor uploads
const decorStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads/decors');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const decorUpload = multer({
  storage: decorStorage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/webp' ||
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/jpg'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only PNG, WebP, and JPEG images are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

// GET /api/decors - get all decors for the authenticated user
router.get('/decors', authenticateToken, async (req, res) => {
  try {
    const decors = await Decor.find({ user: req.user.userId });
    res.json(decors);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/decors - upload a new decor image
router.post('/decors', authenticateToken, decorUpload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  try {
    // Enforce decor limit for Basic users
    const User = require('../models/User');
    const user = await User.findById(req.user.userId);
    if (user && user.plan === 'Basic') {
      const decorCount = await Decor.countDocuments({ user: user._id });
      if (decorCount >= 2) {
        return res.status(403).json({ message: 'Basic plan users can only upload up to 2 decor items.' });
      }
    }
    const imageUrl = `/uploads/decors/${req.file.filename}`;
    const decor = new Decor({
      user: req.user.userId,
      imageUrl,
      originalFilename: req.file.originalname
    });
    await decor.save();
    res.status(201).json(decor);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/decors/:id - delete a decor image
router.delete('/decors/:id', authenticateToken, async (req, res) => {
  try {
    const decor = await Decor.findOne({ _id: req.params.id, user: req.user.userId });
    if (!decor) return res.status(404).json({ message: 'Decor not found' });
    // Remove file from disk
    const filePath = path.join(__dirname, '../../', decor.imageUrl);
    fs.unlink(filePath, (err) => {
      // Ignore file not found errors
    });
    await decor.deleteOne();
    res.status(200).json({ message: 'Decor deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 