const mongoose = require('mongoose');

const BoardSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  content: {
    type: Object,
    required: true
  },
  collaborators: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      permission: { type: String, enum: ['view', 'edit'], required: true }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Board', BoardSchema);

// for board resets
const BoardArchiveSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  boardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  content: {
    type: Object,
    required: true
  }
}, { timestamps: true });

module.exports.BoardArchive = mongoose.model('BoardArchive', BoardArchiveSchema); 