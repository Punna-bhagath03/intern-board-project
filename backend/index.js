const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const boardRoutes = require('./routes/boardRoutes');
const User = require('./models/User.js');
const Board = require('./models/Board.js');

const app = express();
const PORT = process.env.PORT || 5001;

//  Middleware
app.use(express.json());

app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.options('*', cors());

//  Health check route
app.get('/', (req, res) => {
  res.send('✅ Backend is running');
});

//  Register route
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res
      .status(400)
      .json({ message: 'Username and password are required.' });

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser)
      return res.status(409).json({ message: 'Username already exists.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();

    const defaultBoard = new Board({
      user: user._id,
      name: 'My First Board',
      content: {},
    });
    await defaultBoard.save();

    res.status(201).json({ message: 'User registered successfully.' });
  } catch (err) {
    console.error('❌ Registration error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

//  Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res
      .status(400)
      .json({ message: 'Username and password are required.' });

  try {
    const user = await User.findOne({ username });
    if (!user)
      return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    const board = await Board.findOne({ user: user._id }).sort({ createdAt: 1 });
    const defaultBoardId = board ? board._id : null;

    res.status(200).json({ token, defaultBoardId });
  } catch (err) {
    console.error(' Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Routes
app.use('/api', boardRoutes);

// MongoDB Connection
console.log('🔍 Connecting to MongoDB...');

// Check if MONGO_URL exists
if (!process.env.MONGO_URL) {
  console.error(' MONGO_URL not found in .env file!');
  process.exit(1);
}

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log(' Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(' MongoDB connection failed:\n', err);
  });