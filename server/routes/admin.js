const express = require('express');
const User = require('../models/User');
const ExpertProfile = require('../models/ExpertProfile');
const Question = require('../models/Question');
const Review = require('../models/Review');
const Wallet = require('../models/Wallet');
const TransactionHistory = require('../models/TransactionHistory');
const WithdrawalRequest = require('../models/WithdrawalRequest');
const ReferralLog = require('../models/ReferralLog');
const { authenticate, adminOnly } = require('../middleware/auth');
const router = express.Router();

// Dashboard stats
router.get('/dashboard', authenticate, adminOnly, async (req, res) => {
  try {
    // User stats
    const userStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Question stats
    const questionStats = await Question.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Revenue stats (this month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const revenueStats = await Question.aggregate([
      {
        $match: {
          status: 'completed',
          'timeline.completedAt': { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$pricing.amount' },
          platformCommission: { $sum: '$pricing.platformCommission' },
          expertEarnings: { $sum: '$pricing.expertEarning' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Pending approvals
    const pendingExperts = await ExpertProfile.countDocuments({ isApproved: false });
    const pendingWithdrawals = await WithdrawalRequest.countDocuments({ status: 'pending' });
    
    // Recent activity
    const recentQuestions = await Question.find()
      .populate('client', 'firstName lastName')
      .populate('expert', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(10);
    
    const stats = {
      users: userStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      questions: questionStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      revenue: revenueStats.length > 0 ? revenueStats[0] : {
        totalRevenue: 0,
        platformCommission: 0,
        expertEarnings: 0,
        count: 0
      },
      pending: {
        experts: pendingExperts,
        withdrawals: pendingWithdrawals
      },
      recentActivity: recentQuestions
    };
    
    res.json({ stats });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
});

// User management
router.get('/users', authenticate, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search, status } = req.query;
    const skip = (page - 1) * limit;
    
    const filter = {};
    if (role) filter.role = role;
    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await User.countDocuments(filter);
    
    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Deactivate/Activate user
router.put('/users/:id/status', authenticate, adminOnly, async (req, res) => {
  try {
    const { isActive } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.isActive = isActive;
    await user.save();
    
    res.json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: { ...user.toObject(), password: undefined }
    });
  } catch (error) {
    console.error('Admin update user status error:', error);
    res.status(500).json({ message: 'Failed to update user status' });
  }
});

// Expert management
router.get('/experts', authenticate, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, category } = req.query;
    const skip = (page - 1) * limit;
    
    const filter = {};
    if (status === 'approved') filter.isApproved = true;
    if (status === 'pending') filter.isApproved = false;
    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;
    if (category) filter.category = category;
    
    const experts = await ExpertProfile.find(filter)
      .populate('user', 'firstName lastName email profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await ExpertProfile.countDocuments(filter);
    
    res.json({
      experts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin get experts error:', error);
    res.status(500).json({ message: 'Failed to fetch experts' });
  }
});

// Approve/Reject expert
router.put('/experts/:id/approval', authenticate, adminOnly, async (req, res) => {
  try {
    const { isApproved, rejectionReason } = req.body;
    
    const expert = await ExpertProfile.findById(req.params.id);
    if (!expert) {
      return res.status(404).json({ message: 'Expert not found' });
    }
    
    expert.isApproved = isApproved;
    if (!isApproved && rejectionReason) {
      expert.rejectionReason = rejectionReason;
    }
    
    await expert.save();
    
    res.json({
      message: `Expert ${isApproved ? 'approved' : 'rejected'} successfully`,
      expert
    });
  } catch (error) {
    console.error('Admin expert approval error:', error);
    res.status(500).json({ message: 'Failed to update expert approval' });
  }
});

// Feature expert
router.put('/experts/:id/feature', authenticate, adminOnly, async (req, res) => {
  try {
    const { days = 30 } = req.body;
    
    const expert = await ExpertProfile.findById(req.params.id);
    if (!expert) {
      return res.status(404).json({ message: 'Expert not found' });
    }
    
    expert.featuredUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    await expert.save();
    
    res.json({
      message: `Expert featured for ${days} days`,
      expert
    });
  } catch (error) {
    console.error('Admin feature expert error:', error);
    res.status(500).json({ message: 'Failed to feature expert' });
  }
});

// Financial overview
router.get('/finances', authenticate, adminOnly, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);
    
    const filter = { status: 'completed' };
    if (Object.keys(dateFilter).length > 0) {
      filter['timeline.completedAt'] = dateFilter;
    }
    
    // Revenue breakdown
    const revenueStats = await Question.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$pricing.amount' },
          platformCommission: { $sum: '$pricing.platformCommission' },
          expertEarnings: { $sum: '$pricing.expertEarning' },
          clientFees: { $sum: { $subtract: ['$pricing.clientCharge', '$pricing.amount'] } },
          totalQuestions: { $sum: 1 }
        }
      }
    ]);
    
    // Revenue by category
    const categoryRevenue = await Question.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'expertprofiles',
          localField: 'expert',
          foreignField: 'user',
          as: 'expertProfile'
        }
      },
      { $unwind: '$expertProfile' },
      {
        $group: {
          _id: '$expertProfile.category',
          revenue: { $sum: '$pricing.amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } }
    ]);
    
    // Monthly revenue trend
    const monthlyRevenue = await Question.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            year: { $year: '$timeline.completedAt' },
            month: { $month: '$timeline.completedAt' }
          },
          revenue: { $sum: '$pricing.amount' },
          commission: { $sum: '$pricing.platformCommission' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    // Withdrawal stats
    const withdrawalStats = await WithdrawalRequest.aggregate([
      {
        $group: {
          _id: '$status',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      revenue: revenueStats.length > 0 ? revenueStats[0] : {
        totalRevenue: 0,
        platformCommission: 0,
        expertEarnings: 0,
        clientFees: 0,
        totalQuestions: 0
      },
      categoryRevenue,
      monthlyRevenue,
      withdrawals: withdrawalStats.reduce((acc, stat) => {
        acc[stat._id] = { amount: stat.totalAmount, count: stat.count };
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Admin finances error:', error);
    res.status(500).json({ message: 'Failed to fetch financial data' });
  }
});

// Transaction history
router.get('/transactions', authenticate, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 50, type, category, userId } = req.query;
    const skip = (page - 1) * limit;
    
    const filter = {};
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (userId) filter.user = userId;
    
    const transactions = await TransactionHistory.find(filter)
      .populate('user', 'firstName lastName email')
      .populate('relatedUser', 'firstName lastName')
      .populate('relatedQuestion', 'questionText')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await TransactionHistory.countDocuments(filter);
    
    res.json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin transactions error:', error);
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
});

// Referral management
router.get('/referrals', authenticate, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (page - 1) * limit;
    
    const filter = {};
    if (status) filter.status = status;
    
    const referrals = await ReferralLog.find(filter)
      .populate('referrer', 'firstName lastName email')
      .populate('referred', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await ReferralLog.countDocuments(filter);
    
    // Referral stats
    const stats = await ReferralLog.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalCommission: { $sum: '$totalCommission' }
        }
      }
    ]);
    
    res.json({
      referrals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      stats: stats.reduce((acc, stat) => {
        acc[stat._id] = { count: stat.count, commission: stat.totalCommission };
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Admin referrals error:', error);
    res.status(500).json({ message: 'Failed to fetch referrals' });
  }
});

// System settings
router.get('/settings', authenticate, adminOnly, async (req, res) => {
  try {
    // In a real app, you'd have a Settings model
    const settings = {
      platform: {
        commissionRate: 10,
        clientFeeRate: 5,
        referralCommissionRate: 5,
        minimumWithdrawal: 300
      },
      features: {
        registrationOpen: true,
        expertApplicationsOpen: true,
        maintenanceMode: false
      }
    };
    
    res.json({ settings });
  } catch (error) {
    console.error('Admin get settings error:', error);
    res.status(500).json({ message: 'Failed to fetch settings' });
  }
});

// Update system settings
router.put('/settings', authenticate, adminOnly, async (req, res) => {
  try {
    const { settings } = req.body;
    
    // In a real app, you'd update the Settings model
    // For now, just return success
    
    res.json({
      message: 'Settings updated successfully',
      settings
    });
  } catch (error) {
    console.error('Admin update settings error:', error);
    res.status(500).json({ message: 'Failed to update settings' });
  }
});

module.exports = router;