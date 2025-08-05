const mongoose = require('mongoose');

const expertSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    required: true,
    maxlength: 1000
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
  skills: [{
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
    year: Number
  }],
  experience: {
    type: Number,
    required: true // years of experience
  },
  location: {
    type: String,
    required: true
  },
  pricing: {
    text: {
      enabled: {
        type: Boolean,
        default: true
      },
      price: {
        type: Number,
        required: true,
        min: 50
      }
    },
    voice: {
      enabled: {
        type: Boolean,
        default: true
      },
      price: {
        type: Number,
        required: true,
        min: 100
      }
    },
    video: {
      enabled: {
        type: Boolean,
        default: true
      },
      price: {
        type: Number,
        required: true,
        min: 200
      }
    }
  },
  responseTime: {
    type: String,
    required: true,
    enum: ['1-2 hours', '2-4 hours', '4-8 hours', '8-24 hours']
  },
  availability: {
    isAvailable: {
      type: Boolean,
      default: true
    },
    workingHours: {
      start: String,
      end: String
    },
    timezone: {
      type: String,
      default: 'Africa/Addis_Ababa'
    }
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  reviews: [{
    user: {
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
      maxlength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  stats: {
    questionsAnswered: {
      type: Number,
      default: 0
    },
    totalEarnings: {
      type: Number,
      default: 0
    },
    averageResponseTime: {
      type: Number,
      default: 0 // in hours
    }
  },
  bankInfo: {
    accountNumber: String,
    bankName: String,
    accountHolderName: String
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Update rating when new review is added
expertSchema.methods.updateRating = function() {
  if (this.reviews.length === 0) {
    this.rating.average = 0;
    this.rating.count = 0;
    return;
  }

  const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  this.rating.average = totalRating / this.reviews.length;
  this.rating.count = this.reviews.length;
};

module.exports = mongoose.model('Expert', expertSchema);