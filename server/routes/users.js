const express = require('express');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const { firebaseService, upload } = require('../services/firebaseService');
const router = express.Router();

// Get current user profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', authenticate, upload.single('profileImage'), async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phoneNumber,
      dateOfBirth,
      location
    } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update basic info
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (dateOfBirth) user.dateOfBirth = new Date(dateOfBirth);
    if (location) user.location = JSON.parse(location);
    
    // Handle profile image upload
    if (req.file) {
      try {
        // Delete old profile image if exists
        if (user.profileImage) {
          // Extract public ID from URL and delete
          const publicId = user.profileImage.split('/').pop().split('.')[0];
          await firebaseService.deleteFile(publicId);
        }
        
        const uploadResult = await firebaseService.uploadFile(req.file, 'profiles');
        user.profileImage = uploadResult.url;
      } catch (uploadError) {
        return res.status(400).json({ message: 'Profile image upload failed', error: uploadError.message });
      }
    }
    
    await user.save();
    
    // Return user without password
    const updatedUser = await User.findById(user._id).select('-password');
    
    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Change password
router.put('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify current password
    const isValidPassword = await user.comparePassword(currentPassword);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Failed to change password' });
  }
});

// Get user notifications
router.get('/notifications', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    // In a real app, you'd have a Notification model
    // For now, return empty array
    res.json({
      notifications: [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: 0,
        pages: 0
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', authenticate, async (req, res) => {
  try {
    // Implementation would depend on your notification system
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
});

// Get user stats (for dashboard)
router.get('/stats', authenticate, async (req, res) => {
  try {
    const Question = require('../models/Question');
    const Review = require('../models/Review');
    const Wallet = require('../models/Wallet');
    
    let stats = {};
    
    if (req.user.role === 'client') {
      // Client stats
      const questionStats = await Question.aggregate([
        { $match: { client: req.user._id } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);
      
      const totalSpent = await Question.aggregate([
        { 
          $match: { 
            client: req.user._id, 
            status: { $in: ['completed', 'pending', 'accepted'] }
          } 
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$pricing.clientCharge' }
          }
        }
      ]);
      
      stats = {
        questions: questionStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {}),
        totalSpent: totalSpent.length > 0 ? totalSpent[0].total : 0
      };
    } else if (req.user.role === 'expert') {
      // Expert stats
      const ExpertProfile = require('../models/ExpertProfile');
      const profile = await ExpertProfile.findOne({ user: req.user._id });
      
      if (profile) {
        stats = {
          profile: profile.stats,
          totalEarnings: 0 // Would be calculated from wallet
        };
      }
    }
    
    // Get wallet info
    const wallet = await Wallet.findOne({ user: req.user._id });
    if (wallet) {
      stats.wallet = {
        balance: wallet.balance,
        totalEarnings: wallet.totalEarnings,
        totalWithdrawn: wallet.totalWithdrawn
      };
    }
    
    res.json({ stats });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Failed to fetch user stats' });
  }
});

// Delete account
router.delete('/account', authenticate, async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ message: 'Password is required to delete account' });
    }
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Incorrect password' });
    }
    
    // Check for pending questions or withdrawals
    const Question = require('../models/Question');
    const WithdrawalRequest = require('../models/WithdrawalRequest');
    
    const pendingQuestions = await Question.countDocuments({
      $or: [
        { client: req.user._id, status: { $in: ['pending', 'accepted'] } },
        { expert: req.user._id, status: { $in: ['pending', 'accepted'] } }
      ]
    });
    
    const pendingWithdrawals = await WithdrawalRequest.countDocuments({
      user: req.user._id,
      status: { $in: ['pending', 'processing'] }
    });
    
    if (pendingQuestions > 0 || pendingWithdrawals > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete account with pending questions or withdrawals' 
      });
    }
    
    // Soft delete - deactivate account
    user.isActive = false;
    user.email = `deleted_${Date.now()}_${user.email}`;
    await user.save();
    
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Failed to delete account' });
  }
});

module.exports = router;