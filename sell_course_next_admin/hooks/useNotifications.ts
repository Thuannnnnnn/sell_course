'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { io, Socket } from 'socket.io-client';
import { NotificationResponseDto, NotificationListResponseDto, NotificationDetailResponseDto } from '@/types/notification';

interface UseNotificationsReturn {
  notifications: NotificationResponseDto[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  getNotificationDetail: (notificationId: string) => Promise<NotificationDetailResponseDto | null>;
  archiveNotification: (notificationId: string) => Promise<void>;
}

export function useNotifications(userId: string, userRole: string): UseNotificationsReturn {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<NotificationResponseDto[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!userId) return;

    const socketInstance = io(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, {
      query: {
        userId,
        userRole,
      },
      transports: ['websocket'],
    });

    socketInstance.on('connect', () => {
      console.log('Connected to notification socket');
    });

    socketInstance.on('new_notification', (notification: NotificationResponseDto) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Show browser notification if permission granted
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
        });
      }
    });

    socketInstance.on('unread_count', (data: { count: number }) => {
      setUnreadCount(data.count);
    });

    socketInstance.on('notification_marked', (data: { notificationId: string }) => {
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === data.notificationId
            ? { ...notif, status: 'READ' as any, readAt: new Date() }
            : notif
        )
      );
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from notification socket');
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [userId, userRole]);

  // Request notification permission
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!userId || !session?.accessToken) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data: NotificationListResponseDto = await response.json();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, session?.accessToken]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!userId || !session?.accessToken) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/mark`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationId,
          status: 'READ',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      // Update local state
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId
            ? { ...notif, status: 'read' as any, readAt: new Date() }
            : notif
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError(err instanceof Error ? err.message : 'Failed to mark as read');
    }
  }, [userId, session?.accessToken]);

  const markAllAsRead = useCallback(async () => {
    if (!userId || !session?.accessToken) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/mark-all`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'read',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }

      // Update local state
      setNotifications(prev =>
        prev.map(notif => ({
          ...notif,
          status: 'read' as any,
          readAt: notif.readAt || new Date(),
        }))
      );
      
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      setError(err instanceof Error ? err.message : 'Failed to mark all as read');
    }
  }, [userId, session?.accessToken]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!userId || !session?.accessToken) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }

      // Update local state
      const deletedNotification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      
      if (deletedNotification?.status === 'UNREAD') {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete notification');
    }
  }, [userId, session?.accessToken, notifications]);

  const getNotificationDetail = useCallback(async (notificationId: string): Promise<NotificationDetailResponseDto | null> => {
    if (!userId || !session?.accessToken) return null;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${notificationId}/detail`, {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get notification detail');
      }

      const data: NotificationDetailResponseDto = await response.json();
      return data;
    } catch (err) {
      console.error('Error getting notification detail:', err);
      setError(err instanceof Error ? err.message : 'Failed to get notification detail');
      return null;
    }
  }, [userId, session?.accessToken]);

  const archiveNotification = useCallback(async (notificationId: string) => {
    if (!userId || !session?.accessToken) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${notificationId}/archive`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to archive notification');
      }

      // Update local state
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId
            ? { ...notif, status: 'ARCHIVED' as any }
            : notif
        )
      );
      
      const archivedNotification = notifications.find(n => n.id === notificationId);
      if (archivedNotification?.status === 'UNREAD') {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error archiving notification:', err);
      setError(err instanceof Error ? err.message : 'Failed to archive notification');
    }
  }, [userId, session?.accessToken, notifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getNotificationDetail,
    archiveNotification,
  };
}