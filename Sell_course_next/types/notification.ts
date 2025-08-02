export enum NotificationType {
  COURSE_CREATED = 'COURSE_CREATED',
  COURSE_UPDATED = 'COURSE_UPDATED',
  COURSE_PUBLISHED = 'COURSE_PUBLISHED',
  COURSE_REJECTED = 'COURSE_REJECTED',
  COURSE_REVIEW_REQUESTED = 'COURSE_REVIEW_REQUESTED',
  // Enrollment notifications
  ENROLLMENT_CREATED = 'ENROLLMENT_CREATED',
  // Support notifications
  SUPPORT_REQUEST_CREATED = 'SUPPORT_REQUEST_CREATED',
}

export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum NotificationStatus {
  UNREAD = 'UNREAD',
  READ = 'READ',
  ARCHIVED = 'ARCHIVED',
}

export interface NotificationResponseDto {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  metadata: Record<string, unknown>;
  status: NotificationStatus;
  readAt: Date | null;
  createdAt: Date;
  course?: {
    courseId: string;
    title: string;
    instructor: {
      user_id: string;
      username: string;
    };
  };
}

export interface NotificationListResponseDto {
  notifications: NotificationResponseDto[];
  total: number;
  unreadCount: number;
  currentPage: number;
  totalPages: number;
}

export interface CreateNotificationDto {
  title: string;
  message: string;
  type: NotificationType;
  priority?: NotificationPriority;
  metadata?: Record<string, unknown>;
  courseId?: string;
  recipientIds: string[];
}

export interface MarkNotificationDto {
  notificationId: string;
  status: NotificationStatus;
}

export interface MarkAllNotificationsDto {
  status: NotificationStatus;
}