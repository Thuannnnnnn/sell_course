import { NotificationListResponseDto, RealTimeNotificationData } from '../dto/notification-response.dto';

export interface ServerToClientEvents {
  new_notification: (notification: RealTimeNotificationData) => void;
  unread_count: (data: { count: number }) => void;
  notifications_list: (data: NotificationListResponseDto) => void;
  joined_room: (data: { room: string }) => void;
  notification_marked: (data: { notificationId: string }) => void;
  error: (data: { message: string }) => void;
}

export interface ClientToServerEvents {
  join_room: (data: { room: string }) => void;
  get_notifications: (data: { page?: number; limit?: number }) => void;
  mark_notification_read: (data: { notificationId: string }) => void;
}

export interface InterServerEvents {
  // Events between server instances (if using multiple servers)
}

export interface SocketData {
  userId?: string;
  userRole?: string;
}