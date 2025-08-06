const express = require('express');
const Question = require('../models/Question');
const ExpertProfile = require('../models/ExpertProfile');
const Wallet = require('../models/Wallet');
const { authenticate, clientOnly, expertOnly } = require('../middleware/auth');
const { firebaseService, upload } = require('../services/firebaseService');
const walletService = require('../services/walletService');
const questionService = require('../services/questionService');
const router = express.Router();

// Create new question
router.post('/', authenticate, clientOnly, upload.array('contextFiles', 5), async (req, res) => {
  try {
    const {
      expertId,
      questionType,
      questionText,
      responseType,
      isUrgent = false,
      tags = []
    } = req.body;

    // Find expert profile
    const expertProfile = await ExpertProfile.findOne({ 
      user: expertId, 
      isApproved: true, 
      isActive: true 
    });
    
    if (!expertProfile) {
      return res.status(404).json({ message: 'Expert not found or not available' });
    }

    // Check if expert supports the requested response type
    if (!expertProfile.supportedFormats.includes(responseType)) {
      return res.status(400).json({ 
        message: `Expert does not support ${responseType} responses` 
      });
    }

    // Get pricing
    const pricing = expertProfile.pricing[`${responseType}Response`];
    if (!pricing) {
      return res.status(400).json({ message: 'Invalid response type' });
    }

    // Check client's wallet balance
    const clientWallet = await Wallet.findOne({ user: req.user._id });
    const totalCost = pricing.price * 1.05; // 5% client fee
    
    if (!clientWallet || clientWallet.balance < totalCost) {
      return res.status(400).json({ 
        message: 'Insufficient balance',
        required: totalCost,
        available: clientWallet ? clientWallet.balance : 0
      });
    }

    // Upload context files if provided
    let contextFiles = [];
    if (req.files && req.files.length > 0) {
      try {
        const uploadResults = await firebaseService.uploadFiles(req.files, 'questions');
        contextFiles = uploadResults;
      } catch (uploadError) {
        return res.status(400).json({ message: 'File upload failed', error: uploadError.message });
      }
    }

    // Create question
    const questionData = {
      client: req.user._id,
      expert: expertId,
      questionType,
      questionText,
      responseType,
      contextFiles,
      pricing: {
        amount: pricing.price,
        clientCharge: totalCost,
        expertEarning: pricing.price * 0.9,
        platformCommission: pricing.price * 0.1
      },
      isUrgent,
      tags: Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim())
    };

    const question = await questionService.createQuestion(questionData);

    // Process payment
    await walletService.processQuestionPayment(question._id, req.user._id);

    // Populate question for response
    const populatedQuestion = await Question.findById(question._id)
      .populate('client', 'firstName lastName profileImage')
      .populate('expert', 'firstName lastName profileImage');

    res.status(201).json({
      message: 'Question submitted successfully',
      question: populatedQuestion
    });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({ message: 'Failed to create question', error: error.message });
  }
});

// Get questions for client
router.get('/my-questions', authenticate, clientOnly, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, questionType } = req.query;
    const skip = (page - 1) * limit;

    const filter = { client: req.user._id };
    if (status) filter.status = status;
    if (questionType) filter.questionType = questionType;

    const questions = await Question.find(filter)
      .populate('expert', 'firstName lastName profileImage')
      .populate({
        path: 'expert',
        populate: {
          path: 'expertProfile',
          model: 'ExpertProfile',
          select: 'title category stats'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Question.countDocuments(filter);

    res.json({
      questions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get client questions error:', error);
    res.status(500).json({ message: 'Failed to fetch questions' });
  }
});

// Get questions for expert
router.get('/expert-questions', authenticate, expertOnly, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const filter = { expert: req.user._id };
    if (status) filter.status = status;

    const questions = await Question.find(filter)
      .populate('client', 'firstName lastName profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Question.countDocuments(filter);

    res.json({
      questions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get expert questions error:', error);
    res.status(500).json({ message: 'Failed to fetch questions' });
  }
});

// Get single question
router.get('/:id', authenticate, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('client', 'firstName lastName profileImage')
      .populate('expert', 'firstName lastName profileImage');

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Check if user has access to this question
    const hasAccess = question.client._id.toString() === req.user._id.toString() ||
                     question.expert._id.toString() === req.user._id.toString() ||
                     req.user.role === 'admin';

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ question });
  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({ message: 'Failed to fetch question' });
  }
});

// Accept question (expert only)
router.post('/:id/accept', authenticate, expertOnly, async (req, res) => {
  try {
    const question = await questionService.acceptQuestion(req.params.id, req.user._id);
    
    const populatedQuestion = await Question.findById(question._id)
      .populate('client', 'firstName lastName profileImage')
      .populate('expert', 'firstName lastName profileImage');

    res.json({
      message: 'Question accepted successfully',
      question: populatedQuestion
    });
  } catch (error) {
    console.error('Accept question error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Decline question (expert only)
router.post('/:id/decline', authenticate, expertOnly, async (req, res) => {
  try {
    const { reason } = req.body;
    
    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ message: 'Decline reason is required' });
    }

    const question = await questionService.declineQuestion(req.params.id, req.user._id, reason);
    
    res.json({
      message: 'Question declined successfully',
      question
    });
  } catch (error) {
    console.error('Decline question error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Submit answer (expert only)
router.post('/:id/answer', authenticate, expertOnly, upload.single('answerMedia'), async (req, res) => {
  try {
    const { answerText } = req.body;
    
    const question = await Question.findOne({
      _id: req.params.id,
      expert: req.user._id,
      status: 'accepted'
    });

    if (!question) {
      return res.status(404).json({ message: 'Question not found or not accepted' });
    }

    let answerData = { text: answerText };

    // Upload answer media if provided
    if (req.file) {
      try {
        const uploadResult = await firebaseService.uploadFile(req.file, 'answers');
        answerData.mediaUrl = uploadResult.url;
        answerData.mediaType = uploadResult.fileType;
        
        // For audio/video, you might want to extract duration
        if (uploadResult.fileType.startsWith('audio/') || uploadResult.fileType.startsWith('video/')) {
          // Duration extraction would require additional processing
          answerData.duration = 0; // Placeholder
        }
      } catch (uploadError) {
        return res.status(400).json({ message: 'Media upload failed', error: uploadError.message });
      }
    }

    const completedQuestion = await questionService.completeQuestion(req.params.id, req.user._id, answerData);
    
    const populatedQuestion = await Question.findById(completedQuestion._id)
      .populate('client', 'firstName lastName profileImage')
      .populate('expert', 'firstName lastName profileImage');

    res.json({
      message: 'Answer submitted successfully',
      question: populatedQuestion
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({ message: 'Failed to submit answer', error: error.message });
  }
});

// Rate question/expert (client only)
router.post('/:id/rate', authenticate, clientOnly, async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const question = await Question.findOne({
      _id: req.params.id,
      client: req.user._id,
      status: 'completed'
    });

    if (!question) {
      return res.status(404).json({ message: 'Question not found or not completed' });
    }

    if (question.clientRating.rating) {
      return res.status(400).json({ message: 'Question already rated' });
    }

    question.clientRating = {
      rating,
      feedback: feedback || '',
      ratedAt: new Date()
    };

    await question.save();

    // Create review record
    const Review = require('../models/Review');
    await Review.create({
      client: req.user._id,
      expert: question.expert,
      question: question._id,
      rating,
      comment: feedback || ''
    });

    res.json({
      message: 'Rating submitted successfully',
      rating: question.clientRating
    });
  } catch (error) {
    console.error('Rate question error:', error);
    res.status(500).json({ message: 'Failed to submit rating' });
  }
});

// Bookmark question (client only)
router.post('/:id/bookmark', authenticate, clientOnly, async (req, res) => {
  try {
    const question = await Question.findOne({
      _id: req.params.id,
      client: req.user._id
    });

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    question.isBookmarked = !question.isBookmarked;
    await question.save();

    res.json({
      message: question.isBookmarked ? 'Question bookmarked' : 'Question unbookmarked',
      isBookmarked: question.isBookmarked
    });
  } catch (error) {
    console.error('Bookmark question error:', error);
    res.status(500).json({ message: 'Failed to bookmark question' });
  }
});

module.exports = router;