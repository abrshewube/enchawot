const express = require('express');
const Review = require('../models/Review');
const Question = require('../models/Question');
const { authenticate, clientOnly } = require('../middleware/auth');
const router = express.Router();

// Get reviews for an expert
router.get('/expert/:expertId', async (req, res) => {
  try {
    const { page = 1, limit = 10, rating } = req.query;
    const skip = (page - 1) * limit;
    
    const filter = { 
      expert: req.params.expertId,
      isPublic: true 
    };
    
    if (rating) {
      filter.rating = parseInt(rating);
    }
    
    const reviews = await Review.find(filter)
      .populate('client', 'firstName lastName profileImage')
      .populate('question', 'questionType responseType createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Review.countDocuments(filter);
    
    // Get rating distribution
    const ratingDistribution = await Review.aggregate([
      { $match: { expert: req.params.expertId, isPublic: true } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);
    
    // Get average rating and total reviews
    const stats = await Review.aggregate([
      { $match: { expert: req.params.expertId, isPublic: true } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      stats: stats.length > 0 ? stats[0] : { averageRating: 0, totalReviews: 0 },
      ratingDistribution: ratingDistribution.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Get expert reviews error:', error);
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
});

// Create review (client only)
router.post('/', authenticate, clientOnly, async (req, res) => {
  try {
    const {
      questionId,
      rating,
      comment,
      aspects = {}
    } = req.body;
    
    if (!questionId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Question ID and valid rating (1-5) are required' });
    }
    
    // Find the question
    const question = await Question.findOne({
      _id: questionId,
      client: req.user._id,
      status: 'completed'
    });
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found or not completed' });
    }
    
    // Check if review already exists
    const existingReview = await Review.findOne({
      client: req.user._id,
      expert: question.expert,
      question: questionId
    });
    
    if (existingReview) {
      return res.status(400).json({ message: 'Review already exists for this question' });
    }
    
    // Create review
    const review = new Review({
      client: req.user._id,
      expert: question.expert,
      question: questionId,
      rating,
      comment: comment || '',
      aspects: {
        responseQuality: aspects.responseQuality || rating,
        responseTime: aspects.responseTime || rating,
        communication: aspects.communication || rating,
        expertise: aspects.expertise || rating
      }
    });
    
    await review.save();
    
    // Update question with rating
    question.clientRating = {
      rating,
      feedback: comment || '',
      ratedAt: new Date()
    };
    await question.save();
    
    // Populate review for response
    const populatedReview = await Review.findById(review._id)
      .populate('client', 'firstName lastName profileImage')
      .populate('expert', 'firstName lastName')
      .populate('question', 'questionType responseType');
    
    res.status(201).json({
      message: 'Review created successfully',
      review: populatedReview
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Failed to create review' });
  }
});

// Update review (client only)
router.put('/:id', authenticate, clientOnly, async (req, res) => {
  try {
    const {
      rating,
      comment,
      aspects = {}
    } = req.body;
    
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    
    const review = await Review.findOne({
      _id: req.params.id,
      client: req.user._id
    });
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Update review
    if (rating) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    if (Object.keys(aspects).length > 0) {
      review.aspects = {
        ...review.aspects,
        ...aspects
      };
    }
    
    await review.save();
    
    // Update corresponding question rating
    const question = await Question.findById(review.question);
    if (question) {
      question.clientRating.rating = review.rating;
      question.clientRating.feedback = review.comment;
      await question.save();
    }
    
    const populatedReview = await Review.findById(review._id)
      .populate('client', 'firstName lastName profileImage')
      .populate('expert', 'firstName lastName')
      .populate('question', 'questionType responseType');
    
    res.json({
      message: 'Review updated successfully',
      review: populatedReview
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ message: 'Failed to update review' });
  }
});

// Delete review (client only)
router.delete('/:id', authenticate, clientOnly, async (req, res) => {
  try {
    const review = await Review.findOne({
      _id: req.params.id,
      client: req.user._id
    });
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    await Review.findByIdAndDelete(req.params.id);
    
    // Remove rating from question
    const question = await Question.findById(review.question);
    if (question) {
      question.clientRating = {};
      await question.save();
    }
    
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Failed to delete review' });
  }
});

// Get client's reviews
router.get('/my-reviews', authenticate, clientOnly, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    const reviews = await Review.find({ client: req.user._id })
      .populate('expert', 'firstName lastName profileImage')
      .populate('question', 'questionType responseType createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Review.countDocuments({ client: req.user._id });
    
    res.json({
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get client reviews error:', error);
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
});

// Mark review as helpful
router.post('/:id/helpful', authenticate, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    review.helpfulVotes += 1;
    await review.save();
    
    res.json({
      message: 'Review marked as helpful',
      helpfulVotes: review.helpfulVotes
    });
  } catch (error) {
    console.error('Mark review helpful error:', error);
    res.status(500).json({ message: 'Failed to mark review as helpful' });
  }
});

// Report review
router.post('/:id/report', authenticate, async (req, res) => {
  try {
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({ message: 'Report reason is required' });
    }
    
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    review.reportCount += 1;
    await review.save();
    
    // In a real app, you'd create a report record and notify admins
    
    res.json({ message: 'Review reported successfully' });
  } catch (error) {
    console.error('Report review error:', error);
    res.status(500).json({ message: 'Failed to report review' });
  }
});

module.exports = router;