const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const boardRoutes = require('./routes/boardRoutes');
const User = require('./models/User.js');
const Board = require('./models/Board.js');
const Decor = require('./models/Decor');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 5001;

//  Middleware
app.use(express.json({ limit: '20mb' }));

app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-share-token'], // <-- add 'x-share-token' here
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

// Ensure uploads/avatars directory exists
const avatarsDir = path.join(__dirname, '../uploads/avatars');
if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
}

// Multer setup for avatar uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, avatarsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${req.params.id}_${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

// Ensure uploads/backgrounds directory exists
const backgroundsDir = path.join(__dirname, '../uploads/backgrounds');
if (!fs.existsSync(backgroundsDir)) {
  fs.mkdirSync(backgroundsDir, { recursive: true });
}

// Multer setup for background uploads
const backgroundStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, backgroundsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});
const backgroundUpload = multer({
  storage: backgroundStorage,
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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

// POST /api/backgrounds - upload a new background image
app.post('/api/backgrounds', backgroundUpload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  const imageUrl = `/uploads/backgrounds/${req.file.filename}`;
  res.status(201).json({ url: imageUrl });
});

// Serve static files for decor uploads
app.use('/uploads/decors', express.static(path.join(__dirname, '../uploads/decors')));

// Serve all uploads (avatars, decors, etc.)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// GET /api/users/:id - get user info (username, avatar)
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ username: user.username, avatar: user.avatar });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});

// PATCH /api/users/:id - update username, password, avatar
app.patch('/api/users/:id', upload.single('avatar'), async (req, res) => {
  const { username, password } = req.body;
  const userId = req.params.id;
  const update = {};
  if (username) {
    // Check for unique username (case-insensitive, not current user)
    const existing = await User.findOne({ username: { $regex: `^${username}$`, $options: 'i' }, _id: { $ne: userId } });
    if (existing) return res.status(409).json({ message: 'Username already exists.' });
    update.username = username;
  }
  if (password) {
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    update.password = await bcrypt.hash(password, 10);
  }
  if (req.file) {
    // Save avatar path relative to /uploads
    update.avatar = `/uploads/avatars/${req.file.filename}`;
  }
  try {
    const user = await User.findByIdAndUpdate(userId, update, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      username: user.username,
      avatar: user.avatar,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user' });
  }
});

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