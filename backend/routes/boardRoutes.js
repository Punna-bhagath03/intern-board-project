const express = require('express');
const jwt = require('jsonwebtoken');
const Board = require('../models/Board');
const { BoardArchive } = require('../models/Board');

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

module.exports = router; 