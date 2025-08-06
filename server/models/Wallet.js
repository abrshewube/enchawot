const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  currency: {
    type: String,
    default: 'ETB'
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  totalWithdrawn: {
    type: Number,
    default: 0
  },
  pendingWithdrawal: {
    type: Number,
    default: 0
  },
  lastTransactionAt: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  withdrawalSettings: {
    minimumAmount: {
      type: Number,
      default: 300
    },
    bankAccount: {
      accountNumber: String,
      bankName: String,
      accountHolderName: String,
      swiftCode: String
    },
    mobileWallet: {
      phoneNumber: String,
      provider: {
        type: String,
        enum: ['telebirr', 'cbepay', 'mpesa']
      }
    }
  }
}, {
  timestamps: true
});

// Indexes
walletSchema.index({ user: 1 });
walletSchema.index({ balance: -1 });

// Method to add funds
walletSchema.methods.addFunds = async function(amount, description = 'Funds added') {
  this.balance += amount;
  this.lastTransactionAt = new Date();
  await this.save();
  
  // Create transaction record
  const TransactionHistory = mongoose.model('TransactionHistory');
  await TransactionHistory.create({
    user: this.user,
    type: 'credit',
    amount: amount,
    description: description,
    balanceAfter: this.balance
  });
  
  return this;
};

// Method to deduct funds
walletSchema.methods.deductFunds = async function(amount, description = 'Funds deducted') {
  if (this.balance < amount) {
    throw new Error('Insufficient balance');
  }
  
  this.balance -= amount;
  this.lastTransactionAt = new Date();
  await this.save();
  
  // Create transaction record
  const TransactionHistory = mongoose.model('TransactionHistory');
  await TransactionHistory.create({
    user: this.user,
    type: 'debit',
    amount: amount,
    description: description,
    balanceAfter: this.balance
  });
  
  return this;
};

// Method to check if withdrawal is possible
walletSchema.methods.canWithdraw = function(amount) {
  return this.balance >= amount && 
         amount >= this.withdrawalSettings.minimumAmount &&
         this.pendingWithdrawal === 0;
};

// Method to initiate withdrawal
walletSchema.methods.initiateWithdrawal = async function(amount) {
  if (!this.canWithdraw(amount)) {
    throw new Error('Withdrawal not possible');
  }
  
  this.pendingWithdrawal = amount;
  await this.save();
  
  // Create withdrawal request
  const WithdrawalRequest = mongoose.model('WithdrawalRequest');
  const withdrawal = await WithdrawalRequest.create({
    user: this.user,
    amount: amount,
    status: 'pending',
    requestedAt: new Date()
  });
  
  return withdrawal;
};

module.exports = mongoose.model('Wallet', walletSchema);