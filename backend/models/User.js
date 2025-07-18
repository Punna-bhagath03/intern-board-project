const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String, // URL or path to avatar image
    default: '',
  },
  email: {
    type: String,
    unique: true,
    // required: true, // Make email optional for old users
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'suspended'],
    default: 'active',
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  plan: {
    type: String,
    enum: ['Basic', 'Pro', 'Pro+'],
    default: 'Basic',
  },
  lastLogin: {
    type: Date,
    default: null,
  },
  loginHistory: [
    {
      date: { type: Date, default: Date.now },
      ip: { type: String },
      userAgent: { type: String },
    }
  ],
  tokenVersion: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
