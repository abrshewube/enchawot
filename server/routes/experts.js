const express = require('express');
const ExpertProfile = require('../models/ExpertProfile');
const User = require('../models/User');
const Question = require('../models/Question');
const Review = require('../models/Review');
const { authenticate, expertOnly, adminOnly } = require('../middleware/auth');
const { firebaseService, upload } = require('../services/firebaseService');
const router = express.Router();

// Get all experts (public)
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      category, 
      search, 
      sortBy = 'rating',
      minRating,
      maxPrice,
      responseTime
    } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Build filter
    const filter = { isApproved: true, isActive: true };
    if (category) filter.category = category;
    if (minRating) filter['stats.averageRating'] = { $gte: parseFloat(minRating) };
    
    // Build aggregation pipeline
    const pipeline = [
      { $match: filter },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' },
      {
        $match: {
          'userInfo.isActive': true
        }
      }
    ];
    
    // Add search filter
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'userInfo.firstName': { $regex: search, $options: 'i' } },
            { 'userInfo.lastName': { $regex: search, $options: 'i' } },
            { title: { $regex: search, $options: 'i' } },
            { bio: { $regex: search, $options: 'i' } },
            { expertise: { $in: [new RegExp(search, 'i')] } }
          ]
        }
      });
    }
    
    // Add price filter
    if (maxPrice) {
      pipeline.push({
        $match: {
          $or: [
            { 'pricing.textResponse.price': { $lte: parseInt(maxPrice) } },
            { 'pricing.voiceResponse.price': { $lte: parseInt(maxPrice) } },
            { 'pricing.videoResponse.price': { $lte: parseInt(maxPrice) } }
          ]
        }
      });
    }
    
    // Add response time filter
    if (responseTime) {
      pipeline.push({
        $match: {
          $or: [
            { 'pricing.textResponse.responseTime': responseTime },
            { 'pricing.voiceResponse.responseTime': responseTime },
            { 'pricing.videoResponse.responseTime': responseTime }
          ]
        }
      });
    }
    
    // Add sorting
    let sortStage = {};
    switch (sortBy) {
      case 'rating':
        sortStage = { 'stats.averageRating': -1, 'stats.totalReviews': -1 };
        break;
      case 'price_low':
        sortStage = { 'pricing.textResponse.price': 1 };
        break;
      case 'price_high':
        sortStage = { 'pricing.textResponse.price': -1 };
        break;
      case 'experience':
        sortStage = { 'experience.years': -1 };
        break;
      case 'questions':
        sortStage = { 'stats.totalQuestions': -1 };
        break;
      default:
        sortStage = { 'stats.averageRating': -1 };
    }
    
    pipeline.push({ $sort: sortStage });
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parseInt(limit) });
    
    // Project fields
    pipeline.push({
      $project: {
        _id: 1,
        user: '$userInfo._id',
        firstName: '$userInfo.firstName',
        lastName: '$userInfo.lastName',
        profileImage: '$userInfo.profileImage',
        title: 1,
        category: 1,
        bio: 1,
        expertise: 1,
        languages: 1,
        experience: 1,
        pricing: 1,
        supportedFormats: 1,
        stats: 1,
        featuredUntil: 1,
        createdAt: 1
      }
    });
    
    const experts = await ExpertProfile.aggregate(pipeline);
    
    // Get total count for pagination
    const totalPipeline = pipeline.slice(0, -2); // Remove skip and limit
    totalPipeline.push({ $count: 'total' });
    const totalResult = await ExpertProfile.aggregate(totalPipeline);
    const total = totalResult.length > 0 ? totalResult[0].total : 0;
    
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
    console.error('Get experts error:', error);
    res.status(500).json({ message: 'Failed to fetch experts' });
  }
});

// Get featured experts
router.get('/featured', async (req, res) => {
  try {
    const experts = await ExpertProfile.find({
      isApproved: true,
      isActive: true,
      featuredUntil: { $gt: new Date() }
    })
    .populate('user', 'firstName lastName profileImage')
    .sort({ 'stats.averageRating': -1 })
    .limit(6);
    
    res.json({ experts });
  } catch (error) {
    console.error('Get featured experts error:', error);
    res.status(500).json({ message: 'Failed to fetch featured experts' });
  }
});

// Get expert categories with counts
router.get('/categories', async (req, res) => {
  try {
    const categories = await ExpertProfile.aggregate([
      { $match: { isApproved: true, isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgRating: { $avg: '$stats.averageRating' },
          minPrice: { $min: '$pricing.textResponse.price' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
});

// Get single expert profile
router.get('/:id', async (req, res) => {
  try {
    const expert = await ExpertProfile.findOne({
      user: req.params.id,
      isApproved: true,
      isActive: true
    }).populate('user', 'firstName lastName profileImage email');
    
    if (!expert) {
      return res.status(404).json({ message: 'Expert not found' });
    }
    
    // Get recent reviews
    const reviews = await Review.find({ expert: req.params.id })
      .populate('client', 'firstName lastName profileImage')
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({ 
      expert: {
        ...expert.toObject(),
        user: expert.user
      },
      reviews 
    });
  } catch (error) {
    console.error('Get expert error:', error);
    res.status(500).json({ message: 'Failed to fetch expert' });
  }
});

// Create/Update expert profile
router.post('/profile', authenticate, expertOnly, upload.array('portfolioFiles', 10), async (req, res) => {
  try {
    const {
      bio,
      title,
      category,
      expertise,
      languages,
      education,
      certifications,
      experience,
      pricing,
      supportedFormats,
      availability
    } = req.body;
    
    // Parse JSON strings
    const parsedData = {
      bio,
      title,
      category,
      expertise: JSON.parse(expertise || '[]'),
      languages: JSON.parse(languages || '[]'),
      education: JSON.parse(education || '[]'),
      certifications: JSON.parse(certifications || '[]'),
      experience: JSON.parse(experience || '{}'),
      pricing: JSON.parse(pricing || '{}'),
      supportedFormats: JSON.parse(supportedFormats || '[]'),
      availability: JSON.parse(availability || '{}')
    };
    
    // Upload portfolio files
    let portfolio = [];
    if (req.files && req.files.length > 0) {
      try {
        const uploadResults = await firebaseService.uploadFiles(req.files, 'portfolio');
        portfolio = uploadResults.map((result, index) => ({
          title: req.body[`portfolioTitle_${index}`] || 'Portfolio Item',
          description: req.body[`portfolioDescription_${index}`] || '',
          mediaUrl: result.url,
          mediaType: result.fileType.startsWith('image/') ? 'image' : 
                    result.fileType.startsWith('video/') ? 'video' : 'document'
        }));
      } catch (uploadError) {
        return res.status(400).json({ message: 'Portfolio upload failed', error: uploadError.message });
      }
    }
    
    // Find existing profile or create new one
    let expertProfile = await ExpertProfile.findOne({ user: req.user._id });
    
    if (expertProfile) {
      // Update existing profile
      Object.assign(expertProfile, parsedData);
      if (portfolio.length > 0) {
        expertProfile.portfolio = [...expertProfile.portfolio, ...portfolio];
      }
      expertProfile.isApproved = false; // Require re-approval after updates
    } else {
      // Create new profile
      expertProfile = new ExpertProfile({
        user: req.user._id,
        ...parsedData,
        portfolio
      });
    }
    
    await expertProfile.save();
    
    const populatedProfile = await ExpertProfile.findById(expertProfile._id)
      .populate('user', 'firstName lastName profileImage email');
    
    res.json({
      message: expertProfile.isNew ? 'Expert profile created successfully' : 'Expert profile updated successfully',
      profile: populatedProfile
    });
  } catch (error) {
    console.error('Create/Update expert profile error:', error);
    res.status(500).json({ message: 'Failed to save expert profile', error: error.message });
  }
});

// Get own expert profile
router.get('/profile/me', authenticate, expertOnly, async (req, res) => {
  try {
    const profile = await ExpertProfile.findOne({ user: req.user._id })
      .populate('user', 'firstName lastName profileImage email');
    
    if (!profile) {
      return res.status(404).json({ message: 'Expert profile not found' });
    }
    
    res.json({ profile });
  } catch (error) {
    console.error('Get own expert profile error:', error);
    res.status(500).json({ message: 'Failed to fetch expert profile' });
  }
});

// Get expert dashboard stats
router.get('/dashboard/stats', authenticate, expertOnly, async (req, res) => {
  try {
    const profile = await ExpertProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Expert profile not found' });
    }
    
    // Get recent questions
    const recentQuestions = await Question.find({ expert: req.user._id })
      .populate('client', 'firstName lastName profileImage')
      .sort({ createdAt: -1 })
      .limit(10);
    
    // Get pending questions count
    const pendingCount = await Question.countDocuments({
      expert: req.user._id,
      status: 'pending'
    });
    
    // Get earnings this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const monthlyEarnings = await Question.aggregate([
      {
        $match: {
          expert: req.user._id,
          status: 'completed',
          'timeline.completedAt': { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$pricing.expertEarning' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    const stats = {
      profile: profile.stats,
      pendingQuestions: pendingCount,
      recentQuestions,
      monthlyEarnings: monthlyEarnings.length > 0 ? monthlyEarnings[0] : { total: 0, count: 0 }
    };
    
    res.json({ stats });
  } catch (error) {
    console.error('Get expert dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
});

// Update expert availability
router.put('/availability', authenticate, expertOnly, async (req, res) => {
  try {
    const { availability } = req.body;
    
    const profile = await ExpertProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Expert profile not found' });
    }
    
    profile.availability = availability;
    await profile.save();
    
    res.json({
      message: 'Availability updated successfully',
      availability: profile.availability
    });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({ message: 'Failed to update availability' });
  }
});

// Admin: Approve expert
router.post('/:id/approve', authenticate, adminOnly, async (req, res) => {
  try {
    const profile = await ExpertProfile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ message: 'Expert profile not found' });
    }
    
    profile.isApproved = true;
    await profile.save();
    
    res.json({ message: 'Expert approved successfully' });
  } catch (error) {
    console.error('Approve expert error:', error);
    res.status(500).json({ message: 'Failed to approve expert' });
  }
});

// Admin: Reject expert
router.post('/:id/reject', authenticate, adminOnly, async (req, res) => {
  try {
    const { reason } = req.body;
    
    const profile = await ExpertProfile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ message: 'Expert profile not found' });
    }
    
    profile.isApproved = false;
    profile.rejectionReason = reason;
    await profile.save();
    
    res.json({ message: 'Expert rejected successfully' });
  } catch (error) {
    console.error('Reject expert error:', error);
    res.status(500).json({ message: 'Failed to reject expert' });
  }
});

module.exports = router;