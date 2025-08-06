const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expert: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: 1000
  },
  aspects: {
    responseQuality: {
      type: Number,
      min: 1,
      max: 5
    },
    responseTime: {
      type: Number,
      min: 1,
      max: 5
    },
    communication: {
      type: Number,
      min: 1,
      max: 5
    },
    expertise: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: true
  },
  helpfulVotes: {
    type: Number,
    default: 0
  },
  reportCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
reviewSchema.index({ expert: 1, createdAt: -1 });
reviewSchema.index({ client: 1, expert: 1 }, { unique: true });
reviewSchema.index({ question: 1 }, { unique: true });
reviewSchema.index({ rating: -1 });

// Post-save middleware to update expert stats
reviewSchema.post('save', async function() {
  const ExpertProfile = mongoose.model('ExpertProfile');
  const expertProfile = await ExpertProfile.findOne({ user: this.expert });
  if (expertProfile) {
    await expertProfile.updateStats();
  }
});

module.exports = mongoose.model('Review', reviewSchema);