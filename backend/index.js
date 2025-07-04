const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// 👇 Your Mongoose User model
const User = require('./models/User.js');

// ✅ Middleware
app.use(express.json());

app.use(
  cors({
    origin: 'http://localhost:5173', // your React frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ✅ Handle preflight requests manually
app.options('*', cors());

// ✅ Health check route
app.get('/', (req, res) => {
  res.send('Backend is running ✅');
});

// ✅ Register route
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: 'Username and password are required.' });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: 'User registered successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

//mongo connection
mongoose
  .connect(process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/intern-board', {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(' MongoDB connection failed:', err);
  });
