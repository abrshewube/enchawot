const express = require('express');
const User = require('../models/User');
const Referral = require('../models/Referral');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/referrals/my-referrals
// @desc    Get user's referral data
// @access  Private
router.get('/my-referrals', auth, async (req, res) => {
  try {
    const referrals = await Referral.find({ referrer: req.user._id })
      .populate('referred', 'name email createdAt')
      .sort({ createdAt: -1 });

    const totalEarnings = referrals.reduce((sum, ref) => sum + ref.totalEarnings, 0);
    const activeReferrals = referrals.filter(ref => ref.status === 'active').length;

    res.json({
      referrals,
      stats: {
        totalReferrals: referrals.length,
        activeReferrals,
        totalEarnings,
        referralCode: req.user.referralCode
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/referrals/earnings
// @desc    Get referral earnings history
// @access  Private
router.get('/earnings', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const referrals = await Referral.find({ referrer: req.user._id })
      .populate('referred', 'name')
      .populate('earnings.question', 'type status');

    let allEarnings = [];
    referrals.forEach(referral => {
      referral.earnings.forEach(earning => {
        allEarnings.push({
          ...earning.toObject(),
          referredUser: referral.referred.name
        });
      });
    });

    allEarnings.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const paginatedEarnings = allEarnings.slice((page - 1) * limit, page * limit);

    res.json({
      earnings: paginatedEarnings,
      totalPages: Math.ceil(allEarnings.length / limit),
      currentPage: page,
      total: allEarnings.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/referrals/validate-code
// @desc    Validate referral code
// @access  Public
router.post('/validate-code', async (req, res) => {
  try {
    const { code } = req.body;

    const user = await User.findOne({ referralCode: code });
    if (!user) {
      return res.status(404).json({ message: 'Invalid referral code' });
    }

    res.json({
      valid: true,
      referrer: {
        name: user.name,
        code: user.referralCode
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;