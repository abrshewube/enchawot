const Question = require('../models/Question');
const User = require('../models/User');

const handleAutoRefunds = async (io) => {
  try {
    // Find expired questions that haven't been answered
    const expiredQuestions = await Question.find({
      status: { $in: ['pending', 'accepted'] },
      'timeline.expiresAt': { $lt: new Date() }
    }).populate('user expert');

    for (const question of expiredQuestions) {
      // Process refund
      const user = await User.findById(question.user._id);
      
      // Add refund to user wallet
      user.wallet.balance += question.payment.amount;
      user.wallet.transactions.push({
        type: 'refund',
        amount: question.payment.amount,
        description: `Auto-refund for unanswered question`,
        relatedQuestion: question._id
      });
      await user.save();

      // Update question status
      question.status = 'refunded';
      question.refundReason = 'timeout';
      question.timeline.refundedAt = new Date();
      await question.save();

      // Add notification to user
      user.notifications.push({
        title: 'Question Refunded',
        message: `Your question has been automatically refunded due to no response from the expert.`,
        type: 'refund'
      });
      await user.save();

      // Notify user via socket
      io.to(`user_${question.user._id}`).emit('question_refunded', {
        question,
        refundAmount: question.payment.amount
      });

      console.log(`Auto-refunded question ${question._id} for ${question.payment.amount} ETB`);
    }

    if (expiredQuestions.length > 0) {
      console.log(`Processed ${expiredQuestions.length} auto-refunds`);
    }
  } catch (error) {
    console.error('Error processing auto-refunds:', error);
  }
};

module.exports = { handleAutoRefunds };