class SocketService {
  constructor() {
    this.io = null;
    this.userSockets = new Map(); // userId -> socketId mapping
  }

  initialize(io) {
    this.io = io;
    
    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);
      
      // Handle user authentication
      socket.on('authenticate', (data) => {
        if (data.userId) {
          this.userSockets.set(data.userId, socket.id);
          socket.userId = data.userId;
          socket.join(`user_${data.userId}`);
          console.log(`User ${data.userId} authenticated with socket ${socket.id}`);
        }
      });
      
      // Handle joining expert room
      socket.on('joinExpertRoom', (expertId) => {
        socket.join(`expert_${expertId}`);
      });
      
      // Handle joining question room
      socket.on('joinQuestionRoom', (questionId) => {
        socket.join(`question_${questionId}`);
      });
      
      // Handle disconnect
      socket.on('disconnect', () => {
        if (socket.userId) {
          this.userSockets.delete(socket.userId);
          console.log(`User ${socket.userId} disconnected`);
        }
      });
    });
  }

  // Emit to specific user
  emitToUser(userId, event, data) {
    if (this.io) {
      this.io.to(`user_${userId}`).emit(event, data);
    }
  }

  // Emit to expert
  emitToExpert(expertId, event, data) {
    if (this.io) {
      this.io.to(`expert_${expertId}`).emit(event, data);
    }
  }

  // Emit to question room (both client and expert)
  emitToQuestion(questionId, event, data) {
    if (this.io) {
      this.io.to(`question_${questionId}`).emit(event, data);
    }
  }

  // Broadcast to all connected users
  broadcast(event, data) {
    if (this.io) {
      this.io.emit(event, data);
    }
  }

  // Send notification
  sendNotification(userId, notification) {
    this.emitToUser(userId, 'notification', {
      id: Date.now(),
      ...notification,
      timestamp: new Date()
    });
  }

  // Send question expiry warning
  sendExpiryWarning(questionId, clientId, expertId, timeRemaining) {
    const warningData = {
      questionId,
      timeRemaining,
      message: `Question expires in ${timeRemaining} minutes`
    };
    
    this.emitToUser(clientId, 'questionExpiryWarning', warningData);
    this.emitToUser(expertId, 'questionExpiryWarning', warningData);
  }

  // Send real-time earnings update
  sendEarningsUpdate(expertId, earnings) {
    this.emitToUser(expertId, 'earningsUpdate', earnings);
  }
}

module.exports = new SocketService();