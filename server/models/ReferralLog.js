const mongoose = require('mongoose');

const referralLogSchema = new mongoose.Schema({
  referrer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  referred: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['expert_signup', 'client_signup'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'completed'],
    default: 'active'
  },
  commissionRate: {
    type: Number,
    default: 5 // 5% commission
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  totalCommission: {
    type: Number,
    default: 0
  },
  expiresAt: {
    type: Date,
    required: true
  },
  lastCommissionAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
referralLogSchema.index({ referrer: 1, status: 1 });
referralLogSchema.index({ referred: 1 });
referralLogSchema.index({ expiresAt: 1 });

// Pre-save middleware to set expiry date
referralLogSchema.pre('save', function(next) {
  if (this.isNew) {
    // Set expiry to 3 months from creation
    this.expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
  }
  next();
});

// Method to calculate commission
referralLogSchema.methods.calculateCommission = function(amount) {
  return (amount * this.commissionRate) / 100;
};

// Method to add commission
referralLogSchema.methods.addCommission = async function(amount, questionId) {
  const commission = this.calculateCommission(amount);
  
  this.totalEarnings += amount;
  this.totalCommission += commission;
  this.lastCommissionAt = new Date();
  await this.save();
  
  // Add commission to referrer's wallet
  const Wallet = mongoose.model('Wallet');
  const referrerWallet = await Wallet.findOne({ user: this.referrer });
  if (referrerWallet) {
    await referrerWallet.addFunds(
      commission, 
      `Referral commission from ${this.referred}`
    );
  }
  
  // Create transaction record
  const TransactionHistory = mongoose.model('TransactionHistory');
  await TransactionHistory.create({
    user: this.referrer,
    type: 'credit',
    category: 'referral_bonus',
    amount: commission,
    description: `Referral commission (${this.commissionRate}%)`,
    relatedQuestion: questionId,
    relatedUser: this.referred,
    balanceAfter: referrerWallet.balance
  });
  
  return commission;
};

module.exports = mongoose.model('ReferralLog', referralLogSchema);