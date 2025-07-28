import { NotificationType, NotificationPriority, NotificationStatus } from '../enums/notification-type.enum';

export interface NotificationCourseInfo {
  courseId: string;
  title: string;
  thumbnail?: string;
  instructor: {
    user_id: string;
    username: string;
  };
  category?: {
    categoryId: string;
    name: string;
  };
}

export interface NotificationCreatedBy {
  user_id: string;
  username: string;
}

export interface NotificationDetailResponseDto {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  metadata: Record<string, unknown>;
  status: NotificationStatus;
  readAt: Date | null;
  createdAt: Date;
  course?: NotificationCourseInfo;
  createdBy?: NotificationCreatedBy;
}

export class NotificationResponseDto {
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

export class NotificationListResponseDto {
  notifications: NotificationResponseDto[];
  total: number;
  unreadCount: number;
  currentPage?: number;
  totalPages?: number;
}

export interface RealTimeNotificationData {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  createdAt: Date;
  course?: {
    courseId: string;
    title: string;
  };
}