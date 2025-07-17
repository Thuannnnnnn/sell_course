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

// API Request/Response types
export interface GetUserNotificationsResponse {
  success: boolean;
  data: UserNotify[];
  message?: string;
}

export interface UpdateNotificationRequest {
  isRead?: boolean;
  isSent?: boolean;
  readAt?: string;
}

export interface UpdateNotificationResponse {
  success: boolean;
  data: UserNotify;
  message?: string;
}

export interface MarkAllNotificationsRequest {
  userId: string;
}

export interface MarkAllNotificationsResponse {
  success: boolean;
  message: string;
}

// Notification statistics
export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  unsent: number;
}

// Notification filter options
export interface NotificationFilters {
  type?: 'USER' | 'COURSE' | 'GLOBAL' | 'ADMIN';
  isRead?: boolean;
  dateFrom?: string;
  dateTo?: string;
  courseId?: string;
}

// Pagination
export interface NotificationPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedNotificationsResponse {
  success: boolean;
  data: UserNotify[];
  pagination: NotificationPagination;
  stats: NotificationStats;
  message?: string;
}

// Real-time notification event
export interface NotificationEvent {
  type: 'NEW_NOTIFICATION' | 'NOTIFICATION_READ' | 'NOTIFICATION_DELETED';
  data: UserNotify;
  userId: string;
}

// Notification preferences
export interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  courseUpdates: boolean;
  promotions: boolean;
  systemAlerts: boolean;
}

export interface NotificationPreferencesResponse {
  success: boolean;
  data: NotificationPreferences;
  message?: string;
}