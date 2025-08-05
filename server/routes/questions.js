const express = require('express');
const multer = require('multer');
const Question = require('../models/Question');
const Expert = require('../models/Expert');
const User = require('../models/User');
const Referral = require('../models/Referral');
const { auth, expertAuth } = require('../middleware/auth');
const { uploadToCloudinary } = require('../services/uploadService');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// @route   POST /api/questions
// @desc    Submit a question
// @access  Private
router.post('/', auth, upload.array('attachments', 5), async (req, res) => {
  try {
    const { expertId, type, questionText, audioUrl, videoUrl } = req.body;

    // Find expert
    const expert = await Expert.findById(expertId);
    if (!expert) {
      return res.status(404).json({ message: 'Expert not found' });
    }

    // Check if expert offers this type of service
    if (!expert.pricing[type].enabled) {
      return res.status(400).json({ message: `Expert doesn't offer ${type} responses` });
    }

    const amount = expert.pricing[type].price;

    // Check user wallet balance
    if (req.user.wallet.balance < amount) {
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }

    // Handle file uploads
    let attachments = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResult = await uploadToCloudinary(file);
        attachments.push({
          type: uploadResult.secure_url,
          filename: file.originalname,
          fileType: file.mimetype
        });
      }
    }

    // Create question
    const question = new Question({
      user: req.user._id,
      expert: expertId,
      type,
      question: {
        text: questionText,
        audioUrl,
        videoUrl
      },
      attachments,
      payment: {
        amount,
        status: 'paid'
      }
    });

    // Set expiration based on expert's response time
    const responseTimeHours = {
      '1-2 hours': 2,
      '2-4 hours': 4,
      '4-8 hours': 8,
      '8-24 hours': 24
    };
    
    const hoursToAdd = responseTimeHours[expert.responseTime] || 24;
    question.timeline.expiresAt = new Date(Date.now() + hoursToAdd * 60 * 60 * 1000);

    await question.save();

    // Deduct from user wallet
    req.user.wallet.balance -= amount;
    req.user.wallet.transactions.push({
      type: 'payment',
      amount: -amount,
      description: `Payment for ${type} question to ${expert.title}`,
      relatedQuestion: question._id
    });
    await req.user.save();

    // Handle referral earnings
    if (req.user.referredBy) {
      const referral = await Referral.findOne({
        referrer: req.user.referredBy,
        referred: req.user._id,
        status: 'active'
      });

      if (referral && referral.expiresAt > new Date()) {
        const referralEarning = amount * 0.05; // 5%
        
        // Add to referrer's wallet
        const referrer = await User.findById(req.user.referredBy);
        referrer.wallet.balance += referralEarning;
        referrer.wallet.transactions.push({
          type: 'referral',
          amount: referralEarning,
          description: `Referral earning from ${req.user.name}'s question`,
          relatedQuestion: question._id
        });
        await referrer.save();

        // Update referral record
        referral.earnings.push({
          amount: referralEarning,
          source: 'question_payment',
          question: question._id
        });
        referral.totalEarnings += referralEarning;
        await referral.save();
      }
    }

    // Notify expert via socket
    req.io.to(`expert_${expert.user}`).emit('new_question', {
      question: await question.populate('user', 'name avatar')
    });

    await question.populate('expert user', 'name avatar title');
    res.status(201).json(question);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/questions/my-questions
// @desc    Get user's questions
// @access  Private
router.get('/my-questions', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = { user: req.user._id };
    if (status && status !== 'all') {
      query.status = status;
    }

    const questions = await Question.find(query)
      .populate('expert', 'title user')
      .populate('expert.user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Question.countDocuments(query);

    res.json({
      questions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/questions/expert-questions
// @desc    Get expert's questions
// @access  Private (Expert)
router.get('/expert-questions', expertAuth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const expert = await Expert.findOne({ user: req.user._id });
    if (!expert) {
      return res.status(404).json({ message: 'Expert profile not found' });
    }

    let query = { expert: expert._id };
    if (status && status !== 'all') {
      query.status = status;
    }

    const questions = await Question.find(query)
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Question.countDocuments(query);

    res.json({
      questions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/questions/:id/accept
// @desc    Accept a question
// @access  Private (Expert)
router.put('/:id/accept', expertAuth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const expert = await Expert.findOne({ user: req.user._id });
    if (!expert || !question.expert.equals(expert._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (question.status !== 'pending') {
      return res.status(400).json({ message: 'Question cannot be accepted' });
    }

    question.status = 'accepted';
    question.timeline.acceptedAt = new Date();
    await question.save();

    // Notify user
    req.io.to(`user_${question.user}`).emit('question_accepted', { question });

    res.json(question);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/questions/:id/answer
// @desc    Submit answer to a question
// @access  Private (Expert)
router.put('/:id/answer', expertAuth, upload.array('attachments', 5), async (req, res) => {
  try {
    const { answerText, audioUrl, videoUrl } = req.body;
    
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const expert = await Expert.findOne({ user: req.user._id });
    if (!expert || !question.expert.equals(expert._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (question.status !== 'accepted' && question.status !== 'pending') {
      return res.status(400).json({ message: 'Question cannot be answered' });
    }

    // Handle file uploads
    let attachments = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResult = await uploadToCloudinary(file);
        attachments.push({
          type: uploadResult.secure_url,
          filename: file.originalname,
          fileType: file.mimetype
        });
      }
    }

    question.answer = {
      text: answerText,
      audioUrl,
      videoUrl,
      attachments
    };
    question.status = 'answered';
    question.timeline.answeredAt = new Date();

    await question.save();

    // Update expert stats
    expert.stats.questionsAnswered += 1;
    expert.stats.totalEarnings += question.payment.amount;
    await expert.save();

    // Add earnings to expert's wallet
    const expertUser = await User.findById(expert.user);
    expertUser.wallet.balance += question.payment.amount;
    expertUser.wallet.transactions.push({
      type: 'payment',
      amount: question.payment.amount,
      description: `Earnings from answering question`,
      relatedQuestion: question._id
    });
    await expertUser.save();

    // Notify user
    req.io.to(`user_${question.user}`).emit('question_answered', { question });

    res.json(question);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/questions/:id/review
// @desc    Submit review for a question
// @access  Private
router.put('/:id/review', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (!question.user.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (question.status !== 'answered') {
      return res.status(400).json({ message: 'Question must be answered before review' });
    }

    question.review = {
      rating,
      comment,
      createdAt: new Date()
    };
    question.status = 'completed';
    question.timeline.completedAt = new Date();

    await question.save();

    // Add review to expert
    const expert = await Expert.findById(question.expert);
    expert.reviews.push({
      user: req.user._id,
      question: question._id,
      rating,
      comment
    });
    expert.updateRating();
    await expert.save();

    res.json(question);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;