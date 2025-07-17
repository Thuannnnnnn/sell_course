'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { UserNotify } from '../lib/types/notification';

interface UseWebSocketOptions {
  userId: string;
  enabled?: boolean;
  onNewNotification?: (notification: UserNotify) => void;
  onUpdateNotification?: (notification: UserNotify) => void;
  onRemoveNotification?: (userNotifyId: string) => void;
  onMarkAllAsSent?: (notifications: UserNotify[]) => void;
}

interface UseWebSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
}

export const useWebSocket = ({
  userId,
  enabled = true,
  onNewNotification,
  onUpdateNotification,
  onRemoveNotification,
  onMarkAllAsSent,
}: UseWebSocketOptions): UseWebSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const connect = () => {
    if (socketRef.current || !userId || !enabled) return;

    try {
      const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', {
        query: { userId },
        transports: ['websocket'],
        timeout: 5000,
      });

      socket.on('connect', () => {
        console.log('📡 WebSocket connected');
        setIsConnected(true);
        setError(null);
      });

      socket.on('disconnect', () => {
        console.log('📡 WebSocket disconnected');
        setIsConnected(false);
      });

      socket.on('connect_error', (err) => {
        console.error('📡 WebSocket connection error:', err);
        setError(err.message);
        setIsConnected(false);
      });

      // Notification event listeners
      socket.on('newNotification', (notification: UserNotify) => {
        console.log('🔔 New notification:', notification);
        onNewNotification?.(notification);
      });

      socket.on('updateNotification', (notification: UserNotify) => {
        console.log('🔔 Updated notification:', notification);
        onUpdateNotification?.(notification);
      });

      socket.on('removeNotification', (userNotifyId: string) => {
        console.log('🔔 Remove notification:', userNotifyId);
        onRemoveNotification?.(userNotifyId);
      });

      socket.on('markAllAsSent', (notifications: UserNotify[]) => {
        console.log('🔔 Mark all as sent:', notifications);
        onMarkAllAsSent?.(notifications);
      });

      socketRef.current = socket;
    } catch (err) {
      console.error('Failed to create socket connection:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect');
    }
  };

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  };

  // Auto connect/disconnect based on userId and enabled
  useEffect(() => {
    if (userId && enabled) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [userId, enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    error,
    connect,
    disconnect,
  };
};