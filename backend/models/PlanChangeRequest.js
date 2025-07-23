const mongoose = require('mongoose');

const PlanChangeRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requestedPlan: { type: String, enum: ['Basic', 'Pro', 'Pro+'], required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  reviewedAt: { type: Date },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reason: { type: String }
});

module.exports = mongoose.model('PlanChangeRequest', PlanChangeRequestSchema); 