const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expert: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expert',
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'voice', 'video'],
    required: true
  },
  question: {
    text: {
      type: String,
      required: function() {
        return this.type === 'text';
      }
    },
    audioUrl: {
      type: String,
      required: function() {
        return this.type === 'voice';
      }
    },
    videoUrl: {
      type: String,
      required: function() {
        return this.type === 'video';
      }
    }
  },
  attachments: [{
    type: String, // URLs to uploaded files
    filename: String,
    fileType: String
  }],
  answer: {
    text: String,
    audioUrl: String,
    videoUrl: String,
    attachments: [{
      type: String,
      filename: String,
      fileType: String
    }]
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'answered', 'completed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  payment: {
    amount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'paid'
    },
    transactionId: String
  },
  timeline: {
    submittedAt: {
      type: Date,
      default: Date.now
    },
    acceptedAt: Date,
    answeredAt: Date,
    completedAt: Date,
    refundedAt: Date,
    expiresAt: {
      type: Date,
      required: true
    }
  },
  review: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: 500
    },
    createdAt: Date
  },
  refundReason: {
    type: String,
    enum: ['timeout', 'expert_declined', 'user_cancelled', 'dispute']
  },
  isBookmarked: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Auto-set expiration time based on expert's response time
questionSchema.pre('save', function(next) {
  if (this.isNew && !this.timeline.expiresAt) {
    // Default to 24 hours if no response time specified
    const hoursToAdd = 24;
    this.timeline.expiresAt = new Date(Date.now() + hoursToAdd * 60 * 60 * 1000);
  }
  next();
});

module.exports = mongoose.model('Question', questionSchema);