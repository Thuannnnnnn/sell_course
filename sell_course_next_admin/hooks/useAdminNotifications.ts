'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminNotificationAPI } from '../lib/api/notification';
import { 
  Notify, 
  UserNotify, 
  AdminNotificationFilters,
  CreateNotificationRequest,
  UpdateNotificationRequest,
  NotificationAnalytics
} from '../lib/types/notification';

interface UseAdminNotificationsReturn {
  // Notifications
  notifications: Notify[];
  userNotifications: UserNotify[];
  analytics: NotificationAnalytics | null;
  
  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  
  // Error states
  error: string | null;
  
  // Actions
  fetchNotifications: () => Promise<void>;
  fetchUserNotifications: () => Promise<void>;
  fetchAnalytics: () => Promise<void>;
  createNotification: (data: CreateNotificationRequest) => Promise<boolean>;
  updateNotification: (id: string, data: UpdateNotificationRequest) => Promise<boolean>;
  deleteNotification: (id: string) => Promise<boolean>;
  bulkDeleteNotifications: (ids: string[]) => Promise<boolean>;
  
  // Filtering
  getFilteredNotifications: (filters: AdminNotificationFilters) => Notify[];
  getFilteredUserNotifications: (filters: AdminNotificationFilters) => UserNotify[];
  
  // Utility
  refreshAll: () => Promise<void>;
}

export const useAdminNotifications = (): UseAdminNotificationsReturn => {
  // State
  const [notifications, setNotifications] = useState<Notify[]>([]);
  const [userNotifications, setUserNotifications] = useState<UserNotify[]>([]);
  const [analytics, setAnalytics] = useState<NotificationAnalytics | null>(null);
  
  // Loading states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  
  // Error state
  const [error, setError] = useState<string | null>(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setError(null);
      const response = await adminNotificationAPI.getAllNotifications();
      
      if (response.success) {
        setNotifications(response.data);
      } else {
        setError(response.message || 'Failed to fetch notifications');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  }, []);

  // Fetch user notifications
  const fetchUserNotifications = useCallback(async () => {
    try {
      setError(null);
      const response = await adminNotificationAPI.getAllUserNotifications();
      
      if (response.success) {
        setUserNotifications(response.data);
      } else {
        setError(response.message || 'Failed to fetch user notifications');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  }, []);

  // Fetch analytics
  const fetchAnalytics = useCallback(async () => {
    try {
      setError(null);
      const response = await adminNotificationAPI.getNotificationAnalytics();
      
      if (response.success) {
        setAnalytics(response.data);
      } else {
        setError(response.message || 'Failed to fetch analytics');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  }, []);

  // Create notification
  const createNotification = useCallback(async (data: CreateNotificationRequest): Promise<boolean> => {
    try {
      setIsCreating(true);
      setError(null);
      
      const response = await adminNotificationAPI.createNotification(data);
      
      if (response.success) {
        // Add new notification to the list
        setNotifications(prev => [response.data, ...prev]);
        return true;
      } else {
        setError('Failed to create notification');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    } finally {
      setIsCreating(false);
    }
  }, []);

  // Update notification
  const updateNotification = useCallback(async (id: string, data: UpdateNotificationRequest): Promise<boolean> => {
    try {
      setIsUpdating(true);
      setError(null);
      
      const response = await adminNotificationAPI.updateNotification(id, data);
      
      if (response.success) {
        // Update notification in the list
        setNotifications(prev => 
          prev.map(notification => 
            notification.notifyId === id ? response.data : notification
          )
        );
        return true;
      } else {
        setError('Failed to update notification');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (id: string): Promise<boolean> => {
    try {
      setIsDeleting(true);
      setError(null);
      
      const response = await adminNotificationAPI.deleteNotification(id);
      
      if (response.success) {
        // Remove notification from the list
        setNotifications(prev => prev.filter(notification => notification.notifyId !== id));
        return true;
      } else {
        setError(response.message || 'Failed to delete notification');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  // Bulk delete notifications
  const bulkDeleteNotifications = useCallback(async (ids: string[]): Promise<boolean> => {
    try {
      setIsDeleting(true);
      setError(null);
      
      const response = await adminNotificationAPI.bulkDeleteNotifications({ notificationIds: ids });
      
      if (response.success) {
        // Remove deleted notifications from the list
        setNotifications(prev => prev.filter(notification => !ids.includes(notification.notifyId)));
        return true;
      } else {
        setError(response.message || 'Failed to delete notifications');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  // Get filtered notifications
  const getFilteredNotifications = useCallback((filters: AdminNotificationFilters): Notify[] => {
    let filtered = notifications;

    if (filters.type) {
      filtered = filtered.filter(item => item.type === filters.type);
    }
    
    if (filters.isGlobal !== undefined) {
      filtered = filtered.filter(item => item.isGlobal === filters.isGlobal);
    }

    if (filters.isAdmin !== undefined) {
      filtered = filtered.filter(item => item.isAdmin === filters.isAdmin);
    }

    if (filters.courseId) {
      filtered = filtered.filter(item => 
        item.course?.courseId === filters.courseId
      );
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchLower) ||
        item.message.toLowerCase().includes(searchLower)
      );
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(item => 
        new Date(item.createdAt) >= new Date(filters.dateFrom!)
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(item => 
        new Date(item.createdAt) <= new Date(filters.dateTo!)
      );
    }

    return filtered;
  }, [notifications]);

  // Get filtered user notifications
  const getFilteredUserNotifications = useCallback((filters: AdminNotificationFilters): UserNotify[] => {
    let filtered = userNotifications;

    if (filters.type) {
      filtered = filtered.filter(item => item.notify.type === filters.type);
    }

    if (filters.userId) {
      filtered = filtered.filter(item => item.user.userId === filters.userId);
    }

    if (filters.courseId) {
      filtered = filtered.filter(item => 
        item.notify.course?.courseId === filters.courseId
      );
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(item => 
        item.notify.title.toLowerCase().includes(searchLower) ||
        item.notify.message.toLowerCase().includes(searchLower) ||
        item.user.username.toLowerCase().includes(searchLower) ||
        item.user.email.toLowerCase().includes(searchLower)
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
  }, [userNotifications]);

  // Refresh all data
  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([
      fetchNotifications(),
      fetchUserNotifications(),
      fetchAnalytics()
    ]);
    setIsLoading(false);
  }, [fetchNotifications, fetchUserNotifications, fetchAnalytics]);

  // Initial fetch
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  return {
    // Data
    notifications,
    userNotifications,
    analytics,
    
    // Loading states
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    
    // Error state
    error,
    
    // Actions
    fetchNotifications,
    fetchUserNotifications,
    fetchAnalytics,
    createNotification,
    updateNotification,
    deleteNotification,
    bulkDeleteNotifications,
    
    // Filtering
    getFilteredNotifications,
    getFilteredUserNotifications,
    
    // Utility
    refreshAll,
  };
};