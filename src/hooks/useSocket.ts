import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const useSocket = (userId?: string) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!userId) return;

    // Initialize socket connection
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });

    const socket = socketRef.current;

    // Authenticate user
    socket.emit('authenticate', { userId });

    // Connection event handlers
    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [userId]);

  const joinRoom = (room: string) => {
    if (socketRef.current) {
      socketRef.current.emit('joinRoom', room);
    }
  };

  const leaveRoom = (room: string) => {
    if (socketRef.current) {
      socketRef.current.emit('leaveRoom', room);
    }
  };

  const emit = (event: string, data: any) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data);
    }
  };

  const on = (event: string, callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };

  const off = (event: string, callback?: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  };

  return {
    socket: socketRef.current,
    joinRoom,
    leaveRoom,
    emit,
    on,
    off,
    isConnected: socketRef.current?.connected || false,
  };
};

// Hook for real-time notifications
export const useNotifications = (userId?: string) => {
  const { on, off } = useSocket(userId);

  useEffect(() => {
    if (!userId) return;

    const handleNotification = (notification: any) => {
      // You can integrate with a toast library here
      console.log('New notification:', notification);
      
      // Show browser notification if permission granted
      if (Notification.permission === 'granted') {
        new Notification(notification.title || 'New Notification', {
          body: notification.message,
          icon: '/favicon.ico',
        });
      }
    };

    const handleQuestionUpdate = (data: any) => {
      console.log('Question update:', data);
      // Handle question status updates
    };

    const handleEarningsUpdate = (data: any) => {
      console.log('Earnings update:', data);
      // Handle real-time earnings updates
    };

    const handleExpiryWarning = (data: any) => {
      console.log('Question expiry warning:', data);
      // Handle question expiry warnings
    };

    // Subscribe to events
    on('notification', handleNotification);
    on('questionAccepted', handleQuestionUpdate);
    on('questionDeclined', handleQuestionUpdate);
    on('questionCompleted', handleQuestionUpdate);
    on('questionExpired', handleQuestionUpdate);
    on('earningsUpdate', handleEarningsUpdate);
    on('questionExpiryWarning', handleExpiryWarning);

    // Cleanup
    return () => {
      off('notification', handleNotification);
      off('questionAccepted', handleQuestionUpdate);
      off('questionDeclined', handleQuestionUpdate);
      off('questionCompleted', handleQuestionUpdate);
      off('questionExpired', handleQuestionUpdate);
      off('earningsUpdate', handleEarningsUpdate);
      off('questionExpiryWarning', handleExpiryWarning);
    };
  }, [userId, on, off]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);
};