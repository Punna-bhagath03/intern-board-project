const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// Load .env from project if present
require('dotenv').config();
// Additionally load global env from ~/.intern-board.env if available (used in EC2 PM2)
try {
  const fs = require('fs');
  const path = require('path');
  const os = require('os');
  const homeEnvPath = path.join(os.homedir(), '.intern-board.env');
  if (fs.existsSync(homeEnvPath)) {
    require('dotenv').config({ path: homeEnvPath, override: true });
  }
} catch (e) {
  console.warn('Could not load ~/.intern-board.env:', e?.message);
}

const boardRoutes = require('./routes/boardRoutes');
const { router: adminRouter } = require('./routes/admin');
const User = require('./models/User.js');
const Board = require('./models/Board.js');
const Decor = require('./models/Decor');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { sendMail } = require('./utils/mailer');

const app = express();
const PORT = process.env.PORT || 5001;

// Check required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(
    '❌ Missing required environment variables:',
    missingEnvVars.join(', ')
  );
  process.exit(1);
}

// MongoDB connection options
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

// Connect to MongoDB and start server after successful connection
console.log('🔍 Connecting to MongoDB...');
mongoose
  .connect(process.env.MONGODB_URI, mongoOptions)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Access via http://localhost:${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Basic middleware
app.use(express.json({ limit: '20mb' }));
app.use(compression());

// CORS and security middleware setup
const allowedOrigins = [
  process.env.CORS_ORIGIN,
  'http://intern-board-frontend.s3-website.eu-north-1.amazonaws.com',
  'https://intern-board-frontend.s3-website.eu-north-1.amazonaws.com',
  'http://localhost:5173',
].filter(Boolean);

app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('CORS Error'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-share-token'],
    credentials: true,
    optionsSuccessStatus: 200,
    preflightContinue: false,
  })
);

// Note: Global error handler is defined near the end of this file

// Note: CORS preflight is handled by the cors middleware above

//  Middleware
app.use(express.json({ limit: '20mb' }));
app.use(compression());
// Only enable rate limiting in production
if (process.env.NODE_ENV === 'production') {
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );
}

//  Health check route
app.get('/', (req, res) => {
  res.send('✅ Backend is running');
});
// Standard health endpoint for load balancers/monitors
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

//  Register route
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password)
    return res
      .status(400)
      .json({ message: 'Username, email, and password are required.' });

  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser)
      return res
        .status(409)
        .json({ message: 'Username or email already exists.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    // Set role to 'admin' for username 'bhagath', else default
    const role = username === 'bhagath' ? 'admin' : 'user';
    const user = new User({ username, email, password: hashedPassword, role });
    await user.save();

    const defaultBoard = new Board({
      user: user._id,
      name: 'My First Board',
      content: {},
    });
    await defaultBoard.save();

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully.',
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      defaultBoardId: defaultBoard._id,
    });
  } catch (err) {
    console.error('❌ Registration error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

//  Login route
app.post('/login', async (req, res) => {
  const { username, email, password } = req.body;

  if ((!username && !email) || !password)
    return res
      .status(400)
      .json({ message: 'Username or email and password are required.' });

  try {
    const user = await User.findOne(email ? { email } : { username });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    // If bhagath logs in and is not admin, update role to admin
    if (
      (username === 'bhagath' || user.username === 'bhagath') &&
      user.role !== 'admin'
    ) {
      user.role = 'admin';
      await user.save();
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid credentials' });

    // Record last login and login history
    const loginDate = new Date();
    const ip =
      req.headers['x-forwarded-for'] || req.connection.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';

    user.lastLogin = loginDate;
    user.loginHistory = user.loginHistory || [];
    user.loginHistory.push({
      date: loginDate,
      ip,
      userAgent,
    });
    // Optionally limit history length
    if (user.loginHistory.length > 20)
      user.loginHistory = user.loginHistory.slice(-20);
    await user.save();

    // Send login notification email if user has email
    if (user.email) {
      try {
        await sendMail({
          to: user.email,
          subject: 'New Login Detected',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #3b82f6;">New Login Detected</h2>
              <p>Hi ${user.username},</p>
              <p>A new login was detected on your account.</p>
              <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p style="margin: 5px 0;"><strong>Time:</strong> ${loginDate.toLocaleString()}</p>
                <p style="margin: 5px 0;"><strong>IP Address:</strong> ${ip}</p>
                <p style="margin: 5px 0;"><strong>Device:</strong> ${userAgent}</p>
              </div>
              <p>If this wasn't you, please change your password immediately.</p>
              <p style="color: #666;">This is an automated notification. Please do not reply to this email.</p>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error('Failed to send login notification email:', emailErr);
        // Don't fail the login if email fails
      }
    }

    const token = jwt.sign(
      { userId: user._id, tokenVersion: user.tokenVersion || 0 },
      process.env.JWT_SECRET,
      {
        expiresIn: '1d',
      }
    );

    const board = await Board.findOne({ user: user._id }).sort({
      createdAt: 1,
    });
    const defaultBoardId = board ? board._id : null;

    res.status(200).json({
      token,
      defaultBoardId,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        status: user.status,
      },
    });
  } catch (err) {
    console.error(' Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Auth middleware for /api/users/me
async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
      if (err) {
        console.error('JWT verification error:', err);
        return res.status(403).json({ message: 'Invalid token' });
      }

      try {
        // Check tokenVersion
        const user = await User.findById(payload.userId);
        if (!user) return res.status(401).json({ message: 'User not found' });
        if ((user.tokenVersion || 0) !== (payload.tokenVersion || 0)) {
          return res
            .status(401)
            .json({ message: 'Session expired, please log in again.' });
        }
        req.user = payload;
        next();
      } catch (dbErr) {
        console.error('Database error in auth middleware:', dbErr);
        return res.status(500).json({ message: 'Authentication error' });
      }
    });
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({ message: 'Authentication error' });
  }
}

// GET /api/users/me - get current user info (username, avatar, role, plan)
app.get('/api/users/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      _id: user._id,
      username: user.username,
      avatar: user.avatar,
      role: user.role,
      plan: user.plan,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});

// Routes
app.use('/api', boardRoutes);
app.use('/api/admin', adminRouter);

// All file uploads are now handled through S3

// Multer setup for background uploads
const { uploadToS3, getBucketForFileType } = require('./utils/s3');

const storage = multer.memoryStorage();
const backgroundUpload = multer({
  storage: storage,
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
app.post(
  '/api/backgrounds',
  authenticateToken,
  backgroundUpload.single('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const filename = `${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}${path.extname(req.file.originalname)}`;
      const s3Url = await uploadToS3(
        req.file.buffer,
        filename,
        getBucketForFileType('background'),
        req.file.mimetype
      );

      res.status(201).json({ url: s3Url });
    } catch (error) {
      console.error('Background upload error:', error);
      res.status(500).json({ message: 'Failed to upload background' });
    }
  }
);

// Multer for avatar uploads
const avatarUpload = multer({
  storage: storage,
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
  limits: { fileSize: 3 * 1024 * 1024 },
});

// POST /api/avatars - upload avatar image to S3 and return URL
app.post('/api/avatars', authenticateToken, avatarUpload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(
      req.file.originalname
    )}`;
    const s3Url = await uploadToS3(
      req.file.buffer,
      filename,
      getBucketForFileType('avatar'),
      req.file.mimetype
    );
    return res.status(201).json({ url: s3Url });
  } catch (error) {
    console.error('Avatar upload error:', error);
    return res.status(500).json({ message: 'Failed to upload avatar' });
  }
});

// All uploads are now handled through S3

// Explicit OPTIONS handler for /uploads/*
app.options('/uploads/*', (req, res) => {
  res.setHeader(
    'Access-Control-Allow-Origin',
    process.env.CLIENT_ORIGIN || 'http://localhost:5173'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.sendStatus(204);
});

// GET /api/users/:id - get user info (username, avatar)
app.get('/api/users/:id', async (req, res) => {
  try {
    // Validate ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ username: user.username, avatar: user.avatar });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});

// PATCH /api/users/:id - update username, password, email, avatar
app.patch('/api/users/:id', authenticateToken, async (req, res) => {
  const { username, password, email } = req.body;
  const userId = req.params.id;
  const update = {};

  try {
    // Only allow self-update or admin
    const isSelf = req.user.userId === userId;
    let isAdmin = false;
    if (!isSelf) {
      const requestingUser = await User.findById(req.user.userId);
      isAdmin = requestingUser && requestingUser.role === 'admin';
      if (!isAdmin) {
        return res.status(403).json({ message: 'Not authorized to update this user' });
      }
    }
  } catch (authErr) {
    return res.status(500).json({ message: 'Authorization check failed' });
  }

  if (username) {
    // Check for unique username (case-insensitive, not current user)
    const existing = await User.findOne({
      username: { $regex: `^${username}$`, $options: 'i' },
      _id: { $ne: userId },
    });
    if (existing)
      return res.status(409).json({ message: 'Username already exists.' });
    update.username = username;
  }

  if (email) {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format.' });
    }
    // Check for unique email (case-insensitive, not current user)
    const existing = await User.findOne({
      email: { $regex: `^${email}$`, $options: 'i' },
      _id: { $ne: userId },
    });
    if (existing)
      return res.status(409).json({ message: 'Email already exists.' });
    update.email = email;
  }

  if (password) {
    if (password.length < 6)
      return res
        .status(400)
        .json({ message: 'Password must be at least 6 characters.' });
    update.password = await bcrypt.hash(password, 10);
  }

  if (req.body.avatarUrl) {
    update.avatar = req.body.avatarUrl;
  } else if (req.body.avatar) {
    // Store base64 data directly in the database
    update.avatar = req.body.avatar;
  } else if (req.body.removeAvatar === 'true') {
    // Remove avatar (set to empty string for default)
    update.avatar = '';
  }

  try {
    const user = await User.findByIdAndUpdate(userId, update, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      username: user.username,
      email: user.email,
      avatar: user.avatar,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user' });
  }
});

// PUT /api/users/:id/plan - Update user's own plan
app.put('/api/users/:id/plan', authenticateToken, async (req, res) => {
  const { plan } = req.body;
  const userId = req.params.id;

  // Verify user is updating their own plan
  if (userId !== req.user.userId) {
    return res
      .status(403)
      .json({ message: 'You can only update your own plan' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate plan
    const validPlans = ['Basic', 'Pro', 'Pro+'];
    if (!validPlans.includes(plan)) {
      return res.status(400).json({ message: 'Invalid plan' });
    }

    // Update plan
    user.plan = plan;
    await user.save();

    // Send email notification
    if (user.email) {
      try {
        await sendMail({
          to: user.email,
          subject: 'Your Plan Has Been Updated',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #3b82f6;">Plan Update Notification</h2>
              <p>Hi ${user.username},</p>
              <p>Your plan has been updated to <strong>${plan}</strong>.</p>
              <p>You now have access to all features included in the ${plan} plan.</p>
              <p style="color: #666;">This is an automated notification. Please do not reply to this email.</p>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error('Failed to send plan update email:', emailErr);
      }
    }

    res.json({
      message: 'Plan updated successfully',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        plan: user.plan,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Error updating plan:', err);
    res.status(500).json({ message: 'Failed to update plan' });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Note: MongoDB connection and server start are handled at the top of this file
