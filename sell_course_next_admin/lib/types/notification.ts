// Base notification types
export interface Notify {
  notifyId: string;
  title: string;
  message: string;
  type: 'USER' | 'COURSE' | 'GLOBAL' | 'ADMIN';
  isGlobal: boolean;
  isAdmin: boolean;
  createdAt: string;
  course?: {
    courseId: string;
    title: string;
    thumbnail?: string;
  };
}

export interface UserNotify {
  id: string;
  user: {
    userId: string;
    username: string;
    email: string;
    avatar?: string;
  };
  notify: Notify;
  is_read: boolean;
  is_sent: boolean;
  read_at?: string;
}

// Admin-specific notification management types
export interface CreateNotificationRequest {
  title: string;
  message: string;
  type: 'USER' | 'COURSE' | 'GLOBAL' | 'ADMIN';
  isGlobal?: boolean;
  courseIds?: string[];
  userIds?: string[];
}

export interface CreateNotificationResponse {
  success: boolean;
  data: Notify;
  message?: string;
}

export interface UpdateNotificationRequest {
  title?: string;
  message?: string;
  type?: 'USER' | 'COURSE' | 'GLOBAL' | 'ADMIN';
  courseIds?: string[];
  userIds?: string[];
}

export interface UpdateNotificationResponse {
  success: boolean;
  data: Notify;
  message?: string;
}

export interface DeleteNotificationResponse {
  success: boolean;
  message: string;
}

export interface GetAllNotificationsResponse {
  success: boolean;
  data: Notify[];
  message?: string;
}

export interface GetNotificationByIdResponse {
  success: boolean;
  data: Notify;
  message?: string;
}

// User notification management for admin
export interface GetAllUserNotificationsResponse {
  success: boolean;
  data: UserNotify[];
  message?: string;
}

export interface GetUserNotificationsByUserIdResponse {
  success: boolean;
  data: UserNotify[];
  message?: string;
}

export interface UpdateUserNotificationRequest {
  isRead?: boolean;
  isSent?: boolean;
  readAt?: string;
}

export interface UpdateUserNotificationResponse {
  success: boolean;
  data: UserNotify;
  message?: string;
}

// Notification analytics for admin
export interface NotificationAnalytics {
  totalNotifications: number;
  totalUserNotifications: number;
  readRate: number;
  sentRate: number;
  typeDistribution: {
    USER: number;
    COURSE: number;
    GLOBAL: number;
    ADMIN: number;
  };
  recentActivity: {
    date: string;
    created: number;
    read: number;
    sent: number;
  }[];
}

export interface NotificationAnalyticsResponse {
  success: boolean;
  data: NotificationAnalytics;
  message?: string;
}

// Notification recipients info
export interface NotificationRecipients {
  notifyId: string;
  userIds: string[];
  courseIds: string[];
  type: 'USER' | 'COURSE' | 'GLOBAL' | 'ADMIN';
}

export interface GetNotificationRecipientsResponse {
  success: boolean;
  data: NotificationRecipients;
  message?: string;
}

// Bulk operations
export interface BulkDeleteNotificationsRequest {
  notificationIds: string[];
}

export interface BulkDeleteNotificationsResponse {
  success: boolean;
  deletedCount: number;
  message: string;
}

export interface BulkUpdateUserNotificationsRequest {
  userNotificationIds: string[];
  updates: UpdateUserNotificationRequest;
}

export interface BulkUpdateUserNotificationsResponse {
  success: boolean;
  updatedCount: number;
  message: string;
}

// Notification filters and pagination for admin
export interface AdminNotificationFilters {
  type?: 'USER' | 'COURSE' | 'GLOBAL' | 'ADMIN';
  isGlobal?: boolean;
  isAdmin?: boolean;
  dateFrom?: string;
  dateTo?: string;
  courseId?: string;
  userId?: string;
  search?: string;
}

export interface NotificationPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedNotificationsResponse {
  success: boolean;
  data: Notify[];
  pagination: NotificationPagination;
  message?: string;
}

export interface PaginatedUserNotificationsResponse {
  success: boolean;
  data: UserNotify[];
  pagination: NotificationPagination;
  message?: string;
}

// Notification templates for admin
export interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  message: string;
  type: 'USER' | 'COURSE' | 'GLOBAL' | 'ADMIN';
  variables: string[];
  createdAt: string;
  updatedAt: string;
}

export interface NotificationTemplateResponse {
  success: boolean;
  data: NotificationTemplate[];
  message?: string;
}

// Real-time notification events for admin
export interface AdminNotificationEvent {
  type: 'NOTIFICATION_CREATED' | 'NOTIFICATION_UPDATED' | 'NOTIFICATION_DELETED' | 'USER_NOTIFICATION_READ';
  data: Notify | UserNotify;
  adminId: string;
  timestamp: string;
}