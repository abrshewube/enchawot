const Question = require('../models/Question');
const Wallet = require('../models/Wallet');
const TransactionHistory = require('../models/TransactionHistory');
const socketService = require('./socketService');

class QuestionService {
  // Process expired questions (called by cron job)
  async processExpiredQuestions() {
    try {
      const expiredQuestions = await Question.find({
        status: { $in: ['pending', 'accepted'] },
        'timeline.expiresAt': { $lte: new Date() }
      }).populate('client expert');

      for (const question of expiredQuestions) {
        await this.expireQuestion(question);
      }

      console.log(`Processed ${expiredQuestions.length} expired questions`);
    } catch (error) {
      console.error('Error processing expired questions:', error);
      throw error;
    }
  }

  // Expire a single question
  async expireQuestion(question) {
    try {
      question.status = 'expired';
      await question.save();

      // Process refund
      await this.processRefund(question._id);

      // Notify users
      socketService.emitToUser(question.client._id.toString(), 'questionExpired', {
        questionId: question._id,
        message: 'Your question has expired and a refund has been processed'
      });

      socketService.emitToUser(question.expert._id.toString(), 'questionExpired', {
        questionId: question._id,
        message: 'Question has expired due to no response'
      });

    } catch (error) {
      console.error('Error expiring question:', error);
      throw error;
    }
  }

  // Process refund for declined/expired questions
  async processRefund(questionId) {
    try {
      const question = await Question.findById(questionId).populate('client');
      if (!question) {
        throw new Error('Question not found');
      }

      // Find client's wallet
      const clientWallet = await Wallet.findOne({ user: question.client._id });
      if (!clientWallet) {
        throw new Error('Client wallet not found');
      }

      // Add refund to client's wallet
      const refundAmount = question.pricing.clientCharge;
      await clientWallet.addFunds(refundAmount, `Refund for question #${question._id}`);

      // Create transaction record
      await TransactionHistory.create({
        user: question.client._id,
        type: 'credit',
        category: 'refund',
        amount: refundAmount,
        description: `Refund for expired/declined question`,
        relatedQuestion: question._id,
        balanceAfter: clientWallet.balance
      });

      // Update question status
      question.status = 'refunded';
      question.timeline.refundedAt = new Date();
      await question.save();

      console.log(`Processed refund of ${refundAmount} ETB for question ${questionId}`);
    } catch (error) {
      console.error('Error processing refund:', error);
      throw error;
    }
  }

  // Send expiry warnings
  async sendExpiryWarnings() {
    try {
      const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
      const thirtyMinutesFromNow = new Date(Date.now() + 30 * 60 * 1000);

      // Find questions expiring in 1 hour
      const questionsExpiringSoon = await Question.find({
        status: { $in: ['pending', 'accepted'] },
        'timeline.expiresAt': { 
          $gte: new Date(),
          $lte: oneHourFromNow
        }
      });

      for (const question of questionsExpiringSoon) {
        const timeRemaining = Math.ceil((question.timeline.expiresAt - new Date()) / (1000 * 60));
        
        socketService.sendExpiryWarning(
          question._id,
          question.client.toString(),
          question.expert.toString(),
          timeRemaining
        );
      }

    } catch (error) {
      console.error('Error sending expiry warnings:', error);
    }
  }

  // Create new question
  async createQuestion(questionData) {
    try {
      const question = new Question(questionData);
      
      // Set expiry time
      question.timeline.expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000);
      
      await question.save();
      
      // Notify expert
      socketService.emitToUser(question.expert.toString(), 'newQuestion', {
        questionId: question._id,
        clientName: questionData.clientName,
        questionType: question.questionType,
        amount: question.pricing.amount
      });

      return question;
    } catch (error) {
      console.error('Error creating question:', error);
      throw error;
    }
  }

  // Accept question
  async acceptQuestion(questionId, expertId) {
    try {
      const question = await Question.findOne({
        _id: questionId,
        expert: expertId,
        status: 'pending'
      });

      if (!question) {
        throw new Error('Question not found or already processed');
      }

      if (question.isExpired()) {
        throw new Error('Question has expired');
      }

      await question.accept();
      return question;
    } catch (error) {
      console.error('Error accepting question:', error);
      throw error;
    }
  }

  // Decline question
  async declineQuestion(questionId, expertId, reason) {
    try {
      const question = await Question.findOne({
        _id: questionId,
        expert: expertId,
        status: 'pending'
      });

      if (!question) {
        throw new Error('Question not found or already processed');
      }

      await question.decline(reason);
      return question;
    } catch (error) {
      console.error('Error declining question:', error);
      throw error;
    }
  }

  // Complete question with answer
  async completeQuestion(questionId, expertId, answerData) {
    try {
      const question = await Question.findOne({
        _id: questionId,
        expert: expertId,
        status: 'accepted'
      });

      if (!question) {
        throw new Error('Question not found or not accepted');
      }

      await question.complete(answerData);
      return question;
    } catch (error) {
      console.error('Error completing question:', error);
      throw error;
    }
  }
}

module.exports = new QuestionService();