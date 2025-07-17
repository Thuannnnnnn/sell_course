'use client';

import { useState, useEffect, useCallback } from 'react';
import { notificationAPI } from '../lib/api/notification';
import { UserNotify, NotificationFilters } from '../lib/types/notification';
import { useWebSocket } from './useWebSocket';

interface UseNotificationsOptions {
  userId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableWebSocket?: boolean;
}

interface UseNotificationsReturn {
  notifications: UserNotify[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  getFilteredNotifications: (filters: NotificationFilters) => UserNotify[];
  refreshNotifications: () => Promise<void>;
  isConnected?: boolean;
}

export const useNotifications = ({
  userId,
  autoRefresh = true,
  refreshInterval = 30000, // 30 seconds
  enableWebSocket = true,
}: UseNotificationsOptions): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<UserNotify[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // WebSocket handlers
  const handleNewNotification = useCallback((newNotification: UserNotify) => {
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const handleUpdateNotification = useCallback((updatedNotification: UserNotify) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === updatedNotification.id 
          ? updatedNotification 
          : notification
      )
    );
  }, []);

  const handleRemoveNotification = useCallback((userNotifyId: string) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== userNotifyId)
    );
  }, []);

  const handleMarkAllAsSent = useCallback((sentNotifications: UserNotify[]) => {
    setNotifications(prev => 
      prev.map(notification => {
        const sentNotification = sentNotifications.find(sent => sent.id === notification.id);
        return sentNotification ? { ...notification, is_sent: true } : notification;
      })
    );
  }, []);

  // Initialize WebSocket
  const { isConnected } = useWebSocket({
    userId,
    enabled: enableWebSocket,
    onNewNotification: handleNewNotification,
    onUpdateNotification: handleUpdateNotification,
    onRemoveNotification: handleRemoveNotification,
    onMarkAllAsSent: handleMarkAllAsSent,
  });

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;

    try {
      setError(null);
      const response = await notificationAPI.getUserNotifications(userId);
      
      if (response.success) {
        setNotifications(response.data);
      } else {
        setError(response.message || 'Failed to fetch notifications');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true, read_at: new Date().toISOString() }
            : notification
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.is_read);
      const unreadIds = unreadNotifications.map(n => n.id);
      
      if (unreadIds.length > 0) {
        await notificationAPI.bulkMarkAsRead(unreadIds);
        
        setNotifications(prev => 
          prev.map(notification => ({ 
            ...notification, 
            is_read: true, 
            read_at: new Date().toISOString() 
          }))
        );
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  }, [notifications]);

  // Get filtered notifications
  const getFilteredNotifications = useCallback((filters: NotificationFilters): UserNotify[] => {
    let filtered = notifications;

    if (filters.type) {
      filtered = filtered.filter(item => item.notify.type === filters.type);
    }
    
    if (filters.isRead !== undefined) {
      filtered = filtered.filter(item => item.is_read === filters.isRead);
    }

    if (filters.courseId) {
      filtered = filtered.filter(item => 
        item.notify.course?.courseId === filters.courseId
      );
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(item => 
        new Date(item.notify.createdAt) >= new Date(filters.dateFrom!)
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(item => 
        new Date(item.notify.createdAt) <= new Date(filters.dateTo!)
      );
    }

    return filtered;
  }, [notifications]);

  // Refresh notifications (alias for fetchNotifications)
  const refreshNotifications = useCallback(async () => {
    setIsLoading(true);
    await fetchNotifications();
  }, [fetchNotifications]);

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Initial fetch
  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId, fetchNotifications]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !userId) return;

    const interval = setInterval(() => {
      fetchNotifications();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, userId, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    getFilteredNotifications,
    refreshNotifications,
    isConnected,
  };
};