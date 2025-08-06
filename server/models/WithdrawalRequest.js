const mongoose = require('mongoose');

const withdrawalRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 300
  },
  currency: {
    type: String,
    default: 'ETB'
  },
  method: {
    type: String,
    enum: ['bank_transfer', 'mobile_wallet'],
    required: true
  },
  bankDetails: {
    accountNumber: String,
    bankName: String,
    accountHolderName: String,
    swiftCode: String
  },
  mobileWalletDetails: {
    phoneNumber: String,
    provider: String
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'rejected', 'cancelled'],
    default: 'pending'
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  processedAt: {
    type: Date
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectionReason: {
    type: String
  },
  transactionId: {
    type: String
  },
  fees: {
    type: Number,
    default: 0
  },
  netAmount: {
    type: Number
  }
}, {
  timestamps: true
});

// Indexes
withdrawalRequestSchema.index({ user: 1, createdAt: -1 });
withdrawalRequestSchema.index({ status: 1, requestedAt: -1 });

// Pre-save middleware to calculate net amount
withdrawalRequestSchema.pre('save', function(next) {
  if (this.isModified('amount') || this.isModified('fees')) {
    this.netAmount = this.amount - this.fees;
  }
  next();
});

module.exports = mongoose.model('WithdrawalRequest', withdrawalRequestSchema);