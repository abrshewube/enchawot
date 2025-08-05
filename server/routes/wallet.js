const express = require('express');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/wallet/topup
// @desc    Add funds to wallet (temporary manual topup)
// @access  Private
router.post('/topup', auth, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    // For now, we'll allow manual topup
    // In production, this would integrate with payment gateway
    req.user.wallet.balance += amount;
    req.user.wallet.transactions.push({
      type: 'topup',
      amount,
      description: `Manual wallet topup of ${amount} ETB`
    });

    await req.user.save();

    res.json({
      balance: req.user.wallet.balance,
      transaction: req.user.wallet.transactions[req.user.wallet.transactions.length - 1]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/wallet/balance
// @desc    Get wallet balance
// @access  Private
router.get('/balance', auth, async (req, res) => {
  try {
    res.json({
      balance: req.user.wallet.balance
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/wallet/transactions
// @desc    Get wallet transactions
// @access  Private
router.get('/transactions', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const user = await User.findById(req.user._id)
      .populate('wallet.transactions.relatedQuestion', 'type status');

    const transactions = user.wallet.transactions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice((page - 1) * limit, page * limit);

    res.json({
      transactions,
      totalPages: Math.ceil(user.wallet.transactions.length / limit),
      currentPage: page,
      total: user.wallet.transactions.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/wallet/withdraw
// @desc    Request withdrawal (for experts)
// @access  Private
router.post('/withdraw', auth, async (req, res) => {
  try {
    const { amount, bankInfo } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    if (req.user.wallet.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // For now, we'll just record the withdrawal request
    // In production, this would integrate with payment processing
    req.user.wallet.balance -= amount;
    req.user.wallet.transactions.push({
      type: 'withdrawal',
      amount: -amount,
      description: `Withdrawal request of ${amount} ETB`
    });

    await req.user.save();

    res.json({
      message: 'Withdrawal request submitted',
      balance: req.user.wallet.balance
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;