import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user, token } = useAuth();

  useEffect(() => {
    if (user && token) {
      const newSocket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000', {
        auth: {
          token: token
        }
      });

      newSocket.on('connect', () => {
        console.log('Connected to server');
        setConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setConnected(false);
      });

      // Listen for question-related events
      newSocket.on('new_question', (data) => {
        toast.success('New question received!');
      });

      newSocket.on('question_accepted', (data) => {
        toast.success('Your question has been accepted!');
      });

      newSocket.on('question_answered', (data) => {
        toast.success('Your question has been answered!');
      });

      newSocket.on('question_refunded', (data) => {
        toast.error(`Question refunded: ${data.refundAmount} ETB returned to your wallet`);
      });

      // Listen for typing indicators
      newSocket.on('user_typing', (data) => {
        // Handle user typing indicator
      });

      newSocket.on('expert_typing', (data) => {
        // Handle expert typing indicator
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
        setConnected(false);
      }
    }
  }, [user, token]);

  const joinQuestionRoom = (questionId) => {
    if (socket) {
      socket.emit('join_question_room', questionId);
    }
  };

  const leaveQuestionRoom = (questionId) => {
    if (socket) {
      socket.emit('leave_question_room', questionId);
    }
  };

  const startTyping = (data) => {
    if (socket) {
      if (user.role === 'expert') {
        socket.emit('expert_typing_start', data);
      } else {
        socket.emit('typing_start', data);
      }
    }
  };

  const stopTyping = (data) => {
    if (socket) {
      if (user.role === 'expert') {
        socket.emit('expert_typing_stop', data);
      } else {
        socket.emit('typing_stop', data);
      }
    }
  };

  const value = {
    socket,
    connected,
    joinQuestionRoom,
    leaveQuestionRoom,
    startTyping,
    stopTyping
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};