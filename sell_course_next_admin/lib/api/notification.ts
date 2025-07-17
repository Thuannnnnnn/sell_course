import {
  CreateNotificationRequest,
  CreateNotificationResponse,
  UpdateNotificationRequest,
  UpdateNotificationResponse,
  DeleteNotificationResponse,
  GetAllNotificationsResponse,
  GetNotificationByIdResponse,
  GetAllUserNotificationsResponse,
  GetUserNotificationsByUserIdResponse,
  UpdateUserNotificationRequest,
  UpdateUserNotificationResponse,
  NotificationAnalytics,
  NotificationAnalyticsResponse,

  BulkDeleteNotificationsRequest,
  BulkDeleteNotificationsResponse,
  BulkUpdateUserNotificationsRequest,
  BulkUpdateUserNotificationsResponse,
  AdminNotificationFilters,
  PaginatedNotificationsResponse,
  PaginatedUserNotificationsResponse,
  NotificationTemplateResponse,
  Notify,
  UserNotify
} from '../types/notification';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

class AdminNotificationAPI {
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

  // ============ NOTIFICATION MANAGEMENT ============

  /**
   * Get all notifications (admin)
   */
  async getAllNotifications(token?: string): Promise<GetAllNotificationsResponse> {
    const url = `${API_BASE_URL}/api/admin/notify/`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });

    try {
      const data = await this.handleResponse<Notify[]>(response);
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
   * Get notification by ID
   */
  async getNotificationById(notificationId: string, token?: string): Promise<GetNotificationByIdResponse> {
    const url = `${API_BASE_URL}/api/admin/notify/${notificationId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });

    try {
      const data = await this.handleResponse<Notify>(response);
      return { success: true, data };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch notification');
    }
  }

  /**
   * Create a new notification
   */
  async createNotification(
    notificationData: CreateNotificationRequest, 
    token?: string
  ): Promise<CreateNotificationResponse> {
    const url = `${API_BASE_URL}/api/admin/notify/create`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(notificationData),
    });

    try {
      const data = await this.handleResponse<Notify>(response);
      return { success: true, data };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to create notification');
    }
  }

  /**
   * Update a notification
   */
  async updateNotification(
    notificationId: string,
    updates: UpdateNotificationRequest,
    token?: string
  ): Promise<UpdateNotificationResponse> {
    const url = `${API_BASE_URL}/api/admin/notify/${notificationId}`;
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(updates),
    });

    try {
      const data = await this.handleResponse<Notify>(response);
      return { success: true, data };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to update notification');
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string, token?: string): Promise<DeleteNotificationResponse> {
    const url = `${API_BASE_URL}/api/admin/notify/${notificationId}`;
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.getAuthHeaders(token),
    });

    try {
      // Handle 204 No Content response (successful deletion)
      if (response.status === 204) {
        return { 
          success: true, 
          message: 'Notification deleted successfully' 
        };
      }
      
      // Handle other successful responses
      if (response.ok) {
        const result = await response.text(); // Backend returns string
        return { 
          success: true, 
          message: result || 'Notification deleted successfully' 
        };
      }
      
      // Handle error responses
      const errorData = await response.json().catch(() => ({}));
      return { 
        success: false, 
        message: errorData.message || `HTTP error! status: ${response.status}` 
      };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to delete notification' 
      };
    }
  }

  /**
   * Get notification recipients (user IDs)
   */
  async getNotificationUserIds(notificationId: string, token?: string): Promise<{ success: boolean; userIds: string[]; message?: string }> {
    const url = `${API_BASE_URL}/api/admin/notify/${notificationId}/users`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });

    try {
      const userIds = await this.handleResponse<string[]>(response);
      return { success: true, userIds };
    } catch (error) {
      return { 
        success: false, 
        userIds: [], 
        message: error instanceof Error ? error.message : 'Failed to fetch notification recipients' 
      };
    }
  }

  /**
   * Get notification course IDs
   */
  async getNotificationCourseIds(notificationId: string, token?: string): Promise<{ success: boolean; type: string; courseIds: string[]; message?: string }> {
    const url = `${API_BASE_URL}/api/admin/notify/${notificationId}/courses`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });

    try {
      const data = await this.handleResponse<{ type: string; courseIds: string[] }>(response);
      return { success: true, ...data };
    } catch (error) {
      return { 
        success: false, 
        type: '', 
        courseIds: [], 
        message: error instanceof Error ? error.message : 'Failed to fetch notification course IDs' 
      };
    }
  }

  // ============ USER NOTIFICATION MANAGEMENT ============

  /**
   * Get all user notifications
   */
  async getAllUserNotifications(token?: string): Promise<GetAllUserNotificationsResponse> {
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
        message: error instanceof Error ? error.message : 'Failed to fetch user notifications' 
      };
    }
  }

  /**
   * Get user notifications by user ID
   */
  async getUserNotificationsByUserId(userId: string, token?: string): Promise<GetUserNotificationsByUserIdResponse> {
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
        message: error instanceof Error ? error.message : 'Failed to fetch user notifications' 
      };
    }
  }

  /**
   * Update user notification
   */
  async updateUserNotification(
    userNotificationId: string,
    updates: UpdateUserNotificationRequest,
    token?: string
  ): Promise<UpdateUserNotificationResponse> {
    const url = `${API_BASE_URL}/api/user_notify/update/${userNotificationId}`;
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(updates),
    });

    try {
      const data = await this.handleResponse<UserNotify>(response);
      return { success: true, data };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to update user notification');
    }
  }

  /**
   * Mark all notifications as sent for a user
   */
  async markAllNotificationsAsSent(userId: string, token?: string): Promise<{ success: boolean; message: string }> {
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

  // ============ ANALYTICS AND REPORTING ============

  /**
   * Get notification analytics
   */
  async getNotificationAnalytics(token?: string): Promise<NotificationAnalyticsResponse> {
    try {
      // Since there's no dedicated analytics endpoint, we'll calculate from existing data
      const [notificationsResponse, userNotificationsResponse] = await Promise.all([
        this.getAllNotifications(token),
        this.getAllUserNotifications(token)
      ]);

      if (!notificationsResponse.success || !userNotificationsResponse.success) {
        return {
          success: false,
          data: {
            totalNotifications: 0,
            totalUserNotifications: 0,
            readRate: 0,
            sentRate: 0,
            typeDistribution: { USER: 0, COURSE: 0, GLOBAL: 0, ADMIN: 0 },
            recentActivity: []
          },
          message: 'Failed to fetch analytics data'
        };
      }

      const notifications = notificationsResponse.data;
      const userNotifications = userNotificationsResponse.data;

      // Calculate analytics
      const totalNotifications = notifications.length;
      const totalUserNotifications = userNotifications.length;
      const readCount = userNotifications.filter(un => un.is_read).length;
      const sentCount = userNotifications.filter(un => un.is_sent).length;
      
      const readRate = totalUserNotifications > 0 ? (readCount / totalUserNotifications) * 100 : 0;
      const sentRate = totalUserNotifications > 0 ? (sentCount / totalUserNotifications) * 100 : 0;

      // Type distribution
      const typeDistribution = notifications.reduce((acc, notification) => {
        acc[notification.type] = (acc[notification.type] || 0) + 1;
        return acc;
      }, { USER: 0, COURSE: 0, GLOBAL: 0, ADMIN: 0 });

      // Recent activity (last 7 days)
      const recentActivity = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayNotifications = notifications.filter(n => 
          n.createdAt.startsWith(dateStr)
        );
        
        const dayUserNotifications = userNotifications.filter(un => 
          un.notify.createdAt.startsWith(dateStr)
        );

        recentActivity.push({
          date: dateStr,
          created: dayNotifications.length,
          read: dayUserNotifications.filter(un => un.is_read && un.read_at?.startsWith(dateStr)).length,
          sent: dayUserNotifications.filter(un => un.is_sent).length
        });
      }

      const analytics: NotificationAnalytics = {
        totalNotifications,
        totalUserNotifications,
        readRate,
        sentRate,
        typeDistribution,
        recentActivity
      };

      return { success: true, data: analytics };
    } catch (error) {
      return {
        success: false,
        data: {
          totalNotifications: 0,
          totalUserNotifications: 0,
          readRate: 0,
          sentRate: 0,
          typeDistribution: { USER: 0, COURSE: 0, GLOBAL: 0, ADMIN: 0 },
          recentActivity: []
        },
        message: error instanceof Error ? error.message : 'Failed to calculate analytics'
      };
    }
  }

  // ============ BULK OPERATIONS ============

  /**
   * Bulk delete notifications
   */
  async bulkDeleteNotifications(
    request: BulkDeleteNotificationsRequest, 
    token?: string
  ): Promise<BulkDeleteNotificationsResponse> {
    try {
      const promises = request.notificationIds.map(id => this.deleteNotification(id, token));
      const results = await Promise.allSettled(promises);
      
      const successCount = results.filter(result => result.status === 'fulfilled').length;
      
      return {
        success: successCount > 0,
        deletedCount: successCount,
        message: `${successCount} out of ${request.notificationIds.length} notifications deleted successfully`
      };
    } catch (error) {
      return {
        success: false,
        deletedCount: 0,
        message: error instanceof Error ? error.message : 'Failed to delete notifications'
      };
    }
  }

  /**
   * Bulk update user notifications
   */
  async bulkUpdateUserNotifications(
    request: BulkUpdateUserNotificationsRequest,
    token?: string
  ): Promise<BulkUpdateUserNotificationsResponse> {
    try {
      const promises = request.userNotificationIds.map(id => 
        this.updateUserNotification(id, request.updates, token)
      );
      const results = await Promise.allSettled(promises);
      
      const successCount = results.filter(result => result.status === 'fulfilled').length;
      
      return {
        success: successCount > 0,
        updatedCount: successCount,
        message: `${successCount} out of ${request.userNotificationIds.length} user notifications updated successfully`
      };
    } catch (error) {
      return {
        success: false,
        updatedCount: 0,
        message: error instanceof Error ? error.message : 'Failed to update user notifications'
      };
    }
  }

  // ============ FILTERING AND PAGINATION ============

  /**
   * Get notifications with filters and pagination
   */
  async getNotificationsWithFilters(
    filters: AdminNotificationFilters = {},
    page: number = 1,
    limit: number = 20,
    token?: string
  ): Promise<PaginatedNotificationsResponse> {
    try {
      const response = await this.getAllNotifications(token);
      
      if (!response.success) {
        return {
          success: false,
          data: [],
          pagination: { page, limit, total: 0, totalPages: 0 },
          message: response.message
        };
      }

      let filteredData = response.data;

      // Apply filters
      if (filters.type) {
        filteredData = filteredData.filter(item => item.type === filters.type);
      }
      
      if (filters.isGlobal !== undefined) {
        filteredData = filteredData.filter(item => item.isGlobal === filters.isGlobal);
      }

      if (filters.isAdmin !== undefined) {
        filteredData = filteredData.filter(item => item.isAdmin === filters.isAdmin);
      }

      if (filters.courseId) {
        filteredData = filteredData.filter(item => 
          item.course?.courseId === filters.courseId
        );
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredData = filteredData.filter(item => 
          item.title.toLowerCase().includes(searchLower) ||
          item.message.toLowerCase().includes(searchLower)
        );
      }

      if (filters.dateFrom) {
        filteredData = filteredData.filter(item => 
          new Date(item.createdAt) >= new Date(filters.dateFrom!)
        );
      }

      if (filters.dateTo) {
        filteredData = filteredData.filter(item => 
          new Date(item.createdAt) <= new Date(filters.dateTo!)
        );
      }

      // Apply pagination
      const total = filteredData.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const paginatedData = filteredData.slice(startIndex, startIndex + limit);

      return {
        success: true,
        data: paginatedData,
        pagination: { page, limit, total, totalPages },
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
        message: error instanceof Error ? error.message : 'Failed to fetch notifications'
      };
    }
  }

  /**
   * Get user notifications with filters and pagination
   */
  async getUserNotificationsWithFilters(
    filters: AdminNotificationFilters = {},
    page: number = 1,
    limit: number = 20,
    token?: string
  ): Promise<PaginatedUserNotificationsResponse> {
    try {
      const response = filters.userId 
        ? await this.getUserNotificationsByUserId(filters.userId, token)
        : await this.getAllUserNotifications(token);
      
      if (!response.success) {
        return {
          success: false,
          data: [],
          pagination: { page, limit, total: 0, totalPages: 0 },
          message: response.message
        };
      }

      let filteredData = response.data;

      // Apply filters
      if (filters.type) {
        filteredData = filteredData.filter(item => item.notify.type === filters.type);
      }

      if (filters.courseId) {
        filteredData = filteredData.filter(item => 
          item.notify.course?.courseId === filters.courseId
        );
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredData = filteredData.filter(item => 
          item.notify.title.toLowerCase().includes(searchLower) ||
          item.notify.message.toLowerCase().includes(searchLower) ||
          item.user.username.toLowerCase().includes(searchLower) ||
          item.user.email.toLowerCase().includes(searchLower)
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

      // Apply pagination
      const total = filteredData.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const paginatedData = filteredData.slice(startIndex, startIndex + limit);

      return {
        success: true,
        data: paginatedData,
        pagination: { page, limit, total, totalPages },
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
        message: error instanceof Error ? error.message : 'Failed to fetch user notifications'
      };
    }
  }

  // ============ TEMPLATES (Placeholder for future implementation) ============

  /**
   * Get notification templates
   */
  async getNotificationTemplates(): Promise<NotificationTemplateResponse> {
    // This is a placeholder for future implementation
    // You can implement this when the backend supports notification templates
    return {
      success: true,
      data: [],
      message: 'Notification templates feature not implemented yet'
    };
  }
}

export const adminNotificationAPI = new AdminNotificationAPI();
export default adminNotificationAPI;