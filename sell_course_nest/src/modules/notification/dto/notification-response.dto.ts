import { NotificationType, NotificationPriority, NotificationStatus } from '../enums/notification-type.enum';

export class NotificationResponseDto {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  metadata: Record<string, unknown>;
  status: NotificationStatus;
  readAt: Date;
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
}