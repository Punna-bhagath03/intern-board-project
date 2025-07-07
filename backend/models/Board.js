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
  }
}, { timestamps: true });

module.exports = mongoose.model('Board', BoardSchema); 