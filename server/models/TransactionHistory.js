const mongoose = require('mongoose');

const transactionHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: true
  },
  category: {
    type: String,
    enum: [
      'question_payment',
      'expert_earning',
      'refund',
      'withdrawal',
      'deposit',
      'referral_bonus',
      'platform_commission',
      'penalty'
    ],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'ETB'
  },
  description: {
    type: String,
    required: true
  },
  relatedQuestion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  },
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  balanceAfter: {
    type: Number,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'completed'
  }
}, {
  timestamps: true
});

// Indexes
transactionHistorySchema.index({ user: 1, createdAt: -1 });
transactionHistorySchema.index({ type: 1, category: 1 });
transactionHistorySchema.index({ relatedQuestion: 1 });
transactionHistorySchema.index({ status: 1 });

module.exports = mongoose.model('TransactionHistory', transactionHistorySchema);