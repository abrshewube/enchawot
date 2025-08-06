const express = require('express');
const Wallet = require('../models/Wallet');
const TransactionHistory = require('../models/TransactionHistory');
const WithdrawalRequest = require('../models/WithdrawalRequest');
const { authenticate, adminOnly } = require('../middleware/auth');
const walletService = require('../services/walletService');
const router = express.Router();

// Get wallet balance and info
router.get('/', authenticate, async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ user: req.user._id });
    
    if (!wallet) {
      wallet = await walletService.initializeWallet(req.user._id);
    }
    
    res.json({ wallet });
  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({ message: 'Failed to fetch wallet' });
  }
});

// Get transaction history
router.get('/transactions', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20, category, type } = req.query;
    
    const filter = { user: req.user._id };
    if (category) filter.category = category;
    if (type) filter.type = type;
    
    const result = await walletService.getTransactionHistory(req.user._id, parseInt(page), parseInt(limit));
    
    res.json(result);
  } catch (error) {
    console.error('Get transaction history error:', error);
    res.status(500).json({ message: 'Failed to fetch transaction history' });
  }
});

// Add funds (for testing or admin)
router.post('/add-funds', authenticate, async (req, res) => {
  try {
    const { amount, description = 'Funds added' } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }
    
    // In production, this would be protected and only available through payment gateway
    // For now, allowing users to add funds for testing
    const wallet = await walletService.addFunds(req.user._id, amount, description);
    
    res.json({
      message: 'Funds added successfully',
      balance: wallet.balance
    });
  } catch (error) {
    console.error('Add funds error:', error);
    res.status(500).json({ message: 'Failed to add funds' });
  }
});

// Update withdrawal settings
router.put('/withdrawal-settings', authenticate, async (req, res) => {
  try {
    const { bankAccount, mobileWallet, minimumAmount } = req.body;
    
    const wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }
    
    if (bankAccount) {
      wallet.withdrawalSettings.bankAccount = bankAccount;
    }
    
    if (mobileWallet) {
      wallet.withdrawalSettings.mobileWallet = mobileWallet;
    }
    
    if (minimumAmount && minimumAmount >= 300) {
      wallet.withdrawalSettings.minimumAmount = minimumAmount;
    }
    
    await wallet.save();
    
    res.json({
      message: 'Withdrawal settings updated successfully',
      withdrawalSettings: wallet.withdrawalSettings
    });
  } catch (error) {
    console.error('Update withdrawal settings error:', error);
    res.status(500).json({ message: 'Failed to update withdrawal settings' });
  }
});

// Request withdrawal
router.post('/withdraw', authenticate, async (req, res) => {
  try {
    const { amount, method, bankDetails, mobileWalletDetails } = req.body;
    
    if (!amount || amount < 300) {
      return res.status(400).json({ message: 'Minimum withdrawal amount is 300 ETB' });
    }
    
    if (!method || !['bank_transfer', 'mobile_wallet'].includes(method)) {
      return res.status(400).json({ message: 'Invalid withdrawal method' });
    }
    
    const wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }
    
    if (!wallet.canWithdraw(amount)) {
      return res.status(400).json({ 
        message: 'Withdrawal not possible',
        reasons: {
          insufficientBalance: wallet.balance < amount,
          belowMinimum: amount < wallet.withdrawalSettings.minimumAmount,
          pendingWithdrawal: wallet.pendingWithdrawal > 0
        }
      });
    }
    
    // Create withdrawal request
    const withdrawalData = {
      user: req.user._id,
      amount,
      method
    };
    
    if (method === 'bank_transfer' && bankDetails) {
      withdrawalData.bankDetails = bankDetails;
    } else if (method === 'mobile_wallet' && mobileWalletDetails) {
      withdrawalData.mobileWalletDetails = mobileWalletDetails;
    }
    
    const withdrawal = await WithdrawalRequest.create(withdrawalData);
    
    // Update wallet pending withdrawal
    wallet.pendingWithdrawal = amount;
    await wallet.save();
    
    res.json({
      message: 'Withdrawal request submitted successfully',
      withdrawal
    });
  } catch (error) {
    console.error('Request withdrawal error:', error);
    res.status(500).json({ message: 'Failed to request withdrawal' });
  }
});

// Get withdrawal requests
router.get('/withdrawals', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;
    
    const filter = { user: req.user._id };
    if (status) filter.status = status;
    
    const withdrawals = await WithdrawalRequest.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await WithdrawalRequest.countDocuments(filter);
    
    res.json({
      withdrawals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get withdrawals error:', error);
    res.status(500).json({ message: 'Failed to fetch withdrawals' });
  }
});

// Cancel withdrawal request
router.post('/withdrawals/:id/cancel', authenticate, async (req, res) => {
  try {
    const withdrawal = await WithdrawalRequest.findOne({
      _id: req.params.id,
      user: req.user._id,
      status: 'pending'
    });
    
    if (!withdrawal) {
      return res.status(404).json({ message: 'Withdrawal request not found or cannot be cancelled' });
    }
    
    withdrawal.status = 'cancelled';
    await withdrawal.save();
    
    // Reset pending withdrawal in wallet
    const wallet = await Wallet.findOne({ user: req.user._id });
    if (wallet) {
      wallet.pendingWithdrawal = 0;
      await wallet.save();
    }
    
    res.json({ message: 'Withdrawal request cancelled successfully' });
  } catch (error) {
    console.error('Cancel withdrawal error:', error);
    res.status(500).json({ message: 'Failed to cancel withdrawal' });
  }
});

// Admin: Get all withdrawal requests
router.get('/admin/withdrawals', authenticate, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (page - 1) * limit;
    
    const filter = {};
    if (status) filter.status = status;
    
    const withdrawals = await WithdrawalRequest.find(filter)
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await WithdrawalRequest.countDocuments(filter);
    
    res.json({
      withdrawals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin get withdrawals error:', error);
    res.status(500).json({ message: 'Failed to fetch withdrawals' });
  }
});

// Admin: Process withdrawal
router.post('/admin/withdrawals/:id/process', authenticate, adminOnly, async (req, res) => {
  try {
    const { status, transactionId, rejectionReason, fees = 0 } = req.body;
    
    if (!['completed', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const withdrawal = await WithdrawalRequest.findById(req.params.id)
      .populate('user');
    
    if (!withdrawal) {
      return res.status(404).json({ message: 'Withdrawal request not found' });
    }
    
    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ message: 'Withdrawal already processed' });
    }
    
    withdrawal.status = status;
    withdrawal.processedAt = new Date();
    withdrawal.processedBy = req.user._id;
    withdrawal.fees = fees;
    
    if (status === 'completed') {
      withdrawal.transactionId = transactionId;
      
      // Deduct from user's wallet
      const wallet = await Wallet.findOne({ user: withdrawal.user._id });
      if (wallet) {
        await wallet.deductFunds(withdrawal.amount, `Withdrawal processed - ${transactionId}`);
        wallet.pendingWithdrawal = 0;
        wallet.totalWithdrawn += withdrawal.amount;
        await wallet.save();
      }
    } else if (status === 'rejected') {
      withdrawal.rejectionReason = rejectionReason;
      
      // Reset pending withdrawal
      const wallet = await Wallet.findOne({ user: withdrawal.user._id });
      if (wallet) {
        wallet.pendingWithdrawal = 0;
        await wallet.save();
      }
    }
    
    await withdrawal.save();
    
    res.json({
      message: `Withdrawal ${status} successfully`,
      withdrawal
    });
  } catch (error) {
    console.error('Process withdrawal error:', error);
    res.status(500).json({ message: 'Failed to process withdrawal' });
  }
});

module.exports = router;