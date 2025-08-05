const jwt = require('jsonwebtoken');
const User = require('../models/User');

const setupSocketHandlers = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return next(new Error('Authentication error'));
      }

      socket.userId = user._id.toString();
      socket.userRole = user.role;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected`);

    // Join user-specific room
    socket.join(`user_${socket.userId}`);
    
    // Join expert-specific room if user is an expert
    if (socket.userRole === 'expert') {
      socket.join(`expert_${socket.userId}`);
    }

    // Handle typing indicators for questions
    socket.on('typing_start', (data) => {
      socket.to(`expert_${data.expertId}`).emit('user_typing', {
        userId: socket.userId,
        questionId: data.questionId
      });
    });

    socket.on('typing_stop', (data) => {
      socket.to(`expert_${data.expertId}`).emit('user_stop_typing', {
        userId: socket.userId,
        questionId: data.questionId
      });
    });

    // Handle expert typing for answers
    socket.on('expert_typing_start', (data) => {
      socket.to(`user_${data.userId}`).emit('expert_typing', {
        expertId: socket.userId,
        questionId: data.questionId
      });
    });

    socket.on('expert_typing_stop', (data) => {
      socket.to(`user_${data.userId}`).emit('expert_stop_typing', {
        expertId: socket.userId,
        questionId: data.questionId
      });
    });

    // Handle real-time status updates
    socket.on('join_question_room', (questionId) => {
      socket.join(`question_${questionId}`);
    });

    socket.on('leave_question_room', (questionId) => {
      socket.leave(`question_${questionId}`);
    });

    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`);
    });
  });
};

module.exports = { setupSocketHandlers };