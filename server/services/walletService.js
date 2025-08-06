const Wallet = require('../models/Wallet');
const TransactionHistory = require('../models/TransactionHistory');
const ReferralLog = require('../models/ReferralLog');
const Question = require('../models/Question');
const socketService = require('./socketService');

class WalletService {
  // Initialize wallet for new user
  async initializeWallet(userId) {
    try {
      const existingWallet = await Wallet.findOne({ user: userId });
      if (existingWallet) {
        return existingWallet;
      }

      const wallet = new Wallet({
        user: userId,
        balance: 0
      });

      await wallet.save();
      return wallet;
    } catch (error) {
      console.error('Error initializing wallet:', error);
      throw error;
    }
  }

  // Process payment for question
  async processQuestionPayment(questionId, clientId) {
    try {
      const question = await Question.findById(questionId);
      if (!question) {
        throw new Error('Question not found');
      }

      const clientWallet = await Wallet.findOne({ user: clientId });
      if (!clientWallet) {
        throw new Error('Client wallet not found');
      }

      const totalAmount = question.pricing.clientCharge;
      
      if (clientWallet.balance < totalAmount) {
        throw new Error('Insufficient balance');
      }

      // Deduct from client wallet
      await clientWallet.deductFunds(
        totalAmount,
        `Payment for question #${questionId}`
      );

      // Create transaction record
      await TransactionHistory.create({
        user: clientId,
        type: 'debit',
        category: 'question_payment',
        amount: totalAmount,
        description: `Payment for question to expert`,
        relatedQuestion: questionId,
        balanceAfter: clientWallet.balance
      });

      return { success: true, remainingBalance: clientWallet.balance };
    } catch (error) {
      console.error('Error processing question payment:', error);
      throw error;
    }
  }

  // Process payment to expert when question is completed
  async processExpertPayment(questionId) {
    try {
      const question = await Question.findById(questionId).populate('expert client');
      if (!question) {
        throw new Error('Question not found');
      }

      const expertWallet = await Wallet.findOne({ user: question.expert._id });
      if (!expertWallet) {
        throw new Error('Expert wallet not found');
      }

      const expertEarning = question.pricing.expertEarning;

      // Add to expert wallet
      await expertWallet.addFunds(
        expertEarning,
        `Earning from question #${questionId}`
      );

      expertWallet.totalEarnings += expertEarning;
      await expertWallet.save();

      // Create transaction record
      await TransactionHistory.create({
        user: question.expert._id,
        type: 'credit',
        category: 'expert_earning',
        amount: expertEarning,
        description: `Earning from completed question`,
        relatedQuestion: questionId,
        relatedUser: question.client._id,
        balanceAfter: expertWallet.balance
      });

      // Process referral commission if applicable
      await this.processReferralCommission(question.expert._id, expertEarning, questionId);

      // Send real-time earnings update
      socketService.sendEarningsUpdate(question.expert._id.toString(), {
        amount: expertEarning,
        totalEarnings: expertWallet.totalEarnings,
        balance: expertWallet.balance
      });

      return { success: true, expertEarning };
    } catch (error) {
      console.error('Error processing expert payment:', error);
      throw error;
    }
  }

  // Process referral commission
  async processReferralCommission(expertId, earningAmount, questionId) {
    try {
      const activeReferral = await ReferralLog.findOne({
        referred: expertId,
        status: 'active',
        expiresAt: { $gt: new Date() }
      });

      if (activeReferral) {
        await activeReferral.addCommission(earningAmount, questionId);
        console.log(`Processed referral commission for expert ${expertId}`);
      }
    } catch (error) {
      console.error('Error processing referral commission:', error);
    }
  }

  // Process refund
  async processRefund(questionId) {
    try {
      const question = await Question.findById(questionId);
      if (!question) {
        throw new Error('Question not found');
      }

      const clientWallet = await Wallet.findOne({ user: question.client });
      if (!clientWallet) {
        throw new Error('Client wallet not found');
      }

      const refundAmount = question.pricing.clientCharge;

      // Add refund to client wallet
      await clientWallet.addFunds(
        refundAmount,
        `Refund for question #${questionId}`
      );

      // Create transaction record
      await TransactionHistory.create({
        user: question.client,
        type: 'credit',
        category: 'refund',
        amount: refundAmount,
        description: `Refund for expired/declined question`,
        relatedQuestion: questionId,
        balanceAfter: clientWallet.balance
      });

      return { success: true, refundAmount };
    } catch (error) {
      console.error('Error processing refund:', error);
      throw error;
    }
  }

  // Add funds to wallet (for admin or payment gateway)
  async addFunds(userId, amount, description = 'Funds added') {
    try {
      const wallet = await Wallet.findOne({ user: userId });
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      await wallet.addFunds(amount, description);
      return wallet;
    } catch (error) {
      console.error('Error adding funds:', error);
      throw error;
    }
  }

  // Get wallet balance
  async getBalance(userId) {
    try {
      const wallet = await Wallet.findOne({ user: userId });
      return wallet ? wallet.balance : 0;
    } catch (error) {
      console.error('Error getting balance:', error);
      throw error;
    }
  }

  // Get transaction history
  async getTransactionHistory(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;
      
      const transactions = await TransactionHistory.find({ user: userId })
        .populate('relatedUser', 'firstName lastName')
        .populate('relatedQuestion', 'questionText')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await TransactionHistory.countDocuments({ user: userId });

      return {
        transactions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting transaction history:', error);
      throw error;
    }
  }
}

module.exports = new WalletService();