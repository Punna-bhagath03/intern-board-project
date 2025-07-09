const express = require('express');
const jwt = require('jsonwebtoken');
const Board = require('../models/Board');
const { BoardArchive } = require('../models/Board');
const Decor = require('../models/Decor');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

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
  if (!name ) {
    return res.status(400).json({ message: 'Name is  required.' });
  }
  try {
    const board = new Board({
      user: req.user.userId,
      name,
      content
    });
    await board.save();
    res.status(201).json(board);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /boards/:id - get a single board by id
router.get('/boards/:id', authenticateToken, async (req, res) => {
  try {
    const board = await Board.findOne({ _id: req.params.id, user: req.user.userId });
    if (!board) return res.status(404).json({ message: 'Board not found' });
    res.json(board);
  } catch (err) {
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
    const board = await Board.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      updateFields,
      { new: true }
    );
    if (!board) return res.status(404).json({ message: 'Board not found' });
    res.json(board);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /boards/:id - delete a board if it belongs to the user
router.delete('/boards/:id', authenticateToken, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) return res.status(404).json({ error: "Board not found" });
    if (board.user.toString() !== req.user.userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    await Board.findByIdAndDelete(req.params.id);
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