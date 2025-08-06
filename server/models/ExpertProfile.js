const mongoose = require('mongoose');

const expertProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  bio: {
    type: String,
    required: true,
    maxlength: 1000
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Business & Finance',
      'Technology',
      'Health & Wellness',
      'Legal Advice',
      'Creative Arts',
      'Education',
      'Marketing',
      'Healthcare'
    ]
  },
  expertise: [{
    type: String,
    required: true
  }],
  languages: [{
    type: String,
    required: true
  }],
  education: [{
    degree: String,
    institution: String,
    year: Number
  }],
  certifications: [{
    name: String,
    issuer: String,
    year: Number,
    credentialUrl: String
  }],
  experience: {
    years: {
      type: Number,
      required: true,
      min: 0
    },
    description: String
  },
  pricing: {
    textResponse: {
      price: {
        type: Number,
        required: true,
        min: 50
      },
      responseTime: {
        type: String,
        required: true,
        enum: ['1-2 hours', '2-4 hours', '4-6 hours', '6-12 hours', '12-24 hours']
      }
    },
    voiceResponse: {
      price: {
        type: Number,
        required: true,
        min: 100
      },
      responseTime: {
        type: String,
        required: true,
        enum: ['2-4 hours', '4-6 hours', '6-12 hours', '12-24 hours']
      }
    },
    videoResponse: {
      price: {
        type: Number,
        required: true,
        min: 200
      },
      responseTime: {
        type: String,
        required: true,
        enum: ['4-6 hours', '6-12 hours', '12-24 hours', '1-2 days']
      }
    }
  },
  supportedFormats: [{
    type: String,
    enum: ['text', 'voice', 'video'],
    required: true
  }],
  portfolio: [{
    title: String,
    description: String,
    mediaUrl: String,
    mediaType: {
      type: String,
      enum: ['image', 'video', 'document']
    }
  }],
  availability: {
    timezone: {
      type: String,
      default: 'Africa/Addis_Ababa'
    },
    workingHours: {
      start: String,
      end: String
    },
    workingDays: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }]
  },
  stats: {
    totalQuestions: {
      type: Number,
      default: 0
    },
    completedQuestions: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    responseRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    averageResponseTime: {
      type: Number,
      default: 0
    }
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  featuredUntil: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
expertProfileSchema.index({ user: 1 });
expertProfileSchema.index({ category: 1 });
expertProfileSchema.index({ 'stats.averageRating': -1 });
expertProfileSchema.index({ 'stats.totalQuestions': -1 });
expertProfileSchema.index({ isApproved: 1, isActive: 1 });
expertProfileSchema.index({ featuredUntil: 1 });

// Virtual for completion rate
expertProfileSchema.virtual('completionRate').get(function() {
  if (this.stats.totalQuestions === 0) return 0;
  return (this.stats.completedQuestions / this.stats.totalQuestions) * 100;
});

// Method to update stats
expertProfileSchema.methods.updateStats = async function() {
  const Question = mongoose.model('Question');
  const Review = mongoose.model('Review');
  
  const questionStats = await Question.aggregate([
    { $match: { expert: this.user } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        avgResponseTime: {
          $avg: {
            $cond: [
              { $eq: ['$status', 'completed'] },
              { $subtract: ['$answeredAt', '$createdAt'] },
              null
            ]
          }
        }
      }
    }
  ]);
  
  const reviewStats = await Review.aggregate([
    { $match: { expert: this.user } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);
  
  if (questionStats.length > 0) {
    this.stats.totalQuestions = questionStats[0].total;
    this.stats.completedQuestions = questionStats[0].completed;
    this.stats.responseRate = (questionStats[0].completed / questionStats[0].total) * 100;
    this.stats.averageResponseTime = questionStats[0].avgResponseTime || 0;
  }
  
  if (reviewStats.length > 0) {
    this.stats.averageRating = reviewStats[0].avgRating;
    this.stats.totalReviews = reviewStats[0].totalReviews;
  }
  
  await this.save();
};

module.exports = mongoose.model('ExpertProfile', expertProfileSchema);