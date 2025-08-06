const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
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
  questionType: {
    type: String,
    enum: ['text', 'voice', 'video'],
    required: true
  },
  questionText: {
    type: String,
    required: true,
    maxlength: 2000
  },
  contextFiles: [{
    url: String,
    fileName: String,
    fileType: String,
    fileSize: Number
  }],
  responseType: {
    type: String,
    enum: ['text', 'voice', 'video'],
    required: true
  },
  answer: {
    text: String,
    mediaUrl: String,
    mediaType: String,
    duration: Number // for voice/video responses
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'completed', 'refunded', 'expired'],
    default: 'pending'
  },
  pricing: {
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'ETB'
    },
    expertEarning: Number,
    platformCommission: Number,
    clientCharge: Number
  },
  timeline: {
    submittedAt: {
      type: Date,
      default: Date.now
    },
    acceptedAt: Date,
    declinedAt: Date,
    completedAt: Date,
    refundedAt: Date,
    expiresAt: Date
  },
  declineReason: {
    type: String,
    maxlength: 500
  },
  isUrgent: {
    type: Boolean,
    default: false
  },
  tags: [String],
  clientRating: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String,
    ratedAt: Date
  },
  isBookmarked: {
    type: Boolean,
    default: false
  },
  viewCount: {
    type: Number,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
questionSchema.index({ client: 1, createdAt: -1 });
questionSchema.index({ expert: 1, status: 1, createdAt: -1 });
questionSchema.index({ status: 1, 'timeline.expiresAt': 1 });
questionSchema.index({ questionType: 1, responseType: 1 });
questionSchema.index({ 'timeline.submittedAt': -1 });

// Pre-save middleware to set expiry time
questionSchema.pre('save', function(next) {
  if (this.isNew && this.status === 'pending') {
    // Set expiry to 12 hours from submission
    this.timeline.expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000);
  }
  
  // Calculate earnings and commissions
  if (this.isModified('pricing.amount') && this.pricing.amount) {
    this.pricing.clientCharge = this.pricing.amount * 1.05; // 5% client fee
    this.pricing.expertEarning = this.pricing.amount * 0.90; // 10% platform commission
    this.pricing.platformCommission = this.pricing.amount * 0.10;
  }
  
  next();
});

// Method to check if question is expired
questionSchema.methods.isExpired = function() {
  return this.timeline.expiresAt && new Date() > this.timeline.expiresAt;
};

// Method to accept question
questionSchema.methods.accept = async function() {
  this.status = 'accepted';
  this.timeline.acceptedAt = new Date();
  await this.save();
  
  // Emit socket event
  const socketService = require('../services/socketService');
  socketService.emitToUser(this.client.toString(), 'questionAccepted', {
    questionId: this._id,
    expertName: this.expert.fullName
  });
};

// Method to decline question
questionSchema.methods.decline = async function(reason) {
  this.status = 'declined';
  this.timeline.declinedAt = new Date();
  this.declineReason = reason;
  await this.save();
  
  // Process refund
  const walletService = require('../services/walletService');
  await walletService.processRefund(this._id);
  
  // Emit socket event
  const socketService = require('../services/socketService');
  socketService.emitToUser(this.client.toString(), 'questionDeclined', {
    questionId: this._id,
    reason: reason
  });
};

// Method to complete question
questionSchema.methods.complete = async function(answerData) {
  this.status = 'completed';
  this.timeline.completedAt = new Date();
  this.answer = answerData;
  await this.save();
  
  // Process payment to expert
  const walletService = require('../services/walletService');
  await walletService.processExpertPayment(this._id);
  
  // Update expert stats
  const ExpertProfile = mongoose.model('ExpertProfile');
  const expertProfile = await ExpertProfile.findOne({ user: this.expert });
  if (expertProfile) {
    await expertProfile.updateStats();
  }
  
  // Emit socket event
  const socketService = require('../services/socketService');
  socketService.emitToUser(this.client.toString(), 'questionCompleted', {
    questionId: this._id,
    answer: answerData
  });
};

module.exports = mongoose.model('Question', questionSchema);