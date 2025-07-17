import {
  GetUserNotificationsResponse,
  UpdateNotificationRequest,
  UpdateNotificationResponse,
  MarkAllNotificationsResponse,
  NotificationPreferences,
  NotificationPreferencesResponse,
  PaginatedNotificationsResponse,
  NotificationFilters,
  UserNotify
} from '../types/notification';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

class NotificationAPI {
  private getAuthHeaders(token?: string) {
    // Try to get token from parameter first, then from localStorage
    const authToken = token || localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  /**
   * Get all notifications for the current user
   */
  async getUserNotifications(userId: string, token?: string): Promise<GetUserNotificationsResponse> {
    const url = `${API_BASE_URL}/api/user_notify/${userId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });

    try {
      const data = await this.handleResponse<UserNotify[]>(response);
      return { 
        success: true, 
        data: Array.isArray(data) ? data : [data] 
      };
    } catch (error) {
      return { 
        success: false, 
        data: [], 
        message: error instanceof Error ? error.message : 'Failed to fetch notifications' 
      };
    }
  }

  /**
   * Get all user notifications (admin endpoint accessible to users)
   */
  async getAllUserNotifications(token?: string): Promise<GetUserNotificationsResponse> {
    const url = `${API_BASE_URL}/api/user_notify/all`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });

    try {
      const data = await this.handleResponse<UserNotify[]>(response);
      return { 
        success: true, 
        data: Array.isArray(data) ? data : [data] 
      };
    } catch (error) {
      return { 
        success: false, 
        data: [], 
        message: error instanceof Error ? error.message : 'Failed to fetch notifications' 
      };
    }
  }

  /**
   * Update a specific notification (mark as read, etc.)
   */
  async updateNotification(
    notificationId: string, 
    updates: UpdateNotificationRequest, 
    token?: string
  ): Promise<UpdateNotificationResponse> {
    const url = `${API_BASE_URL}/api/user_notify/update/${notificationId}`;
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(updates),
    });

    try {
      const data = await this.handleResponse<UserNotify>(response);
      return { success: true, data };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to update notification');
    }
  }

  /**
   * Mark all notifications as sent for a user
   */
  async markAllNotificationsAsSent(userId: string, token?: string): Promise<MarkAllNotificationsResponse> {
    const url = `${API_BASE_URL}/api/user_notify/mark-all-sent/${userId}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
    });

    try {
      await this.handleResponse<void>(response);
      return { 
        success: true, 
        message: 'All notifications marked as sent successfully' 
      };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to mark notifications as sent' 
      };
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, token?: string): Promise<UpdateNotificationResponse> {
    return this.updateNotification(
      notificationId, 
      { 
        isRead: true, 
        readAt: new Date().toISOString() 
      }, 
      token
    );
  }

  /**
   * Mark notification as unread
   */
  async markAsUnread(notificationId: string, token?: string): Promise<UpdateNotificationResponse> {
    return this.updateNotification(
      notificationId, 
      { 
        isRead: false, 
        readAt: undefined 
      }, 
      token
    );
  }

  /**
   * Get notifications with filters and pagination
   */
  async getNotificationsWithFilters(
    userId: string,
    filters: NotificationFilters = {},
    page: number = 1,
    limit: number = 20,
    token?: string
  ): Promise<PaginatedNotificationsResponse> {
    // Since the backend doesn't support filtering yet, we'll get all and filter client-side
    try {
      const response = await this.getUserNotifications(userId, token);
      
      if (!response.success) {
        return {
          success: false,
          data: [],
          pagination: { page, limit, total: 0, totalPages: 0 },
          stats: { total: 0, unread: 0, read: 0, unsent: 0 },
          message: response.message
        };
      }

      let filteredData = response.data;

      // Apply filters
      if (filters.type) {
        filteredData = filteredData.filter(item => item.notify.type === filters.type);
      }
      
      if (filters.isRead !== undefined) {
        filteredData = filteredData.filter(item => item.is_read === filters.isRead);
      }

      if (filters.courseId) {
        filteredData = filteredData.filter(item => 
          item.notify.course?.courseId === filters.courseId
        );
      }

      if (filters.dateFrom) {
        filteredData = filteredData.filter(item => 
          new Date(item.notify.createdAt) >= new Date(filters.dateFrom!)
        );
      }

      if (filters.dateTo) {
        filteredData = filteredData.filter(item => 
          new Date(item.notify.createdAt) <= new Date(filters.dateTo!)
        );
      }

      // Calculate stats
      const stats = {
        total: response.data.length,
        unread: response.data.filter(item => !item.is_read).length,
        read: response.data.filter(item => item.is_read).length,
        unsent: response.data.filter(item => !item.is_sent).length,
      };

      // Apply pagination
      const total = filteredData.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const paginatedData = filteredData.slice(startIndex, startIndex + limit);

      return {
        success: true,
        data: paginatedData,
        pagination: { page, limit, total, totalPages },
        stats,
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
        stats: { total: 0, unread: 0, read: 0, unsent: 0 },
        message: error instanceof Error ? error.message : 'Failed to fetch notifications'
      };
    }
  }

  /**
   * Get notification preferences (placeholder - implement when backend supports it)
   */
  async getNotificationPreferences(): Promise<NotificationPreferencesResponse> {
    // This is a placeholder since the backend doesn't have this endpoint yet
    // You can implement this when the backend supports user preferences
    const defaultPreferences: NotificationPreferences = {
      emailNotifications: true,
      pushNotifications: true,
      courseUpdates: true,
      promotions: false,
      systemAlerts: true,
    };

    return {
      success: true,
      data: defaultPreferences,
    };
  }

  /**
   * Update notification preferences (placeholder - implement when backend supports it)
   */
  async updateNotificationPreferences(
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferencesResponse> {

    const currentPreferences = await this.getNotificationPreferences();
    
    if (currentPreferences.success) {
      const updatedPreferences = { ...currentPreferences.data, ...preferences };
      return {
        success: true,
        data: updatedPreferences,
      };
    }

    return currentPreferences;
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string, token?: string): Promise<{ success: boolean; count: number; message?: string }> {
    try {
      const response = await this.getUserNotifications(userId, token);
      
      if (!response.success) {
        return { success: false, count: 0, message: response.message };
      }

      const unreadCount = response.data.filter(item => !item.is_read).length;
      
      return { success: true, count: unreadCount };
    } catch (error) {
      return { 
        success: false, 
        count: 0, 
        message: error instanceof Error ? error.message : 'Failed to get unread count' 
      };
    }
  }

  /**
   * Bulk mark notifications as read
   */
  async bulkMarkAsRead(notificationIds: string[], token?: string): Promise<{ success: boolean; message: string }> {
    try {
      const promises = notificationIds.map(id => this.markAsRead(id, token));
      await Promise.all(promises);
      
      return { 
        success: true, 
        message: `${notificationIds.length} notifications marked as read` 
      };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to mark notifications as read' 
      };
    }
  }
}

export const notificationAPI = new NotificationAPI();
export default notificationAPI;