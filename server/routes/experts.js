const express = require('express');
const Expert = require('../models/Expert');
const User = require('../models/User');
const { auth, expertAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/experts
// @desc    Get all experts
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    
    let query = { isActive: true };
    
    if (category && category !== 'All') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const experts = await Expert.find(query)
      .populate('user', 'name avatar')
      .sort({ 'rating.average': -1, 'stats.questionsAnswered': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Expert.countDocuments(query);

    res.json({
      experts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/experts/:id
// @desc    Get expert by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const expert = await Expert.findById(req.params.id)
      .populate('user', 'name avatar email')
      .populate('reviews.user', 'name avatar');

    if (!expert) {
      return res.status(404).json({ message: 'Expert not found' });
    }

    res.json(expert);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/experts/profile
// @desc    Create or update expert profile
// @access  Private (Expert)
router.post('/profile', expertAuth, async (req, res) => {
  try {
    const {
      title,
      bio,
      category,
      skills,
      languages,
      education,
      certifications,
      experience,
      location,
      pricing,
      responseTime,
      availability
    } = req.body;

    let expert = await Expert.findOne({ user: req.user._id });

    if (expert) {
      // Update existing profile
      expert.title = title;
      expert.bio = bio;
      expert.category = category;
      expert.skills = skills;
      expert.languages = languages;
      expert.education = education;
      expert.certifications = certifications;
      expert.experience = experience;
      expert.location = location;
      expert.pricing = pricing;
      expert.responseTime = responseTime;
      expert.availability = availability;
    } else {
      // Create new profile
      expert = new Expert({
        user: req.user._id,
        title,
        bio,
        category,
        skills,
        languages,
        education,
        certifications,
        experience,
        location,
        pricing,
        responseTime,
        availability
      });
    }

    await expert.save();
    await expert.populate('user', 'name avatar email');

    res.json(expert);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/experts/profile/me
// @desc    Get current expert's profile
// @access  Private (Expert)
router.get('/profile/me', expertAuth, async (req, res) => {
  try {
    const expert = await Expert.findOne({ user: req.user._id })
      .populate('user', 'name avatar email');

    if (!expert) {
      return res.status(404).json({ message: 'Expert profile not found' });
    }

    res.json(expert);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/experts/availability
// @desc    Update expert availability
// @access  Private (Expert)
router.put('/availability', expertAuth, async (req, res) => {
  try {
    const { isAvailable, workingHours } = req.body;

    const expert = await Expert.findOne({ user: req.user._id });
    if (!expert) {
      return res.status(404).json({ message: 'Expert profile not found' });
    }

    expert.availability.isAvailable = isAvailable;
    if (workingHours) {
      expert.availability.workingHours = workingHours;
    }

    await expert.save();
    res.json(expert);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;